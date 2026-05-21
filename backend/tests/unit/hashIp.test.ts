import { describe, it, expect } from "bun:test";
import { hashIp } from "../../src/lib/hashIp";

describe("hashIp", () => {
  const salt = "test-salt-32-chars-aaaaaaaaaaaaaaa";
  const altSalt = "alt-salt-32-chars-bbbbbbbbbbbbbbbbb";

  it("produces 64-char hex string", () => {
    const h = hashIp("192.168.1.1", salt);
    expect(h).toMatch(/^[0-9a-f]{64}$/);
  });

  it("is deterministic for same IP + same salt", () => {
    const a = hashIp("192.168.1.1", salt);
    const b = hashIp("192.168.1.1", salt);
    expect(a).toBe(b);
  });

  it("differs for same IP with different salt", () => {
    const a = hashIp("192.168.1.1", salt);
    const b = hashIp("192.168.1.1", altSalt);
    expect(a).not.toBe(b);
  });

  it("differs for different IPs with same salt", () => {
    const a = hashIp("192.168.1.1", salt);
    const b = hashIp("192.168.1.2", salt);
    expect(a).not.toBe(b);
  });

  it("handles IPv6 addresses", () => {
    const h = hashIp("2001:db8::1", salt);
    expect(h).toMatch(/^[0-9a-f]{64}$/);
  });

  it("treats empty IP as a valid input", () => {
    const h = hashIp("", salt);
    expect(h).toMatch(/^[0-9a-f]{64}$/);
  });
});
