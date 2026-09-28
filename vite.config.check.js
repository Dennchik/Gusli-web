import base from "./vite.config.js";
export default function (env) {
  const cfg = typeof base === "function" ? base(env) : base;
  cfg.server = { ...(cfg.server || {}), open: false };
  cfg.preview = { ...(cfg.preview || {}), open: false };
  return cfg;
}
