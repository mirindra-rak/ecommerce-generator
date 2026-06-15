import { useTranslations } from "next-intl";
import { Button, Container, Eyebrow, Heading, Input } from "@pharmacie/ui";
import { MailIcon } from "./icons";

// Capture e-mail (visuel). Branchement réel (double opt-in) = module email
// (lot 4.15) — formulaire non fonctionnel à ce stade.
export function Newsletter() {
  const t = useTranslations("newsletter");

  return (
    <Container className="pb-20">
      <div className="rounded-sm border border-line bg-brand-50 px-8 py-12 sm:px-12">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div>
            <Eyebrow>{t("eyebrow")}</Eyebrow>
            <Heading as="h3" className="mt-4 !text-2xl">
              <span className="inline-flex items-center gap-2">
                <MailIcon className="h-6 w-6 text-brand-600" />
                {t("heading")}
              </span>
            </Heading>
            <p className="mt-3 text-sm leading-relaxed text-muted">{t("text")}</p>
          </div>

          <form className="flex w-full flex-col gap-3 sm:flex-row" action="#">
            <label htmlFor="newsletter-email" className="sr-only">
              {t("emailLabel")}
            </label>
            <Input
              id="newsletter-email"
              type="email"
              required
              placeholder={t("emailPlaceholder")}
              className="flex-1"
            />
            <Button type="submit">{t("submit")}</Button>
          </form>
        </div>
      </div>
    </Container>
  );
}
