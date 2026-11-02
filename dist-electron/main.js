import { app as t, BrowserWindow as i, shell as a } from "electron";
import n from "node:path";
import { fileURLToPath as l } from "node:url";
const s = n.dirname(l(import.meta.url));
process.env.DIST = n.join(s, "../dist");
process.env.VITE_PUBLIC = t.isPackaged ? process.env.DIST : n.join(process.env.DIST, "../public");
let e;
function r() {
  e = new i({
    width: 1280,
    height: 850,
    minWidth: 900,
    minHeight: 600,
    title: "Nalia MedCore",
    icon: n.join(process.env.VITE_PUBLIC || "", "pwa-512x512.svg"),
    webPreferences: {
      preload: n.join(s, "preload.js"),
      nodeIntegration: !1,
      contextIsolation: !0,
      webSecurity: !0
    }
  }), e.webContents.setWindowOpenHandler(({ url: o }) => ((o.startsWith("https:") || o.startsWith("http:")) && a.openExternal(o), { action: "deny" })), e.webContents.on("did-finish-load", () => {
    e == null || e.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), process.env.VITE_DEV_SERVER_URL ? e.loadURL(process.env.VITE_DEV_SERVER_URL) : e.loadFile(n.join(process.env.DIST || "", "index.html"));
}
t.on("window-all-closed", () => {
  process.platform !== "darwin" && (t.quit(), e = null);
});
t.on("activate", () => {
  i.getAllWindows().length === 0 && r();
});
t.whenReady().then(r);
