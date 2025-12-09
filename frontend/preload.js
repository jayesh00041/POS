const {contextBridge, ipcRenderer} = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  printComponent: async (printData, callback) => {
    // printData = { url, printerConfig }
    let response = await ipcRenderer.invoke("printComponent", printData);
    callback(response);
  },
  previewComponent: async (url, callback) => {
    let response = await ipcRenderer.invoke("previewComponent", url);
    callback(response);
  },
  getPrinterStatus: async (deviceName) => {
    return await ipcRenderer.invoke("getPrinterStatus", deviceName);
  },
  testPrinter: async (printerConfig) => {
    return await ipcRenderer.invoke("testPrinter", printerConfig);
  },
});