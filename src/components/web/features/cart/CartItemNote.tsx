"use client";
import React, { FC, memo, useCallback } from "react";
import Note from "./Note";
import { useCartStore } from "@/hooks/web/cart/store";

const CartItemNote: FC<{ cartId: string; note: string }> = memo(
  ({ cartId, note }) => {
    const updateNote = useCartStore((state) => state.actions.updateNote);

    const onSubmit = useCallback(
      (value: string) => {
        updateNote(cartId, value);
      },
      [cartId, updateNote],
    );

    return <Note note={note} onSubmit={onSubmit} />;
  },
);

CartItemNote.displayName = "CartItemNote";

export default CartItemNote;
