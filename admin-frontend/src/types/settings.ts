export type SettingItem = {
  key: string;
  group: string;
  type: "string" | "number" | "boolean" | "json";
  label: string;
  description: string;
  value: string | number | boolean;
  default: string | number | boolean;
};

export type SettingGroup = {
  id: string;
  label: string;
  settings: SettingItem[];
};

export type SettingsData = {
  groups: SettingGroup[];
};
