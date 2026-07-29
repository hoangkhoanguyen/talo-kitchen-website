import Image from "next/image";
import React from "react";
import { Button } from "../../ui/button";
import Link from "next/link";
import { webRoutes } from "@/constants/route";

const EmptyCart = () => {
  return (
    <div className="container flex flex-col items-center justify-center py-20 text-center">
      <div className="relative w-full max-w-[483px] aspect-square mb-10">
        <Image
          src="/assets/static/empty-cart.jpg"
          alt="Empty Cart"
          fill
          className="w-full"
        />
      </div>
      <h2 className="text-web-h1-mobile lg:text-web-h1 text-web-primary mb-5">
        Your cart is empty
      </h2>
      <p className="text-web-h4-mobile lg:text-web-h4 text-web-content-3">
        You have no items in your cart.
      </p>
      <p className="text-web-h4-mobile lg:text-web-h4 text-web-content-3 mb-10">
        Let’s go buy something
      </p>
      <Button
        as={Link}
        href={webRoutes.menu("all")}
        variant={"primary"}
        className="rounded-lg text-web-button-mobile lg:text-web-button py-4 px-28"
      >
        Continue Shopping
      </Button>
    </div>
  );
};

export default EmptyCart;
