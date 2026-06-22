import { describe, it, expect, vi, beforeEach } from "vitest";
import type { EmailMessage, EmailTransport } from "./email.types";
import { sendEmail, sendTemplatedEmail, setEmailTransport } from "./email.service";

function createMockTransport(): EmailTransport & { sent: EmailMessage[] } {
  const sent: EmailMessage[] = [];
  return {
    sent,
    async send(message: EmailMessage) {
      sent.push(message);
    },
  };
}

describe("email.service", () => {
  let mock: ReturnType<typeof createMockTransport>;

  beforeEach(() => {
    mock = createMockTransport();
    setEmailTransport(mock);
  });

  describe("sendEmail", () => {
    it("sends a raw message via the active transport", async () => {
      await sendEmail({ to: "admin@test.com", subject: "Test", html: "<p>Hello</p>" });

      expect(mock.sent).toHaveLength(1);
      expect(mock.sent[0]!.to).toBe("admin@test.com");
      expect(mock.sent[0]!.subject).toBe("Test");
    });

    it("does not throw when transport fails", async () => {
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      setEmailTransport({
        async send() {
          throw new Error("SMTP down");
        },
      });

      await expect(sendEmail({ to: "a@b.com", subject: "X", html: "" })).resolves.toBeUndefined();

      expect(errorSpy).toHaveBeenCalledWith("[Email] Failed to send:", expect.any(Error));
      errorSpy.mockRestore();
    });
  });

  describe("sendTemplatedEmail", () => {
    it("resolves the low-stock template and sends", async () => {
      await sendTemplatedEmail({
        to: "stock@test.com",
        template: "low-stock",
        data: {
          productName: "Crème hydratante",
          sku: "CRM-001",
          stock: 2,
          threshold: 5,
        },
      });

      expect(mock.sent).toHaveLength(1);
      const msg = mock.sent[0]!;
      expect(msg.subject).toContain("Crème hydratante");
      expect(msg.html).toContain("Crème hydratante");
      expect(msg.html).toContain("CRM-001");
      expect(msg.html).toContain("2");
      expect(msg.html).toContain("5");
    });

    it("does not send when template is unknown", async () => {
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      await sendTemplatedEmail({
        to: "a@b.com",
        template: "does-not-exist",
        data: {},
      });

      expect(mock.sent).toHaveLength(0);
      expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("Unknown template"));
      errorSpy.mockRestore();
    });

    it("handles template with null sku", async () => {
      await sendTemplatedEmail({
        to: "stock@test.com",
        template: "low-stock",
        data: {
          productName: "Produit sans SKU",
          sku: null,
          stock: 1,
          threshold: 3,
        },
      });

      expect(mock.sent).toHaveLength(1);
      expect(mock.sent[0]!.html).toContain("sans référence");
    });
  });
});
