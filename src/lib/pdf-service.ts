// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse") as (buffer: Buffer) => Promise<{ text: string; numpages: number }>;

export type ParsedPdf = {
  text: string;
  numpages: number;
};

export async function parsePDF(buffer: Buffer): Promise<ParsedPdf> {
  const data = await pdfParse(buffer);
  return { text: data.text, numpages: data.numpages };
}

