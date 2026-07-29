"use client";
import React, { FC } from "react";
import Header from "../../shared/header/Header";
import { Button } from "../../ui/button";
import { useSetLoading } from "@/hooks/admin/loading";
import { NewConfigDB } from "@/db/schemas";
import useInitConfigs from "@/hooks/admin/features/settings/useInitConfigs";

const InitSetting: FC<{
  initConfigs: NewConfigDB;
}> = ({ initConfigs }) => {
  const { mutate, isPending } = useInitConfigs();

  useSetLoading(isPending);

  if (!initConfigs) {
    return <div>Invalid Config</div>;
  }

  return (
    <div>
      <Header
        title={initConfigs.title}
        actions={
          <Button color="primary" onClick={() => mutate(initConfigs)}>
            Khởi tạo
          </Button>
        }
      />
    </div>
  );
};

export default InitSetting;
