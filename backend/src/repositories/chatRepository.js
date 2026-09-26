/**
 * Chat Repository for AI Concierge conversations and grounded messages.
 */

class ChatRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async findConversation(conversationId, guestId) {
    const query = `
      SELECT id, guest_id, created_at, updated_at
      FROM chat_conversations
      WHERE id = $1 AND guest_id = $2
      LIMIT 1;
    `;
    const res = await this.pool.query(query, [conversationId, guestId]);
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return {
      id: row.id,
      guestId: row.guest_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async createConversation(guestId) {
    const query = `
      INSERT INTO chat_conversations (guest_id, created_at, updated_at)
      VALUES ($1, NOW(), NOW())
      RETURNING id, guest_id, created_at, updated_at;
    `;
    const res = await this.pool.query(query, [guestId]);
    const row = res.rows[0];
    return {
      id: row.id,
      guestId: row.guest_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async saveMessage({ conversationId, role, content, grounded = true, sources = [], usedPreferences = [] }) {
    const query = `
      INSERT INTO chat_messages (
        conversation_id, role, content, grounded, sources, used_preferences, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, NOW()
      )
      RETURNING id, conversation_id, role, content, grounded, sources, used_preferences, created_at;
    `;
    const res = await this.pool.query(query, [
      conversationId,
      role,
      content,
      grounded,
      JSON.stringify(sources),
      JSON.stringify(usedPreferences),
    ]);
    const row = res.rows[0];
    return {
      id: row.id,
      conversationId: row.conversation_id,
      role: row.role,
      content: row.content,
      grounded: row.grounded,
      sources: typeof row.sources === 'string' ? JSON.parse(row.sources) : row.sources,
      usedPreferences: typeof row.used_preferences === 'string' ? JSON.parse(row.used_preferences) : row.used_preferences,
      createdAt: row.created_at,
    };
  }
}

module.exports = ChatRepository;
