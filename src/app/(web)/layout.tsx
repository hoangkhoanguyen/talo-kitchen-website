import "@/app/globals.css";
import Footer from "@/components/web/shared/Footer";
import Header from "@/components/web/shared/header/Header";
import React, { FC, PropsWithChildren } from "react";
import { Poppins } from "next/font/google";
import localFont from "next/font/local";
import { WebsiteQueryProvider } from "@/providers/react-query-provider";
import AnimationHeaderScroll from "@/components/web/shared/header/AnimationHeaderScroll";
import { Toaster } from "sonner";
import Icon from "@/components/common/Icon";
import { getUIConfigsByKeyCached } from "@/services/cached";
import { FullscreenLoading } from "@/components/web/ui/loading";
import QuickCartModal from "@/components/web/shared/quick-cart/QuickCartModal";
import FloatingActions from "@/components/web/shared/FloatingActions";
import type { Metadata } from "next";
import { APP_DESCRIPTION, APP_NAME, APP_URL } from "@/constants/app";
import Script from "next/script";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: APP_NAME,
  url: APP_URL,
  logo: `${APP_URL}/talo-logo-bg.svg`,
  description: APP_DESCRIPTION,
  image: `${APP_URL}/assets/static/hero.png`,
};

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s`,
    // template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  metadataBase: new URL(APP_URL),
  formatDetection: {
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: `/favicon-32.png`, type: "image/png", sizes: "32x32" },
      { url: `/favicon-96.png`, type: "image/png", sizes: "96x96" },
      { url: `/favicon-192.png`, type: "image/png", sizes: "192x192" },
      { url: `/favicon-512.png`, type: "image/png", sizes: "512x512" },
      { url: `/talo-logo-bg.svg`, type: "image/svg+xml" },
    ],
    apple: [
      { url: `/favicon-180.png`, sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "mask-icon", url: `/talo-logo-bg.svg` },
    ],
  },
  manifest: `/site.webmanifest`,
  // openGraph: {
  //   title: APP_NAME,
  //   description: APP_DESCRIPTION,
  //   url: APP_URL,
  //   siteName: APP_NAME,
  //   locale: "en_US",
  //   type: "website",
  //   images: [
  //     {
  //       url: "/assets/static/hero.png",
  //       width: 1200,
  //       height: 630,
  //       alt: APP_NAME,
  //     },
  //   ],
  // },
  // twitter: {
  //   card: "summary_large_image",
  //   title: APP_NAME,
  //   description: APP_DESCRIPTION,
  //   images: ["/assets/static/hero.png"],
  // },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  other: {
    "script:ld+json": JSON.stringify(organizationSchema),
  },
};

const popinsSans = Poppins({
  variable: "--font-poppins-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const allogist = localFont({
  src: "./SVN-Allogist.otf",
  variable: "--font-allogist",
});

export const dynamic = "force-dynamic";

const Layout: FC<PropsWithChildren> = async ({ children }) => {
  const configs = await getUIConfigsByKeyCached("layout");

  return (
    <html lang="en">
      <head>
        {/* Google Tag Manager */}
        <Script strategy="beforeInteractive" src="/assets/js/script.js" />
        <Script
          async
          strategy="beforeInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-DF54SPMHH0"
        />
        <Script>
          {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-DF54SPMHH0');

          // console.log("GTM Initialized");
        `}
        </Script>
      </head>

      <body
        className={`website antialiased ${popinsSans.variable} ${allogist.variable} antialiased font-poppins-sans bg-web-background-1 flex flex-col items-stretch min-h-screen`}
      >
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-WW4GQR6L"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>
        <WebsiteQueryProvider>
          <AnimationHeaderScroll>
            <Header configs={configs?.value.header || {}} />
          </AnimationHeaderScroll>
          <main className="pt-[149px] lg:pt-[146px] flex-1">{children}</main>
          <Footer configs={configs?.value.footer || {}} />
          <FloatingActions configs={configs?.value.floating_actions || {}} />
          <Toaster
            visibleToasts={3}
            position="top-center"
            icons={{
              success: (
                <Icon
                  icon="ph:check-circle-fill"
                  className="text-xl text-web-secondary-1"
                />
              ),
              error: (
                <Icon
                  icon="ph:x-circle-fill"
                  className="text-xl text-web-error"
                />
              ),
            }}
          />
          <QuickCartModal />
          <FullscreenLoading />
        </WebsiteQueryProvider>
      </body>
    </html>
  );
};

export default Layout;
