/**
 * Standard API Response Envelope Helpers.
 * Enforces api.md §1.7 envelope format { data, meta? }
 */
const respond = {
  ok(res, data, meta = undefined) {
    const payload = { data };
    if (meta !== undefined) {
      payload.meta = meta;
    }
    return res.status(200).json(payload);
  },

  created(res, data, meta = undefined) {
    const payload = { data };
    if (meta !== undefined) {
      payload.meta = meta;
    }
    return res.status(201).json(payload);
  },

  paginated(res, data, pagination) {
    const { page, limit, total } = pagination;
    return res.status(200).json({
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  },

  noContent(res) {
    return res.status(204).send();
  },
};

module.exports = respond;
