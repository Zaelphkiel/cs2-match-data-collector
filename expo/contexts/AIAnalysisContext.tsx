import createContextHook from "@nkzw/create-context-hook";
import { useCallback, useMemo, useState } from "react";
import { generateObject, generateText } from "@rork/toolkit-sdk";
import { z } from "zod";
import type { Match, MatchAnalysis, TeamAnalysis, MultiSourceData, ComprehensiveAnalysis } from "@/types/matches";
import { 
  generateDeepMatchAnalysis, 
  generateLiveMatchPrediction, 
  generateTeamDetailedAnalysis,
  analyzeBettingOpportunity 
} from "@/services/aiDeepAnalysis";

const TeamAnalysisSchema = z.object({
  teamName: z.string(),
  lastGames: z.array(
    z.object({
      date: z.string(),
      opponent: z.string(),
      opponentRating: z.number(),
      result: z.enum(["W", "L"]),
      score: z.string(),
      importance: z.enum(["high", "medium", "low"]),
    })
  ),
  mapPool: z.array(
    z.object({
      map: z.string(),
      winRate: z.number(),
      gamesPlayed: z.number(),
    })
  ),
  mapSideStats: z.array(
    z.object({
      map: z.string(),
      ctWinRate: z.number(),
      tWinRate: z.number(),
      preferredSide: z.enum(["CT", "T"]),
    })
  ),
  strategies: z.array(
    z.object({
      map: z.string(),
      description: z.string(),
    })
  ),
  teamwork: z.object({
    synergy: z.number().min(0).max(100),
    communication: z.number().min(0).max(100),
    clutchRate: z.number().min(0).max(100),
  }),
  currentNews: z.array(
    z.object({
      date: z.string(),
      title: z.string(),
      impact: z.enum(["positive", "negative", "neutral"]),
    })
  ),
  rostorChanges: z.array(
    z.object({
      type: z.enum(["substitution", "replacement", "injury"]),
      playerOut: z.string(),
      playerIn: z.string(),
      reason: z.string(),
    })
  ),
});

const MatchAnalysisSchema = z.object({
  headToHead: z.object({
    team1Wins: z.number(),
    team2Wins: z.number(),
    lastMeetings: z.array(
      z.object({
        date: z.string(),
        winner: z.string(),
        score: z.string(),
        maps: z.array(z.string()),
      })
    ),
  }),
  formAnalysis: z.object({
    team1: z.object({
      wins: z.number(),
      losses: z.number(),
      trend: z.enum(["improving", "declining", "stable"]),
      last4Weeks: z.object({
        wins: z.number(),
        losses: z.number(),
        avgRating: z.number(),
      }),
    }),
    team2: z.object({
      wins: z.number(),
      losses: z.number(),
      trend: z.enum(["improving", "declining", "stable"]),
      last4Weeks: z.object({
        wins: z.number(),
        losses: z.number(),
        avgRating: z.number(),
      }),
    }),
  }),
  mapAnalysis: z.object({
    bestMaps: z.object({
      team1: z.array(z.object({ map: z.string(), winRate: z.number() })),
      team2: z.array(z.object({ map: z.string(), winRate: z.number() })),
    }),
    expectedMaps: z.array(z.string()),
    advantage: z.string(),
  }),
  tournamentImportance: z.object({
    forTeam1: z.enum(["critical", "important", "moderate", "low"]),
    forTeam2: z.enum(["critical", "important", "moderate", "low"]),
    reasoning: z.string(),
  }),
  aiScenarios: z.array(
    z.object({
      scenario: z.string(),
      probability: z.number(),
      reasoning: z.string(),
    })
  ),
  keyFactors: z.array(z.string()),
  predictedWinner: z.string(),
  confidence: z.number(),
  bettingRecommendations: z.array(
    z.object({
      recommendation: z.string(),
      expectedValue: z.number(),
      risk: z.enum(["low", "medium", "high"]),
    })
  ),
});

export const [AIAnalysisContext, useAIAnalysis] = createContextHook(() => {
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisCache, setAnalysisCache] = useState<Map<string, MatchAnalysis>>(new Map());

  const fetchMultiSourceData = useCallback(async (match: Match): Promise<MultiSourceData> => {
    console.log("🌐 Fetching data from multiple sources...");

    const dataPrompt = `Ты агрегатор данных для анализа матчей CS2. Собери и синтезируй данные из различных источников.

МАТЧ: ${match.team1.name} vs ${match.team2.name}
Турнир: ${match.tournament}

СОБЕРИ ДАННЫЕ КАК ЕСЛИ БЫ ОНИ БЫЛИ ИЗ:
1. HLTV.org - рейтинги команд, последние матчи, статистика игроков
2. Liquipedia - информация о турнире, история команд, изменения в составах
3. Букмекерские конторы (BetBoom, etc) - коэффициенты, движение рынка, ценные возможности
4. Сообщество (форумы, Reddit, Telegram) - настроение болельщиков, мнения экспертов, прогнозы каналов
5. Новостные источники - последние новости о командах, слухи

Сгенерируй реалистичные данные, которые могли бы быть получены из этих источников.
Данные должны быть детальными и правдоподобными.`;

    const multiSourceData = await generateObject({
      messages: [{ role: "user", content: dataPrompt }],
      schema: z.object({
        hltv: z.object({
          teamRankings: z.array(z.object({ team: z.string(), rank: z.number() })),
          recentMatches: z.array(z.any()),
          playerStats: z.array(z.any()),
        }).optional(),
        liquipedia: z.object({
          tournamentInfo: z.any(),
          teamHistory: z.array(z.any()),
          rosterChanges: z.array(z.any()),
        }).optional(),
        betting: z.object({
          odds: z.array(z.object({
            bookmaker: z.string(),
            team1Win: z.number(),
            team2Win: z.number(),
          })),
          marketMovement: z.array(z.object({ timestamp: z.string(), odds: z.number() })),
          valueOpportunities: z.array(z.string()),
        }).optional(),
        community: z.object({
          forumSentiment: z.array(z.object({
            source: z.string(),
            sentiment: z.enum(["positive", "negative", "neutral"]),
            weight: z.number(),
          })),
          telegramPredictions: z.array(z.object({
            channel: z.string(),
            prediction: z.string(),
            confidence: z.number(),
          })),
          expertOpinions: z.array(z.object({
            expert: z.string(),
            analysis: z.string(),
            credibility: z.number(),
          })),
        }).optional(),
        news: z.object({
          recentNews: z.array(z.object({
            source: z.string(),
            title: z.string(),
            impact: z.string(),
            date: z.string(),
          })),
          rumors: z.array(z.object({ content: z.string(), reliability: z.number() })),
        }).optional(),
      }),
    });

    return multiSourceData;
  }, []);

  const generateComprehensiveAnalysis = useCallback(async (
    match: Match,
    multiSourceData: MultiSourceData
  ): Promise<ComprehensiveAnalysis> => {
    console.log("🧠 Generating comprehensive cross-source analysis...");

    const comprehensivePrompt = `Ты продвинутый аналитик CS2 матчей. Проанализируй все собранные данные из разных источников и создай комплексный анализ.

МАТЧ: ${match.team1.name} vs ${match.team2.name}

ДАННЫЕ ИЗ ИСТОЧНИКОВ:
${JSON.stringify(multiSourceData, null, 2)}

ВЫПОЛНИ:
1. Валидацию данных из разных источников (найди совпадения и конфликты)
2. Разреши конфликтующую информацию на основе надёжности источников
3. Определи вес каждой категории факторов:
   - Статистические (winrate, рейтинги, форма)
   - Психологические (мотивация, давление, важность турнира)
   - Контекстуальные (карты, стратегии, недавние изменения)
   - Общественные (мнения экспертов, настроение сообщества)
4. Укажи свежесть данных и используемые источники

Дай глубокий мета-анализ всей информации.`;

    const analysis = await generateObject({
      messages: [{ role: "user", content: comprehensivePrompt }],
      schema: z.object({
        sourcesUsed: z.array(z.object({
          name: z.string(),
          url: z.string().optional(),
          lastUpdated: z.string(),
          reliability: z.number(),
          dataType: z.enum(["statistics", "news", "community", "expert_opinion"]),
        })),
        dataFreshness: z.string(),
        aggregatedData: z.any(),
        crossSourceValidation: z.object({
          consensus: z.number(),
          conflictingInfo: z.array(z.string()),
          resolvedConflicts: z.array(z.string()),
        }),
        enhancedFactors: z.object({
          statistical: z.object({ weight: z.number(), factors: z.array(z.string()) }),
          psychological: z.object({ weight: z.number(), factors: z.array(z.string()) }),
          contextual: z.object({ weight: z.number(), factors: z.array(z.string()) }),
          community: z.object({ weight: z.number(), factors: z.array(z.string()) }),
        }),
      }),
    });

    return {
      ...analysis,
      aggregatedData: multiSourceData,
    };
  }, []);

  const generateDeepAnalysis = useCallback(async (
    match: Match,
    useComprehensiveMode: boolean = false
  ): Promise<MatchAnalysis> => {
    console.log("🤖 Starting deep AI analysis for match:", match.id);
    console.log("📊 Mode:", useComprehensiveMode ? "COMPREHENSIVE (Multi-source)" : "STANDARD");
    setIsAnalyzing(true);

    try {
      let comprehensiveData: ComprehensiveAnalysis | undefined;

      if (useComprehensiveMode) {
        const multiSourceData = await fetchMultiSourceData(match);
        comprehensiveData = await generateComprehensiveAnalysis(match, multiSourceData);
        console.log("✅ Multi-source data collected and analyzed");
      }

      const analysis = await generateDeepMatchAnalysis(match);

      const fullAnalysis: MatchAnalysis = {
        ...analysis,
        comprehensiveData,
        analysisVersion: useComprehensiveMode ? "comprehensive" : "standard",
      };

      setAnalysisCache((prev) => new Map(prev).set(match.id, fullAnalysis));
      console.log("✅ Analysis complete");
      return fullAnalysis;
    } catch (error) {
      console.error("❌ Analysis failed:", error);
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  }, [fetchMultiSourceData, generateComprehensiveAnalysis]);

  const generateTeamAnalysis = useCallback(async (
    teamName: string,
    tournament: string
  ): Promise<string> => {
    console.log("🤖 Generating team analysis:", teamName);
    const analysis = await generateTeamDetailedAnalysis(teamName, tournament);
    return analysis;
  }, []);

  const generateLivePrediction = useCallback(async (
    match: Match,
    liveState: {
      currentMap: string;
      team1Score: number;
      team2Score: number;
      team1RoundsWon: number;
      team2RoundsWon: number;
      situation: string;
    },
    useComprehensiveMode: boolean = false
  ): Promise<{
    currentWinProbability: { team1: number; team2: number };
    suggestedBets: string[];
  }> => {
    console.log("🎮 Generating live prediction");
    console.log("📊 Mode:", useComprehensiveMode ? "COMPREHENSIVE (Multi-source)" : "STANDARD");

    const result = await generateLiveMatchPrediction(
      match,
      liveState.currentMap,
      liveState.team1RoundsWon,
      liveState.team2RoundsWon,
      liveState.situation
    );

    return result;
  }, []);

  const getAnalysisFromCache = useCallback((matchId: string): MatchAnalysis | undefined => {
    return analysisCache.get(matchId);
  }, [analysisCache]);

  return useMemo(
    () => ({
      isAnalyzing,
      generateDeepAnalysis,
      generateTeamAnalysis,
      generateLivePrediction,
      getAnalysisFromCache,
    }),
    [isAnalyzing, generateDeepAnalysis, generateTeamAnalysis, generateLivePrediction, getAnalysisFromCache]
  );
});
