import { jsPDF } from 'jspdf';

export interface SummaryData {
    title: string;
    url?: string;
    summarization: string;
    keyPoints?: string[];
    actionPoints?: string[];
}

export const downloadAsPdf = (summary: SummaryData) => {
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;
    let y = 25;

    // Helper to check for page break
    const checkPageBreak = (neededHeight: number) => {
        if (y + neededHeight > pageHeight - margin) {
            doc.addPage();
            y = 20;
            return true;
        }
        return false;
    };

    // Document Title (SmartNoter Header)
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(99, 102, 241); // indigo-500
    doc.text('SMARTNOTER AI SUMMARY', margin, y);
    y += 8;

    // Divider Line
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 12;

    // Title of the Summary
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(30, 41, 59); // slate-800
    const titleLines = doc.splitTextToSize(summary.title || 'Summary', contentWidth);
    doc.text(titleLines, margin, y);
    y += (titleLines.length * 7) + 5;

    // Source URL if available
    if (summary.url) {
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184); // slate-400
        const urlText = `Source: ${summary.url}`;
        const urlLines = doc.splitTextToSize(urlText, contentWidth);
        doc.text(urlLines, margin, y);
        y += (urlLines.length * 4) + 8;
    }

    // Section: Executive Summary
    checkPageBreak(25);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(79, 70, 229); // indigo-600
    doc.text('Executive Summary', margin, y);
    y += 6;

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(71, 85, 105); // slate-600
    const summaryLines = doc.splitTextToSize(summary.summarization || '', contentWidth);
    
    // Draw summary lines with pagination support
    for (let i = 0; i < summaryLines.length; i++) {
        checkPageBreak(6);
        doc.text(summaryLines[i], margin, y);
        y += 6;
    }
    y += 6;

    // Section: Key Insights
    if (summary.keyPoints && summary.keyPoints.length > 0) {
        checkPageBreak(20);
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(79, 70, 229); // indigo-600
        doc.text('Key Insights', margin, y);
        y += 8;

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(71, 85, 105); // slate-600

        summary.keyPoints.forEach((point, index) => {
            const bulletText = `${index + 1}. ${point}`;
            const bulletLines = doc.splitTextToSize(bulletText, contentWidth - 5); // Indent slightly
            
            checkPageBreak(bulletLines.length * 6 + 2);
            doc.text(bulletLines, margin, y);
            y += (bulletLines.length * 6) + 2;
        });
        y += 4;
    }

    // Section: Actionable Steps
    if (summary.actionPoints && summary.actionPoints.length > 0) {
        checkPageBreak(20);
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(79, 70, 229); // indigo-600
        doc.text('Actionable Steps', margin, y);
        y += 8;

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(71, 85, 105); // slate-600

        summary.actionPoints.forEach((point, index) => {
            const bulletText = `- ${point}`;
            const bulletLines = doc.splitTextToSize(bulletText, contentWidth - 5);
            
            checkPageBreak(bulletLines.length * 6 + 2);
            doc.text(bulletLines, margin, y);
            y += (bulletLines.length * 6) + 2;
        });
        y += 4;
    }

    // Footer on all pages
    const pageCount = doc.internal.pages.length;
    for (let i = 1; i < pageCount; i++) {
        doc.setPage(i);
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184); // slate-400
        doc.text('Generated with SmartNoter AI', margin, pageHeight - 10);
        doc.text(`Page ${i} of ${pageCount - 1}`, pageWidth - margin - 15, pageHeight - 10);
    }

    doc.save(`${(summary.title || 'summary').replace(/[^a-z0-9]/gi, '_').toLowerCase()}_summary.pdf`);
};

export const downloadAsMd = (summary: SummaryData) => {
    let mdText = `# ${summary.title}\n\n`;
    if (summary.url) {
        mdText += `**Source URL:** [Link](${summary.url})\n\n`;
    }
    mdText += `## Executive Summary\n\n${summary.summarization}\n\n`;
    if (summary.keyPoints && summary.keyPoints.length > 0) {
        mdText += `## Key Insights\n\n`;
        summary.keyPoints.forEach((point: string) => {
            mdText += `- ${point}\n`;
        });
        mdText += `\n`;
    }
    if (summary.actionPoints && summary.actionPoints.length > 0) {
        mdText += `## Actionable Steps\n\n`;
        summary.actionPoints.forEach((point: string) => {
            mdText += `- ${point}\n`;
        });
        mdText += `\n`;
    }
    mdText += `*Generated with SmartNoter AI*`;
    const blob = new Blob([mdText], { type: 'text/markdown;charset=utf-8' });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${(summary.title || 'summary').replace(/[^a-z0-9]/gi, '_').toLowerCase()}_summary.md`;
    link.click();
    URL.revokeObjectURL(downloadUrl);
};
