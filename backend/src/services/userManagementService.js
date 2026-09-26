/**
 * User Management Service.
 * Lets a RESORT_MANAGER create and deactivate OPERATIONS_MANAGER accounts
 * (Manager > Settings > User Management — previously fully hardcoded UI).
 * A generated password is returned once, in plaintext, at creation time —
 * it is never recoverable afterward (only its bcrypt hash is stored).
 */
const { hashPassword } = require('../utils/password');
const { generateSimplePassword } = require('../utils/credentials');
const { ConflictError, NotFoundError } = require('../utils/errors');

class UserManagementService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async listOperationsManagers({ search, limit = 50, offset = 0 } = {}) {
    const { items, total } = await this.userRepository.listByRole('OPERATIONS_MANAGER', { search, limit, offset });
    return {
      items: items.map((u) => ({ id: u.id, name: u.name, email: u.email, isActive: u.isActive, createdAt: u.createdAt })),
      total,
    };
  }

  async createOperationsManager({ name, email }) {
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new ConflictError(`An account with the identifier '${email}' already exists`);
    }

    const password = generateSimplePassword();
    const passwordHash = await hashPassword(password);
    const user = await this.userRepository.create({ name, email, passwordHash, role: 'OPERATIONS_MANAGER' });

    return {
      user: { id: user.id, name: user.name, email: user.email, isActive: user.isActive, createdAt: user.createdAt },
      // Plaintext password — shown exactly once, on this response only.
      generatedPassword: password,
    };
  }

  async setActive(userId, isActive) {
    const user = await this.userRepository.setActive(userId, isActive);
    if (!user) {
      throw new NotFoundError(`User ${userId} not found`);
    }
    return { id: user.id, name: user.name, email: user.email, isActive: user.isActive };
  }
}

module.exports = UserManagementService;
