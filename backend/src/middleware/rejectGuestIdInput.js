const { ValidationError } = require('../utils/errors');

function rejectGuestIdInput(req, res, next) {
  const hasGuestIdInParams = req.params && 'guestId' in req.params;
  const hasGuestIdInQuery = req.query && 'guestId' in req.query;
  const hasGuestIdInBody = req.body && typeof req.body === 'object' && 'guestId' in req.body;

  if (hasGuestIdInParams || hasGuestIdInQuery || hasGuestIdInBody) {
    return next(
      new ValidationError('Client-specified guestId is not permitted for guest self-service routes', [
        { field: 'guestId', issue: 'not_allowed' },
      ])
    );
  }

  next();
}

module.exports = rejectGuestIdInput;
