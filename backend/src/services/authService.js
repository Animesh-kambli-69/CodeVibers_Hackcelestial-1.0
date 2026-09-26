/**
 * Authentication & User Service.
 */
const { comparePassword, hashPassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');
const { UnauthorizedError, InternalError } = require('../utils/errors');

class AuthService {
  constructor(userRepository, guestRepository) {
    this.userRepository = userRepository;
    this.guestRepository = guestRepository;
  }

  async login(email, password) {
    if (!email || !password) {
      throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const passwordMatch = await comparePassword(password, user.passwordHash);
    if (!passwordMatch) {
      throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    let guestId = null;
    if (user.role === 'GUEST') {
      const guest = await this.guestRepository.findByUserId(user.id);
      if (!guest) {
        // Data integrity violation: GUEST user missing corresponding guests row
        throw new InternalError('Guest profile data is missing for this account');
      }
      guestId = guest.id;
    }

    const tokenPayload = {
      userId: user.id,
      role: user.role,
      guestId,
    };

    const token = signToken(tokenPayload);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        guestId,
      },
    };
  }

  async getMe(auth) {
    const user = await this.userRepository.findById(auth.userId);
    if (!user) {
      throw new UnauthorizedError('User account no longer exists');
    }

    let guest = null;
    if (auth.guestId) {
      guest = await this.guestRepository.findById(auth.guestId);
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      guestId: auth.guestId || null,
      name: guest ? guest.name : undefined,
    };
  }

  async changePassword(userId, currentPassword, newPassword) {
    if (!currentPassword || !newPassword) {
      throw new UnauthorizedError('Both current and new passwords are required', 'INVALID_INPUT');
    }

    const currentHash = await this.userRepository.findPasswordHashById(userId);
    if (!currentHash) {
      throw new UnauthorizedError('User not found', 'USER_NOT_FOUND');
    }

    const passwordMatch = await comparePassword(currentPassword, currentHash);
    if (!passwordMatch) {
      throw new UnauthorizedError('Incorrect current password', 'INVALID_CREDENTIALS');
    }

    const newHash = await hashPassword(newPassword);
    await this.userRepository.updatePassword(userId, newHash);
  }
}

module.exports = AuthService;
