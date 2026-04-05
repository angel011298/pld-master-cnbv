/* eslint-disable @typescript-eslint/no-require-imports */
const pdf = require("pdf-parse");

async function parsePDF(buffer) {
  try {
    const data = await pdf(buffer);
    return {
      text: data.text,
      numpages: data.numpages
    };
  } catch (error) {
    console.error("PDF Parse error:", error);
    throw error;
  }
}

module.exports = { parsePDF };
