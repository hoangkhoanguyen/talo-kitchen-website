import { webRoutes } from "@/constants/route";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Logo() {
  return (
    <Link href={webRoutes.home()}>
      <Image
        src={"/logo-talo.svg"}
        alt="TALO Kitchen & Lounge"
        width={129}
        height={61}
        priority
      />
    </Link>
  );
}
