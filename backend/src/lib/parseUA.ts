import { UAParser } from "ua-parser-js";

export interface ParsedUA {
  device: "mobile" | "tablet" | "desktop" | null;
  browser: string | null;
  os: string | null;
}

function normalizeOS(os: string | undefined): string | null {
  if (!os) return null;
  if (os === "Mac OS") return "macOS";
  if (os === "iOS") return "iOS";
  if (os === "Android") return "Android";
  if (os === "Windows") return "Windows";
  if (os === "Linux") return "Linux";
  return os;
}

function normalizeBrowser(browser: string | undefined): string | null {
  if (!browser) return null;
  if (browser.includes("Chrome") && !browser.includes("Edge")) return "Chrome";
  if (browser === "Mobile Safari" || browser === "Safari") return "Safari";
  if (browser.includes("Firefox")) return "Firefox";
  if (browser.includes("Edge")) return "Edge";
  return browser;
}

function normalizeDevice(deviceType: string | undefined): ParsedUA["device"] {
  if (deviceType === "mobile") return "mobile";
  if (deviceType === "tablet") return "tablet";
  if (deviceType === undefined) return "desktop";
  return null;
}

export function parseUA(userAgent: string | undefined): ParsedUA {
  if (!userAgent) return { device: null, browser: null, os: null };
  const result = UAParser(userAgent);
  return {
    device: normalizeDevice(result.device.type),
    browser: normalizeBrowser(result.browser.name),
    os: normalizeOS(result.os.name),
  };
}
