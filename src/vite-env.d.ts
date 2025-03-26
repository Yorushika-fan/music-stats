/// <reference types="vite/client" />

// 通用组件声明
declare module "*.tsx" {
  import type React from "react";

  const Component: React.ComponentType<any>;
  export default Component;
}

// 所有组件页面声明
declare module "./components/pages/*" {
  import type React from "react";

  const Component: React.ComponentType;
  export default Component;
}

// 特定模块声明
declare module "./components/pages/stats" {
  import type React from "react";

  const Stats: React.ComponentType;
  export default Stats;
}

declare module "./components/pages/playlists" {
  import type React from "react";

  const Playlists: React.ComponentType;
  export default Playlists;
}

declare module "./components/pages/downloads" {
  import type React from "react";

  const Downloads: React.ComponentType;
  export default Downloads;
}

// 提供器声明
declare module "./providers/i18n-provider" {
  import type React from "react";

  export const I18nProvider: React.ComponentType<{ children: React.ReactNode }>;
}

declare module "./providers/theme-provider" {
  import type React from "react";

  export const ThemeProvider: React.ComponentType<{ children: React.ReactNode }>;
}
