import { contextBridge } from "electron";

contextBridge.exposeInMainWorld("archflow", {
  platform: process.platform,
  isElectron: true,
});
