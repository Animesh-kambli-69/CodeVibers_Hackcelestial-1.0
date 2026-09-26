/**
 * Concierge Service.
 * Orchestrates the full grounded AI Concierge pipeline:
 * 1. Scope guest identity
 * 2. Load context (preferences, bookings)
 * 3. Retrieve verified resort information
 * 4. Grounding guard (0 sources -> return fallback without LLM)
 * 5. Generate reply
 * 6. Atomic message persistence
 */
const { NotFoundError } = require('../utils/errors');
const appConfig = require('../config/app');
const { getTodayString } = require('../utils/dates');

class ConciergeService {
  constructor(
    chatRepository,
    resortInfoRepository,
    guestRepository,
    preferenceRepository,
    bookingRepository,
    aiService
  ) {
    this.chatRepository = chatRepository;
    this.resortInfoRepository = resortInfoRepository;
    this.guestRepository = guestRepository;
    this.preferenceRepository = preferenceRepository;
    this.bookingRepository = bookingRepository;
    this.aiService = aiService;
  }

  async processMessage({ guestId, conversationId = null, message }) {
    // 1. Verify guest exists
    const guest = await this.guestRepository.findById(guestId);
    if (!guest) {
      throw new NotFoundError('Guest not found');
    }

    // 2. Validate or create conversation session
    let conversation;
    if (conversationId) {
      conversation = await this.chatRepository.findConversation(conversationId, guestId);
      if (!conversation) {
        throw new NotFoundError('Conversation not found or does not belong to guest');
      }
    } else {
      conversation = await this.chatRepository.createConversation(guestId);
    }

    // 3. Load guest context (preferences & current stay)
    const today = getTodayString();
    const [preferences, currentStay] = await Promise.all([
      this.preferenceRepository.findByGuestId(guestId),
      this.bookingRepository.findCurrentStay(guestId, today),
    ]);

    const guestContext = {
      name: guest.name,
      loyaltyTier: guest.loyaltyTier,
      preferences,
      currentStay,
    };

    // 4. Retrieve verified resort information sources
    const sources = await this.resortInfoRepository.searchGroundedSources(
      message,
      appConfig.CONCIERGE.TOP_K_SOURCES
    );

    let replyText;
    let grounded = true;
    let usedSources = [];

    // Guard: Zero sources found -> immediately fallback without calling LLM
    if (!sources || sources.length === 0) {
      replyText = appConfig.CONCIERGE.FALLBACK_MESSAGE;
      grounded = false;
      usedSources = [];
    } else {
      usedSources = sources;
      replyText = await this.aiService.generateGroundedReply({
        message,
        guestContext,
        sources,
      });
    }

    // Identify which guest preferences were relevant
    const usedPreferences = preferences
      .filter((p) => replyText.toLowerCase().includes(p.preferenceValue.toLowerCase()))
      .map((p) => ({ type: p.preferenceType, value: p.preferenceValue }));

    // 5. Persist user message and assistant reply
    await this.chatRepository.saveMessage({
      conversationId: conversation.id,
      role: 'GUEST',
      content: message,
    });

    const assistantMsg = await this.chatRepository.saveMessage({
      conversationId: conversation.id,
      role: 'ASSISTANT',
      content: replyText,
      grounded,
      sources: usedSources.map((s) => ({ id: s.id, category: s.category, title: s.title })),
      usedPreferences,
    });

    return {
      conversationId: conversation.id,
      reply: {
        id: assistantMsg.id,
        content: assistantMsg.content,
        grounded: assistantMsg.grounded,
        sources: assistantMsg.sources,
        usedPreferences: assistantMsg.usedPreferences,
        createdAt: assistantMsg.createdAt,
      },
    };
  }
}

module.exports = ConciergeService;
