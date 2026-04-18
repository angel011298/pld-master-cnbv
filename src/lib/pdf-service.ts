export type ParsedPdf = {
  text: string;
  numpages: number;
};

export async function parsePDF(buffer: Buffer): Promise<ParsedPdf> {
  // pdfjs-dist is ESM-only; dynamic import works in both Next.js server and CLI contexts
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (pdfjsLib as any).GlobalWorkerOptions.workerSrc = "";

  const data = new Uint8Array(buffer);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc = await (pdfjsLib as any).getDocument({ data, disableWorker: true }).promise;

  const pageTexts: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const tc = await page.getTextContent();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const words = (tc.items as any[]).filter((item) => "str" in item).map((item) => item.str as string);
    pageTexts.push(words.join(" "));
  }

  return { text: pageTexts.join("\n"), numpages: doc.numPages };
}
