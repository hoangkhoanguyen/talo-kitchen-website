"use client";

import { Icon } from "@iconify/react/dist/iconify.js";
import React, { FC, useCallback, useRef } from "react";
import ImageItem from "./ImageItem";
import useFetchImages from "@/hooks/admin/media/useFetchImages";
import useUploadImage from "@/hooks/admin/media/useUploadImage";
import { Input } from "../../ui/form";
import { cn } from "@/lib/utils";

const ImageLibrary: FC<{
  selectedImgs: string[];
  onClickImgBox(url: string): void;
}> = ({ onClickImgBox, selectedImgs }) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: images = [], refetch } = useFetchImages();

  const { mutate, isPending } = useUploadImage();

  const onClickInput = useCallback(() => {
    if (!fileRef.current) return;

    fileRef.current.files = null;

    fileRef.current.click();
  }, []);

  const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];

    mutate(file, {
      onSuccess() {
        refetch();
      },
    });
  };

  return (
    <>
      <div className="flex flex-col gap-5 max-h-[600px]">
        <div className="">
          <p className="text-xl text-gray-700 dark:text-gray-400">
            Thư viện ảnh
          </p>
        </div>
        <div className="">
          <Input placeholder="Tìm kiếm..." />
        </div>

        <div className="flex-1 overflow-auto">
          <button
            onClick={onClickInput}
            className={cn(
              "mb-5 flex flex-col items-center w-full border border-dashed rounded-lg py-8 hover:bg-gray-50 duration-200",
              "dark:hover:bg-gray-700",
            )}
          >
            <input
              onChange={onChangeInput}
              type="file"
              accept="image/*"
              hidden
              ref={fileRef}
            />
            <Icon
              icon={
                isPending
                  ? "line-md:uploading-loop"
                  : "material-symbols:upload-rounded"
              }
              className="text-5xl text-gray-500"
            />
            <p className="text-gray-500 dark:text-gray-400">
              {isPending ? "Uploading..." : "Upload images"}
            </p>
          </button>
          <div className="grid grid-cols-4 gap-4">
            {images.map((image) => (
              <ImageItem
                key={image}
                url={image}
                isSelected={selectedImgs.includes(image)}
                onClick={() => {
                  onClickImgBox(image);
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default ImageLibrary;
