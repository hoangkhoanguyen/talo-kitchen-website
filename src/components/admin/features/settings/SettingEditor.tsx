"use client";
import { useSetLoading } from "@/hooks/admin/loading";
import useUpdateConfigs from "@/hooks/admin/features/settings/useUpdateConfigs";
import { ISetting, MetaValue } from "@/types/settings";
import React, { FC } from "react";
import Setting from "./Setting";

const SettingEditor: FC<{ data: ISetting; meta: MetaValue[] }> = ({
  data,
  meta,
}) => {
  const { mutate, isPending } = useUpdateConfigs();

  useSetLoading(isPending);

  const onSubmit = (newConfig: any) => {
    mutate({ key: data.key, value: newConfig, config_type: data.config_type });
  };

  return (
    <Setting
      onSubmit={onSubmit}
      configs={data.value}
      title={data.title}
      metaFields={meta}
    />
  );
};

export default SettingEditor;
