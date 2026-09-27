/**
 * Guest Feedback Service.
 * Creates a PENDING feedback record at checkout, accepts a guest's rating +
 * comment (by login session or by an unauthenticated QR/link token), scores
 * sentiment/topics with the shared heuristic, and — once feedback is in —
 * immediately destroys the guest's auto-provisioned login account (its
 * purpose is served). Also feeds the manager sentiment dashboard from real
 * submissions instead of mocked data.
 */
const appConfig = require('../config/app');
const { scoreGuestFeedback, extractTopics } = require('../utils/sentiment');
const { NotFoundError, ConflictError, ValidationError } = require('../utils/errors');

class FeedbackService {
  constructor(feedbackRepository, guestAccountService) {
    this.feedbackRepository = feedbackRepository;
    this.guestAccountService = guestAccountService;
  }

  async createPendingForBooking(bookingId, guestId) {
    const graceDeadline = new Date(Date.now() + appConfig.FEEDBACK.GRACE_WINDOW_HOURS * 60 * 60 * 1000);
    return this.feedbackRepository.createPending({ bookingId, guestId, graceDeadline });
  }

  async listPendingForGuest(guestId) {
    return this.feedbackRepository.listPendingForGuest(guestId);
  }

  async submitAsGuest(bookingId, guestId, { rating, comment }) {
    // Guests may only ever submit feedback for their OWN booking — verified
    // by guestId, mirroring the guest-isolation pattern used everywhere else
    // (rejectGuestIdInput middleware, guestSelfService.js).
    const pending = await this._findOwnedPending(bookingId, guestId);
    return this._submit(pending, { rating, comment });
  }

  async submitByToken(token, { rating, comment }) {
    const feedback = await this.feedbackRepository.findByToken(token);
    if (!feedback) {
      throw new NotFoundError('Feedback link not found or already used');
    }
    if (feedback.status !== 'PENDING') {
      throw new ConflictError('Feedback has already been submitted for this stay');
    }
    return this._submit(feedback, { rating, comment });
  }

  async _findOwnedPending(bookingId, guestId) {
    const pending = await this.feedbackRepository.findByBookingId(bookingId);
    if (!pending || pending.guestId !== guestId) {
      throw new NotFoundError('Feedback request not found');
    }
    if (pending.status !== 'PENDING') {
      throw new ConflictError('Feedback has already been submitted for this stay');
    }
    return pending;
  }

  async _submit(feedback, { rating, comment }) {
    if (rating === undefined || rating === null || rating < 1 || rating > 5) {
      throw new ValidationError('rating must be between 1 and 5', [{ field: 'rating', issue: 'out_of_range' }]);
    }

    const text = `${comment || ''}`;
    const sentiment = rating <= 2 ? 'NEGATIVE' : rating >= 4 ? 'POSITIVE' : scoreGuestFeedback(text) || 'NEUTRAL';
    const topics = extractTopics(text);

    const submitted = await this.feedbackRepository.submit(feedback.id, {
      rating,
      comment: comment || null,
      sentiment,
      topics,
    });

    if (!submitted) {
      throw new ConflictError('Feedback has already been submitted for this stay');
    }

    // "Feedback first, then destroy" — the account's purpose is served.
    if (this.guestAccountService) {
      await this.guestAccountService.destroy(submitted.guestId);
    }

    return submitted;
  }

  /**
   * Real sentiment aggregation for the manager dashboard — replaces the
   * previously mocked /manager/sentiment payload with actual guest
   * submissions. Returns a "not enough data yet" shape rather than fake
   * numbers when there's nothing to aggregate.
   */
  async getManagerSentimentSummary(days = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const feedback = await this.feedbackRepository.listSubmittedSince(since);

    if (feedback.length === 0) {
      return {
        hasData: false,
        totalReviews: 0,
        averageRating: null,
        breakdown: { positive: 0, neutral: 0, negative: 0 },
        topics: [],
      };
    }

    const breakdown = { positive: 0, neutral: 0, negative: 0 };
    const topicCounts = {};
    let ratingSum = 0;

    for (const f of feedback) {
      ratingSum += f.rating || 0;
      if (f.sentiment === 'POSITIVE') breakdown.positive += 1;
      else if (f.sentiment === 'NEGATIVE') breakdown.negative += 1;
      else breakdown.neutral += 1;

      for (const topic of f.topics || []) {
        if (!topicCounts[topic]) topicCounts[topic] = { topic, count: 0, negativeCount: 0 };
        topicCounts[topic].count += 1;
        if (f.sentiment === 'NEGATIVE') topicCounts[topic].negativeCount += 1;
      }
    }

    const topics = Object.values(topicCounts)
      .map((t) => ({ ...t, negativeSharePct: Math.round((t.negativeCount / t.count) * 1000) / 10 }))
      .sort((a, b) => b.count - a.count);

    return {
      hasData: true,
      totalReviews: feedback.length,
      averageRating: Math.round((ratingSum / feedback.length) * 100) / 100,
      breakdown,
      topics,
    };
  }
}

module.exports = FeedbackService;
