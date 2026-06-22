import { existsSync, mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

export interface StorageAdapter {
  put(key: string, buffer: Buffer, contentType: string): Promise<string>;
  delete(key: string): Promise<void>;
  url(key: string): string;
}

export class LocalStorageAdapter implements StorageAdapter {
  constructor(
    private readonly baseDir: string,
    private readonly publicPrefix: string = "/uploads",
  ) {}

  async put(key: string, buffer: Buffer): Promise<string> {
    const filePath = join(this.baseDir, key);
    const dir = dirname(filePath);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(filePath, buffer);
    return this.url(key);
  }

  async delete(key: string): Promise<void> {
    const filePath = join(this.baseDir, key);
    try {
      unlinkSync(filePath);
    } catch {
      // File already absent — idempotent.
    }
  }

  url(key: string): string {
    return `${this.publicPrefix}/${key}`;
  }
}
