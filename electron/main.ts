import { app, BrowserWindow } from "electron";
import { spawn, ChildProcess } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = !app.isPackaged;

let mainWindow: BrowserWindow | null = null;
let serverProcess: ChildProcess | null = null;

const PORT = 3000;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: "ArchFlow",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadURL(`http://localhost:${PORT}`);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function startServer(): Promise<void> {
  return new Promise((resolve) => {
    if (isDev) {
      resolve();
      return;
    }

    const nextPath = path.join(process.resourcesPath, "app");
    const nextBin = path.join(nextPath, "node_modules", ".bin", "next");

    serverProcess = spawn(nextBin, ["start", "-p", PORT.toString()], {
      cwd: nextPath,
      env: { ...process.env, NODE_ENV: "production" },
      stdio: "pipe",
    });

    serverProcess.stdout?.on("data", (data: Buffer) => {
      const output = data.toString();
      if (output.includes("Ready") || output.includes("started")) {
        resolve();
      }
    });

    serverProcess.stderr?.on("data", (data: Buffer) => {
      console.error("Server error:", data.toString());
    });

    setTimeout(resolve, 5000);
  });
}

app.whenReady().then(async () => {
  await startServer();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
});
