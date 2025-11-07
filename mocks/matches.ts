import type { Match, MatchAnalysis } from "@/types/matches";

export const mockMatches: Match[] = [
  {
    id: "1",
    date: "2025-11-06T18:00:00Z",
    tournament: "IEM Katowice 2025",
    team1: {
      name: "Natus Vincere",
      logo: "https://img.icons8.com/color/96/000000/csgo.png",
      players: [
        { name: "s1mple", rating: 1.32 },
        { name: "electroNic", rating: 1.18 },
        { name: "Perfecto", rating: 1.05 },
        { name: "b1t", rating: 1.21 },
        { name: "sdy", rating: 1.09 },
      ],
      winRate: 68,
      recentForm: ["W", "W", "L", "W", "W"],
    },
    team2: {
      name: "FaZe Clan",
      logo: "https://img.icons8.com/color/96/000000/csgo.png",
      players: [
        { name: "rain", rating: 1.15 },
        { name: "ropz", rating: 1.24 },
        { name: "Twistzz", rating: 1.19 },
        { name: "karrigan", rating: 1.02 },
        { name: "frozen", rating: 1.11 },
      ],
      winRate: 64,
      recentForm: ["W", "W", "W", "L", "W"],
    },
    status: "upcoming",
    prediction: {
      winner: "Natus Vincere",
      confidence: 62,
      factors: ["Better individual skill", "Recent form advantage", "Strong on selected maps"],
    },
  },
  {
    id: "2",
    date: "2025-11-06T20:30:00Z",
    tournament: "BLAST Premier Spring 2025",
    team1: {
      name: "G2 Esports",
      logo: "https://img.icons8.com/color/96/000000/csgo.png",
      players: [
        { name: "NiKo", rating: 1.28 },
        { name: "m0NESY", rating: 1.31 },
        { name: "huNter-", rating: 1.14 },
        { name: "jks", rating: 1.08 },
        { name: "HooXi", rating: 0.98 },
      ],
      winRate: 71,
      recentForm: ["W", "W", "W", "W", "L"],
    },
    team2: {
      name: "Vitality",
      logo: "https://img.icons8.com/color/96/000000/csgo.png",
      players: [
        { name: "ZywOo", rating: 1.35 },
        { name: "apEX", rating: 1.11 },
        { name: "Magisk", rating: 1.17 },
        { name: "Spinx", rating: 1.13 },
        { name: "Mezii", rating: 1.09 },
      ],
      winRate: 69,
      recentForm: ["W", "L", "W", "W", "W"],
    },
    status: "live",
    stats: {
      maps: ["Mirage", "Inferno", "Anubis"],
      viewerCount: 45320,
    },
  },
  {
    id: "3",
    date: "2025-11-06T15:00:00Z",
    tournament: "ESL Pro League Season 21",
    team1: {
      name: "Astralis",
      logo: "https://img.icons8.com/color/96/000000/csgo.png",
      score: 2,
      players: [
        { name: "device", rating: 1.22, kills: 54, deaths: 48, assists: 12 },
        { name: "blameF", rating: 1.15, kills: 48, deaths: 51, assists: 15 },
        { name: "k0nfig", rating: 1.18, kills: 51, deaths: 49, assists: 10 },
        { name: "Staehr", rating: 1.08, kills: 42, deaths: 52, assists: 8 },
        { name: "jabbi", rating: 1.11, kills: 45, deaths: 50, assists: 11 },
      ],
      winRate: 58,
      recentForm: ["L", "W", "W", "L", "W"],
    },
    team2: {
      name: "MOUZ",
      logo: "https://img.icons8.com/color/96/000000/csgo.png",
      score: 1,
      players: [
        { name: "torzsi", rating: 1.19, kills: 49, deaths: 50, assists: 9 },
        { name: "xertioN", rating: 1.12, kills: 47, deaths: 48, assists: 13 },
        { name: "Jimpphat", rating: 1.05, kills: 43, deaths: 52, assists: 7 },
        { name: "siuhy", rating: 1.01, kills: 40, deaths: 51, assists: 14 },
        { name: "Brollan", rating: 1.14, kills: 48, deaths: 49, assists: 10 },
      ],
      winRate: 62,
      recentForm: ["W", "L", "W", "W", "L"],
    },
    status: "finished",
    stats: {
      duration: "2h 15m",
      maps: ["Nuke", "Ancient", "Vertigo"],
      mvp: "device",
    },
  },
  {
    id: "4",
    date: "2025-11-06T22:00:00Z",
    tournament: "BLAST Premier Spring 2025",
    team1: {
      name: "Liquid",
      logo: "https://img.icons8.com/color/96/000000/csgo.png",
      players: [
        { name: "YEKINDAR", rating: 1.16 },
        { name: "cadiaN", rating: 1.04 },
        { name: "NAF", rating: 1.12 },
        { name: "ultimate", rating: 1.19 },
        { name: "Twistzz", rating: 1.25 },
      ],
      winRate: 65,
      recentForm: ["W", "W", "L", "W", "L"],
    },
    team2: {
      name: "Heroic",
      logo: "https://img.icons8.com/color/96/000000/csgo.png",
      players: [
        { name: "TeSeS", rating: 1.13 },
        { name: "sjuush", rating: 1.09 },
        { name: "nicoodoz", rating: 1.21 },
        { name: "kyxsan", rating: 1.07 },
        { name: "NertZ", rating: 1.15 },
      ],
      winRate: 61,
      recentForm: ["L", "W", "W", "L", "W"],
    },
    status: "upcoming",
    prediction: {
      winner: "Liquid",
      confidence: 58,
      factors: ["Home advantage", "Strong firepower", "Better map pool"],
    },
  },
  {
    id: "5",
    date: "2025-11-07T14:00:00Z",
    tournament: "ESL Pro League Season 21",
    team1: {
      name: "Cloud9",
      logo: "https://img.icons8.com/color/96/000000/csgo.png",
      players: [
        { name: "HObbit", rating: 1.15 },
        { name: "nafany", rating: 1.08 },
        { name: "Ax1Le", rating: 1.22 },
        { name: "interz", rating: 1.11 },
        { name: "sh1ro", rating: 1.27 },
      ],
      winRate: 63,
      recentForm: ["W", "L", "W", "W", "W"],
    },
    team2: {
      name: "ENCE",
      logo: "https://img.icons8.com/color/96/000000/csgo.png",
      players: [
        { name: "Snappi", rating: 1.06 },
        { name: "Maden", rating: 1.18 },
        { name: "Spinx", rating: 1.14 },
        { name: "Goofy", rating: 1.09 },
        { name: "dycha", rating: 1.13 },
      ],
      winRate: 59,
      recentForm: ["L", "W", "L", "W", "W"],
    },
    status: "upcoming",
    prediction: {
      winner: "Cloud9",
      confidence: 64,
      factors: ["Superior firepower", "Consistent form", "sh1ro in excellent shape"],
    },
  },
  {
    id: "6",
    date: "2025-11-07T17:00:00Z",
    tournament: "IEM Katowice 2025",
    team1: {
      name: "Spirit",
      logo: "https://img.icons8.com/color/96/000000/csgo.png",
      players: [
        { name: "chopper", rating: 1.09 },
        { name: "magixx", rating: 1.17 },
        { name: "donk", rating: 1.29 },
        { name: "zont1x", rating: 1.13 },
        { name: "sh1ro", rating: 1.23 },
      ],
      winRate: 72,
      recentForm: ["W", "W", "W", "L", "W"],
    },
    team2: {
      name: "Complexity",
      logo: "https://img.icons8.com/color/96/000000/csgo.png",
      players: [
        { name: "JT", rating: 1.08 },
        { name: "floppy", rating: 1.14 },
        { name: "hallzerk", rating: 1.19 },
        { name: "EliGE", rating: 1.21 },
        { name: "Grim", rating: 1.12 },
      ],
      winRate: 56,
      recentForm: ["L", "L", "W", "L", "W"],
    },
    status: "live",
    stats: {
      maps: ["Anubis", "Nuke", "Vertigo"],
      viewerCount: 28500,
    },
  },
  {
    id: "7",
    date: "2025-11-06T12:00:00Z",
    tournament: "BLAST Premier Spring 2025",
    team1: {
      name: "BIG",
      logo: "https://img.icons8.com/color/96/000000/csgo.png",
      score: 0,
      players: [
        { name: "prosus", rating: 1.07, kills: 38, deaths: 54, assists: 8 },
        { name: "syrsoN", rating: 1.15, kills: 45, deaths: 50, assists: 9 },
        { name: "tabseN", rating: 1.09, kills: 41, deaths: 52, assists: 11 },
        { name: "Krimbo", rating: 1.02, kills: 37, deaths: 53, assists: 7 },
        { name: "rigoN", rating: 1.11, kills: 43, deaths: 51, assists: 10 },
      ],
      winRate: 52,
      recentForm: ["L", "L", "W", "L", "L"],
    },
    team2: {
      name: "OG",
      logo: "https://img.icons8.com/color/96/000000/csgo.png",
      score: 2,
      players: [
        { name: "nexa", rating: 1.14, kills: 49, deaths: 42, assists: 13 },
        { name: "F1KU", rating: 1.21, kills: 53, deaths: 40, assists: 11 },
        { name: "regali", rating: 1.18, kills: 51, deaths: 41, assists: 14 },
        { name: "degster", rating: 1.26, kills: 56, deaths: 38, assists: 9 },
        { name: "niko", rating: 1.09, kills: 44, deaths: 44, assists: 12 },
      ],
      winRate: 61,
      recentForm: ["W", "W", "L", "W", "W"],
    },
    status: "finished",
    stats: {
      duration: "1h 42m",
      maps: ["Mirage", "Inferno"],
      mvp: "degster",
    },
  },
  {
    id: "8",
    date: "2025-11-07T19:30:00Z",
    tournament: "IEM Katowice 2025",
    team1: {
      name: "Fnatic",
      logo: "https://img.icons8.com/color/96/000000/csgo.png",
      players: [
        { name: "KRIMZ", rating: 1.10 },
        { name: "MATYS", rating: 1.16 },
        { name: "afro", rating: 1.20 },
        { name: "roeJ", rating: 1.08 },
        { name: "bodyy", rating: 1.05 },
      ],
      winRate: 57,
      recentForm: ["W", "L", "L", "W", "L"],
    },
    team2: {
      name: "Virtus.pro",
      logo: "https://img.icons8.com/color/96/000000/csgo.png",
      players: [
        { name: "Jame", rating: 1.17 },
        { name: "FL1T", rating: 1.13 },
        { name: "fame", rating: 1.19 },
        { name: "n0rb3r7", rating: 1.11 },
        { name: "Qikert", rating: 1.08 },
      ],
      winRate: 60,
      recentForm: ["W", "W", "L", "W", "L"],
    },
    status: "upcoming",
    prediction: {
      winner: "Virtus.pro",
      confidence: 55,
      factors: ["More consistent results", "Better team synergy", "Jame AWP factor"],
    },
  },
];

export function generateMatchAnalysis(match: Match): MatchAnalysis {
  const team1Wins = Math.floor(Math.random() * 10) + 5;
  const team2Wins = Math.floor(Math.random() * 10) + 5;
  
  return {
    matchId: match.id,
    analysisVersion: "standard",
    headToHead: {
      team1Wins,
      team2Wins,
      lastMeetings: [
        {
          date: "2025-10-15",
          winner: match.team1.name,
          score: "2-1",
          maps: ["Mirage", "Inferno", "Nuke"],
        },
        {
          date: "2025-09-22",
          winner: match.team2.name,
          score: "2-0",
          maps: ["Dust2", "Anubis"],
        },
        {
          date: "2025-08-10",
          winner: match.team1.name,
          score: "2-1",
          maps: ["Ancient", "Vertigo", "Overpass"],
        },
      ],
    },
    formAnalysis: {
      team1: {
        wins: match.team1.recentForm.filter((r) => r === "W").length,
        losses: match.team1.recentForm.filter((r) => r === "L").length,
        trend: match.team1.recentForm.slice(-3).filter((r) => r === "W").length >= 2 ? "improving" : "stable",
        last4Weeks: {
          wins: Math.floor(Math.random() * 8) + 5,
          losses: Math.floor(Math.random() * 5) + 2,
          avgRating: 1.05 + Math.random() * 0.15,
        },
      },
      team2: {
        wins: match.team2.recentForm.filter((r) => r === "W").length,
        losses: match.team2.recentForm.filter((r) => r === "L").length,
        trend: match.team2.recentForm.slice(-3).filter((r) => r === "W").length >= 2 ? "improving" : "stable",
        last4Weeks: {
          wins: Math.floor(Math.random() * 8) + 5,
          losses: Math.floor(Math.random() * 5) + 2,
          avgRating: 1.05 + Math.random() * 0.15,
        },
      },
    },
    mapAnalysis: {
      bestMaps: {
        team1: [
          { map: "Mirage", winRate: 70 + Math.random() * 15 },
          { map: "Inferno", winRate: 65 + Math.random() * 15 },
          { map: "Nuke", winRate: 60 + Math.random() * 15 },
        ],
        team2: [
          { map: "Dust2", winRate: 72 + Math.random() * 10 },
          { map: "Anubis", winRate: 68 + Math.random() * 10 },
          { map: "Ancient", winRate: 65 + Math.random() * 10 },
        ],
      },
      expectedMaps: ["Mirage", "Dust2", "Ancient"],
      advantage: `${match.team1.name} имеет небольшое преимущество на Mirage и Inferno, в то время как ${match.team2.name} сильнее на Dust2 и Anubis`,
    },
    tournamentImportance: {
      forTeam1: "important",
      forTeam2: "important",
      reasoning: `Обе команды стремятся к победе в ${match.tournament}, что делает этот матч критически важным для их дальнейшего продвижения в турнире`,
    },
    aiScenarios: [
      {
        scenario: `${match.team1.name} побеждает 2-0`,
        probability: 35,
        reasoning: "Сильная форма и преимущество на ключевых картах",
      },
      {
        scenario: `${match.team1.name} побеждает 2-1`,
        probability: 30,
        reasoning: "Равная игра с небольшим преимуществом",
      },
      {
        scenario: `${match.team2.name} побеждает 2-1`,
        probability: 25,
        reasoning: "Возможный камбэк на своих сильных картах",
      },
      {
        scenario: `${match.team2.name} побеждает 2-0`,
        probability: 10,
        reasoning: "Маловероятно, но возможно при идеальной игре",
      },
    ],
    keyFactors: match.prediction?.factors || [
      "Текущая форма команд",
      "Статистика на выбранных картах",
      "Рейтинг игроков",
      "Важность матча для турнира",
    ],
    predictedWinner: match.prediction?.winner || match.team1.name,
    confidence: match.prediction?.confidence || 50,
    bettingRecommendations: [
      {
        recommendation: `Победа ${match.prediction?.winner || match.team1.name}`,
        expectedValue: 1.5 + Math.random() * 0.5,
        risk: "medium",
      },
      {
        recommendation: "Тотал карт больше 2.5",
        expectedValue: 1.8 + Math.random() * 0.3,
        risk: "low",
      },
    ],
  };
}
