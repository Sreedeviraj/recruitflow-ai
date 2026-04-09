class RankingAgent {
  rank(scores) {
    console.log(`[RankingAgent] Ranking ${scores.length} candidates...`);

    // Sort by totalScore descending, tiebreak by skillScore, then experienceScore
    const sorted = [...scores].sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      if (b.skillScore !== a.skillScore) return b.skillScore - a.skillScore;
      return b.experienceScore - a.experienceScore;
    });

    // Assign ranks (ties share same rank number)
    let currentRank = 1;
    for (let i = 0; i < sorted.length; i++) {
      if (i > 0) {
        const prev = sorted[i - 1];
        const curr = sorted[i];
        if (curr.totalScore === prev.totalScore && curr.skillScore === prev.skillScore) {
          // Tie — same rank
        } else {
          currentRank = i + 1;
        }
      }
      sorted[i].rank = currentRank;
    }

    console.log(`[RankingAgent] Ranking complete. Top candidate: ${sorted[0]?.candidateName} (${sorted[0]?.totalScore})`);
    return sorted;
  }

  generateSummary(rankedCandidates) {
    if (!rankedCandidates || rankedCandidates.length === 0) {
      return {
        totalCandidates: 0,
        averageScore: 0,
        topCandidate: null,
        topScore: 0,
        breakdown: { stronglyRecommended: 0, recommended: 0, consider: 0, notRecommended: 0 }
      };
    }

    const totalCandidates = rankedCandidates.length;
    const totalScore = rankedCandidates.reduce((sum, c) => sum + c.totalScore, 0);
    const averageScore = Math.round(totalScore / totalCandidates);
    const topCandidate = rankedCandidates[0];

    const breakdown = {
      stronglyRecommended: rankedCandidates.filter(c => c.recommendation === 'Strongly Recommended').length,
      recommended: rankedCandidates.filter(c => c.recommendation === 'Recommended').length,
      consider: rankedCandidates.filter(c => c.recommendation === 'Consider').length,
      notRecommended: rankedCandidates.filter(c => c.recommendation === 'Not Recommended').length
    };

    return {
      totalCandidates,
      averageScore,
      topCandidate: topCandidate.candidateName,
      topScore: topCandidate.totalScore,
      breakdown
    };
  }
}

module.exports = new RankingAgent();
