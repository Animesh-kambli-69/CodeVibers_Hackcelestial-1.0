/**
 * Credential generation for system-created accounts (e.g. an Operations Manager
 * account created by a Resort Manager, or — later — a guest account auto-created
 * at check-in). Generates a short, human-readable, non-email-shaped password
 * that's easy to read off a screen and hand to someone in person.
 */
const crypto = require('crypto');

const PASSWORD_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'; // no 0/O/1/l/I ambiguity

/**
 * A short random password, e.g. "kx7Rmq9P" — not a real word, but not a
 * confusing mess of symbols either. Suitable for handing to a guest/staff
 * member verbally or on a printed slip.
 */
function generateSimplePassword(length = 8) {
  let out = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    out += PASSWORD_CHARS[bytes[i] % PASSWORD_CHARS.length];
  }
  return out;
}

/**
 * A short numeric suffix used to disambiguate generated usernames
 * (e.g. "raghav" -> "raghav482").
 */
function generateNumericSuffix(length = 3) {
  let out = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    out += (bytes[i] % 10).toString();
  }
  return out;
}

/**
 * Turns a display name into a lowercase, no-space identifier — deliberately
 * NOT email-shaped (no @domain), per product decision: generated login
 * identifiers should be simple usernames, not fake email addresses.
 */
function slugifyName(name) {
  return (name || 'guest')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 20) || 'guest';
}

function generateUsername(name) {
  return `${slugifyName(name)}${generateNumericSuffix()}`;
}

module.exports = {
  generateSimplePassword,
  generateUsername,
  slugifyName,
};
