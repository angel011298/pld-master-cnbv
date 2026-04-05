import * as pdf from "pdf-parse"

export async function parsePDF(buffer: Buffer) {
  // @ts-expect-error - pdf-parse types are tricky with namespace imports
  return await pdf(buffer)
}
