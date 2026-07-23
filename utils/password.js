import bcrypt from "bcryptjs";

// Verify a plaintext password against a stored value.
// Supports bcrypt hashes and, for backward compatibility with legacy
// rows, a plaintext-stored password. Legacy plaintext support should be
// removed once all stored passwords have been migrated to bcrypt hashes.
export const verifyPassword = async (plain, stored) => {
  if (typeof stored !== "string" || stored.length === 0) {
    return false;
  }

  if (stored.startsWith("$2")) {
    return bcrypt.compare(plain, stored);
  }

  return plain === stored;
};
