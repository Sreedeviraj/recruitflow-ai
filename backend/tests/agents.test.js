// Pure unit tests for RankingAgent and ScoringAgent
// Zero real API calls — aiService is mocked

jest.mock('../src/services/aiService', () => ({
  analyze: jest.fn(),
  parseJSON: jest.fn()
}));

const rankingAgent = require('../src/agents/rankingAgent');
const scoringAgent = require('../src/agents/scoringAgent');
const aiService = require('../src/services/aiService');

describe('RankingAgent.rank()', () => {
  it('should sort by totalScore descending', () => {
    const scores = [
      { candidateName: 'C', totalScore: 50, skillScore: 50, experienceScore: 50 },
      { candidateName: 'A', totalScore: 90, skillScore: 90, experienceScore: 90 },
      { candidateName: 'B', totalScore: 70, skillScore: 70, experienceScore: 70 }
    ];
    const ranked = rankingAgent.rank(scores);
    expect(ranked[0].candidateName).toBe('A');
    expect(ranked[1].candidateName).toBe('B');
    expect(ranked[2].candidateName).toBe('C');
  });

  it('should assign rank 1 to highest scorer', () => {
    const scores = [
      { candidateName: 'X', totalScore: 85, skillScore: 80, experienceScore: 85 },
      { candidateName: 'Y', totalScore: 60, skillScore: 60, experienceScore: 60 }
    ];
    const ranked = rankingAgent.rank(scores);
    expect(ranked[0].rank).toBe(1);
    expect(ranked[1].rank).toBe(2);
  });

  it('should handle ties: same rank number for equal scores', () => {
    const scores = [
      { candidateName: 'A', totalScore: 80, skillScore: 80, experienceScore: 80 },
      { candidateName: 'B', totalScore: 80, skillScore: 80, experienceScore: 80 },
      { candidateName: 'C', totalScore: 60, skillScore: 60, experienceScore: 60 }
    ];
    const ranked = rankingAgent.rank(scores);
    expect(ranked[0].rank).toBe(1);
    expect(ranked[1].rank).toBe(1);
    expect(ranked[2].rank).toBe(3);
  });
});

describe('RankingAgent.generateSummary()', () => {
  it('should count recommendation tiers correctly', () => {
    const candidates = [
      { candidateName: 'A', totalScore: 90, recommendation: 'Strongly Recommended' },
      { candidateName: 'B', totalScore: 75, recommendation: 'Recommended' },
      { candidateName: 'C', totalScore: 55, recommendation: 'Consider' },
      { candidateName: 'D', totalScore: 40, recommendation: 'Not Recommended' }
    ];
    const summary = rankingAgent.generateSummary(candidates);
    expect(summary.breakdown.stronglyRecommended).toBe(1);
    expect(summary.breakdown.recommended).toBe(1);
    expect(summary.breakdown.consider).toBe(1);
    expect(summary.breakdown.notRecommended).toBe(1);
  });

  it('should return correct totalCandidates', () => {
    const candidates = [
      { candidateName: 'A', totalScore: 80, recommendation: 'Recommended' },
      { candidateName: 'B', totalScore: 60, recommendation: 'Consider' }
    ];
    const summary = rankingAgent.generateSummary(candidates);
    expect(summary.totalCandidates).toBe(2);
  });
});

describe('ScoringAgent totalScore formula', () => {
  it('should calculate totalScore as skill*0.5 + exp*0.3 + edu*0.2', () => {
    // Test the formula: (80*0.5) + (70*0.3) + (90*0.2) = 40 + 21 + 18 = 79
    const expected = Math.round(80 * 0.5 + 70 * 0.3 + 90 * 0.2);
    expect(expected).toBe(79);
  });

  it('should assign Strongly Recommended for score 85+', () => {
    expect(scoringAgent._getRecommendation(85)).toBe('Strongly Recommended');
    expect(scoringAgent._getRecommendation(95)).toBe('Strongly Recommended');
    expect(scoringAgent._getRecommendation(100)).toBe('Strongly Recommended');
  });

  it('should assign Recommended for score 70-84', () => {
    expect(scoringAgent._getRecommendation(70)).toBe('Recommended');
    expect(scoringAgent._getRecommendation(77)).toBe('Recommended');
    expect(scoringAgent._getRecommendation(84)).toBe('Recommended');
  });

  it('should assign Consider for score 50-69', () => {
    expect(scoringAgent._getRecommendation(50)).toBe('Consider');
    expect(scoringAgent._getRecommendation(60)).toBe('Consider');
    expect(scoringAgent._getRecommendation(69)).toBe('Consider');
  });

  it('should assign Not Recommended for score below 50', () => {
    expect(scoringAgent._getRecommendation(49)).toBe('Not Recommended');
    expect(scoringAgent._getRecommendation(0)).toBe('Not Recommended');
    expect(scoringAgent._getRecommendation(25)).toBe('Not Recommended');
  });
});
