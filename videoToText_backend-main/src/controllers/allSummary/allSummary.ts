import { Response } from "express";
import { Request } from "../../request";
import { StatusCodes } from "http-status-codes";
import { getAllSummaries } from "../../modules/folders";
import { Types } from "mongoose";
import moment from "moment";
import Joi from "joi";
import { getSummaryFromSouceAndSummaryId } from "../../modules/chatWithAI/getSummaryFromSource";
import PDFDocument from "pdfkit";
import { Document, HeadingLevel, Packer, Paragraph } from "docx";
import { createWriteStream, mkdirSync, unlink } from "fs";
import path from "path";
type qryType = {
  dateRange?: string;
  source?: string;
  to?: string;
  from?: string;
};
type optionType = {
  filter: string;
  customRange?: {
    from: string;
    to: string;
  };
};
type exportSchema = {
  source: string;
  exportType: string;
  summaryId: string;
};
export class Controller {
  private readonly exportSchema = Joi.object().keys({
    source: Joi.string()
      .valid("pdf", "web", "video", "audio", "text")
      .required(),
    exportType: Joi.string().valid("pdf", "docs").required(),
    summaryId: Joi.string().required(),
  });
  private getDateRange = async (
    filter?: string,
    customRange?: { from: string; to: string }
  ) => {
    const today = moment().startOf("day");
    const now = moment();

    switch (filter.toLowerCase()) {
      case "today":
        return { $gte: today.toDate(), $lte: today.toDate() };
        break;
      case "yesterday":
        return {
          $gte: moment().subtract(1, "day").startOf("day").toDate(),
          $lte: moment().subtract(1, "day").endOf("day").toDate(),
        };
        break;
      case "this week":
        return { $gte: moment().startOf("week").toDate(), $lte: now.toDate() };
      case "last week":
        return {
          $gte: moment().subtract(1, "week").startOf("week").toDate(),
          $lte: moment().subtract(1, "week").endOf("week").toDate(),
        };
      case "this month":
        return { $gte: moment().startOf("month").toDate(), $lte: now.toDate() };
      case "last month":
        return {
          $gte: moment().subtract(1, "month").startOf("month").toDate(),
          $lte: moment().subtract(1, "month").endOf("month").toDate(),
        };
      case "this year":
        return { $gte: moment().startOf("year").toDate(), $lte: now.toDate() };
      case "last year":
        return {
          $gte: moment().subtract(1, "year").startOf("year").toDate(),
          $lte: moment().subtract(1, "year").endOf("year").toDate(),
        };
      case "custom":

        return {
          $gte: new Date(customRange?.from || ""),
          $lte: new Date(customRange?.to || ""),
        };
      default: // All time
        throw new Error(
          `Only Valid ["today", "yesterday", "this week", "last week", "this month", "last month", "this year", "last year", "custom"]`
        );
    }
  };
  protected readonly getSummaries = async (req: Request, res: Response) => {
    try {
      const authUser = req.authUser;
      const query: qryType = req.query;
      let params: {
        userId?: Types.ObjectId | string;
        source?: string;
        createdAt?: Date | { $gte: Date; $lte: Date };
      } = {
        userId: authUser._id,
      };

      if (query.dateRange) {
        // params.dateRange = query.dateRange;
        let option: optionType = { filter: query.dateRange };
        if (query.dateRange.toLowerCase() === "custom") {
          if (query.to && query.from) {
            option.customRange = { to: query.to, from: query.from };
          } else {
            return res.status(StatusCodes.BAD_REQUEST).json({
              message: "Invalid Custom Date Range",
              success: false,
            });
          }
        }
        const createdAtFilter = await this.getDateRange(
          option.filter,
          option.customRange
        );
        params.createdAt = createdAtFilter;
      }
      if (query.source) {
        params.source = query.source;
      }

      const summaries = await getAllSummaries(params);
      return res.status(StatusCodes.OK).json({
        message: "Summaries Fetched",
        result: summaries,
        success: true,
      });
    } catch (error) {
      console.log("error", "error in get all summaries", error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Something happened wrong try again after sometime.",
        error: error.message,
      });
    }
  };
  private readonly exportPDF = async (
    summary: any,
    title: string,
    doc: PDFKit.PDFDocument
  ) => {
    const marketing = {
      title: "Smart Noter",
      playStore: "https://play.google.com/store/apps/details?id=com.autonotes.ainotemaker.aimeetingnotestaker",
      appStore: "https://play.google.com/store/apps/details?id=com.autonotes.ainotemaker.aimeetingnotestaker"
    }
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
    doc.fontSize(10).fillColor("gray").text(
    `Shared from AutoNotes: ${marketing.title}\n\nDownload AutoNotes: ${marketing.title}:\nPlay Store : ${marketing.playStore}`,
    {
      align: "center", // center it at bottom
    }
  );
  };
  private readonly exportDOC = async (
    summary: any,
    payloadValue: exportSchema,
    title: string
  ): Promise<Buffer> => {
    let cleanJson;
    const aiResponse = summary.aiResponse;
    if (aiResponse.startsWith("```json")) {
      cleanJson = aiResponse.replace(/```json\n?|\n```/g, "");
    } else {
      cleanJson = aiResponse;
    }
    const parsedResponse = JSON.parse(cleanJson);

    const children = [
      new Paragraph({
        text: title,
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: `Source: ${payloadValue.source} Summary`,
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: `Language: ${summary.language || "English"}`,
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: "Summary:",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      }),
      new Paragraph({
        text: summary.summarization || summary.summary || "No summary provided",
        spacing: { after: 100 },
      }),
    ];

    if (summary.transcript) {
      children.push(
        new Paragraph({
          text: "Transcript:",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        })
      );
      // Split transcript into chunks to avoid exceeding max paragraph size
      const transcriptChunks =
        summary.transcript.match(/(.{1,1000})(\s|$)/g) || [];
      transcriptChunks.forEach((chunk) =>
        children.push(
          new Paragraph({
            text: chunk.trim(),
            spacing: { after: 50 },
          })
        )
      );
    }

    if (Array.isArray(summary.quotes)) {
      children.push(
        new Paragraph({
          text: "Quotes:",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        }),
        ...summary.quotes.map(
          (point) =>
            new Paragraph({
              text: `* ${point}`,
              bullet: { level: 0 },
              spacing: { after: 50 },
            })
        )
      );
    }

    if (Array.isArray(summary.tags)) {
      children.push(
        new Paragraph({
          text: "Tags:",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        }),
        ...summary.tags.map(
          (point) =>
            new Paragraph({
              text: `* ${point}`,
              bullet: { level: 0 },
              spacing: { after: 50 },
            })
        )
      );
    }

    if (Array.isArray(summary.keyPoints) || Array.isArray(summary.keypoints)) {
      children.push(
        new Paragraph({
          text: "Key Points:",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        }),
        ...(summary.keyPoints || summary.keypoints || []).map(
          (point) =>
            new Paragraph({
              text: `* ${point}`,
              bullet: { level: 0 },
              spacing: { after: 50 },
            })
        )
      );
    }

    if (
      Array.isArray(summary.actionPoints) ||
      Array.isArray(summary.actionpoints)
    ) {
      children.push(
        new Paragraph({
          text: "Action Points:",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        }),
        ...(summary.actionPoints || summary.actionpoints || []).map(
          (point) =>
            new Paragraph({
              text: `* ${point}`,
              bullet: { level: 0 },
              spacing: { after: 50 },
            })
        )
      );
    }

    const doc = new Document({
      sections: [
        {
          properties: {},
          children,
        },
      ],
    });

    try {
      const buffer = await Packer.toBuffer(doc);
      if (!buffer || buffer.length === 0) {
        throw new Error("Generated DOCX buffer is empty");
      }
      return buffer;
    } catch (error) {
      throw new Error(`Failed to generate DOCX: ${error.message}`);
    }
  };
  protected readonly export = async (req: Request, res: Response) => {
    try {
      const authUser = req.authUser;
      const payloadValue = await this.exportSchema.validateAsync(req.body, {
        stripUnknown: true,
      });
      const summary = await getSummaryFromSouceAndSummaryId(
        payloadValue.source,
        payloadValue.summaryId,
        authUser._id
      );
      if (!summary) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "Summary not found", success: false });
      }
      const title =
        summary?.title || summary?.topic || `${payloadValue.source} Summary`;
      const filename = (summary?.title || summary?.topic).replace(
        /[<>:"/\\|?*]/g,
        ""
      );
      if (payloadValue.exportType === "pdf") {
        const doc = new PDFDocument();
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=${filename}`
        );
        const outPath = path.resolve(__dirname, "exports", `${filename}.pdf`);

        mkdirSync(path.dirname(outPath), { recursive: true });
        const fileStream = createWriteStream(outPath);
        doc.pipe(fileStream);
        doc.pipe(res);
        await this.exportPDF(summary, title, doc);
        doc.end();
        fileStream.on("finish", () => {
          unlink(outPath, (err) => {
            if (err) {
              throw new Error(err.message);
            }
          });
        });
      } else if (payloadValue.exportType === "docs") {
        const buffer = await this.exportDOC(summary, payloadValue, title);
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=${filename}.docx`
        );
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        );
        res.send(buffer);
      }
    } catch (error) {
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
