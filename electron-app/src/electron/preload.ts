import { contextBridge, ipcRenderer } from 'electron';

// Define proper interfaces for type safety
interface SystemInfo {
  platform: string;
  hostname: string;
  arch?: string;
  version?: string;
  memory?: string;
  cpuModel?: string;
  systemModel?: string;
  nodeVersion?: string;
  error?: string;
}

interface MessageBoxOptions {
  type: 'none' | 'info' | 'error' | 'question' | 'warning';
  title: string;
  message: string;
  buttons: string[];
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // System Information - Use proper SystemInfo type instead of any
  getMachineId: (): Promise<string> => ipcRenderer.invoke('get-machine-id'),
  getSystemInfo: (): Promise<SystemInfo> => ipcRenderer.invoke('get-system-info'), // ✅ Fixed: SystemInfo instead of any
  
  // App Control
  minimizeApp: (): Promise<void> => ipcRenderer.invoke('minimize-app'),
  registrationComplete: (): Promise<boolean> => ipcRenderer.invoke('registration-complete'),
  restartApp: (): Promise<void> => ipcRenderer.invoke('restart-app'),
  
  // Dialog and Notifications - Use proper MessageBoxOptions type instead of any
  showMessage: (options: MessageBoxOptions): Promise<number> => ipcRenderer.invoke('show-message', options), // ✅ Fixed: MessageBoxOptions instead of any
  
  // App Information
  getAppVersion: (): Promise<string> => ipcRenderer.invoke('get-app-version'),
  
  // Environment flags
  isElectron: true,
  isDev: process.env.NODE_ENV === 'development',
  platform: process.platform
});

// ✅ REMOVED: These lines cause errors because with contextIsolation: true,
// Node.js globals (require, exports, module) are not accessible in the renderer
// This is by design for security - contextBridge is the safe way to expose APIs

// ❌ REMOVED - These lines were causing the errors:
// delete (window as any).require;
// delete (window as any).exports;  
// delete (window as any).module;

// Security: With contextIsolation enabled, Node.js APIs are already isolated
// from the renderer process, so manual deletion is unnecessary and impossible

console.log('✅ Preload script loaded successfully');
console.log('🔒 Context isolation enabled - secure API exposure via contextBridge');
console.log('🌍 Environment:', process.env.NODE_ENV);
console.log('💻 Platform:', process.platform);
