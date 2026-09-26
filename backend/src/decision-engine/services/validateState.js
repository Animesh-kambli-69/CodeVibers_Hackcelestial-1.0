/**
 * Validates the resort state payload passed to the Decision Engine.
 */

function validateState(state) {
  if (!state || typeof state !== 'object') {
    return { valid: false, error: 'State must be an object' };
  }

  return { valid: true };
}

module.exports = validateState;
