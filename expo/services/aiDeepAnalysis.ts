import { generateObject, generateText } from "@rork/toolkit-sdk";
import { z } from "zod";
import type { Match, MatchAnalysis } from "@/types/matches";

export async function generateDeepMatchAnalysis(match: Match): Promise<MatchAnalysis> {
  console.log(`[AI Deep Analysis] 🧠 Starting comprehensive analysis for ${match.team1.name} vs ${match.team2.name}`);

  const analysisPrompt = `Ты топовый аналитик Counter-Strike 2 с многолетним опытом. Проведи ГЛУБОКИЙ, ДЕТАЛЬНЫЙ анализ предстоящего матча.

МАТЧ:
${match.team1.name} vs ${match.team2.name}
Турнир: ${match.tournament}
Дата: ${match.date}
Статус: ${match.status}
${match.status === "live" ? `Текущий счёт: ${match.team1.score}:${match.team2.score}` : ""}

КОМАНДА 1: ${match.team1.name}
- Winrate: ${match.team1.winRate.toFixed(1)}%
- Последние матчи: ${match.team1.recentForm.join(", ")}
${match.team1.hltvRanking ? `- HLTV Ranking: #${match.team1.hltvRanking}` : ""}

КОМАНДА 2: ${match.team2.name}
- Winrate: ${match.team2.winRate.toFixed(1)}%
- Последние матчи: ${match.team2.recentForm.join(", ")}
${match.team2.hltvRanking ? `- HLTV Ranking: #${match.team2.hltvRanking}` : ""}

ТРЕБУЕТСЯ ПОЛНЫЙ, ДЕТАЛЬНЫЙ АНАЛИЗ:

1. 📊 История личных встреч (H2H):
   - Кто побеждал в последних встречах
   - На каких картах играли
   - Счёт прошлых матчей
   - Тренды в противостоянии

2. 📈 Анализ формы команд за последние 3-4 недели:
   - Количество побед и поражений
   - Средний рейтинг игроков
   - Тренд (улучшение/ухудшение/стабильность)
   - Против каких команд играли (рейтинг HLTV соперников)
   - Важность сыгранных матчей

3. 🗺️ Маппул и анализ карт:
   - Лучшие карты каждой команды (винрейт, количество игр)
   - Какие карты будут выбраны/забанены
   - У кого преимущество на каждой возможной карте
   - Ожидаемый маппул этого матча

4. 🔄 Анализ предпочитаемых сторон (CT/T):
   - Винрейт на CT и T стороне для каждой команды на каждой карте
   - Предпочитаемая сторона на каждой карте
   - Как это повлияет на исход

5. 🎯 Важность турнира:
   - Насколько важен этот турнир для команды 1 (critical/important/moderate/low)
   - Насколько важен этот турнир для команды 2
   - Обоснование важности
   - Мотивация команд

6. ⚡ Ключевые игроки и их форма:
   - Топ игроки каждой команды
   - Их текущая форма
   - Кто может сделать разницу
   - Возможные замены или проблемы

7. 📰 Последние новости:
   - Замены в составе
   - Травмы игроков
   - Изменения в командах
   - Тренерские изменения
   - Всё что может повлиять на матч

8. 🧠 Сценарии развития матча:
   - Проанализируй ВСЕ возможные сценарии
   - Укажи вероятность каждого сценария
   - Обоснуй каждый сценарий
   - Учти психологические факторы

9. 🔑 Ключевые факторы успеха:
   - Что решит исход матча
   - На что обратить внимание
   - Слабые места каждой команды

10. 🎲 Прогноз и рекомендации:
    - Прогноз победителя
    - Уверенность в прогнозе (0-100%)
    - Рекомендации для ставок в БК BetBoom
    - Рекомендуемая фора по картам
    - Оценка риска каждой ставки (low/medium/high)
    - Expected value каждой ставки

Используй свои знания о CS2, командах, игроках, турнирах. Будь максимально точным и детальным.
Учитывай ВСЁ: статистику, психологию, контекст, новости, мотивацию, усталость команд.`;

  const analysis = await generateObject({
    messages: [{ role: "user", content: analysisPrompt }],
    schema: z.object({
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
    }),
  });

  console.log("[AI Deep Analysis] ✅ Analysis complete");

  return {
    matchId: match.id,
    analysisVersion: "comprehensive",
    ...analysis,
  };
}

export async function generateLiveMatchPrediction(
  match: Match,
  currentMapName: string,
  team1RoundsWon: number,
  team2RoundsWon: number,
  situation: string
): Promise<{
  currentWinProbability: { team1: number; team2: number };
  suggestedBets: string[];
}> {
  console.log("[AI Live] 🎮 Generating live prediction...");

  const livePredictionPrompt = `Ты эксперт по LIVE анализу матчей Counter-Strike 2. Дай актуальный прогноз основываясь на текущей ситуации.

МАТЧ: ${match.team1.name} vs ${match.team2.name}
Турнир: ${match.tournament}

ТЕКУЩАЯ СИТУАЦИЯ:
Карта: ${currentMapName}
Счёт по картам: ${match.team1.score}:${match.team2.score}
Раунды на текущей карте: ${team1RoundsWon}:${team2RoundsWon}
Описание ситуации: ${situation}

ФОРМА КОМАНД:
${match.team1.name}: ${match.team1.recentForm.join(", ")} (winrate: ${match.team1.winRate.toFixed(1)}%)
${match.team2.name}: ${match.team2.recentForm.join(", ")} (winrate: ${match.team2.winRate.toFixed(1)}%)

ЗАДАЧА:
1. Проанализируй текущую ситуацию в матче
2. Учти:
   - Психологический момент
   - Моментум (импульс)
   - Статистику команд на карте ${currentMapName}
   - Экономическую ситуацию (predict based on rounds)
   - Статистику comeback'ов с похожего счёта
   - Усталость команд
   - Важность раундов

3. Прокрути ВСЕ возможные сценарии для оставшейся части матча
4. Дай ТОЧНУЮ вероятность победы каждой команды (сумма должна быть 100%)
5. Дай 5-7 конкретных рекомендаций для LIVE ставок в BetBoom прямо сейчас

Будь точным и учитывай именно live-контекст!`;

  const prediction = await generateObject({
    messages: [{ role: "user", content: livePredictionPrompt }],
    schema: z.object({
      currentWinProbability: z.object({
        team1: z.number().min(0).max(100),
        team2: z.number().min(0).max(100),
      }),
      suggestedBets: z.array(z.string()).min(5).max(7),
    }),
  });

  console.log("[AI Live] ✅ Live prediction complete");

  return prediction;
}

export async function generateTeamDetailedAnalysis(
  teamName: string,
  tournament: string
): Promise<string> {
  console.log(`[AI Team Analysis] 🔍 Analyzing ${teamName}...`);

  const teamAnalysisPrompt = `Проведи МАКСИМАЛЬНО ДЕТАЛЬНЫЙ анализ команды Counter-Strike 2.

КОМАНДА: ${teamName}
КОНТЕКСТ: Турнир ${tournament}

ТРЕБУЕТСЯ:

1. 📊 Последние 10-15 игр:
   - Дата каждого матча
   - Против кого играли
   - Рейтинг соперника по HLTV
   - Результат (W/L)
   - Счёт
   - Важность матча (high/medium/low)

2. 🗺️ Маппул команды:
   - Статистика по каждой карте CS2
   - Winrate на каждой карте
   - Количество сыгранных игр
   - Любимые карты
   - Карты которые избегают

3. 🔄 Статистика по сторонам:
   - CT winrate на каждой карте
   - T winrate на каждой карте
   - Предпочитаемая сторона на каждой карте

4. 🎯 Стратегии команды:
   - Основные стратегии на ключевых картах
   - Тактический стиль
   - Сильные стороны в игре

5. 👥 Взаимодействие игроков:
   - Синергия команды (0-100)
   - Коммуникация (0-100)
   - Клатч рейт (0-100)
   - Ключевые игроки

6. 📰 Последние новости:
   - Дата новости
   - Заголовок
   - Влияние (positive/negative/neutral)

7. 🔄 Изменения в составе:
   - Тип изменения (substitution/replacement/injury)
   - Кто выбыл
   - Кто заменил
   - Причина

Будь максимально информативным и точным!`;

  const analysis = await generateText({
    messages: [{ role: "user", content: teamAnalysisPrompt }],
  });

  console.log(`[AI Team Analysis] ✅ ${teamName} analysis complete`);

  return analysis;
}

export async function analyzeBettingOpportunity(
  match: Match,
  analysis: MatchAnalysis
): Promise<string> {
  console.log("[AI Betting] 💰 Analyzing betting opportunities...");

  const bettingPrompt = `Ты эксперт по беттингу в CS2. Проанализируй возможности для ставок.

МАТЧ: ${match.team1.name} vs ${match.team2.name}
Турнир: ${match.tournament}

КОЭФФИЦИЕНТЫ BETBOOM:
${match.odds?.map((o) => `${o.bookmaker}: ${match.team1.name} - ${o.team1Win.toFixed(2)}, ${match.team2.name} - ${o.team2Win.toFixed(2)}`).join("\n")}

АНАЛИЗ МАТЧА:
- Прогноз: ${analysis.predictedWinner} (уверенность: ${analysis.confidence}%)
- Тренд ${match.team1.name}: ${analysis.formAnalysis.team1.trend}
- Тренд ${match.team2.name}: ${analysis.formAnalysis.team2.trend}
- H2H: ${analysis.headToHead.team1Wins}:${analysis.headToHead.team2Wins}
- Важность для ${match.team1.name}: ${analysis.tournamentImportance.forTeam1}
- Важность для ${match.team2.name}: ${analysis.tournamentImportance.forTeam2}

КЛЮЧЕВЫЕ ФАКТОРЫ:
${analysis.keyFactors.map((f, i) => `${i + 1}. ${f}`).join("\n")}

СЦЕНАРИИ:
${analysis.aiScenarios.map((s) => `- ${s.scenario} (вероятность: ${s.probability}%)`).join("\n")}

ЗАДАЧА:
1. Найди value бets (где коэффициент выше реальной вероятности)
2. Оцени риски каждой ставки
3. Дай рекомендации по:
   - Победе команды
   - Форе по картам
   - Тоталу карт
   - Специальным ставкам
4. Для каждой ставки укажи:
   - Рекомендуемый размер ставки (% от банка)
   - Expected value
   - Уровень риска
   - Обоснование

Дай детальные рекомендации для BetBoom!`;

  const bettingAnalysis = await generateText({
    messages: [{ role: "user", content: bettingPrompt }],
  });

  console.log("[AI Betting] ✅ Betting analysis complete");

  return bettingAnalysis;
}
