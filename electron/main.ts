import { app, BrowserWindow } from "electron";
import { spawn, ChildProcess, execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { existsSync, copyFileSync, mkdirSync } from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = !app.isPackaged;
const PORT = isDev ? 3000 : 3099;

let mainWindow: BrowserWindow | null = null;
let serverProcess: ChildProcess | null = null;

function getDbPath(): string {
  if (isDev) {
    return path.join(process.cwd(), "prisma", "dev.db");
  }
  const userDataPath = app.getPath("userData");
  return path.join(userDataPath, "archflow.db");
}

function getDatabaseUrl(): string {
  return `file:${getDbPath()}`;
}

function ensureDatabase(): void {
  const dbPath = getDbPath();
  if (existsSync(dbPath)) return;

  const dir = path.dirname(dbPath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  const appPath = getAppPath();
  const schemaPath = path.join(appPath, "prisma", "schema.prisma");

  try {
    execSync(
      `${process.execPath} ${path.join(appPath, "node_modules", "prisma", "build", "index.js")} db push --skip-generate --schema="${schemaPath}"`,
      {
        env: {
          ...process.env,
          DATABASE_URL: getDatabaseUrl(),
          ELECTRON_RUN_AS_NODE: "1",
        },
        cwd: appPath,
        stdio: "pipe",
      }
    );
  } catch (err) {
    console.error("Failed to initialize database:", err);
  }
}

function getNextBin(): string {
  if (isDev) {
    return path.join(process.cwd(), "node_modules", "next", "dist", "bin", "next");
  }

  const appPath = getAppPath();
  const candidates = [
    path.join(appPath, "node_modules", "next", "dist", "bin", "next"),
    path.join(appPath, "node_modules", ".bin", "next"),
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }

  return path.join(appPath, "node_modules", "next", "dist", "bin", "next");
}

function getAppPath(): string {
  if (isDev) return process.cwd();
  return app.getAppPath();
}

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

    const nextBin = getNextBin();
    const appPath = getAppPath();

    serverProcess = spawn(process.execPath, [nextBin, "start", "-p", PORT.toString()], {
      cwd: appPath,
      env: {
        ...process.env,
        NODE_ENV: "production",
        ELECTRON_RUN_AS_NODE: "1",
        DATABASE_URL: getDatabaseUrl(),
      },
      stdio: "pipe",
    });

    serverProcess.stdout?.on("data", (data: Buffer) => {
      const output = data.toString();
      console.log("Server:", output);
      if (output.includes("Ready") || output.includes("started") || output.includes(`:${PORT}`)) {
        resolve();
      }
    });

    serverProcess.stderr?.on("data", (data: Buffer) => {
      console.error("Server stderr:", data.toString());
    });

    serverProcess.on("error", (err) => {
      console.error("Failed to start server:", err);
      resolve();
    });

    setTimeout(resolve, 8000);
  });
}

app.whenReady().then(async () => {
  if (!isDev) {
    ensureDatabase();
  }

  if (isDev) {
    createWindow();
  } else {
    await startServer();
    createWindow();
  }

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
