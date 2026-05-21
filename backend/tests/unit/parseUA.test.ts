import { describe, it, expect } from "bun:test";
import { parseUA } from "../../src/lib/parseUA";

describe("parseUA", () => {
  it("parses iPhone Safari as mobile/Safari/iOS", () => {
    const ua =
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
    const r = parseUA(ua);
    expect(r.device).toBe("mobile");
    expect(r.browser).toBe("Safari");
    expect(r.os).toBe("iOS");
  });

  it("parses Android Chrome as mobile/Chrome/Android", () => {
    const ua =
      "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";
    const r = parseUA(ua);
    expect(r.device).toBe("mobile");
    expect(r.browser).toBe("Chrome");
    expect(r.os).toBe("Android");
  });

  it("parses Windows Firefox as desktop/Firefox/Windows", () => {
    const ua =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0";
    const r = parseUA(ua);
    expect(r.device).toBe("desktop");
    expect(r.browser).toBe("Firefox");
    expect(r.os).toBe("Windows");
  });

  it("parses macOS Chrome as desktop/Chrome/macOS", () => {
    const ua =
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    const r = parseUA(ua);
    expect(r.device).toBe("desktop");
    expect(r.browser).toBe("Chrome");
    expect(r.os).toBe("macOS");
  });

  it("returns nulls for empty user-agent", () => {
    const r = parseUA("");
    expect(r.device).toBeNull();
    expect(r.browser).toBeNull();
    expect(r.os).toBeNull();
  });

  it("returns nulls for undefined user-agent", () => {
    const r = parseUA(undefined);
    expect(r.device).toBeNull();
    expect(r.browser).toBeNull();
    expect(r.os).toBeNull();
  });
});
