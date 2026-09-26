const { addDays, diffDays, getStayNights } = require('../../../src/utils/dates');

describe('Date Utilities', () => {
  test('addDays adds specified days correctly', () => {
    expect(addDays('2026-09-26', 1)).toBe('2026-09-27');
    expect(addDays('2026-09-30', 1)).toBe('2026-10-01');
  });

  test('diffDays calculates difference in days', () => {
    expect(diffDays('2026-09-26', '2026-09-30')).toBe(4);
  });

  test('getStayNights separates weekend and week nights per H1 definition', () => {
    // 2026-09-25 is Friday, 2026-09-28 is Monday
    // Nights: Friday (week), Saturday (weekend), Sunday (weekend)
    const result = getStayNights('2026-09-25', '2026-09-28');
    expect(result.totalNights).toBe(3);
    expect(result.weekendNights).toBe(2);
    expect(result.weekNights).toBe(1);
  });
});
