import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Prisma → runtime Node.js obligatoire (jamais edge).
export const runtime = "nodejs";

export const { GET, POST } = toNextJsHandler(auth);
