"use strict";

const { app, ipcMain, BrowserWindow } = require("electron");
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

  let indexPath;

  if (dev) {
    indexPath = "http://localhost:3000";
  } else {
    indexPath = `file://${path.join(__dirname, "build", "index.html")}`;
  }

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

// Function to get page size based on printer type
const getPageSize = (printerType) => {
  const pageSizes = {
    'thermal-80mm': { width: 80000, height: 32760 },  // 80mm × ~127mm
    'thermal-58mm': { width: 58000, height: 32760 },  // 58mm × ~127mm
    'standard-a4': { width: 210000, height: 297000 }  // A4 (210mm × 297mm)
  };
  return pageSizes[printerType] || pageSizes['thermal-80mm'];
};

// Function to build print options from printer config
const buildPrintOptions = (printerConfig) => {
  const pageSize = getPageSize(printerConfig?.type || 'thermal-80mm');
  
  return {
    silent: printerConfig?.silent ?? true,
    printBackground: printerConfig?.printBackground ?? true,
    color: printerConfig?.color ?? true,
    margin: {
      marginType: "printableArea",
    },
    landscape: false,
    pagesPerSheet: 1,
    collate: false,
    copies: 1,
    header: "",
    footer: "",
    printerName: printerConfig?.deviceName || "Brother HL-B2080DW series Printer",
    deviceName: printerConfig?.deviceName || "Brother HL-B2080DW series Printer",
    pageSize: pageSize,
  };
};

// Default print options (fallback)
const defaultPrintOptions = buildPrintOptions(null);

//handle print
ipcMain.handle("printComponent", async (event, { url, printerName }) => {
  if (printerName)
    printOptions.printerName = printerName;

  const win = new BrowserWindow({ show: false });

    win.webContents.on("did-finish-load", () => {
      win.webContents.print(printOptions, (success, failureReason) => {
        if (!success) {
          event.sender.send("print-result", {
            status: "error",
            message: failureReason || "Print failed"
          });
        } else {
          event.sender.send("print-result", {
            status: "success",
            message: "Receipt printed successfully"
          });
        }
        win.destroy(); // Cleanup after printing
      });
    });

    win.webContents.on("crashed", () => {
      event.sender.send("print-result", {
        status: "error",
        message: "Print window crashed"
      });
      win.destroy();
    });

    // Load HTML content directly using data URL
    await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);
    return { status: "printing" };
  } catch (error) {
    console.log(error);
    event.sender.send("print-result", {
      status: "error",
      message: error.message
    });
    return { status: "error", message: error.message };
  }
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

//handle get printer status - check if printer device exists and is available
ipcMain.handle("getPrinterStatus", async (event, deviceName) => {
  try {
    // Create a temporary window to get printers
    const tempWin = new BrowserWindow({ show: false });
    const printers = tempWin.webContents.getPrinters();
    tempWin.destroy();

    if (!deviceName || deviceName.trim() === "") {
      return {
        status: "error",
        message: "Device name is required",
        exists: false
      };
    }

    // Search for matching printer by deviceName or displayName
    const printer = printers.find(p => 
      p.deviceName === deviceName || 
      p.name === deviceName ||
      p.displayName === deviceName
    );

    if (printer) {
      // Status codes: 0=ready, 1=paused, 2=error, 3=jammed, 4=outofpaper, 5=offline
      const statusText = {
        0: "Ready",
        1: "Paused",
        2: "Error",
        3: "Paper Jam",
        4: "Out of Paper",
        5: "Offline"
      }[printer.status] || "Unknown";

      return {
        status: "success",
        message: "Printer found",
        exists: true,
        printerStatus: statusText,
        statusCode: printer.status,
        isReady: printer.status === 0,
        displayName: printer.displayName || printer.name,
        options: printer.options || {}
      };
    } else {
      return {
        status: "error",
        message: `Printer '${deviceName}' not found on this system. Check device name and ensure printer is connected.`,
        exists: false
      };
    }
  } catch (error) {
    return {
      status: "error",
      message: `Error checking printer: ${error.message}`,
      exists: false
    };
  }
});

//handle test printer - send a test page to validate printer is working
ipcMain.handle("testPrinter", async (event, printerConfig) => {
  try {
    if (!printerConfig || !printerConfig.deviceName) {
      return {
        status: "error",
        message: "Printer configuration is required"
      };
    }

    // Build print options from the printer config
    const printOptions = printerConfig ? buildPrintOptions(printerConfig) : defaultPrintOptions;

    // Create hidden window for test print
    const testWin = new BrowserWindow({ show: false, webPreferences: { nodeIntegration: false } });
    
    let testComplete = false;
    let testSuccess = false;
    let testError = null;

    // Set a timeout for the test (30 seconds)
    const testTimeout = new Promise((resolve) => {
      setTimeout(() => {
        if (!testComplete) {
          testComplete = true;
          testWin.destroy();
          resolve({
            status: "error",
            message: "Test print timeout - printer did not respond within 30 seconds"
          });
        }
      }, 30000);
    });

    // Create test page HTML
    const testPageHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Printer Test Page</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            padding: 20px; 
            text-align: center;
            margin: 0;
          }
          .container {
            border: 2px solid #000;
            padding: 20px;
            max-width: 300px;
            margin: 0 auto;
          }
          h1 { margin: 0 0 10px 0; font-size: 24px; }
          .status { 
            color: #10B981; 
            font-weight: bold; 
            font-size: 18px;
            margin: 20px 0;
          }
          .details {
            text-align: left;
            font-size: 12px;
            margin-top: 20px;
            border-top: 1px solid #ccc;
            padding-top: 10px;
          }
          .timestamp { color: #666; font-size: 11px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🖨️ PRINTER TEST</h1>
          <div class="status">✅ SUCCESS</div>
          <p>Your printer is working correctly!</p>
          <div class="details">
            <p><strong>Device:</strong> ${printerConfig.deviceName}</p>
            <p><strong>Type:</strong> ${printerConfig.type || 'Standard'}</p>
            <p class="timestamp">${new Date().toLocaleString()}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Load test page and print
    testWin.webContents.on("did-finish-load", () => {
      testWin.webContents.print(printOptions, (success, failureReason) => {
        testComplete = true;
        testSuccess = success;
        testError = failureReason;
        testWin.destroy();
      });
    });

    testWin.webContents.on("crashed", () => {
      if (!testComplete) {
        testComplete = true;
        testWin.destroy();
      }
    });

    // Load the test page
    await testWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(testPageHTML)}`);

    // Wait for test to complete or timeout
    const result = await testTimeout;
    
    if (result) {
      return result;
    }

    // If test completed within timeout
    if (testSuccess) {
      return {
        status: "success",
        message: "✅ Test page sent successfully! Your printer is working correctly.",
        testPassed: true
      };
    } else {
      return {
        status: "error",
        message: `❌ Test print failed: ${testError || "Printer rejected the print job"}. Check if printer is online and has paper.`,
        testPassed: false
      };
    }
  } catch (error) {
    return {
      status: "error",
      message: `Error testing printer: ${error.message}`,
      testPassed: false
    };
  }
});