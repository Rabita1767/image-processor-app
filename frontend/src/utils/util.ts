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
