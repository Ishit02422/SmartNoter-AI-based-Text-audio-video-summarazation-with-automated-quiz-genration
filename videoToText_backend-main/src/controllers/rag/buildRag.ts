import { ChatPromptTemplate } from "@langchain/core/prompts";
import { getLlm } from "../../llm";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { CharacterTextSplitter } from "langchain/text_splitter";
import { StringOutputParser } from "@langchain/core/output_parsers";
import axios from "axios";
import * as cheerio from "cheerio";

export class BuildRAG {
  private source: string;
  private payload: any;

  constructor(source: string, payload: any) {
    this.source = source;
    if (payload.pdfURL && !payload.pdfUrl) payload.pdfUrl = payload.pdfURL;
    if (payload.audioURL && !payload.audioUrl) payload.audioUrl = payload.audioURL;
    this.payload = payload;
  }

  private getLanguageName(code: string): string {
    const mapping: Record<string, string> = {
      en: "English",
      hi: "Hindi",
      gu: "Gujarati",
      es: "Spanish",
      fr: "French",
      de: "German",
    };
    return mapping[code.toLowerCase()] || code;
  }

  private getSystemPrompt(): string {
    const langCode = this.payload.language || "en";
    const lang = this.getLanguageName(langCode);

    return `You are an intelligent AI assistant that always responds with valid JSON only.
Your response must be a single, valid JSON object with NO markdown formatting, NO code blocks, NO backticks, and NO extra text before or after the JSON.
Generate the JSON with the following fields: "topic", "summarization", "keypoints", "actionpoints", "details", "quotes", "tags".
- "topic": A concise title/topic for the content in ${lang} language.
- "summarization": A well-structured, detailed summary in ${lang} language. This should be human-readable text, NOT JSON or code.
- "keypoints": An array of important points as strings in ${lang} language.
- "actionpoints": An array of recommended actions as strings in ${lang} language.
- "details": More in-depth details about the content in ${lang}.
- "quotes": An array of important quotes from the content.
- "tags": An array of relevant tags or keywords.
CRITICAL: Output ONLY the raw JSON object. Do NOT wrap it in \`\`\`json or any code blocks. Do NOT add any explanatory text.
All text fields MUST be written in ${lang}.
Context: {context}
Input: {input}`;
  }

  private extractVideoId(url: string): string | null {
    const m = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return m ? m[1] : null;
  }

  // ─────────────────────────────────────────────────────────────
  // TRANSCRIPT – 4 methods
  // ─────────────────────────────────────────────────────────────
  private async getTranscript(videoUrl: string): Promise<string> {
    const videoId = this.extractVideoId(videoUrl);
    if (!videoId) throw new Error("Invalid YouTube URL");
    const errs: string[] = [];

    // 1. youtube-transcript
    try {
      console.log("1️⃣ youtube-transcript...");
      const { YoutubeTranscript } = require("youtube-transcript");
      const items = await YoutubeTranscript.fetchTranscript(videoId);
      const text = items.map((t: any) => t.text).join(" ").replace(/\n/g, " ").trim();
      if (text.length > 20) { console.log(`✅ [1] ${text.length} chars`); return text; }
    } catch (e: any) { errs.push(`[1] ${e.message}`); console.log("❌ [1]", e.message); }

    // 2. kome.ai free API
    try {
      console.log("2️⃣ kome.ai...");
      const res = await axios.post("https://api.kome.ai/api/tools/youtube-transcripts",
        { video_id: videoId, force_fetch: false },
        { timeout: 20000, headers: { "Content-Type": "application/json" } }
      );
      const raw = res.data?.transcript;
      const text = typeof raw === "string" ? raw : Array.isArray(raw) ? raw.map((x: any) => x.text || x).join(" ") : "";
      if (text.length > 20) { console.log(`✅ [2] ${text.length} chars`); return text; }
    } catch (e: any) { errs.push(`[2] ${e.message}`); console.log("❌ [2]", e.message); }

    // 3. Direct HTTP scrape
    try {
      console.log("3️⃣ Direct caption scrape...");
      const text = await this.scrapeYouTubeCaptions(videoId);
      if (text.length > 20) { console.log(`✅ [3] ${text.length} chars`); return text; }
    } catch (e: any) { errs.push(`[3] ${e.message}`); console.log("❌ [3]", e.message); }

    // 4. Audio → AssemblyAI
    try {
      console.log("4️⃣ Audio → AssemblyAI...");
      const text = await this.transcribeAudio(videoUrl);
      if (text.length > 20) { console.log(`✅ [4] ${text.length} chars`); return text; }
    } catch (e: any) { errs.push(`[4] ${e.message}`); console.log("❌ [4]", e.message); }

    throw new Error(`All methods failed:\n${errs.join("\n")}`);
  }

  // ─────────────────────────────────────────────────────────────
  // METHOD 3: Direct HTTP scrape (TWO separate header sets)
  // ─────────────────────────────────────────────────────────────
  private async scrapeYouTubeCaptions(videoId: string): Promise<string> {

    // PAGE headers: identity encoding so HTML is easy to parse
    const pageHdr = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Encoding": "identity",
    };

    const pageRes = await axios.get(
      `https://www.youtube.com/watch?v=${videoId}&hl=en`,
      { headers: pageHdr, timeout: 20000, responseType: "text" }
    );
    const html: string = pageRes.data;
    const setCookies: string[] = (pageRes.headers["set-cookie"] as string[] | undefined) || [];
    const cookieStr = setCookies.map((c: string) => c.split(";")[0]).join("; ");
    console.log(`  Page: ${html.length} chars | cookies: ${setCookies.length} | captionTracks: ${html.includes('"captionTracks"')}`);

    if (!html.includes('"captionTracks"')) throw new Error("No captionTracks — video has no captions");

    const idx = html.indexOf('"captionTracks"');
    const arrStart = html.indexOf("[", idx);
    let depth = 0, arrEnd = arrStart;
    for (let i = arrStart; i < Math.min(html.length, arrStart + 200000); i++) {
      if (html[i] === "[" || html[i] === "{") depth++;
      else if (html[i] === "]" || html[i] === "}") { depth--; if (depth === 0) { arrEnd = i; break; } }
    }
    const tracks: any[] = JSON.parse(html.substring(arrStart, arrEnd + 1));
    if (!tracks?.length) throw new Error("captionTracks empty");

    const track = tracks.find((t: any) => t.languageCode === "en" || t.languageCode?.startsWith("en")) || tracks[0];
    if (!track?.baseUrl) throw new Error("No baseUrl");
    console.log(`  Track: lang=${track.languageCode}, kind=${track.kind}`);

    // TRANSCRIPT headers: gzip allowed (YouTube returns empty for identity encoding on transcript URLs!)
    const fetchHdr: Record<string, string> = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      "Accept": "*/*",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",  // KEY FIX: YouTube needs gzip for transcript URLs
      "Referer": `https://www.youtube.com/watch?v=${videoId}`,
      "Origin": "https://www.youtube.com",
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-origin",
    };
    if (cookieStr) fetchHdr["Cookie"] = cookieStr;

    const decodeHtml = (s: string) =>
      s.replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"')
        .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ").trim();

    const extractSegs = (events: any[]) =>
      events.filter((e: any) => Array.isArray(e.segs))
        .flatMap((e: any) => e.segs)
        .map((s: any) => String(s?.utf8 ?? s?.text ?? s?.t ?? "").replace(/\n/g, " "))
        .filter(Boolean).join(" ").trim();

    // Try JSON3 — default responseType so axios auto-decompresses
    try {
      const r = await axios.get(track.baseUrl + "&fmt=json3", { headers: fetchHdr, timeout: 15000 });
      const data = r.data;
      console.log(`  JSON3: typeof=${typeof data}, events=${data?.events?.length ?? "N/A"}, raw100=${JSON.stringify(data).substring(0, 100)}`);
      if (Array.isArray(data?.events) && data.events.length > 0) {
        const text = extractSegs(data.events);
        console.log(`  JSON3 text: ${text.length}`);
        if (text.length > 0) return text;
      }
    } catch (e: any) { console.log("  JSON3 err:", e.message); }

    // Try XML
    try {
      const r = await axios.get(track.baseUrl, { headers: fetchHdr, responseType: "text", timeout: 15000 });
      const xml: string = r.data;
      console.log(`  XML: ${xml?.length} chars | preview: ${String(xml).substring(0, 100)}`);
      const matches = [...xml.matchAll(/<text[^>]*>([\s\S]*?)<\/text>/gi)];
      const text = matches.map((m) => decodeHtml(m[1] || "")).filter(Boolean).join(" ");
      console.log(`  XML text: ${text.length}`);
      if (text.length > 0) return text;
    } catch (e: any) { console.log("  XML err:", e.message); }

    throw new Error("captionTracks found but empty — YouTube may be rate-limiting server IPs");
  }

  // ─────────────────────────────────────────────────────────────
  // METHOD 4: Audio download → AssemblyAI
  // ─────────────────────────────────────────────────────────────
  // private async transcribeAudio(videoUrl: string): Promise<string> {
  //   const assemblyKey = process.env.ASSEMBLY_AI_API_KEY || process.env.ASSEMBLYAI_KEY;
  //   if (!assemblyKey) throw new Error("ASSEMBLYAI_KEY missing");
  //   const fs = require("fs");
  //   const path = require("path");
  //   const { AssemblyAI } = require("assemblyai");
  //   const audioPath = path.join(__dirname, `audio_${Date.now()}.mp3`);
  //   let downloaded = false;
  //   const errs: string[] = [];

  //   const cleanVideoUrl = (() => {
  //     const vid = this.extractVideoId(videoUrl);
  //     if (vid) return `https://www.youtube.com/watch?v=${vid}`;
  //     return videoUrl;
  //   })();

  //   // Try yt-dlp-exec as primary method
  //   try {
  //     const youtubedl = require("yt-dlp-exec");
  //     await youtubedl(cleanVideoUrl, {
  //       extractAudio: true,
  //       audioFormat: "mp3",
  //       output: audioPath,
  //     });
  //     if (fs.existsSync(audioPath)) {
  //       downloaded = true;
  //     } else {
  //       throw new Error("yt-dlp-exec succeeded but file not created");
  //     }
  //   } catch (e: any) {
  //     errs.push(`yt-dlp-exec: ${e.message}`);
  //   }

  //   if (!downloaded) {
  //     // Fallback 1: youtube-dl-exec (if yt-dlp fails)
  //     try {
  //       const fallbackDl = require("youtube-dl-exec");
  //       await fallbackDl(cleanVideoUrl, {
  //         extractAudio: true,
  //         audioFormat: "mp3",
  //         output: audioPath,
  //       });
  //       if (fs.existsSync(audioPath)) {
  //         downloaded = true;
  //       } else {
  //         throw new Error("youtube-dl-exec succeeded but file not created");
  //       }
  //     } catch (e: any) {
  //       errs.push(`youtube-dl-exec: ${e.message}`);
  //     }
  //   }

  //   if (!downloaded) {
  //     // Fallback 2: play-dl (stream dump)
  //     try {
  //       const playdl = require("play-dl");
  //       const stream = await playdl.stream(cleanVideoUrl, {
  //         discordPlayerCompatibility: true,
  //         quality: 0,
  //       }); // lowest quality audio
  //       await new Promise<void>((resolve, reject) => {
  //         const w = fs.createWriteStream(audioPath);
  //         stream.stream.pipe(w);
  //         stream.stream.on("error", (e: any) => reject(new Error(e.message)));
  //         w.on("finish", () => {
  //           downloaded = true;
  //           resolve();
  //         });
  //         w.on("error", reject);
  //       });
  //     } catch (e: any) {
  //       errs.push(`play-dl: ${e.message}`);
  //     }
  //   }

  //   if (!downloaded)
  //     throw new Error(`Audio download failed: ${errs.join(" | ")}`);
  //   try {
  //     const client = new AssemblyAI({ apiKey: assemblyKey });
  //     const res = await client.transcripts.transcribe({ audio_url: audioPath });
  //     if (res.status === "error") throw new Error(res.error || "AssemblyAI failed");
  //     return res.text || "";
  //   } finally {
  //     fs.unlink(audioPath, () => { });
  //   }
  // }
  // ─────────────────────────────────────────────────────────────
  // METHOD 4: Audio download → AssemblyAI
  // ─────────────────────────────────────────────────────────────
  private async transcribeAudio(videoUrl: string): Promise<string> {
    const assemblyKey = process.env.ASSEMBLY_AI_API_KEY || process.env.ASSEMBLYAI_KEY;
    if (!assemblyKey) throw new Error("ASSEMBLYAI_KEY missing");
    const fs = require("fs");
    const path = require("path");
    const { AssemblyAI } = require("assemblyai");
    const audioPath = path.join(__dirname, `audio_${Date.now()}.mp3`);
    let downloaded = false;
    const errs: string[] = [];

    const cleanVideoUrl = (() => {
      const vid = this.extractVideoId(videoUrl);
      if (vid) return `https://www.youtube.com/watch?v=${vid}`;
      return videoUrl;
    })();

    // Try yt-dlp-exec as primary method
    try {
      const youtubedl = require("yt-dlp-exec");
      await youtubedl(cleanVideoUrl, {
        extractAudio: true,
        audioFormat: "mp3",
        output: audioPath,
      });
      if (fs.existsSync(audioPath)) {
        downloaded = true;
      } else {
        throw new Error("yt-dlp-exec succeeded but file not created");
      }
    } catch (e: any) {
      errs.push(`yt-dlp-exec: ${e.message}`);
    }

    if (!downloaded) {
      // Fallback 1: youtube-dl-exec
      try {
        const fallbackDl = require("youtube-dl-exec");
        await fallbackDl(cleanVideoUrl, {
          extractAudio: true,
          audioFormat: "mp3",
          output: audioPath,
        });
        if (fs.existsSync(audioPath)) {
          downloaded = true;
        } else {
          throw new Error("youtube-dl-exec succeeded but file not created");
        }
      } catch (e: any) {
        errs.push(`youtube-dl-exec: ${e.message}`);
      }
    }

    if (!downloaded) {
      // Fallback 2: play-dl (stream dump)
      try {
        const playdl = require("play-dl");
        const stream = await playdl.stream(cleanVideoUrl, {
          discordPlayerCompatibility: true,
          quality: 0,
        });
        await new Promise<void>((resolve, reject) => {
          const w = fs.createWriteStream(audioPath);
          stream.stream.pipe(w);
          stream.stream.on("error", (e: any) => reject(new Error(e.message)));
          w.on("finish", () => {
            downloaded = true;
            resolve();
          });
          w.on("error", reject);
        });
      } catch (e: any) {
        errs.push(`play-dl: ${e.message}`);
      }
    }

    if (!downloaded)
      throw new Error(`Audio download failed: ${errs.join(" | ")}`);

    // ✅ FIX: Upload local file to AssemblyAI first, then use the returned URL
    try {
      const client = new AssemblyAI({ apiKey: assemblyKey });

      // Upload the local mp3 file to AssemblyAI's servers
      const uploadedFile = await client.files.upload(audioPath);
      // uploadedFile is the public URL string returned by AssemblyAI

      const res = await client.transcripts.transcribe({ audio_url: uploadedFile });
      if (res.status === "error") throw new Error(res.error || "AssemblyAI failed");
      return res.text || "";
    } finally {
      // Always clean up local file
      fs.unlink(audioPath, () => { });
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Load documents
  // ─────────────────────────────────────────────────────────────
  private async loadDocs(): Promise<any[]> {
    try {
      const src = this.source.toLowerCase();

      if (src === "youtube") {
        const videoUrl = this.payload.videoUrl;
        if (!videoUrl) throw new Error("YouTube URL missing");
        const transcript = await this.getTranscript(videoUrl);
        return [{ pageContent: transcript, metadata: { source: videoUrl } }];

      } else if (src === "pdf") {
        let pdfUrl = this.payload.pdfUrl;
        if (!pdfUrl) throw new Error("PDF URL missing");

        // Handle relative paths (S3 keys)
        if (!pdfUrl.startsWith("http")) {
          const baseUrl = process.env.BASE_URL?.trim()?.replace(/\/$/, "") || "";
          pdfUrl = baseUrl + "/" + pdfUrl.replace(/^\//, "");
        }

        const pdfParse = require("pdf-parse");
        const resp = await axios.get(pdfUrl, { responseType: "arraybuffer" });
        const data = await pdfParse(resp.data);
        return [{ pageContent: data.text, metadata: { source: pdfUrl } }];

      } else if (src === "audio" || src === "uploadvideo") {
        let audioUrl = this.payload.audioUrl;
        if (!audioUrl) throw new Error("Audio URL missing");

        // Handle relative paths (S3 keys)
        if (!audioUrl.startsWith("http")) {
          const baseUrl = process.env.BASE_URL?.trim()?.replace(/\/$/, "") || "";
          audioUrl = baseUrl + "/" + audioUrl.replace(/^\//, "");
        }

        const { AssemblyAI } = require("assemblyai");
        const client = new AssemblyAI({ apiKey: process.env.ASSEMBLY_AI_API_KEY || process.env.ASSEMBLYAI_KEY || "" });
        const res = await client.transcripts.transcribe({ audio_url: audioUrl });
        if (res.status === "error") throw new Error(`AssemblyAI: ${res.error}`);
        return [{ pageContent: res.text || "", metadata: { source: audioUrl } }];

      } else if (src === "web") {
        const url = this.payload.url;
        if (!url) throw new Error("Web URL missing");

        let text = "";

        try {
          const response = await axios.get(url, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
              "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
              "Accept-Language": "en-US,en;q=0.9"
            },
            timeout: 15000,
          });

          const $ = cheerio.load(response.data);
          // Remove script, style, nav, footer, header tags
          $("script, style, nav, footer, header, noscript").remove();
          text = $("body").text().replace(/\s+/g, " ").trim();
        } catch (error: any) {
          console.log(`Axios web scrape failed: ${error.message}. Trying Puppeteer fallback...`);
        }

        // If axios failed or didn't get enough text, try Puppeteer
        if (text.length < 50) {
           console.log("Using Puppeteer to extract dynamic web content...");
           try {
             const puppeteer = require("puppeteer");
             const browser = await puppeteer.launch({
               headless: true,
               args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
             });
             try {
               const page = await browser.newPage();
               await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36");
               await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
               
               text = await page.evaluate(() => {
                  const elementsToRemove = document.querySelectorAll('script, style, nav, footer, header, noscript, iframe');
                  elementsToRemove.forEach(el => el.remove());
                  return document.body.innerText || document.body.textContent || "";
               });
               text = text.replace(/\s+/g, " ").trim();
             } finally {
               await browser.close();
             }
           } catch (puppeteerError: any) {
              console.log(`Puppeteer fallback failed: ${puppeteerError.message}`);
           }
        }

        if (text.length < 50) {
          throw new Error("Could not extract enough text from the webpage. The site might be blocking scrapers or requires manual verification.");
        }

        return [{ pageContent: text, metadata: { source: url } }];
      } else {
        throw new Error("Unsupported source: " + this.source);
      }
    } catch (err: any) {
      console.error("RAG ERROR:", err.message);
      throw new Error(err.message);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Main public method
  // ─────────────────────────────────────────────────────────────
  //   public async createChunksAndVectorStore() {
  //     const docs = await this.loadDocs();
  //     const splitter = new CharacterTextSplitter({ chunkSize: 3000, chunkOverlap: 100 });
  //     const splitDocs = await splitter.splitDocuments(docs);
  //     const prompt = ChatPromptTemplate.fromTemplate(this.getSystemPrompt());
  //     const llm = await getLlm();
  //     const mainChain = await createStuffDocumentsChain({ llm, prompt });
  //     const chain = mainChain.pipe(new StringOutputParser());

  //     const retrievalChain = {
  //       stream: async function* (input: { input: string }) {
  //         const result = await chain.stream({ input: input.input, context: splitDocs });
  //         for await (const chunk of result) yield { answer: chunk };
  //       },
  //       invoke: async (input: { input: string }) => {
  //         const answer = await chain.invoke({ input: input.input, context: splitDocs });
  //         return { answer };
  //       },
  //     };

  //     return { docs, retrievalChain };
  //   }
  // }
  public async createChunksAndVectorStore() {
    const docs = await this.loadDocs();
    const splitter = new CharacterTextSplitter({ chunkSize: 2000, chunkOverlap: 100 });
    const splitDocs = await splitter.splitDocuments(docs);
    const prompt = ChatPromptTemplate.fromTemplate(this.getSystemPrompt());
    const llm = await getLlm();
    const mainChain = await createStuffDocumentsChain({ llm, prompt });
    const chain = mainChain.pipe(new StringOutputParser());

    const retrievalChain = {
      stream: async function* (input: { input: string }) {
        let attempts = 0;
        while (attempts < 3) {
          try {
            const result = await chain.stream({ input: input.input, context: splitDocs });
            for await (const chunk of result) yield { answer: chunk };
            return;
          } catch (e: any) {
            attempts++;
            console.log(`Gemini stream error (attempt ${attempts}):`, e.message);
            if (attempts >= 3) throw e;
            await new Promise(r => setTimeout(r, 2000 * attempts));
          }
        }
      },
      invoke: async (input: { input: string }) => {
        let attempts = 0;
        while (attempts < 3) {
          try {
            const answer = await chain.invoke({ input: input.input, context: splitDocs });
            return { answer };
          } catch (e: any) {
            attempts++;
            console.log(`Gemini invoke error (attempt ${attempts}):`, e.message);
            if (attempts >= 3) throw e;
            await new Promise(r => setTimeout(r, 2000 * attempts));
          }
        }
      },
    };
    return { docs, retrievalChain };
  }
}