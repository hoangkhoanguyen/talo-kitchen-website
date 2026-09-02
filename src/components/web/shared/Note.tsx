"use client";
import React, { FC, memo, useState } from "react";
import Icon from "@/components/common/Icon";
import { Button } from "../ui/button";
import { useTranslations } from "next-intl";

const Note: FC<{ note: string; onSubmit(note: string): void }> = memo(
  ({ note, onSubmit }) => {
    const t = useTranslations("common");
    const [isEditing, setIsEditing] = useState(false);

    const [noteText, setNoteText] = useState("");

    const onStartEditing = () => {
      setNoteText(note);
      setIsEditing(true);
    };

    const onCloseEditing = () => {
      setIsEditing(false);
    };

    return (
      <div className="bg-web-background-3 rounded-lg p-5">
        <p className="text-web-h4-mobile lg:text-web-h4 text-web-content-2">
          {t("noteLabel", { count: note.length })}
        </p>
        {isEditing ? (
          <textarea
            className="web-input w-full bg-white"
            value={noteText}
            maxLength={300}
            onChange={(e) => {
              setNoteText(e.target.value);
            }}
          ></textarea>
        ) : (
          <p className="text-web-body-mobile lg:text-web-body text-web-content-2 mb-2.5">
            {note}
          </p>
        )}
        <div className="flex items-center justify-end gap-3">
          <Button
            onClick={
              isEditing
                ? () => {
                    onSubmit(noteText);
                    onCloseEditing();
                  }
                : onStartEditing
            }
            startIcon={<Icon icon={isEditing ? "ph:check" : "ph:pen"} />}
            variant={"secondary1"}
            className="text-web-background-1 text-web-button-mobile lg:text-web-button rounded-full"
          >
            {isEditing ? t("save") : t("fillInNote")}
          </Button>
          {isEditing && (
            <Button
              onClick={onCloseEditing}
              variant={"white"}
              className="text-web-content-2 rounded-full text-web-button-mobile lg:text-web-button"
            >
              {t("cancel")}
            </Button>
          )}
        </div>
      </div>
    );
  },
);

Note.displayName = "Note";

export default Note;
