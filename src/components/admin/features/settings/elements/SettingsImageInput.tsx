"use client";
import React, { FC } from "react";
import SettingsTextInput from "./SettingsTextInput";
import { Button } from "@/components/admin/ui/button";
import { useImgLibraryContext } from "@/components/admin/shared/image-library/ImageLibraryProvider";
import Image from "next/image";
import { InputWithLabel } from "@/components/admin/ui/form";

const SettingsImageInput: FC<{
  url: string;
  alt: string;
  urlError?: string;
  altError?: string;
  onChangeUrl: (url: string) => void;
  onChangeAlt: (alt: string) => void;
}> = ({ url, alt, onChangeUrl, onChangeAlt, urlError, altError }) => {
  const { openLibrary } = useImgLibraryContext();
  return (
    <div className="flex gap-4 w-full">
      {url ? (
        <div>
          <Image
            src={url}
            alt={alt || "Selected"}
            width={128}
            height={128}
            className="w-36 h-36 object-contain rounded border"
          />
        </div>
      ) : (
        <div className="w-36 h-36 rounded border border-dashed border-gray-300 flex items-center justify-center text-gray-400">
          No Image
        </div>
      )}
      <div className="flex flex-col items-stretch gap-3 flex-1">
        <InputWithLabel label="URL ảnh" required>
          <div className="flex items-center gap-3">
            <SettingsTextInput
              className="flex-1"
              placeholder="Nhập URL ảnh"
              value={url}
              onChange={onChangeUrl}
              errorMessage={urlError}
            />
            <span className="text-sm text-gray-700">or</span>
            <Button
              color="info"
              onClick={() => {
                openLibrary((imgs) => {
                  if (imgs && imgs.length > 0) {
                    onChangeUrl(imgs[0]);
                  }
                }, false);
              }}
            >
              Chọn từ Thư viện
            </Button>
          </div>
        </InputWithLabel>

        <InputWithLabel label="Alt ảnh" required>
          <SettingsTextInput
            value={alt}
            onChange={onChangeAlt}
            placeholder="Nhập mô tả ảnh"
            errorMessage={altError}
          />
        </InputWithLabel>
      </div>
    </div>
  );
};

export default SettingsImageInput;
