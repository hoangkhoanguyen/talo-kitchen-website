"use client";
import React, { FC } from "react";
import { Editor } from "@/types/common";
import { cn } from "@/lib/utils";
import WithError from "@/components/admin/ui/form/WithError";
import { InputWithLabel } from "./InputWithLabel";

export const SlugInput: FC<
  Editor & {
    onGenerateSlug(): void;
  }
> = ({ value, onChange, error, onGenerateSlug }) => {
  return (
    <InputWithLabel label="Đường dẫn" required>
      <WithError error={error}>
        <div className="join w-full ">
          <input
            name="slug"
            type="email"
            className={cn(
              "flex-1 input w-full join-item rounded-ss-xl rounded-es-xl",
              error ? "input-error" : "",
            )}
            placeholder="Đường dẫn"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
          <button
            type="button"
            className="btn btn-neutral join-item rounded-ee-xl rounded-se-xl"
            onClick={onGenerateSlug}
          >
            Tạo đường dẫn
          </button>
        </div>
      </WithError>
    </InputWithLabel>
  );
};
