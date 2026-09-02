import { routing } from "@/i18n/routing";

export type Locale = (typeof routing.locales)[number];
export type LocalizedText = Partial<Record<Locale, string>>;

export type TextValue = string | LocalizedText;
export type NumberValue = number;
export type BooleanValue = boolean;
export interface ImageValue {
  url: string;
  alt: string;
}
// export type ObjectValue = Record<string, Value>;
export interface ObjectValue {
  [key: string]: Value;
}

export type ArrayValue = ObjectValue[];

export type Value =
  | TextValue
  | NumberValue
  | BooleanValue
  | ImageValue
  | ObjectValue
  | ArrayValue;

export type ConfigValue = Record<string, Value>;

export type Config = Record<string, ConfigValue>;
