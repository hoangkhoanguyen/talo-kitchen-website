export type TextValue = string;
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
