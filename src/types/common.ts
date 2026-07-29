export interface Editor {
  value: any;
  onChange(value: any): void;
  error?: {
    message?: string;
  };
}
