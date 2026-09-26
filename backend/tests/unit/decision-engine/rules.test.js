const { generateRecommendations, classifyRisk, demandLevel, RULE_CONFIG } = require('../../../src/decision-engine');
const { RiskLevel } = require('../../../src/models/enums');

describe('Decision Engine & Pure Classification', () => {
  test('classifyRisk correctly assigns HIGH, MEDIUM, LOW', () => {
    expect(classifyRisk(0.85)).toBe(RiskLevel.HIGH);
    expect(classifyRisk(0.70)).toBe(RiskLevel.HIGH);
    expect(classifyRisk(0.45)).toBe(RiskLevel.MEDIUM);
    expect(classifyRisk(0.40)).toBe(RiskLevel.MEDIUM);
    expect(classifyRisk(0.39)).toBe(RiskLevel.LOW);
    expect(classifyRisk(null)).toBeNull();
  });

  test('demandLevel assigns HIGH, MEDIUM, LOW based on occupancy', () => {
    expect(demandLevel(85)).toBe('HIGH');
    expect(demandLevel(65)).toBe('MEDIUM');
    expect(demandLevel(40)).toBe('LOW');
  });

  test('generates R1 High Occupancy Alert when forecast exceeds threshold', () => {
    const state = {
      occupancyForecast: {
        predictions: [
          { date: '2026-09-27', dayOfWeek: 'Sunday', predictedOccupancy: 88.5 },
          { date: '2026-09-28', dayOfWeek: 'Monday', predictedOccupancy: 60.0 },
        ],
      },
    };

    const recs = generateRecommendations(state);
    expect(recs.length).toBe(1);
    expect(recs[0].ruleId).toBe('R1');
    expect(recs[0].dedupKey).toBe('R1:2026-09-27');
    expect(recs[0].priority).toBe('HIGH');
  });

  test('generates R4 Low Inventory Alert when demand is HIGH and availability <= 5', () => {
    const state = {
      roomDemands: [
        { roomType: 'DELUXE', demandLevel: 'HIGH', availableRooms: 3, totalRooms: 80 },
        { roomType: 'STANDARD', demandLevel: 'LOW', availableRooms: 40, totalRooms: 100 },
      ],
    };

    const recs = generateRecommendations(state);
    expect(recs.length).toBe(1);
    expect(recs[0].ruleId).toBe('R4');
    expect(recs[0].dedupKey).toBe('R4:DELUXE');
  });

  test('R9 combined rule supersedes R2 aggregate alert for same window', () => {
    const state = {
      occupancyForecast: {
        predictions: [
          { date: '2026-09-27', dayOfWeek: 'Sunday', predictedOccupancy: 90.0 },
        ],
      },
      cancellationSummary: {
        highRiskCount: 15,
        mediumRiskCount: 5,
        windowDays: 30,
      },
    };

    const recs = generateRecommendations(state);
    const ruleIds = recs.map((r) => r.ruleId);
    expect(ruleIds).toContain('R9');
    expect(ruleIds).toContain('R1');
    expect(ruleIds).not.toContain('R2'); // R2 superseded by R9
  });
});
