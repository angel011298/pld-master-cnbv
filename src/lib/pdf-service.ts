import pdfParse from "pdf-parse";

export type ParsedPdf = {
  text: string;
  numpages: number;
};

export async function parsePDF(buffer: Buffer): Promise<ParsedPdf> {
  const data = await pdfParse(buffer);
  return { text: data.text, numpages: data.numpages };
}

