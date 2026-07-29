"use client";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react/dist/iconify.js";
import Image from "next/image";
import path from "path";
import React, { FC, useMemo } from "react";

const ImageItem: FC<{ isSelected?: boolean; url: string; onClick(): void }> = ({
  isSelected,
  onClick,
  url,
}) => {
  const { ext, fileName } = useMemo(() => {
    const pathname =
      url.startsWith("http://") || url.startsWith("https://")
        ? new URL(url).pathname
        : url;
    const fileNameWithExt = path.basename(pathname);

    const ext = path.extname(fileNameWithExt);

    const fileName = path.basename(fileNameWithExt, ext);

    return {
      fileName,
      ext: ext.replace(".", ""),
    };
  }, [url]);

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center p-3 duration-200 rounded-lg group",
        isSelected
          ? "bg-gray-100 dark:bg-gray-700"
          : "hover:bg-gray-50 dark:hover:bg-gray-800",
      )}
    >
      <div className="w-full bg-white aspect-square border border-gray-200 rounded-md mb-2 relative overflow-hidden">
        <Image src={url} alt="" fill className="object-contain" />
        {/* <button
          className={cn(
            "absolute bottom-1 right-1 duration-200 bg-blue-500 hover:bg-blue-800 p-1 rounded",
            "opacity-0 group-hover:opacity-100"
          )}
        >
          <Icon icon="mdi:eye-outline" className="text-white text-xs" />
        </button> */}
        <button
          className={cn(
            "absolute top-1 left-1 duration-200 p-1 rounded",
            isSelected
              ? "bg-blue-500 hover:bg-blue-800 opacity-100"
              : "opacity-0 group-hover:opacity-100 border border-gray-200 bg-white hover:bg-gray-100",
          )}
        >
          <Icon
            icon="streamline:check-solid"
            className={cn(
              "text-white text-xs duration-200 origin-center",
              isSelected ? "scale-100 opacity-100" : "scale-0 opacity-0",
            )}
          />
        </button>
      </div>
      <p className="line-clamp-1 w-full text-xs text-gray-700 dark:text-gray-300">
        {fileName}
      </p>
      <p className="text-sm uppercase text-gray-500 dark:text-gray-400">
        {ext}
      </p>
    </button>
  );
};

export default ImageItem;
