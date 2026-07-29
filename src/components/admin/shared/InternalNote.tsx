"use client";
import React, { FC, useRef, useState } from "react";
import { LayoutRef, LayoutWithRef, Modal } from "../ui/layout";
import { Button, IconButton } from "../ui/button";
import { Textarea } from "../ui/form";

const InternalNote: FC<{
  initNote: string;
  onSubmit: (note: string) => void;
  isPending: boolean;
  canEdit?: boolean;
}> = ({ initNote, onSubmit, isPending, canEdit }) => {
  const [note, setNote] = useState(initNote);
  const ref = useRef<LayoutRef>(null);

  const onAfterClose = () => {
    setNote(initNote);
  };

  return (
    <>
      <div className="card p-5 bg-white">
        <div className="flex justify-between items-center">
          <h2 className="card-title">Internal Note</h2>
          {canEdit && (
            <IconButton
              icon="tabler:edit"
              onClick={() => ref.current?.open()}
            />
          )}
        </div>

        <p className="mt-2 text-sm text-gray-600">{initNote || "--/--"}</p>
      </div>
      {canEdit && (
        <LayoutWithRef ref={ref} Component={Modal} afterClose={onAfterClose}>
          <div className="card p-5 bg-white w-xs sm:w-sm md:w-md lg:w-2xl">
            <h2 className="card-title mb-2">Edit Internal Note</h2>
            <Textarea
              rows={5}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              defaultValue={initNote || ""}
              placeholder="Enter internal note"
            />
            <div className="card-actions justify-end mt-4">
              <Button disabled={isPending} onClick={() => ref.current?.close()}>
                Close
              </Button>
              <Button
                disabled={isPending}
                color="primary"
                onClick={() => {
                  onSubmit(note);
                  ref.current?.close();
                }}
              >
                Save
              </Button>
            </div>
          </div>
        </LayoutWithRef>
      )}
    </>
  );
};

export default InternalNote;
