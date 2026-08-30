"use client";
import React, { FC, memo, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "../../ui/button";
import Icon from "@/components/common/Icon";

const Note: FC<{ note: string; onSubmit(note: string): void }> = memo(
  ({ note, onSubmit }) => {
    const t = useTranslations("cart");
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
      <div className="bg-web-background-2 rounded-lg p-5">
        <p className="text-web-h4-mobile lg:text-web-h4 text-web-content-2">
          {t("note.label", { count: note.length, max: 300 })}
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
          <p className="text-web-body-mobile lg:text-web-body text-web-content-2 mb-2.5 break-all">
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
            {isEditing ? t("note.save") : t("note.fillIn")}
          </Button>
          {isEditing && (
            <Button
              onClick={onCloseEditing}
              variant={"white"}
              className="text-web-content-2 rounded-full text-web-button-mobile lg:text-web-button"
            >
              {t("note.cancel")}
            </Button>
          )}
        </div>
      </div>
    );
  },
);

Note.displayName = "Note";

export default Note;
