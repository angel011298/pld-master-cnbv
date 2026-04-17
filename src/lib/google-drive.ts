export function extractGoogleDriveFileId(url: string) {
  const trimmed = url.trim();

  const byPath = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (byPath?.[1]) return byPath[1];

  try {
    const parsed = new URL(trimmed);
    const byQuery = parsed.searchParams.get("id");
    if (byQuery) return byQuery;
  } catch {
    return null;
  }

  return null;
}

export function buildGoogleDriveDownloadUrl(fileId: string) {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

export function isGoogleDriveUrl(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.hostname === "drive.google.com" || parsed.hostname.endsWith(".google.com");
  } catch {
    return false;
  }
}

