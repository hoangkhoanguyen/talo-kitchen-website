"use client";
import React, { FC, useCallback, useEffect, useMemo } from "react";
import SettingsCard from "./SettingsCard";
import SettingsInput from "./SettingsInput";
import { generateSettingSchema } from "@/lib/zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import SettingField from "./SettingField";
import Header from "../../shared/header/Header";
import { Button } from "../../ui/button";
import { FieldType, MetaValue } from "@/types/settings";
import { Config } from "@/types/configs";
import ImageLibraryModalProvider from "../../shared/image-library/ImageLibraryProvider";

const Setting: FC<{
  configs: Config;
  title: string;
  onSubmit(data: any): void;
  metaFields: MetaValue[];
}> = ({ configs, metaFields, title, onSubmit }) => {
  const schema = useMemo(() => {
    return metaFields.reduce(
      (acc, meta) => ({
        ...acc,
        [meta.key]: z.object(generateSettingSchema(meta.fields)),
      }),
      {} as Record<string, z.ZodType>,
    );
  }, [metaFields]);

  const {
    control,
    reset,
    formState: { isDirty },
    handleSubmit,
  } = useForm({
    mode: "onSubmit",
    resolver: zodResolver(z.object(schema)),
  });

  const onReset = useCallback(() => {
    reset(structuredClone(configs));
  }, [reset, configs]);

  useEffect(() => {
    onReset();
  }, [onReset]);

  return (
    <ImageLibraryModalProvider>
      <Header
        title={title}
        actions={
          isDirty && (
            <div className="card-actions">
              <Button color="primary" onClick={handleSubmit(onSubmit)}>
                Save
              </Button>
              <Button onClick={onReset}>Discard</Button>
            </div>
          )
        }
      />
      <div className="container py-5">
        <div className="grid grid-cols-1 gap-5">
          {metaFields.map((section) => (
            <SettingsCard
              key={section.key}
              title={section.title}
              description={section.description}
            >
              <div className="flex flex-col gap-5">
                {section.fields.map((field: FieldType) => (
                  <SettingsInput
                    key={field.key}
                    label={field.label}
                    required={field.isRequired}
                    description={field.description}
                  >
                    <SettingField
                      control={control}
                      item={field}
                      name={`${section.key}.${field.key}`}
                    />
                  </SettingsInput>
                ))}
              </div>
            </SettingsCard>
          ))}
        </div>
      </div>
    </ImageLibraryModalProvider>
  );
};

export default Setting;
