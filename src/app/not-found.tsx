import Link from "next/link";
import { Metadata } from "next";
import { webRoutes } from "@/constants/route";

export const metadata: Metadata = {
  title: "Page Not Found | TALO Kitchen & Lounge",
  description:
    "The page you are looking for could not be found. Return to TALO Kitchen & Lounge homepage.",
  robots: {
    index: false,
    follow: true,
  },
};

const NotFoundPage = () => {
  return (
    <body>
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-web-background-2">
        <div className="text-center max-w-2xl">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-3xl font-semibold text-gray-700 mb-6">
            Page Not Found
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Oops! The page you are looking for could not be found.
          </p>
          <Link
            href={webRoutes.home()}
            className="inline-block px-8 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </body>
  );
};

export default NotFoundPage;
