export function hashPassword(pw: string) {
  return Bun.password.hash(pw, { algorithm: "bcrypt", cost: 12 });
}

export function verifyPassword(pw: string, hash: string) {
  return Bun.password.verify(pw, hash);
}
