import { Link } from "@/i18n/navigation";
import { webRoutes } from "@/constants/route";
import { getTranslations } from "next-intl/server";
import { resolveLocale } from "@/lib/locale";
import { getOgLocale } from "@/lib/i18n-meta";
import type { Metadata } from "next";

/**
 * NOTE (sprint-4-i18n-polish, EC-01/RULE-05): when a page in this locale
 * segment calls `notFound()` (e.g. dish/[slug] for a missing product), Next
 * discards that page's own `generateMetadata` result and renders this
 * boundary instead — so THIS file must be locale-aware, otherwise every 404
 * (including "product not found") silently falls back to the untranslated
 * root layout title regardless of locale.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale?: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const t = await getTranslations({ locale, namespace: "notFound" });

  return {
    title: t("title"),
    description: t("message"),
    openGraph: {
      title: t("title"),
      description: t("message"),
      locale: getOgLocale(locale),
    },
  };
}

const NotFoundPage = async () => {
  const t = await getTranslations("notFound");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-web-background-2">
      <div className="text-center max-w-2xl">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-gray-700 mb-6">
          {t("title")}
        </h2>
        <p className="text-lg text-gray-600 mb-8">{t("message")}</p>
        <Link
          href={webRoutes.home()}
          className="inline-block px-8 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          {t("backHome")}
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
