import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';

export const generateDocx = async (parts: string[]): Promise<Blob> => {
  const children = [];

  for (let i = 0; i < parts.length; i++) {
    const partText = parts[i];
    
    // Process the text into paragraphs based on double newlines
    const paragraphs = partText.split(/\n\n+/).map((text) => {
      return new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: {
          after: 200, // Spacing after paragraph
          line: 360, // 1.5 line spacing (240 * 1.5)
        },
        children: [
          new TextRun({
            text: text.trim(),
            font: "Arial",
            size: 24, // 12pt
          }),
        ],
      });
    });

    children.push(...paragraphs);

    // Add separator if not the last part
    if (i < parts.length - 1) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 400, after: 400 },
          children: [
            new TextRun({
              text: "...",
              font: "Arial",
              size: 28,
              bold: true,
            }),
          ],
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: children,
      },
    ],
  });

  return await Packer.toBlob(doc);
};

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};
