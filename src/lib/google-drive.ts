export function extractGoogleDriveFileId(url: string): string | null {
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

export function extractGoogleDriveFolderId(url: string): string | null {
  const trimmed = url.trim();

  const byPath = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
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

export function buildGoogleDriveDownloadUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

export function isGoogleDriveUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.hostname === "drive.google.com" || parsed.hostname.endsWith(".google.com");
  } catch {
    return false;
  }
}

export function isGoogleDriveFolderUrl(url: string): boolean {
  if (!isGoogleDriveUrl(url)) return false;
  return url.includes("/folders/") || url.includes("?id=");
}

export interface DriveFile {
  id: string;
  name: string;
  size: number;
  mimeType: string;
}

export async function listPdfsInFolder(
  folderId: string,
  apiKey: string
): Promise<DriveFile[]> {
  const query = encodeURIComponent(
    `'${folderId}' in parents and mimeType = 'application/pdf' and trashed = false`
  );
  const fields = encodeURIComponent("files(id,name,size,mimeType)");
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&key=${apiKey}&fields=${fields}&pageSize=50`;

  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Drive API error ${res.status}: ${body}`);
  }

  const json = (await res.json()) as { files?: { id: string; name: string; size?: string; mimeType: string }[] };
  const files = json.files ?? [];

  return files.map((f) => ({
    id: f.id,
    name: f.name,
    size: parseInt(f.size ?? "0", 10),
    mimeType: f.mimeType,
  }));
}
