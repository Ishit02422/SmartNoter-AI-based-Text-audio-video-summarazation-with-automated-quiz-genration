"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildRAG = void 0;
const prompts_1 = require("@langchain/core/prompts");
const llm_1 = require("../../llm");
const combine_documents_1 = require("langchain/chains/combine_documents");
const text_splitter_1 = require("langchain/text_splitter");
const output_parsers_1 = require("@langchain/core/output_parsers");
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
class BuildRAG {
    constructor(source, payload) {
        this.source = source;
        if (payload.pdfURL && !payload.pdfUrl)
            payload.pdfUrl = payload.pdfURL;
        if (payload.audioURL && !payload.audioUrl)
            payload.audioUrl = payload.audioURL;
        this.payload = payload;
    }
    getLanguageName(code) {
        const mapping = {
            en: "English",
            hi: "Hindi",
            gu: "Gujarati",
            es: "Spanish",
            fr: "French",
            de: "German",
        };
        return mapping[code.toLowerCase()] || code;
    }
    getSystemPrompt() {
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
    extractVideoId(url) {
        const m = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
        return m ? m[1] : null;
    }
    // ─────────────────────────────────────────────────────────────
    // TRANSCRIPT – 4 methods
    // ─────────────────────────────────────────────────────────────
    async getTranscript(videoUrl) {
        var _a, _b, _c, _d, _e, _f;
        const videoId = this.extractVideoId(videoUrl);
        if (!videoId)
            throw new Error("Invalid YouTube URL");
        const errs = [];
        const fs = require("fs");
        const { cookieHeader, cookiesFilePath } = this.resolveCookies();
        try {
            // 1. youtube-transcript
            try {
                console.log("Method 1: youtube-transcript...");
                const { YoutubeTranscript } = require("youtube-transcript");
                const items = await YoutubeTranscript.fetchTranscript(videoId);
                const text = items.map((t) => t.text).join(" ").replace(/\n/g, " ").trim();
                if (text.length > 20) {
                    console.log("Method 1 success: " + text.length + " chars");
                    return text;
                }
            }
            catch (e) {
                errs.push("[1] " + e.message);
                console.log("Method 1 err:", e.message);
            }
            // 2. youtubei.js (Innertube API — works for geoblocked/region-restricted videos)
            try {
                console.log("Method 2: youtubei.js (Innertube)...");
                const { Innertube } = require("youtubei.js");
                const youtube = await Innertube.create({ retrieve_player: false });
                const info = await youtube.getInfo(videoId);
                const transcriptData = await info.getTranscript();
                const segments = [];
                const body = (_b = (_a = transcriptData === null || transcriptData === void 0 ? void 0 : transcriptData.transcript) === null || _a === void 0 ? void 0 : _a.content) === null || _b === void 0 ? void 0 : _b.body;
                if (body) {
                    const initialSeg = body.initial_segments || [];
                    for (const seg of initialSeg) {
                        const snippet = seg === null || seg === void 0 ? void 0 : seg.snippet;
                        if (snippet) {
                            const txt = typeof snippet === "string" ? snippet : (_e = (_c = snippet === null || snippet === void 0 ? void 0 : snippet.text) !== null && _c !== void 0 ? _c : (_d = snippet === null || snippet === void 0 ? void 0 : snippet.runs) === null || _d === void 0 ? void 0 : _d.map((r) => r.text).join("")) !== null && _e !== void 0 ? _e : "";
                            if (txt)
                                segments.push(txt.replace(/\n/g, " "));
                        }
                    }
                }
                const text = segments.join(" ").trim();
                if (text.length > 20) {
                    console.log("Method 2 success (youtubei.js): " + text.length + " chars");
                    return text;
                }
            }
            catch (e) {
                errs.push("[2] " + e.message);
                console.log("Method 2 err (youtubei.js):", e.message);
            }
            // 3. kome.ai free API
            try {
                console.log("Method 3: kome.ai...");
                const res = await axios_1.default.post("https://api.kome.ai/api/tools/youtube-transcripts", { video_id: videoId, force_fetch: false }, { timeout: 20000, headers: { "Content-Type": "application/json" } });
                const raw = (_f = res.data) === null || _f === void 0 ? void 0 : _f.transcript;
                const text = typeof raw === "string" ? raw : Array.isArray(raw) ? raw.map((x) => x.text || x).join(" ") : "";
                if (text.length > 20) {
                    console.log("Method 3 success: " + text.length + " chars");
                    return text;
                }
            }
            catch (e) {
                errs.push("[3] " + e.message);
                console.log("Method 3 err:", e.message);
            }
            // 4. Direct HTTP scrape
            try {
                console.log("Method 4: Direct caption scrape...");
                const text = await this.scrapeYouTubeCaptions(videoId, cookieHeader);
                if (text.length > 20) {
                    console.log("Method 4 success: " + text.length + " chars");
                    return text;
                }
            }
            catch (e) {
                errs.push("[4] " + e.message);
                console.log("Method 4 err:", e.message);
            }
            // 5. Audio - AssemblyAI
            try {
                console.log("Method 5: Audio to AssemblyAI...");
                const text = await this.transcribeAudio(videoUrl, cookieHeader, cookiesFilePath);
                if (text.length > 20) {
                    console.log("Method 5 success: " + text.length + " chars");
                    return text;
                }
            }
            catch (e) {
                errs.push("[5] " + e.message);
                console.log("Method 5 err:", e.message);
            }
            throw new Error("All methods failed:\n" + errs.join("\n"));
        }
        finally {
            if (cookiesFilePath && fs.existsSync(cookiesFilePath)) {
                try {
                    fs.unlinkSync(cookiesFilePath);
                    console.log("Cleaned up temp cookies file: " + cookiesFilePath);
                }
                catch (e) {
                    console.error("Failed to clean up temp cookies file:", e.message);
                }
            }
        }
    }
    resolveCookies() {
        const fs = require("fs");
        const path = require("path");
        let rawContent = "";
        if (process.env.YOUTUBE_COOKIES_CONTENT) {
            rawContent = process.env.YOUTUBE_COOKIES_CONTENT;
        }
        else {
            const potentialPaths = [
                path.resolve(process.cwd(), "cookies.txt"),
                path.resolve(__dirname, "cookies.txt"),
                path.resolve(__dirname, "../../cookies.txt"),
                path.resolve(__dirname, "../../../cookies.txt"),
            ];
            for (const p of potentialPaths) {
                if (fs.existsSync(p)) {
                    try {
                        rawContent = fs.readFileSync(p, "utf8");
                        console.log("Found cookies.txt at: " + p);
                        break;
                    }
                    catch (e) { }
                }
            }
        }
        if (!rawContent) {
            return { cookieHeader: null, cookiesFilePath: null };
        }
        try {
            const lines = rawContent.split("\n");
            const cookiesList = [];
            const cleanLines = [
                "# Netscape HTTP Cookie File",
                "# http://curl.haxx.se/rfc/cookie_spec.html",
                "# This is a generated file! Do not edit.",
                ""
            ];
            for (let line of lines) {
                line = line.trim();
                if (!line || line.startsWith("#"))
                    continue;
                const parts = line.split(/\s+/);
                if (parts.length >= 7) {
                    cleanLines.push(parts.slice(0, 7).join("\t"));
                    cookiesList.push(parts[5] + "=" + parts[6]);
                }
            }
            if (cookiesList.length === 0) {
                console.warn("No cookies parsed successfully. Check format.");
                return { cookieHeader: null, cookiesFilePath: null };
            }
            const essentialKeys = ["SID", "HSID", "SSID", "SAPISID", "APISID", "LOGIN_INFO"];
            const foundEssentials = cookiesList.filter(c => {
                const name = c.split("=")[0];
                return essentialKeys.includes(name);
            });
            console.log("[Cookies Info] Total cookies: " + cookiesList.length + ". Found essential auth cookies: " + (foundEssentials.map(c => c.split("=")[0]).join(", ") || "NONE"));
            const cookieHeader = cookiesList.join("; ");
            const cleanContent = cleanLines.join("\n");
            const tempFile = path.resolve(__dirname, "clean_cookies_" + Date.now() + ".txt");
            fs.writeFileSync(tempFile, cleanContent, "utf8");
            console.log("Cookies resolved: " + cookiesList.length + " items parsed. Temp cookies file: " + tempFile);
            return { cookieHeader, cookiesFilePath: tempFile };
        }
        catch (err) {
            console.error("Error resolving cookies:", err.message);
            return { cookieHeader: null, cookiesFilePath: null };
        }
    }
    mergeCookies(c1, c2) {
        const map = new Map();
        const parse = (str) => {
            if (!str)
                return;
            str.split(";").forEach(p => {
                const idx = p.indexOf("=");
                if (idx > 0) {
                    const key = p.substring(0, idx).trim();
                    const val = p.substring(idx + 1).trim();
                    if (key)
                        map.set(key, val);
                }
            });
        };
        parse(c1);
        parse(c2);
        return Array.from(map.entries()).map(([k, v]) => `${k}=${v}`).join("; ");
    }
    // ─────────────────────────────────────────────────────────────
    // METHOD 3: Direct HTTP scrape (TWO separate header sets)
    // ─────────────────────────────────────────────────────────────
    async scrapeYouTubeCaptions(videoId, cookieHeader) {
        var _a, _b, _c;
        // PAGE headers: identity encoding so HTML is easy to parse
        const pageHdr = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Encoding": "identity",
        };
        if (cookieHeader) {
            pageHdr["Cookie"] = cookieHeader;
        }
        const axiosConfig = { headers: pageHdr, timeout: 20000, responseType: "text" };
        if (process.env.YOUTUBE_PROXY) {
            const { HttpProxyAgent } = require("http-proxy-agent");
            const { HttpsProxyAgent } = require("https-proxy-agent");
            axiosConfig.httpAgent = new HttpProxyAgent(process.env.YOUTUBE_PROXY);
            axiosConfig.httpsAgent = new HttpsProxyAgent(process.env.YOUTUBE_PROXY);
        }
        const pageRes = await axios_1.default.get(`https://www.youtube.com/watch?v=${videoId}&hl=en`, axiosConfig);
        const html = pageRes.data;
        const setCookies = pageRes.headers["set-cookie"] || [];
        const responseCookieStr = setCookies.map((c) => c.split(";")[0]).join("; ");
        const finalCookieStr = this.mergeCookies(cookieHeader, responseCookieStr);
        console.log("  Page: " + html.length + " chars | cookies received: " + setCookies.length + " | captionTracks: " + html.includes('"captionTracks"'));
        if (!html.includes('"captionTracks"'))
            throw new Error("No captionTracks — video has no captions");
        const idx = html.indexOf('"captionTracks"');
        const arrStart = html.indexOf("[", idx);
        let depth = 0, arrEnd = arrStart;
        for (let i = arrStart; i < Math.min(html.length, arrStart + 200000); i++) {
            if (html[i] === "[" || html[i] === "{")
                depth++;
            else if (html[i] === "]" || html[i] === "}") {
                depth--;
                if (depth === 0) {
                    arrEnd = i;
                    break;
                }
            }
        }
        const tracks = JSON.parse(html.substring(arrStart, arrEnd + 1));
        if (!(tracks === null || tracks === void 0 ? void 0 : tracks.length))
            throw new Error("captionTracks empty");
        const track = tracks.find((t) => { var _a; return t.languageCode === "en" || ((_a = t.languageCode) === null || _a === void 0 ? void 0 : _a.startsWith("en")); }) || tracks[0];
        if (!(track === null || track === void 0 ? void 0 : track.baseUrl))
            throw new Error("No baseUrl");
        console.log("  Track: lang=" + track.languageCode + ", kind=" + track.kind);
        // TRANSCRIPT headers: gzip allowed (YouTube returns empty for identity encoding on transcript URLs!)
        const fetchHdr = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Accept": "*/*",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Encoding": "gzip, deflate, br", // KEY FIX: YouTube needs gzip for transcript URLs
            "Referer": "https://www.youtube.com/watch?v=" + videoId,
            "Origin": "https://www.youtube.com",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
        };
        if (finalCookieStr)
            fetchHdr["Cookie"] = finalCookieStr;
        const decodeHtml = (s) => s.replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"')
            .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ").trim();
        const extractSegs = (events) => events.filter((e) => Array.isArray(e.segs))
            .flatMap((e) => e.segs)
            .map((s) => { var _a, _b, _c; return String((_c = (_b = (_a = s === null || s === void 0 ? void 0 : s.utf8) !== null && _a !== void 0 ? _a : s === null || s === void 0 ? void 0 : s.text) !== null && _b !== void 0 ? _b : s === null || s === void 0 ? void 0 : s.t) !== null && _c !== void 0 ? _c : "").replace(/\n/g, " "); })
            .filter(Boolean).join(" ").trim();
        // Try JSON3 — default responseType so axios auto-decompresses
        try {
            const json3Config = { headers: fetchHdr, timeout: 15000 };
            if (process.env.YOUTUBE_PROXY) {
                const { HttpProxyAgent } = require("http-proxy-agent");
                const { HttpsProxyAgent } = require("https-proxy-agent");
                json3Config.httpAgent = new HttpProxyAgent(process.env.YOUTUBE_PROXY);
                json3Config.httpsAgent = new HttpsProxyAgent(process.env.YOUTUBE_PROXY);
            }
            const r = await axios_1.default.get(track.baseUrl + "&fmt=json3", json3Config);
            const data = r.data;
            console.log("  JSON3: typeof=" + (typeof data) + ", events=" + ((_b = (_a = data === null || data === void 0 ? void 0 : data.events) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : "N/A"));
            if (Array.isArray(data === null || data === void 0 ? void 0 : data.events) && data.events.length > 0) {
                const text = extractSegs(data.events);
                console.log("  JSON3 text: " + text.length);
                if (text.length > 0)
                    return text;
            }
        }
        catch (e) {
            console.log("  JSON3 err:", e.message);
            if (e.response) {
                console.log("  JSON3 response: status=" + e.response.status + " data=" + String(e.response.data).substring(0, 100));
            }
        }
        // Try XML
        try {
            const xmlConfig = { headers: fetchHdr, responseType: "text", timeout: 15000 };
            if (process.env.YOUTUBE_PROXY) {
                const { HttpProxyAgent } = require("http-proxy-agent");
                const { HttpsProxyAgent } = require("https-proxy-agent");
                xmlConfig.httpAgent = new HttpProxyAgent(process.env.YOUTUBE_PROXY);
                xmlConfig.httpsAgent = new HttpsProxyAgent(process.env.YOUTUBE_PROXY);
            }
            const r = await axios_1.default.get(track.baseUrl, xmlConfig);
            const xml = r.data;
            console.log("  XML: " + ((_c = xml === null || xml === void 0 ? void 0 : xml.length) !== null && _c !== void 0 ? _c : 0) + " chars");
            const matches = [...xml.matchAll(/<text[^>]*>([\s\S]*?)<\/text>/gi)];
            const text = matches.map((m) => decodeHtml(m[1] || "")).filter(Boolean).join(" ");
            console.log("  XML text: " + text.length);
            if (text.length > 0)
                return text;
        }
        catch (e) {
            console.log("  XML err:", e.message);
            if (e.response) {
                console.log("  XML response: status=" + e.response.status + " data=" + String(e.response.data).substring(0, 100));
            }
        }
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
    async transcribeAudio(videoUrl, cookieHeader, cookiesFilePath) {
        const assemblyKey = process.env.ASSEMBLY_AI_API_KEY || process.env.ASSEMBLYAI_KEY;
        if (!assemblyKey)
            throw new Error("ASSEMBLYAI_KEY missing");
        const fs = require("fs");
        const path = require("path");
        const { AssemblyAI } = require("assemblyai");
        const audioPath = path.join(__dirname, "audio_" + Date.now() + ".mp3");
        let downloaded = false;
        const errs = [];
        const cleanVideoUrl = (() => {
            const vid = this.extractVideoId(videoUrl);
            if (vid)
                return "https://www.youtube.com/watch?v=" + vid;
            return videoUrl;
        })();
        // Configure cookies for play-dl if present
        if (cookieHeader) {
            try {
                const playdl = require("play-dl");
                playdl.setToken({
                    youtube: {
                        cookie: cookieHeader
                    }
                });
                console.log("play-dl youtube cookies configured successfully!");
            }
            catch (err) {
                console.error("Failed to configure play-dl cookies:", err.message);
            }
        }
        // Try yt-dlp-exec as primary method
        try {
            const youtubedl = require("yt-dlp-exec");
            const options = {
                extractAudio: true,
                audioFormat: "mp3",
                output: audioPath,
                jsRuntimes: "node:" + process.execPath,
            };
            if (cookiesFilePath) {
                options.cookies = cookiesFilePath;
            }
            if (process.env.YOUTUBE_PROXY) {
                options.proxy = process.env.YOUTUBE_PROXY;
            }
            await youtubedl(cleanVideoUrl, options);
            if (fs.existsSync(audioPath)) {
                downloaded = true;
            }
            else {
                throw new Error("yt-dlp-exec succeeded but file not created");
            }
        }
        catch (e) {
            errs.push("yt-dlp-exec: " + e.message);
        }
        if (!downloaded) {
            // Fallback 1: youtube-dl-exec
            try {
                const fallbackDl = require("youtube-dl-exec");
                const options = {
                    extractAudio: true,
                    audioFormat: "mp3",
                    output: audioPath,
                };
                if (cookiesFilePath) {
                    options.cookies = cookiesFilePath;
                }
                if (process.env.YOUTUBE_PROXY) {
                    options.proxy = process.env.YOUTUBE_PROXY;
                }
                await fallbackDl(cleanVideoUrl, options);
                if (fs.existsSync(audioPath)) {
                    downloaded = true;
                }
                else {
                    throw new Error("youtube-dl-exec succeeded but file not created");
                }
            }
            catch (e) {
                errs.push("youtube-dl-exec: " + e.message);
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
                await new Promise((resolve, reject) => {
                    const w = fs.createWriteStream(audioPath);
                    stream.stream.pipe(w);
                    stream.stream.on("error", (e) => reject(new Error(e.message)));
                    w.on("finish", () => {
                        downloaded = true;
                        resolve();
                    });
                    w.on("error", reject);
                });
            }
            catch (e) {
                errs.push("play-dl: " + e.message);
            }
        }
        if (!downloaded)
            throw new Error("Audio download failed: " + errs.join(" | "));
        try {
            const client = new AssemblyAI({ apiKey: assemblyKey });
            const uploadedFile = await client.files.upload(audioPath);
            const res = await client.transcripts.transcribe({ audio_url: uploadedFile });
            if (res.status === "error")
                throw new Error(res.error || "AssemblyAI failed");
            return res.text || "";
        }
        finally {
            fs.unlink(audioPath, () => { });
        }
    }
    // ─────────────────────────────────────────────────────────────
    // Load documents
    // ─────────────────────────────────────────────────────────────
    async loadDocs() {
        var _a, _b, _c, _d, _e;
        try {
            const src = this.source.toLowerCase();
            if (src === "youtube") {
                const videoUrl = this.payload.videoUrl;
                if (!videoUrl)
                    throw new Error("YouTube URL missing");
                const transcript = await this.getTranscript(videoUrl);
                return [{ pageContent: transcript, metadata: { source: videoUrl } }];
            }
            else if (src === "pdf") {
                let pdfUrl = this.payload.pdfUrl;
                if (!pdfUrl)
                    throw new Error("PDF URL missing");
                // Handle relative paths (S3 keys)
                if (!pdfUrl.startsWith("http")) {
                    const baseUrl = ((_b = (_a = process.env.BASE_URL) === null || _a === void 0 ? void 0 : _a.trim()) === null || _b === void 0 ? void 0 : _b.replace(/\/$/, "")) || "";
                    pdfUrl = baseUrl + "/" + pdfUrl.replace(/^\//, "");
                }
                const { PDFLoader } = require("@langchain/community/document_loaders/fs/pdf");
                const resp = await axios_1.default.get(pdfUrl, { responseType: "arraybuffer" });
                const loader = new PDFLoader(new Blob([resp.data]), { splitPages: false });
                const docs = await loader.load();
                return [{ pageContent: ((_c = docs[0]) === null || _c === void 0 ? void 0 : _c.pageContent) || "", metadata: { source: pdfUrl } }];
            }
            else if (src === "audio" || src === "uploadvideo") {
                let audioUrl = this.payload.audioUrl;
                if (!audioUrl)
                    throw new Error("Audio URL missing");
                // Handle relative paths (S3 keys)
                if (!audioUrl.startsWith("http")) {
                    const baseUrl = ((_e = (_d = process.env.BASE_URL) === null || _d === void 0 ? void 0 : _d.trim()) === null || _e === void 0 ? void 0 : _e.replace(/\/$/, "")) || "";
                    audioUrl = baseUrl + "/" + audioUrl.replace(/^\//, "");
                }
                const { AssemblyAI } = require("assemblyai");
                const client = new AssemblyAI({ apiKey: process.env.ASSEMBLY_AI_API_KEY || process.env.ASSEMBLYAI_KEY || "" });
                const res = await client.transcripts.transcribe({ audio_url: audioUrl });
                if (res.status === "error")
                    throw new Error(`AssemblyAI: ${res.error}`);
                return [{ pageContent: res.text || "", metadata: { source: audioUrl } }];
            }
            else if (src === "web") {
                const url = this.payload.url;
                if (!url)
                    throw new Error("Web URL missing");
                let text = "";
                try {
                    const response = await axios_1.default.get(url, {
                        headers: {
                            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
                            "Accept-Language": "en-US,en;q=0.9"
                        },
                        timeout: 15000,
                    });
                    const $ = cheerio.load(response.data);
                    // Remove script, style, nav, footer, header tags
                    $("script, style, nav, footer, header, noscript").remove();
                    text = $("body").text().replace(/\s+/g, " ").trim();
                }
                catch (error) {
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
                        }
                        finally {
                            await browser.close();
                        }
                    }
                    catch (puppeteerError) {
                        console.log(`Puppeteer fallback failed: ${puppeteerError.message}`);
                    }
                }
                if (text.length < 50) {
                    throw new Error("Could not extract enough text from the webpage. The site might be blocking scrapers or requires manual verification.");
                }
                return [{ pageContent: text, metadata: { source: url } }];
            }
            else {
                throw new Error("Unsupported source: " + this.source);
            }
        }
        catch (err) {
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
    async createChunksAndVectorStore() {
        const docs = await this.loadDocs();
        const splitter = new text_splitter_1.CharacterTextSplitter({ chunkSize: 2000, chunkOverlap: 100 });
        const splitDocs = await splitter.splitDocuments(docs);
        const prompt = prompts_1.ChatPromptTemplate.fromTemplate(this.getSystemPrompt());
        const retrievalChain = {
            stream: async function* (input) {
                let attempts = 0;
                const keysStr = process.env.GOOGLE_API_KEY || "";
                const keys = keysStr.split(",").map(k => k.trim()).filter(Boolean);
                while (attempts < Math.max(3, keys.length)) {
                    try {
                        const keyIndex = attempts % keys.length;
                        const llm = await (0, llm_1.getLlm)(keyIndex);
                        const mainChain = await (0, combine_documents_1.createStuffDocumentsChain)({ llm, prompt });
                        const chain = mainChain.pipe(new output_parsers_1.StringOutputParser());
                        const result = await chain.stream({ input: input.input, context: splitDocs });
                        for await (const chunk of result)
                            yield { answer: chunk };
                        return;
                    }
                    catch (e) {
                        attempts++;
                        console.log(`Gemini stream error (attempt ${attempts}):`, e.message);
                        if (attempts >= Math.max(3, keys.length))
                            throw e;
                        await new Promise(r => setTimeout(r, 1000 * attempts));
                    }
                }
            },
            invoke: async (input) => {
                let attempts = 0;
                const keysStr = process.env.GOOGLE_API_KEY || "";
                const keys = keysStr.split(",").map(k => k.trim()).filter(Boolean);
                while (attempts < Math.max(3, keys.length)) {
                    try {
                        const keyIndex = attempts % keys.length;
                        const llm = await (0, llm_1.getLlm)(keyIndex);
                        const mainChain = await (0, combine_documents_1.createStuffDocumentsChain)({ llm, prompt });
                        const chain = mainChain.pipe(new output_parsers_1.StringOutputParser());
                        const answer = await chain.invoke({ input: input.input, context: splitDocs });
                        return { answer };
                    }
                    catch (e) {
                        attempts++;
                        console.log(`Gemini invoke error (attempt ${attempts}):`, e.message);
                        if (attempts >= Math.max(3, keys.length))
                            throw e;
                        await new Promise(r => setTimeout(r, 1000 * attempts));
                    }
                }
            },
        };
        return { docs, retrievalChain };
    }
}
exports.BuildRAG = BuildRAG;
//# sourceMappingURL=buildRag.js.map