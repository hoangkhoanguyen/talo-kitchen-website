import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ltelle-upload.erosnguyen.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "upload.ltelleeatery.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "*.r2.dev",
        port: "",
      },
      {
        protocol: "https",
        hostname: "assets.talokitchenhg.com",
        port: "",
      },
    ],
    qualities: [85],
  },
};

export default withNextIntl(nextConfig);
