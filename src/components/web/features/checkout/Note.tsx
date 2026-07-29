"use client";
import React, { useState } from "react";
import { Button } from "../../ui/button";
import Icon from "@/components/common/Icon";
import { useCheckoutContext } from "./CheckoutProvider";
import { useController } from "react-hook-form";

const Note = () => {
  const { control } = useCheckoutContext();

  const {
    field: { value = "", onChange },
  } = useController({
    control,
    name: "note",
  });

  const [isEditing, setIsEditing] = useState(false);

  const [noteText, setNoteText] = useState("");

  const onStartEditing = () => {
    setNoteText(value);
    setIsEditing(true);
  };

  const onCloseEditing = () => {
    setIsEditing(false);
  };

  return (
    <div className="bg-web-background-3 rounded-lg p-5">
      <p className="text-web-h4-mobile lg:text-web-h4 text-web-content-2">
        Note ({value.length}/300)
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
          {value}
        </p>
      )}
      <div className="flex items-center justify-end gap-3">
        <Button
          onClick={
            isEditing
              ? () => {
                  onChange(noteText);
                  onCloseEditing();
                }
              : onStartEditing
          }
          startIcon={<Icon icon={isEditing ? "ph:check" : "ph:pen"} />}
          variant={"secondary1"}
          className="text-web-background-1 text-web-button-mobile lg:text-web-button ms-auto rounded-full"
        >
          {isEditing ? "Save" : "Fill in note"}
        </Button>
        {isEditing && (
          <Button
            onClick={onCloseEditing}
            variant={"white"}
            className="text-web-content-2 rounded-full text-web-button-mobile lg:text-web-button"
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
};

export default Note;
