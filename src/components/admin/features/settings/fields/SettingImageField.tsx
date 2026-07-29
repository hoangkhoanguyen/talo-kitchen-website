import React, { FC } from "react";
import { Control, useController } from "react-hook-form";
import SettingsImageInput from "../elements/SettingsImageInput";

const SettingImageField: FC<{ control: Control; name: string }> = ({
  control,
  name,
}) => {
  const {
    field: { onChange: onUrlChange, value: url },
    fieldState: { error: urlError },
  } = useController({
    control,
    name: `${name}.url`,
  });

  const {
    field: { onChange: onAltChange, value: alt },
    fieldState: { error: altError },
  } = useController({
    control,
    name: `${name}.alt`,
  });

  return (
    <SettingsImageInput
      url={url}
      onChangeUrl={onUrlChange}
      alt={alt}
      onChangeAlt={onAltChange}
      urlError={urlError?.message}
      altError={altError?.message}
    />
  );
};

export default SettingImageField;
