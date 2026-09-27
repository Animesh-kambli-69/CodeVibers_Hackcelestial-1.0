/**
 * Authentication & User Service.
 */
const { comparePassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');
const { UnauthorizedError, InternalError } = require('../utils/errors');

class AuthService {
  constructor(userRepository, guestRepository, feedbackRepository = null, guestAccountService = null) {
    this.userRepository = userRepository;
    this.guestRepository = guestRepository;
    this.feedbackRepository = feedbackRepository;
    this.guestAccountService = guestAccountService;
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

    if (user.isActive === false) {
      throw new UnauthorizedError('This account has been deactivated', 'ACCOUNT_INACTIVE');
    }

    let guestId = null;
    if (user.role === 'GUEST') {
      const guest = await this.guestRepository.findByUserId(user.id);
      if (!guest) {
        // Data integrity violation: GUEST user missing corresponding guests row
        throw new InternalError('Guest profile data is missing for this account');
      }
      guestId = guest.id;

      // Lazy destruction: a guest's auto-provisioned account is only meant to
      // live through its feedback grace window (see bookingLifecycleService,
      // guestAccountService). If that window lapsed without a login attempt
      // in between, destroy it now and refuse the login rather than letting
      // an expired account keep working indefinitely.
      if (this.feedbackRepository && this.guestAccountService) {
        const expired = await this.feedbackRepository.hasExpiredPending(guestId);
        if (expired) {
          await this.guestAccountService.destroy(guestId);
          throw new UnauthorizedError('This account has expired', 'ACCOUNT_EXPIRED');
        }
      }
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
      name: guest ? guest.name : user.name,
    };
  }
}

module.exports = AuthService;
