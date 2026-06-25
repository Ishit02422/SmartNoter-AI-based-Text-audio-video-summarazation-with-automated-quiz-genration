"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Controller = void 0;
const joi_1 = __importDefault(require("joi"));
const pdf_1 = require("../../modules/pdf");
const rag_1 = require("../rag");
const saveGeneratedSummaryPdf_1 = require("../../modules/generatedSummaryFromPdf/saveGeneratedSummaryPdf");
const http_status_codes_1 = require("http-status-codes");
const generatedSummaryFromPdf_1 = require("../../modules/generatedSummaryFromPdf");
const user_1 = require("../../modules/user");
const history_1 = require("../../modules/history");
const getSummaryFromSource_1 = require("../../modules/chatWithAI/getSummaryFromSource");
class Controller {
    constructor() {
        this.generateSummaryPdfCreateSchema = joi_1.default.object().keys({
            language: joi_1.default.string().optional().default("en"),
            fileId: joi_1.default.optional().external(async (v) => {
                if (!v)
                    return;
                const file = await (0, pdf_1.getPdfById)(v);
                if (!file) {
                    throw new Error("File not found");
                }
            }),
            pdfUrl: joi_1.default.string()
                .pattern(/^(http:\/\/|https:\/\/|pdf).+/)
                .optional()
                .messages({
                "string.pattern.base": "PDF URL must start with pdf/",
            }),
            pdfURL: joi_1.default.string().optional(),
        }).or("pdfUrl", "pdfURL");
        this.generatedSummaryPdfEditScheam = joi_1.default.object().keys({
            aiResponse: joi_1.default.string().optional(),
            title: joi_1.default.string().optional(),
            summarization: joi_1.default.string().optional(),
            keyPoints: joi_1.default.array().optional(),
            actionPoints: joi_1.default.array().optional(),
        });
        this.create = async (req, res) => {
            try {
                const authUser = req.authUser;
                const paylodValue = await this.generateSummaryPdfCreateSchema
                    .validateAsync(req.body, { stripUnknown: true });
                this.payload = paylodValue;
                // If pdfUrl is missing but fileId is present, fetch it from DB
                if (!this.payload.pdfUrl && !this.payload.pdfURL && this.payload.fileId) {
                    const file = await (0, pdf_1.getPdfById)(this.payload.fileId);
                    if (file) {
                        this.payload.pdfUrl = file.pdfURL || file.pdfUrl || file.url;
                    }
                }
                // Removed strict .pdf check to support signed URLs or cloud storage links
                const rag = new rag_1.BuildRAG("pdf", this.payload);
                const { docs, retrievalChain } = await rag.createChunksAndVectorStore();
                res.setHeader("Content-Type", "text/event-stream");
                res.setHeader("Cache-Control", "no-cache");
                res.setHeader("Connection", "keep-alive");
                res.flushHeaders();
                const result = await retrievalChain.stream({
                    input: `give me keypoint, action points, summary and also give title in ${paylodValue.language || "en"} language from pdf url given in context`,
                });
                let resultString = "";
                for await (const chunk of result) {
                    resultString += chunk.answer || "";
                    res.write(`event: answer\n`);
                    res.write(`data: ${JSON.stringify(chunk === null || chunk === void 0 ? void 0 : chunk.answer)}\n\n`);
                }
                // const { result: data, title } = this.parseInvoiceData(resultString);
                let parsed = {};
                try {
                    const jsonMatch = resultString.match(/\{[\s\S]*\}/);
                    const cleanJson = jsonMatch ? jsonMatch[0] : resultString.replace(/```json\n?|\n```/g, "");
                    parsed = JSON.parse(cleanJson);
                }
                catch (e) {
                    console.error("JSON Parse Error in PDF Summary:", e);
                    // Fallback for non-JSON responses
                    parsed = {
                        summary: resultString,
                        title: "Untitled",
                        keypoints: [],
                        actionpoints: []
                    };
                }
                const responData = {
                    actionPoints: parsed.actionpoints || parsed.actionPoints || [],
                    keyPoints: parsed.keypoints || parsed.keyPoints || [],
                    summarization: parsed.summarization || parsed.summary || "",
                    userId: authUser._id,
                    title: parsed.topic || parsed.title || "Untitled",
                };
                const savedData = await (0, saveGeneratedSummaryPdf_1.saveGeneratedSummaryFromPDF)({
                    ...this.payload,
                    ...responData,
                    aiResponse: resultString,
                });
                await (0, user_1.deductCreditAndAddReward)(authUser._id, "PDF_SUMMARY");
                await (0, history_1.saveHistory)(new history_1.History({
                    modelId: [savedData._id],
                    modelName: history_1.getModelByName.SummaryPDF,
                    userId: authUser._id.toString(),
                }));
                res.write(`event: metadata\n`);
                res.write(`data: ${JSON.stringify(savedData)}\n\n`);
                res.write(`event: done\ndata: {}\n\n`);
                res.end();
            }
            catch (error) {
                if (error.isJoi) {
                    return res.status(422).json({ message: error.message });
                }
                console.log("error", "error in create generatedSummary", error);
                if (res.headersSent) {
                    if (!res.writableEnded) {
                        res.write(`event: error\n`);
                        res.write(`data: ${JSON.stringify({ message: error.message || "Streaming error" })}\n\n`);
                        res.end();
                    }
                    return;
                }
                return res.status(500).json({
                    message: "Something happened wrong try again generatedSummary after sometime",
                    error: JSON.stringify((error === null || error === void 0 ? void 0 : error.message) || error),
                });
            }
        };
        this.createDirect = async (req, res) => {
            try {
                const authUser = req.authUser;
                const paylodValue = await this.generateSummaryPdfCreateSchema
                    .validateAsync(req.body, { stripUnknown: true });
                this.payload = paylodValue;
                // If pdfUrl is missing but fileId is present, fetch it from DB
                if (!this.payload.pdfUrl && !this.payload.pdfURL && this.payload.fileId) {
                    const file = await (0, pdf_1.getPdfById)(this.payload.fileId);
                    if (file) {
                        this.payload.pdfUrl = file.pdfURL || file.pdfUrl || file.url;
                    }
                }
                // Removed strict .pdf check
                const rag = new rag_1.BuildRAG("pdf", this.payload);
                const { docs, retrievalChain } = await rag.createChunksAndVectorStore();
                const result = await retrievalChain.stream({
                    input: `give me keypoint, action points, summary and also give title in ${paylodValue.language || "en"} language from pdf url given in context`,
                });
                let resultString = "";
                for await (const chunk of result) {
                    resultString += chunk.answer || "";
                }
                // const { result: data, title } = this.parseInvoiceData(resultString);
                let parsed = {};
                try {
                    const jsonMatch = resultString.match(/\{[\s\S]*\}/);
                    const cleanJson = jsonMatch ? jsonMatch[0] : resultString.replace(/```json\n?|\n```/g, "");
                    parsed = JSON.parse(cleanJson);
                }
                catch (e) {
                    console.error("JSON Parse Error in PDF Summary (Direct):", e);
                    parsed = {
                        summary: resultString,
                        title: "Untitled",
                        keypoints: [],
                        actionpoints: []
                    };
                }
                const responData = {
                    actionPoints: parsed.actionpoints || parsed.actionPoints || [],
                    keyPoints: parsed.keypoints || parsed.keyPoints || [],
                    summarization: parsed.summarization || parsed.summary || "",
                    userId: authUser._id,
                    title: parsed.topic || parsed.title || "Untitled",
                };
                const savedData = await (0, saveGeneratedSummaryPdf_1.saveGeneratedSummaryFromPDF)({
                    ...this.payload,
                    ...responData,
                    aiResponse: resultString,
                });
                await (0, user_1.deductCreditAndAddReward)(authUser._id, "PDF_SUMMARY");
                await (0, history_1.saveHistory)(new history_1.History({
                    modelId: [savedData._id],
                    modelName: history_1.getModelByName.SummaryPDF,
                    userId: authUser._id.toString(),
                }));
                return res.status(200).json({
                    result: savedData,
                });
            }
            catch (error) {
                if (error.isJoi) {
                    return res.status(422).json({ message: error.message });
                }
                console.log("error", "error in create generatedSummary", error);
                if (res.headersSent) {
                    return;
                }
                return res.status(500).json({
                    message: "Something happened wrong try again generatedSummary after sometime",
                    error: JSON.stringify((error === null || error === void 0 ? void 0 : error.message) || error),
                });
            }
        };
        this.update = async (req, res) => {
            const authUser = req.authUser;
            const summaryId = req.params.id;
            try {
                const payloadValue = await this.generatedSummaryPdfEditScheam
                    .validateAsync(req.body)
                    .catch((e) => {
                    if (e instanceof Error) {
                        return res.status(422).json({ message: e.message });
                    }
                    return res.status(422).json({ message: "Invalid payload" });
                });
                if (!payloadValue) {
                    return res.status(422).json({ message: "Invalid payload" });
                }
                const summary = await (0, generatedSummaryFromPdf_1.checkPdfSummaryIsExistById)(summaryId, authUser._id);
                if (!summary) {
                    return res
                        .status(http_status_codes_1.StatusCodes.NOT_FOUND)
                        .json({ message: "Summary not found", success: false });
                }
                const updated = await (0, generatedSummaryFromPdf_1.updatePdfSummary)(summaryId, payloadValue);
                return res
                    .status(http_status_codes_1.StatusCodes.OK)
                    .json({ message: "Summary updated", success: true, result: updated });
            }
            catch (error) {
                console.error("Error in update generatedSummaryPDF:", error);
                return res.status(500).json({
                    message: "Something went wrong, try again later",
                    error: error instanceof Error ? error.message : "Unknown error",
                });
            }
        };
        this.delete = async (req, res) => {
            const authUser = req.authUser;
            const summaryId = req.params.id;
            const source = req.query.source;
            if (!source) {
                return res.status(400).json({ message: "Source is required" });
            }
            try {
                const summary = await (0, getSummaryFromSource_1.getSummaryFromSouceAndSummaryId)(source, summaryId, authUser._id);
                if (!summary) {
                    return res
                        .status(http_status_codes_1.StatusCodes.NOT_FOUND)
                        .json({ message: "Summary not found", success: false });
                }
                await (0, generatedSummaryFromPdf_1.deletedSummary)(summary._id);
                return res
                    .status(http_status_codes_1.StatusCodes.OK)
                    .json({ message: "Summary Deleted", success: true });
            }
            catch (error) {
                if (error.isJoi) {
                    return res.status(422).json({ message: error.message });
                }
                console.log("error", "error in delete pdf summary", error);
                return res.status(500).json({
                    message: "Something happened wrong try again delete summary after sometime",
                    error: JSON.stringify(error.message),
                });
            }
        };
    }
    parseInvoiceData(invoiceText) {
        const headings = ["Key Points", "Action Points", "Summary", "Title"];
        // Initialize result object
        const result = {};
        let text;
        try {
            // Handle both JSON string and regular string
            if ((invoiceText === null || invoiceText === void 0 ? void 0 : invoiceText.startsWith('"')) && (invoiceText === null || invoiceText === void 0 ? void 0 : invoiceText.endsWith('"'))) {
                text = JSON.parse(invoiceText);
            }
            else {
                text = invoiceText;
            }
        }
        catch (error) {
            console.error("Failed to parse JSON:", error);
            text = invoiceText; // Use original text if JSON parsing fails
        }
        // Clean and normalize the text
        const normalizedText = text
            .replace(/\\n/g, "\n") // Handle escaped newlines
            .replace(/\s*\n\s*\n\s*/g, "\n\n") // Normalize multiple newlines
            .trim();
        const normalize = normalizedText.split("\n");
        const title = normalize.find((elem) => elem.startsWith("**Title") || elem.startsWith("Title"));
        // Split text into sections using various heading patterns
        const sections = this.splitTextIntoSections(normalizedText, headings);
        // Process each section
        sections.forEach((section) => {
            if (section.heading && section.content) {
                const headingKey = section.heading;
                result[headingKey] = section.content;
            }
        });
        // Clean up empty sections
        // Object.keys(result).forEach((key) => {
        //   if (
        //     (Array.isArray(result[key]) && result[key].length === 0) ||
        //     (typeof result[key] === "object" &&
        //       Object.keys(result[key]).length === 0) ||
        //     (typeof result[key] === "string" && result[key].trim() === "")
        //   ) {
        //     delete result[key];
        //   }
        // });
        return { result, title };
    }
    splitTextIntoSections(text, headings) {
        const sections = [];
        // Create regex patterns for different heading formats
        const headingPatterns = [
            /^#+\s*([^#\n]+)\s*$/gm, // # Heading
            /^\*\*([^*]+)\*\*\s*:?$/gm, // **Heading**:
            /^([^:\n]+):\s*$/gm, // Heading:
            /^([A-Z][A-Za-z\s]+)(?=\n)/gm, // Title Case at start of line
        ];
        let lastIndex = 0;
        let currentHeading = "";
        let matches = [];
        // Find all potential headings
        headingPatterns.forEach((pattern) => {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                const extractedHeading = match[1].trim();
                const normalizedHeading = this.normalizeHeading(extractedHeading);
                // Check if this matches one of our target headings
                const matchedHeading = headings.find((h) => this.normalizeHeading(h) === normalizedHeading);
                if (matchedHeading) {
                    matches.push({
                        index: match.index,
                        heading: matchedHeading,
                        fullMatch: match[0],
                    });
                }
            }
        });
        // Sort matches by position
        matches.sort((a, b) => a.index - b.index);
        // Extract content for each section
        for (let i = 0; i < matches.length; i++) {
            const currentMatch = matches[i];
            const nextMatch = matches[i + 1];
            const startIndex = currentMatch.index + currentMatch.fullMatch.length;
            const endIndex = nextMatch ? nextMatch.index : text.length;
            const content = text.slice(startIndex, endIndex).trim();
            if (content) {
                sections.push({
                    heading: currentMatch.heading,
                    content: content,
                });
            }
        }
        return sections;
    }
    normalizeHeading(heading) {
        return heading
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, "")
            .replace(/\s+/g, " ")
            .trim();
    }
}
exports.Controller = Controller;
//# sourceMappingURL=generatedSummaryPdf.js.map