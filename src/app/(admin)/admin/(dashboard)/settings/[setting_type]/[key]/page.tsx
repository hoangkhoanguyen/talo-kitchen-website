import InitSetting from "@/components/admin/features/settings/InitSetting";
import SettingEditor from "@/components/admin/features/settings/SettingEditor";
import { adminConfigs } from "@/constants/settings";
import { getConfigsByKey } from "@/services/configs";
import React from "react";

const page = async ({
  params,
}: {
  params: Promise<{ key: string; setting_type: string }>;
}) => {
  const { key, setting_type } = await params;

  const settings = adminConfigs[setting_type as keyof typeof adminConfigs];
  if (!settings) {
    return <div>Invalid setting type {setting_type}</div>;
  }

  const config = await getConfigsByKey(key, setting_type);

  const meta = settings.meta[key as keyof typeof settings.meta];

  const initConfigs =
    settings.initConfigs?.[key as keyof typeof settings.initConfigs];

  if (config) return <SettingEditor data={config} meta={meta} />;

  if (initConfigs) {
    return <InitSetting initConfigs={initConfigs} />;
  }

  return <div>No configuration found for key: {key}</div>;
};

export default page;
