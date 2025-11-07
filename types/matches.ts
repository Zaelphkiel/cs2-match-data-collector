export interface Player {
  name: string;
  rating: number;
  kills?: number;
  deaths?: number;
  assists?: number;
  isSubstitute?: boolean;
  recentPerformance?: {
    lastGames: { kills: number; deaths: number; rating: number }[];
    trend: "improving" | "declining" | "stable";
  };
}

export interface MapSideStats {
  map: string;
  ctWinRate: number;
  tWinRate: number;
  preferredSide: "CT" | "T";
}

export interface TeamAnalysis {
  teamName: string;
  lastGames: {
    date: string;
    opponent: string;
    opponentRating: number;
    result: "W" | "L";
    score: string;
    importance: "high" | "medium" | "low";
  }[];
  mapPool: {
    map: string;
    winRate: number;
    gamesPlayed: number;
  }[];
  mapSideStats: MapSideStats[];
  strategies: {
    map: string;
    description: string;
  }[];
  teamwork: {
    synergy: number;
    communication: number;
    clutchRate: number;
  };
  currentNews: {
    date: string;
    title: string;
    impact: "positive" | "negative" | "neutral";
  }[];
  rostorChanges: {
    type: "substitution" | "replacement" | "injury";
    playerOut: string;
    playerIn: string;
    reason: string;
  }[];
}

export interface Team {
  name: string;
  logo: string;
  score?: number;
  players: Player[];
  winRate: number;
  recentForm: string[];
  hltvRanking?: number;
  detailedAnalysis?: TeamAnalysis;
}

export interface MatchStats {
  duration?: string;
  maps?: string[];
  mvp?: string;
  viewerCount?: number;
}

export interface Match {
  id: string;
  date: string;
  tournament: string;
  team1: Team;
  team2: Team;
  status: "upcoming" | "live" | "finished";
  stats?: MatchStats;
  prediction?: {
    winner: string;
    confidence: number;
    factors: string[];
  };
  odds?: BettingOdds[];
}

export interface BettingOdds {
  bookmaker: string;
  team1Win: number;
  team2Win: number;
  mapHandicap?: {
    team: string;
    handicap: number;
    odds: number;
  }[];
}

export interface LiveMatchState {
  currentMap: string;
  mapNumber: number;
  team1Score: number;
  team2Score: number;
  currentRound: number;
  team1RoundsWon: number;
  team2RoundsWon: number;
  situation: string;
}

export interface AIAnalysis {
  scenario: string;
  probability: number;
  reasoning: string;
}

export interface DataSource {
  name: string;
  url?: string;
  lastUpdated: string;
  reliability: number;
  dataType: "statistics" | "news" | "community" | "expert_opinion";
}

export interface MultiSourceData {
  hltv?: {
    teamRankings: { team: string; rank: number }[];
    recentMatches: any[];
    playerStats: any[];
  };
  liquipedia?: {
    tournamentInfo: any;
    teamHistory: any[];
    rosterChanges: any[];
  };
  betting?: {
    odds: BettingOdds[];
    marketMovement: { timestamp: string; odds: number }[];
    valueOpportunities: string[];
  };
  community?: {
    forumSentiment: { source: string; sentiment: "positive" | "negative" | "neutral"; weight: number }[];
    telegramPredictions: { channel: string; prediction: string; confidence: number }[];
    expertOpinions: { expert: string; analysis: string; credibility: number }[];
  };
  news?: {
    recentNews: { source: string; title: string; impact: string; date: string }[];
    rumors: { content: string; reliability: number }[];
  };
}

export interface ComprehensiveAnalysis {
  sourcesUsed: DataSource[];
  dataFreshness: string;
  aggregatedData: MultiSourceData;
  crossSourceValidation: {
    consensus: number;
    conflictingInfo: string[];
    resolvedConflicts: string[];
  };
  enhancedFactors: {
    statistical: { weight: number; factors: string[] };
    psychological: { weight: number; factors: string[] };
    contextual: { weight: number; factors: string[] };
    community: { weight: number; factors: string[] };
  };
}

export interface MatchAnalysis {
  matchId: string;
  analysisVersion: "standard" | "comprehensive";
  comprehensiveData?: ComprehensiveAnalysis;
  headToHead: {
    team1Wins: number;
    team2Wins: number;
    lastMeetings: {
      date: string;
      winner: string;
      score: string;
      maps: string[];
    }[];
  };
  formAnalysis: {
    team1: {
      wins: number;
      losses: number;
      trend: "improving" | "declining" | "stable";
      last4Weeks: {
        wins: number;
        losses: number;
        avgRating: number;
      };
    };
    team2: {
      wins: number;
      losses: number;
      trend: "improving" | "declining" | "stable";
      last4Weeks: {
        wins: number;
        losses: number;
        avgRating: number;
      };
    };
  };
  mapAnalysis: {
    bestMaps: {
      team1: { map: string; winRate: number }[];
      team2: { map: string; winRate: number }[];
    };
    expectedMaps: string[];
    advantage: string;
  };
  tournamentImportance: {
    forTeam1: "critical" | "important" | "moderate" | "low";
    forTeam2: "critical" | "important" | "moderate" | "low";
    reasoning: string;
  };
  aiScenarios: AIAnalysis[];
  keyFactors: string[];
  predictedWinner: string;
  confidence: number;
  bettingRecommendations?: {
    recommendation: string;
    odds?: BettingOdds;
    expectedValue: number;
    risk: "low" | "medium" | "high";
  }[];
  liveState?: LiveMatchState;
  livePredictions?: {
    currentWinProbability: { team1: number; team2: number };
    suggestedBets: string[];
  };
}
