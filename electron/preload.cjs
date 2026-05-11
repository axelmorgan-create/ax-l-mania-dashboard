const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("dashboardAPI", {
  getState: () => ipcRenderer.invoke("dashboard:get-state"),
  getCommandSensor: () => ipcRenderer.invoke("dashboard:get-command-sensor"),
  refresh: () => ipcRenderer.invoke("dashboard:refresh"),
  onRefreshed: (cb) => {
    const handler = (_e, state) => cb(state);
    ipcRenderer.on("dashboard:refreshed", handler);
    return () => ipcRenderer.removeListener("dashboard:refreshed", handler);
  },
  onRefreshLog: (cb) => {
    const handler = (_e, line) => cb(line);
    ipcRenderer.on("dashboard:refresh-log", handler);
    return () => ipcRenderer.removeListener("dashboard:refresh-log", handler);
  },
  spotifyStatus: () => ipcRenderer.invoke("spotify:get-auth-status"),
  spotifyConnect: () => ipcRenderer.invoke("spotify:connect"),
  spotifyPlayback: (action) => ipcRenderer.invoke("spotify:playback", action),
  onSpotifyStatus: (cb) => {
    const handler = (_e, status) => cb(status);
    ipcRenderer.on("spotify:auth-status", handler);
    return () => ipcRenderer.removeListener("spotify:auth-status", handler);
  },
  onSpotifyError: (cb) => {
    const handler = (_e, message) => cb(message);
    ipcRenderer.on("spotify:auth-error", handler);
    return () => ipcRenderer.removeListener("spotify:auth-error", handler);
  },
  onSpotifyLog: (cb) => {
    const handler = (_e, line) => cb(line);
    ipcRenderer.on("spotify:auth-log", handler);
    return () => ipcRenderer.removeListener("spotify:auth-log", handler);
  }
});
