// version.model.ts
export interface VersionInfo {
  version: string;
  buildId: string;
  environment: string;
  timestamp: string;
  engineer?: string;
  branch?: string;
}