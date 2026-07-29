import React, { FC, PropsWithChildren } from "react";

const SettingsCard: FC<
  PropsWithChildren<{ title: string; description?: string }>
> = ({ title, description, children }) => {
  return (
    <div className="card p-5 bg-white">
      <p className="card-title">{title}</p>
      {description && <p className="text-xs">{description}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
};

export default SettingsCard;
