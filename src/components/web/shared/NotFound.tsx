import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import { webRoutes } from "@/constants/route";

const NotFound = () => {
  return (
    <div className="container pt-20 pb-10 flex flex-col md:items-center justify-center h-full">
      <p className="text-web-primary text-web-h2-mobile lg:text-web-h2 mb-5">
        OOOPS!!
      </p>
      <p className="text-web-content-1 text-web-subtitle-mobile lg:text-web-subtitle mb-10">
        This is not page you are looking for!
      </p>
      <Button
        as={Link}
        href={webRoutes.home()}
        className="text-web-button-mobile lg:text-web-button py-4.5 w-full lg:max-w-80"
      >
        Back to Home
      </Button>
    </div>
  );
};

export default NotFound;
