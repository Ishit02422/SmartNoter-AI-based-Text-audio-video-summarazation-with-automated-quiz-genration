"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Controller = void 0;
const http_status_codes_1 = require("http-status-codes");
const folders_1 = require("../../modules/folders");
const moment_1 = __importDefault(require("moment"));
const joi_1 = __importDefault(require("joi"));
const getSummaryFromSource_1 = require("../../modules/chatWithAI/getSummaryFromSource");
const pdfkit_1 = __importDefault(require("pdfkit"));
const docx_1 = require("docx");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
class Controller {
    constructor() {
        this.exportSchema = joi_1.default.object().keys({
            source: joi_1.default.string()
                .valid("pdf", "web", "video", "audio", "text")
                .required(),
            exportType: joi_1.default.string().valid("pdf", "docs").required(),
            summaryId: joi_1.default.string().required(),
        });
        this.getDateRange = async (filter, customRange) => {
            const today = (0, moment_1.default)().startOf("day");
            const now = (0, moment_1.default)();
            switch (filter.toLowerCase()) {
                case "today":
                    return { $gte: today.toDate(), $lte: today.toDate() };
                    break;
                case "yesterday":
                    return {
                        $gte: (0, moment_1.default)().subtract(1, "day").startOf("day").toDate(),
                        $lte: (0, moment_1.default)().subtract(1, "day").endOf("day").toDate(),
                    };
                    break;
                case "this week":
                    return { $gte: (0, moment_1.default)().startOf("week").toDate(), $lte: now.toDate() };
                case "last week":
                    return {
                        $gte: (0, moment_1.default)().subtract(1, "week").startOf("week").toDate(),
                        $lte: (0, moment_1.default)().subtract(1, "week").endOf("week").toDate(),
                    };
                case "this month":
                    return { $gte: (0, moment_1.default)().startOf("month").toDate(), $lte: now.toDate() };
                case "last month":
                    return {
                        $gte: (0, moment_1.default)().subtract(1, "month").startOf("month").toDate(),
                        $lte: (0, moment_1.default)().subtract(1, "month").endOf("month").toDate(),
                    };
                case "this year":
                    return { $gte: (0, moment_1.default)().startOf("year").toDate(), $lte: now.toDate() };
                case "last year":
                    return {
                        $gte: (0, moment_1.default)().subtract(1, "year").startOf("year").toDate(),
                        $lte: (0, moment_1.default)().subtract(1, "year").endOf("year").toDate(),
                    };
                case "custom":
                    return {
                        $gte: new Date((customRange === null || customRange === void 0 ? void 0 : customRange.from) || ""),
                        $lte: new Date((customRange === null || customRange === void 0 ? void 0 : customRange.to) || ""),
                    };
                default: // All time
                    throw new Error(`Only Valid ["today", "yesterday", "this week", "last week", "this month", "last month", "this year", "last year", "custom"]`);
            }
        };
        this.getSummaries = async (req, res) => {
            try {
                const authUser = req.authUser;
                const query = req.query;
                let params = {
                    userId: authUser._id,
                };
                if (query.dateRange) {
                    // params.dateRange = query.dateRange;
                    let option = { filter: query.dateRange };
                    if (query.dateRange.toLowerCase() === "custom") {
                        if (query.to && query.from) {
                            option.customRange = { to: query.to, from: query.from };
                        }
                        else {
                            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                                message: "Invalid Custom Date Range",
                                success: false,
                            });
                        }
                    }
                    const createdAtFilter = await this.getDateRange(option.filter, option.customRange);
                    params.createdAt = createdAtFilter;
                }
                if (query.source) {
                    params.source = query.source;
                }
                const summaries = await (0, folders_1.getAllSummaries)(params);
                return res.status(http_status_codes_1.StatusCodes.OK).json({
                    message: "Summaries Fetched",
                    result: summaries,
                    success: true,
                });
            }
            catch (error) {
                console.log("error", "error in get all summaries", error);
                return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
                    message: "Something happened wrong try again after sometime.",
                    error: error.message,
                });
            }
        };
        this.exportPDF = async (summary, title, doc) => {
            const marketing = {
                title: "Smart Noter",
                playStore: "https://play.google.com/store/apps/details?id=com.autonotes.ainotemaker.aimeetingnotestaker",
                appStore: "https://play.google.com/store/apps/details?id=com.autonotes.ainotemaker.aimeetingnotestaker"
            };
            doc.fontSize(20).text(title, { underline: true });
            doc.moveDown();
            doc.fontSize(12).text(`Language: ${summary.language || "English"}`);
            doc.moveDown();
            if (summary.details) {
                doc.fontSize(14).text("Details:");
                doc.fontSize(8).text(summary.details, {
                    indent: 20,
                    height: 100,
                });
                doc.moveDown();
            }
            doc.fontSize(14).text("Summary:");
            doc
                .fontSize(10)
                .text(summary.summarization || summary.summary, { indent: 20 });
            doc.addPage();
            if (summary.transcript) {
                doc.fontSize(14).text("Transcript:");
                doc.fontSize(8).text(summary.transcript, {
                    width: 400,
                    align: "left",
                    indent: 0,
                });
                doc.moveDown();
            }
            if (summary.keyPoints || summary.keypoints) {
                doc.fontSize(14).text("Key Points:");
                (summary.keyPoints || summary.keypoints).map((point) => {
                    doc.fontSize(8).text(`* ${point}`, {
                        indent: 20,
                    });
                });
                doc.moveDown();
            }
            if (summary.actionPoints || summary.actionpoints) {
                doc.fontSize(14).text("Action Points:");
                (summary.actionPoints || summary.actionpoints).map((point) => {
                    doc.fontSize(8).text(`* ${point}`, {
                        indent: 20,
                    });
                });
                doc.moveDown();
            }
            if (summary.quotes) {
                doc.fontSize(14).text("Quotes:");
                summary.quotes.map((point) => {
                    doc.fontSize(8).text(`* ${point}`, {
                        indent: 20,
                    });
                });
                doc.moveDown();
            }
            if (summary.tags) {
                doc.fontSize(14).text("Tags:");
                summary.tags.map((point) => {
                    doc.fontSize(8).text(`* ${point}`, {
                        indent: 20,
                    });
                });
                doc.moveDown();
            }
            doc.moveDown(3);
            doc.fontSize(10).fillColor("gray").text(`Shared from AutoNotes: ${marketing.title}\n\nDownload AutoNotes: ${marketing.title}:\nPlay Store : ${marketing.playStore}`, {
                align: "center", // center it at bottom
            });
        };
        this.exportDOC = async (summary, payloadValue, title) => {
            let cleanJson;
            const aiResponse = summary.aiResponse;
            if (aiResponse.startsWith("```json")) {
                cleanJson = aiResponse.replace(/```json\n?|\n```/g, "");
            }
            else {
                cleanJson = aiResponse;
            }
            const parsedResponse = JSON.parse(cleanJson);
            const children = [
                new docx_1.Paragraph({
                    text: title,
                    heading: docx_1.HeadingLevel.HEADING_1,
                    spacing: { after: 200 },
                }),
                new docx_1.Paragraph({
                    text: `Source: ${payloadValue.source} Summary`,
                    spacing: { after: 100 },
                }),
                new docx_1.Paragraph({
                    text: `Language: ${summary.language || "English"}`,
                    spacing: { after: 100 },
                }),
                new docx_1.Paragraph({
                    text: "Summary:",
                    heading: docx_1.HeadingLevel.HEADING_2,
                    spacing: { before: 200, after: 100 },
                }),
                new docx_1.Paragraph({
                    text: summary.summarization || summary.summary || "No summary provided",
                    spacing: { after: 100 },
                }),
            ];
            if (summary.transcript) {
                children.push(new docx_1.Paragraph({
                    text: "Transcript:",
                    heading: docx_1.HeadingLevel.HEADING_2,
                    spacing: { before: 200, after: 100 },
                }));
                // Split transcript into chunks to avoid exceeding max paragraph size
                const transcriptChunks = summary.transcript.match(/(.{1,1000})(\s|$)/g) || [];
                transcriptChunks.forEach((chunk) => children.push(new docx_1.Paragraph({
                    text: chunk.trim(),
                    spacing: { after: 50 },
                })));
            }
            if (Array.isArray(summary.quotes)) {
                children.push(new docx_1.Paragraph({
                    text: "Quotes:",
                    heading: docx_1.HeadingLevel.HEADING_2,
                    spacing: { before: 200, after: 100 },
                }), ...summary.quotes.map((point) => new docx_1.Paragraph({
                    text: `* ${point}`,
                    bullet: { level: 0 },
                    spacing: { after: 50 },
                })));
            }
            if (Array.isArray(summary.tags)) {
                children.push(new docx_1.Paragraph({
                    text: "Tags:",
                    heading: docx_1.HeadingLevel.HEADING_2,
                    spacing: { before: 200, after: 100 },
                }), ...summary.tags.map((point) => new docx_1.Paragraph({
                    text: `* ${point}`,
                    bullet: { level: 0 },
                    spacing: { after: 50 },
                })));
            }
            if (Array.isArray(summary.keyPoints) || Array.isArray(summary.keypoints)) {
                children.push(new docx_1.Paragraph({
                    text: "Key Points:",
                    heading: docx_1.HeadingLevel.HEADING_2,
                    spacing: { before: 200, after: 100 },
                }), ...(summary.keyPoints || summary.keypoints || []).map((point) => new docx_1.Paragraph({
                    text: `* ${point}`,
                    bullet: { level: 0 },
                    spacing: { after: 50 },
                })));
            }
            if (Array.isArray(summary.actionPoints) ||
                Array.isArray(summary.actionpoints)) {
                children.push(new docx_1.Paragraph({
                    text: "Action Points:",
                    heading: docx_1.HeadingLevel.HEADING_2,
                    spacing: { before: 200, after: 100 },
                }), ...(summary.actionPoints || summary.actionpoints || []).map((point) => new docx_1.Paragraph({
                    text: `* ${point}`,
                    bullet: { level: 0 },
                    spacing: { after: 50 },
                })));
            }
            const doc = new docx_1.Document({
                sections: [
                    {
                        properties: {},
                        children,
                    },
                ],
            });
            try {
                const buffer = await docx_1.Packer.toBuffer(doc);
                if (!buffer || buffer.length === 0) {
                    throw new Error("Generated DOCX buffer is empty");
                }
                return buffer;
            }
            catch (error) {
                throw new Error(`Failed to generate DOCX: ${error.message}`);
            }
        };
        this.export = async (req, res) => {
            try {
                const authUser = req.authUser;
                const payloadValue = await this.exportSchema.validateAsync(req.body, {
                    stripUnknown: true,
                });
                const summary = await (0, getSummaryFromSource_1.getSummaryFromSouceAndSummaryId)(payloadValue.source, payloadValue.summaryId, authUser._id);
                if (!summary) {
                    return res
                        .status(http_status_codes_1.StatusCodes.NOT_FOUND)
                        .json({ message: "Summary not found", success: false });
                }
                const title = (summary === null || summary === void 0 ? void 0 : summary.title) || (summary === null || summary === void 0 ? void 0 : summary.topic) || `${payloadValue.source} Summary`;
                const filename = ((summary === null || summary === void 0 ? void 0 : summary.title) || (summary === null || summary === void 0 ? void 0 : summary.topic)).replace(/[<>:"/\\|?*]/g, "");
                if (payloadValue.exportType === "pdf") {
                    const doc = new pdfkit_1.default();
                    res.setHeader("Content-Type", "application/pdf");
                    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
                    const outPath = path_1.default.resolve(__dirname, "exports", `${filename}.pdf`);
                    (0, fs_1.mkdirSync)(path_1.default.dirname(outPath), { recursive: true });
                    const fileStream = (0, fs_1.createWriteStream)(outPath);
                    doc.pipe(fileStream);
                    doc.pipe(res);
                    await this.exportPDF(summary, title, doc);
                    doc.end();
                    fileStream.on("finish", () => {
                        (0, fs_1.unlink)(outPath, (err) => {
                            if (err) {
                                throw new Error(err.message);
                            }
                        });
                    });
                }
                else if (payloadValue.exportType === "docs") {
                    const buffer = await this.exportDOC(summary, payloadValue, title);
                    res.setHeader("Content-Disposition", `attachment; filename=${filename}.docx`);
                    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
                    res.send(buffer);
                }
            }
            catch (error) {
                if (error.isJoi) {
                    return res.status(422).json({ message: error.message });
                }
                console.log("error", "error in export pdf or docx", error);
                return res.status(500).json({
                    message: "Something happened wrong try again export after sometime",
                    error: JSON.stringify(error.message),
                });
            }
        };
    }
}
exports.Controller = Controller;
//# sourceMappingURL=allSummary.js.map