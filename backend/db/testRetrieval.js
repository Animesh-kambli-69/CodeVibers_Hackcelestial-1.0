const { getPool } = require('../src/config/database');

async function testImprovedSearch(queryText) {
  const pool = getPool();
  
  const stopWords = new Set(['what', 'are', 'is', 'the', 'a', 'an', 'and', 'or', 'to', 'for', 'in', 'on', 'at', 'can', 'i', 'you', 'me', 'my', 'we', 'our', 'do', 'have', 'there', 'any', 'tell', 'about', 'options', 'option', 'places', 'info', 'information', 'how']);
  const tokens = queryText.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));
  console.log('Query:', queryText, '-> Tokens:', tokens);

  const categoryMap = {
    'DINING': ['dining', 'restaurant', 'food', 'breakfast', 'lunch', 'dinner', 'tapas', 'bistro', 'cafe', 'eat', 'meal', 'drinks', 'bar'],
    'SPA': ['spa', 'massage', 'wellness', 'ayurvedic', 'hydrotherapy', 'steam', 'facial', 'relax'],
    'ACTIVITIES': ['activities', 'activity', 'snorkel', 'snorkeling', 'cruise', 'sailing', 'catamaran', 'dolphin', 'excursion', 'boat', 'marine', 'yoga'],
    'FACILITIES': ['pool', 'infinity', 'gym', 'fitness', 'workout', 'technogym', 'deck', 'beach'],
    'POLICIES': ['checkin', 'checkout', 'policy', 'policies', 'rules', 'arrival', 'departure', 'early', 'late', 'hours', 'time'],
    'TRANSPORTATION': ['airport', 'transfer', 'limousine', 'taxi', 'helipad', 'car', 'pickup', 'drop']
  };

  const matchedCategories = [];
  for (const [cat, words] of Object.entries(categoryMap)) {
    if (tokens.some(t => words.some(w => w.includes(t) || t.includes(w)))) {
      matchedCategories.push(cat);
    }
  }

  const conditions = [];
  const params = [];

  for (const t of tokens) {
    params.push(`%${t}%`);
    conditions.push(`(title ILIKE $${params.length} OR content ILIKE $${params.length} OR category ILIKE $${params.length})`);
  }

  if (matchedCategories.length > 0) {
    params.push(matchedCategories);
    conditions.push(`category = ANY($${params.length})`);
  }

  let sql;
  if (conditions.length > 0) {
    params.push(5);
    sql = `
      SELECT id, category, title, content
      FROM resort_information
      WHERE ${conditions.join(' OR ')}
      LIMIT $${params.length}
    `;
  } else {
    params.push(5);
    sql = `SELECT id, category, title, content FROM resort_information LIMIT $${params.length}`;
  }

  const res = await pool.query(sql, params);
  console.log('Results:', res.rows.map(r => `[${r.category}] ${r.title}`));
}

async function run() {
  await testImprovedSearch('what are dining options');
  await testImprovedSearch('Sunset Catamaran Coastal Cruise');
  await testImprovedSearch('tell me about the pool and fitness');
  await testImprovedSearch('what time is check out?');
  process.exit(0);
}
run().catch(console.error);
