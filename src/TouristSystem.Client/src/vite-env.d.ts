/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the TouristSystem API, e.g. http://localhost:5010/api */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
