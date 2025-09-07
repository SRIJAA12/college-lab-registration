import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getMachineId: () => ipcRenderer.invoke('getMachineId'),
});
