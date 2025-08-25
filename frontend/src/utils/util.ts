import { jwtDecode } from "jwt-decode";

export function getUserIdFromToken(token: string): string | null {
  try {
    const decoded = jwtDecode(token) as {
      id?: string;
    };
    return decoded.id || null;
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
}

export function normalizeFilename(file: File): File {
  // Normalize Unicode (NFC form makes composed chars consistent)
  const normalized = file.name.normalize("NFC");

  // Replace any non-ASCII characters (including weird spaces) with "_"
  const safeName = normalized.replace(/[^\x00-\x7F]/g, "_");

  // Return a new File object with safe name
  return new File([file], safeName, { type: file.type });
}
