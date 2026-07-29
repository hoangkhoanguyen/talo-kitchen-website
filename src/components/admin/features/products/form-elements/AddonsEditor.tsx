"use client";
import { Button, IconButton } from "@/components/admin/ui/button";
import { Switch } from "@/components/admin/ui/form";
import React from "react";
import { useProductDetailsContext } from "../ProductDetailsProvider";
import { Controller, useFieldArray } from "react-hook-form";
import Icon from "@/components/common/Icon";
import WithError from "@/components/admin/ui/form/WithError";
import { cn } from "@/lib/utils";

const AddonsEditor = () => {
  const { control } = useProductDetailsContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "addons",
    keyName: "uid",
  });

  const onAddAddons = () => {
    append({
      name: "",
      price: 0,
      isActive: true,
    });
  };

  return (
    <div className="card bg-white">
      <div className="p-5">
        <div className="flex justify-between items-center gap-4">
          <p className="card-title">Addons</p>
          <Button onClick={onAddAddons}>+ Thêm</Button>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {fields.map((field, index) => (
            <div
              key={field.uid}
              className="flex items-start gap-3 bg-gray-50 rounded-xl px-3 py-3"
            >
              <Controller
                control={control}
                name={`addons.${index}.isActive`}
                render={({ field: { value, onChange } }) => (
                  <Switch
                    checked={value}
                    onChange={(e) => onChange(e.target.checked)}
                    className="mt-2"
                  />
                )}
              />
              <Controller
                control={control}
                name={`addons.${index}.name`}
                render={({
                  field: { value, onChange },
                  fieldState: { error },
                }) => (
                  <div className="flex-1">
                    <WithError error={error}>
                      <label
                        className={cn(
                          "input rounded-xl",
                          error ? "input-error" : "",
                        )}
                      >
                        <Icon
                          className="h-[1em] opacity-50"
                          icon="fluent:rename-16-regular"
                        />
                        <input
                          type="text"
                          className="grow"
                          placeholder="Tên"
                          value={value}
                          onChange={(e) => onChange(e.target.value)}
                        />
                      </label>
                    </WithError>
                  </div>
                )}
              />
              <Controller
                control={control}
                name={`addons.${index}.price`}
                render={({
                  field: { value, onChange },
                  fieldState: { error },
                }) => (
                  <div className="flex-1">
                    <WithError error={error}>
                      <label
                        className={cn(
                          "input rounded-xl",
                          error ? "input-error" : "",
                        )}
                      >
                        <span>VND</span>
                        <input
                          type="number"
                          className="grow"
                          placeholder="Giá"
                          value={value}
                          onChange={(e) => onChange(Number(e.target.value))}
                        />
                      </label>
                    </WithError>
                  </div>
                )}
              />

              <IconButton
                onClick={() => remove(index)}
                className="mt-1"
                icon="mdi:trash-outline"
                color="error"
                variant={"soft"}
                disabled={!!field.id}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AddonsEditor;
