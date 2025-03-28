"use strict";

const {app, ipcMain, BrowserWindow} = require("electron");
const path = require("path");

let mainWindow;
let dev = false;
if (
    process.defaultApp ||
    /[\\/]electron-prebuilt[\\/]/.test(process.execPath) ||
    /[\\/]electron[\\/]/.test(process.execPath)
) {
  dev = true;
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
    },
  });

  // load the index.html of the app
  let indexPath;
  // indexPath = new URL("https://jayesh00041.github.io/POS/");
  indexPath = new URL("http://localhost:3000/POS/");



  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    if (dev) {
      mainWindow.webContents.openDevTools();
    }
  });

  mainWindow.on("closed", function () {
    mainWindow = null;

    // terminate the app when main window is closed
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  await mainWindow.loadURL(indexPath.toString());
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", async () => {
  if (mainWindow === null) {
    await createWindow();
  }
});

//-------------------- print function -----------------

// List of all options at -
// https://www.electronjs.org/docs/latest/api/web-contents#contentsprintoptions-callback
const printOptions = {
  silent: true,
  printBackground: true,
  color: true,
  margin: {
    marginType: "printableArea",
  },
  landscape: false,
  pagesPerSheet: 1,
  collate: false,
  copies: 1,
  header: "Page header",
  footer: "Page footer",
  printerName: "Brother HL-B2080DW series Printer",
  deviceName: "Brother HL-B2080DW series Printer",
  pageSize: { width: 80000, height: 32760 },
};

//handle print
ipcMain.handle("printComponent", async (event, {url, printerName}) => {
  if(printerName)
    printOptions.printerName = printerName;

  const win = new BrowserWindow({show: false});

  win.webContents.on("did-finish-load", () => {
    console.log("Available Printers:", win.webContents)
    win.webContents.print(printOptions, (success, failureReason) => {
      console.log("Print Initiated in Main...");
      if (!success) console.log(failureReason);
    });
  });

  await win.loadURL(url);
  return "shown print dialog";
});

//handle preview
ipcMain.handle("previewComponent", async (event, url) => {
  let win = new BrowserWindow({
    title: "Print Preview",
    show: false,
    autoHideMenuBar: true
  });

  win.webContents.once("did-finish-load", () => {
    win.webContents.printToPDF(printOptions).then((data) => {
      const buf = Buffer.from(data);
      data = buf.toString("base64");
      const url = "data:application/pdf;base64," + data;

      win.webContents.on("ready-to-show", () => {
        win.once("page-title-updated", (e) => e.preventDefault());
        win.show();
      });

      win.webContents.on("closed", () => win = null);
      win.loadURL(url);
    }).catch((error) => {
      console.log(error);
    });
  });

  await win.loadURL(url);
  return "shown preview window";
});