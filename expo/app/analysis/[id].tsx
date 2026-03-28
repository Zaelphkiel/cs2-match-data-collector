import { useLocalSearchParams, router } from "expo-router";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Trophy,
  Target,
  Brain,
  AlertCircle,
  TrendingUpIcon,
  Activity,
  Shield,
  MapPin,
  Globe,
  Database,
  RefreshCw,
} from "lucide-react-native";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMatches } from "@/contexts/MatchesContext";
import { useAIAnalysis } from "@/contexts/AIAnalysisContext";
import { useEffect, useState } from "react";
import type { MatchAnalysis as MatchAnalysisType } from "@/types/matches";

export default function AnalysisScreen() {
  const { id } = useLocalSearchParams();
  const { getMatchById } = useMatches();
  const { generateDeepAnalysis, getAnalysisFromCache, isAnalyzing } = useAIAnalysis();
  const match = getMatchById(id as string);
  const [analysis, setAnalysis] = useState<MatchAnalysisType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysisMode, setAnalysisMode] = useState<"standard" | "comprehensive">("standard");
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!match) return;

    const cachedAnalysis = getAnalysisFromCache(match.id);
    if (cachedAnalysis) {
      setAnalysis(cachedAnalysis);
      return;
    }

    const runAnalysis = async () => {
      try {
        console.log("🚀 Starting analysis for match:", match.id);
        const result = await generateDeepAnalysis(match, analysisMode === "comprehensive");
        setAnalysis(result);
      } catch (err) {
        console.error("❌ Analysis error:", err);
        setError("Не удалось выполнить анализ. Попробуйте позже.");
      }
    };

    runAnalysis();
  }, [match, generateDeepAnalysis, getAnalysisFromCache, analysisMode]);

  const handleReanalyze = async () => {
    if (!match) return;
    setAnalysis(null);
    setError(null);
    try {
      const result = await generateDeepAnalysis(match, analysisMode === "comprehensive");
      setAnalysis(result);
    } catch (err) {
      console.error("❌ Reanalysis error:", err);
      setError("Не удалось выполнить анализ. Попробуйте позже.");
    }
  };

  if (!match) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Матч не найден</Text>
      </View>
    );
  }

  const getTrendIcon = (trend: "improving" | "declining" | "stable") => {
    if (trend === "improving") return TrendingUp;
    if (trend === "declining") return TrendingDown;
    return Minus;
  };

  const getTrendColor = (trend: "improving" | "declining" | "stable") => {
    if (trend === "improving") return "#10B981";
    if (trend === "declining") return "#EF4444";
    return "#6B7280";
  };

  const getRiskColor = (risk: "low" | "medium" | "high") => {
    if (risk === "low") return "#10B981";
    if (risk === "medium") return "#F59E0B";
    return "#EF4444";
  };

  const getImportanceColor = (importance: "critical" | "important" | "moderate" | "low") => {
    if (importance === "critical") return "#EF4444";
    if (importance === "important") return "#F59E0B";
    if (importance === "moderate") return "#3B82F6";
    return "#6B7280";
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#F9FAFB" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI-Анализ матча</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.matchHeader}>
          <Text style={styles.matchupText}>
            {match.team1.name} vs {match.team2.name}
          </Text>
          <Text style={styles.tournamentText}>{match.tournament}</Text>
        </View>

        <View style={styles.modeSelector}>
          <Text style={styles.modeSelectorLabel}>Режим анализа:</Text>
          <View style={styles.modeButtons}>
            <TouchableOpacity
              style={[
                styles.modeButton,
                analysisMode === "standard" && styles.modeButtonActive,
              ]}
              onPress={() => setAnalysisMode("standard")}
            >
              <Brain size={16} color={analysisMode === "standard" ? "#FFF" : "#94A3B8"} />
              <Text
                style={[
                  styles.modeButtonText,
                  analysisMode === "standard" && styles.modeButtonTextActive,
                ]}
              >
                Стандартный
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modeButton,
                analysisMode === "comprehensive" && styles.modeButtonActive,
              ]}
              onPress={() => setAnalysisMode("comprehensive")}
            >
              <Globe size={16} color={analysisMode === "comprehensive" ? "#FFF" : "#94A3B8"} />
              <Text
                style={[
                  styles.modeButtonText,
                  analysisMode === "comprehensive" && styles.modeButtonTextActive,
                ]}
              >
                Комплексный
              </Text>
            </TouchableOpacity>
          </View>
          {analysisMode === "comprehensive" && (
            <View style={styles.modeDescription}>
              <Database size={14} color="#3B82F6" />
              <Text style={styles.modeDescriptionText}>
                Данные из HLTV, Liquipedia, букмекеров, форумов, Telegram
              </Text>
            </View>
          )}
        </View>

        {analysis && (
          <TouchableOpacity style={styles.reanalyzeButton} onPress={handleReanalyze} disabled={isAnalyzing}>
            <RefreshCw size={16} color={isAnalyzing ? "#6B7280" : "#3B82F6"} />
            <Text style={[styles.reanalyzeText, isAnalyzing && styles.reanalyzeTextDisabled]}>
              Переанализировать
            </Text>
          </TouchableOpacity>
        )}

        {isAnalyzing && !analysis && (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>🤖 AI анализирует матч...</Text>
            <Text style={styles.loadingSubtext}>
              Обрабатываем статистику, H2H, форму команд и множество других факторов
            </Text>
          </View>
        )}

        {error && (
          <View style={styles.errorCard}>
            <AlertCircle size={24} color="#EF4444" />
            <Text style={styles.errorMessage}>{error}</Text>
          </View>
        )}

        {analysis && (
          <>
            {analysis.analysisVersion === "comprehensive" && analysis.comprehensiveData && (
              <View style={styles.comprehensiveDataCard}>
                <View style={styles.comprehensiveHeader}>
                  <Globe size={20} color="#10B981" />
                  <Text style={styles.comprehensiveTitle}>Множественные источники данных</Text>
                </View>
                
                <Text style={styles.dataFreshness}>
                  Свежесть: {analysis.comprehensiveData.dataFreshness}
                </Text>

                <Text style={styles.sourcesTitle}>Использованные источники:</Text>
                <View style={styles.sourcesList}>
                  {analysis.comprehensiveData.sourcesUsed.map((source, index) => (
                    <View key={index} style={styles.sourceChip}>
                      <Text style={styles.sourceText}>{source.name}</Text>
                      <View style={[
                        styles.reliabilityIndicator,
                        { backgroundColor: source.reliability > 0.7 ? "#10B981" : source.reliability > 0.5 ? "#F59E0B" : "#EF4444" }
                      ]}>
                        <Text style={styles.reliabilityText}>
                          {Math.round(source.reliability * 100)}%
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>

                <View style={styles.validationCard}>
                  <Text style={styles.validationTitle}>Валидация данных</Text>
                  <Text style={styles.consensusText}>
                    Консенсус: {Math.round(analysis.comprehensiveData.crossSourceValidation.consensus * 100)}%
                  </Text>
                  {analysis.comprehensiveData.crossSourceValidation.conflictingInfo.length > 0 && (
                    <View style={styles.conflictsSection}>
                      <Text style={styles.conflictsTitle}>Конфликты:</Text>
                      {analysis.comprehensiveData.crossSourceValidation.conflictingInfo.map((conflict, idx) => (
                        <Text key={idx} style={styles.conflictText}>• {conflict}</Text>
                      ))}
                    </View>
                  )}
                </View>

                <View style={styles.factorsWeightCard}>
                  <Text style={styles.factorsWeightTitle}>Веса факторов:</Text>
                  <View style={styles.weightBars}>
                    <View style={styles.weightBar}>
                      <Text style={styles.weightLabel}>Статистические</Text>
                      <View style={styles.weightBarBg}>
                        <View style={[
                          styles.weightBarFill,
                          { width: `${analysis.comprehensiveData.enhancedFactors.statistical.weight * 100}%`, backgroundColor: "#3B82F6" }
                        ]} />
                      </View>
                      <Text style={styles.weightValue}>{Math.round(analysis.comprehensiveData.enhancedFactors.statistical.weight * 100)}%</Text>
                    </View>
                    <View style={styles.weightBar}>
                      <Text style={styles.weightLabel}>Психологические</Text>
                      <View style={styles.weightBarBg}>
                        <View style={[
                          styles.weightBarFill,
                          { width: `${analysis.comprehensiveData.enhancedFactors.psychological.weight * 100}%`, backgroundColor: "#8B5CF6" }
                        ]} />
                      </View>
                      <Text style={styles.weightValue}>{Math.round(analysis.comprehensiveData.enhancedFactors.psychological.weight * 100)}%</Text>
                    </View>
                    <View style={styles.weightBar}>
                      <Text style={styles.weightLabel}>Контекстуальные</Text>
                      <View style={styles.weightBarBg}>
                        <View style={[
                          styles.weightBarFill,
                          { width: `${analysis.comprehensiveData.enhancedFactors.contextual.weight * 100}%`, backgroundColor: "#10B981" }
                        ]} />
                      </View>
                      <Text style={styles.weightValue}>{Math.round(analysis.comprehensiveData.enhancedFactors.contextual.weight * 100)}%</Text>
                    </View>
                    <View style={styles.weightBar}>
                      <Text style={styles.weightLabel}>Общественные</Text>
                      <View style={styles.weightBarBg}>
                        <View style={[
                          styles.weightBarFill,
                          { width: `${analysis.comprehensiveData.enhancedFactors.community.weight * 100}%`, backgroundColor: "#F59E0B" }
                        ]} />
                      </View>
                      <Text style={styles.weightValue}>{Math.round(analysis.comprehensiveData.enhancedFactors.community.weight * 100)}%</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            <View style={styles.predictionCard}>
              <View style={styles.predictionHeader}>
                <Brain size={24} color="#3B82F6" />
                <Text style={styles.predictionTitle}>AI Прогноз</Text>
              </View>
              <Text style={styles.winnerText}>{analysis.predictedWinner}</Text>
              <View style={styles.confidenceBar}>
                <View
                  style={[styles.confidenceFill, { width: `${analysis.confidence}%` }]}
                />
              </View>
              <Text style={styles.confidenceLabel}>
                Уверенность: {analysis.confidence}%
              </Text>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Target size={20} color="#F59E0B" />
                <Text style={styles.sectionTitle}>Важность турнира</Text>
              </View>
              <View style={styles.importanceCard}>
                <View style={styles.importanceRow}>
                  <Text style={styles.teamImportanceName}>{match.team1.name}</Text>
                  <View
                    style={[
                      styles.importanceBadge,
                      { backgroundColor: getImportanceColor(analysis.tournamentImportance.forTeam1) },
                    ]}
                  >
                    <Text style={styles.importanceBadgeText}>
                      {analysis.tournamentImportance.forTeam1.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <View style={styles.importanceRow}>
                  <Text style={styles.teamImportanceName}>{match.team2.name}</Text>
                  <View
                    style={[
                      styles.importanceBadge,
                      { backgroundColor: getImportanceColor(analysis.tournamentImportance.forTeam2) },
                    ]}
                  >
                    <Text style={styles.importanceBadgeText}>
                      {analysis.tournamentImportance.forTeam2.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>
              <Text style={styles.importanceReasoning}>{analysis.tournamentImportance.reasoning}</Text>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <BarChart3 size={20} color="#3B82F6" />
                <Text style={styles.sectionTitle}>Личные встречи (H2H)</Text>
              </View>
              <View style={styles.h2hCard}>
                <View style={styles.h2hRow}>
                  <Text style={styles.h2hTeam}>{match.team1.name}</Text>
                  <Text style={styles.h2hScore}>{analysis.headToHead.team1Wins}</Text>
                </View>
                <View style={styles.h2hDivider} />
                <View style={styles.h2hRow}>
                  <Text style={styles.h2hTeam}>{match.team2.name}</Text>
                  <Text style={styles.h2hScore}>{analysis.headToHead.team2Wins}</Text>
                </View>
              </View>

              <Text style={styles.subsectionTitle}>Последние встречи</Text>
              {analysis.headToHead.lastMeetings.map((meeting, index) => (
                <View key={index} style={styles.meetingCard}>
                  <Text style={styles.meetingDate}>{meeting.date}</Text>
                  <View style={styles.meetingResult}>
                    <Trophy size={16} color="#F59E0B" />
                    <Text style={styles.meetingWinner}>{meeting.winner}</Text>
                    <Text style={styles.meetingScore}>{meeting.score}</Text>
                  </View>
                  <View style={styles.mapsRow}>
                    {meeting.maps.map((map, idx) => (
                      <View key={idx} style={styles.miniMapChip}>
                        <Text style={styles.miniMapText}>{map}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Activity size={20} color="#10B981" />
                <Text style={styles.sectionTitle}>Анализ формы (4 недели)</Text>
              </View>

              <View style={styles.formCard}>
                <Text style={styles.formTeamName}>{match.team1.name}</Text>
                <View style={styles.formStats}>
                  <View style={styles.formStatItem}>
                    <Text style={styles.formStatLabel}>Побед</Text>
                    <Text style={styles.formStatValue}>{analysis.formAnalysis.team1.last4Weeks.wins}</Text>
                  </View>
                  <View style={styles.formStatItem}>
                    <Text style={styles.formStatLabel}>Поражений</Text>
                    <Text style={styles.formStatValue}>{analysis.formAnalysis.team1.last4Weeks.losses}</Text>
                  </View>
                  <View style={styles.formStatItem}>
                    <Text style={styles.formStatLabel}>Ср. Рейтинг</Text>
                    <Text style={styles.formStatValue}>
                      {analysis.formAnalysis.team1.last4Weeks.avgRating.toFixed(2)}
                    </Text>
                  </View>
                </View>
                <View style={styles.trendRow}>
                  {(() => {
                    const Icon = getTrendIcon(analysis.formAnalysis.team1.trend);
                    return (
                      <Icon
                        size={18}
                        color={getTrendColor(analysis.formAnalysis.team1.trend)}
                      />
                    );
                  })()}
                  <Text
                    style={[
                      styles.trendText,
                      { color: getTrendColor(analysis.formAnalysis.team1.trend) },
                    ]}
                  >
                    {analysis.formAnalysis.team1.trend === "improving"
                      ? "Улучшение"
                      : analysis.formAnalysis.team1.trend === "declining"
                        ? "Спад"
                        : "Стабильно"}
                  </Text>
                </View>
              </View>

              <View style={styles.formCard}>
                <Text style={styles.formTeamName}>{match.team2.name}</Text>
                <View style={styles.formStats}>
                  <View style={styles.formStatItem}>
                    <Text style={styles.formStatLabel}>Побед</Text>
                    <Text style={styles.formStatValue}>{analysis.formAnalysis.team2.last4Weeks.wins}</Text>
                  </View>
                  <View style={styles.formStatItem}>
                    <Text style={styles.formStatLabel}>Поражений</Text>
                    <Text style={styles.formStatValue}>{analysis.formAnalysis.team2.last4Weeks.losses}</Text>
                  </View>
                  <View style={styles.formStatItem}>
                    <Text style={styles.formStatLabel}>Ср. Рейтинг</Text>
                    <Text style={styles.formStatValue}>
                      {analysis.formAnalysis.team2.last4Weeks.avgRating.toFixed(2)}
                    </Text>
                  </View>
                </View>
                <View style={styles.trendRow}>
                  {(() => {
                    const Icon = getTrendIcon(analysis.formAnalysis.team2.trend);
                    return (
                      <Icon
                        size={18}
                        color={getTrendColor(analysis.formAnalysis.team2.trend)}
                      />
                    );
                  })()}
                  <Text
                    style={[
                      styles.trendText,
                      { color: getTrendColor(analysis.formAnalysis.team2.trend) },
                    ]}
                  >
                    {analysis.formAnalysis.team2.trend === "improving"
                      ? "Улучшение"
                      : analysis.formAnalysis.team2.trend === "declining"
                        ? "Спад"
                        : "Стабильно"}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MapPin size={20} color="#8B5CF6" />
                <Text style={styles.sectionTitle}>Анализ карт</Text>
              </View>
              
              <Text style={styles.subsectionTitle}>Лучшие карты {match.team1.name}</Text>
              <View style={styles.mapsList}>
                {analysis.mapAnalysis.bestMaps.team1.map((mapData, index) => (
                  <View key={index} style={styles.mapStatCard}>
                    <Text style={styles.mapName}>{mapData.map}</Text>
                    <View style={styles.winRateBar}>
                      <View style={[styles.winRateFill, { width: `${mapData.winRate}%` }]} />
                    </View>
                    <Text style={styles.mapWinRate}>{mapData.winRate}% WR</Text>
                  </View>
                ))}
              </View>

              <Text style={styles.subsectionTitle}>Лучшие карты {match.team2.name}</Text>
              <View style={styles.mapsList}>
                {analysis.mapAnalysis.bestMaps.team2.map((mapData, index) => (
                  <View key={index} style={styles.mapStatCard}>
                    <Text style={styles.mapName}>{mapData.map}</Text>
                    <View style={styles.winRateBar}>
                      <View style={[styles.winRateFill, { width: `${mapData.winRate}%` }]} />
                    </View>
                    <Text style={styles.mapWinRate}>{mapData.winRate}% WR</Text>
                  </View>
                ))}
              </View>

              <View style={styles.mapAdvantageCard}>
                <Shield size={20} color="#10B981" />
                <Text style={styles.mapAdvantageText}>{analysis.mapAnalysis.advantage}</Text>
              </View>

              <Text style={styles.subsectionTitle}>Ожидаемые карты</Text>
              <View style={styles.expectedMapsRow}>
                {analysis.mapAnalysis.expectedMaps.map((map, index) => (
                  <View key={index} style={styles.expectedMapChip}>
                    <Text style={styles.expectedMapText}>{map}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Brain size={20} color="#8B5CF6" />
                <Text style={styles.sectionTitle}>AI Сценарии</Text>
              </View>
              {analysis.aiScenarios.map((scenario, index) => (
                <View key={index} style={styles.scenarioCard}>
                  <View style={styles.scenarioHeader}>
                    <Text style={styles.scenarioTitle}>{scenario.scenario}</Text>
                    <View style={styles.probabilityBadge}>
                      <Text style={styles.probabilityText}>{scenario.probability}%</Text>
                    </View>
                  </View>
                  <Text style={styles.scenarioReasoning}>{scenario.reasoning}</Text>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <TrendingUpIcon size={20} color="#F59E0B" />
                <Text style={styles.sectionTitle}>Рекомендации для ставок</Text>
              </View>
              {analysis.bettingRecommendations?.map((rec, index) => (
                <View key={index} style={styles.bettingCard}>
                  <View style={styles.bettingHeader}>
                    <Text style={styles.bettingRecommendation}>{rec.recommendation}</Text>
                    <View
                      style={[
                        styles.riskBadge,
                        { backgroundColor: getRiskColor(rec.risk) },
                      ]}
                    >
                      <Text style={styles.riskText}>{rec.risk.toUpperCase()}</Text>
                    </View>
                  </View>
                  <Text style={styles.expectedValue}>
                    Expected Value: {rec.expectedValue.toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ключевые факторы</Text>
              {analysis.keyFactors.map((factor, index) => (
                <View key={index} style={styles.factorCard}>
                  <View style={styles.factorNumber}>
                    <Text style={styles.factorNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.factorText}>{factor}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: "#1E293B",
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#F9FAFB",
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  matchHeader: {
    padding: 20,
    backgroundColor: "#1E293B",
    marginTop: 8,
    marginHorizontal: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  matchupText: {
    fontSize: 18,
    fontWeight: "800" as const,
    color: "#F9FAFB",
    textAlign: "center",
  },
  tournamentText: {
    fontSize: 14,
    color: "#94A3B8",
    marginTop: 4,
  },
  loadingCard: {
    backgroundColor: "#1E293B",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 32,
    borderRadius: 16,
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#F9FAFB",
    marginTop: 12,
  },
  loadingSubtext: {
    fontSize: 13,
    color: "#94A3B8",
    textAlign: "center",
  },
  errorCard: {
    backgroundColor: "#1E293B",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  errorMessage: {
    fontSize: 14,
    color: "#EF4444",
    flex: 1,
  },
  predictionCard: {
    backgroundColor: "#1E293B",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#3B82F6",
  },
  predictionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  predictionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#3B82F6",
  },
  winnerText: {
    fontSize: 24,
    fontWeight: "900" as const,
    color: "#F9FAFB",
    marginBottom: 12,
  },
  confidenceBar: {
    height: 8,
    backgroundColor: "#334155",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  confidenceFill: {
    height: "100%",
    backgroundColor: "#3B82F6",
  },
  confidenceLabel: {
    fontSize: 14,
    color: "#94A3B8",
    fontWeight: "600" as const,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#F9FAFB",
    marginBottom: 12,
  },
  importanceCard: {
    backgroundColor: "#1E293B",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  importanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  teamImportanceName: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#F9FAFB",
  },
  importanceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  importanceBadgeText: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: "#FFF",
  },
  importanceReasoning: {
    fontSize: 13,
    color: "#94A3B8",
    lineHeight: 20,
  },
  h2hCard: {
    backgroundColor: "#1E293B",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  h2hRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  h2hTeam: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#F9FAFB",
  },
  h2hScore: {
    fontSize: 20,
    fontWeight: "800" as const,
    color: "#3B82F6",
  },
  h2hDivider: {
    height: 1,
    backgroundColor: "#334155",
    marginVertical: 4,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#94A3B8",
    marginBottom: 8,
    marginTop: 4,
  },
  meetingCard: {
    backgroundColor: "#1E293B",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  meetingDate: {
    fontSize: 12,
    color: "#94A3B8",
    marginBottom: 6,
  },
  meetingResult: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  meetingWinner: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#F9FAFB",
    flex: 1,
  },
  meetingScore: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#3B82F6",
  },
  mapsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  miniMapChip: {
    backgroundColor: "#334155",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
  },
  miniMapText: {
    fontSize: 11,
    color: "#E2E8F0",
    fontWeight: "600" as const,
  },
  formCard: {
    backgroundColor: "#1E293B",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  formTeamName: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#F9FAFB",
    marginBottom: 12,
  },
  formStats: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  formStatItem: {
    flex: 1,
    backgroundColor: "#334155",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  formStatLabel: {
    fontSize: 11,
    color: "#94A3B8",
    marginBottom: 4,
  },
  formStatValue: {
    fontSize: 22,
    fontWeight: "800" as const,
    color: "#F9FAFB",
  },
  trendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  trendText: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  mapsList: {
    gap: 8,
    marginBottom: 12,
  },
  mapStatCard: {
    backgroundColor: "#1E293B",
    padding: 12,
    borderRadius: 10,
  },
  mapName: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#F9FAFB",
    marginBottom: 6,
  },
  winRateBar: {
    height: 6,
    backgroundColor: "#334155",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 6,
  },
  winRateFill: {
    height: "100%",
    backgroundColor: "#10B981",
  },
  mapWinRate: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "600" as const,
  },
  mapAdvantageCard: {
    backgroundColor: "#1E293B",
    padding: 14,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#10B981",
  },
  mapAdvantageText: {
    fontSize: 13,
    color: "#F9FAFB",
    flex: 1,
    fontWeight: "500" as const,
  },
  expectedMapsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  expectedMapChip: {
    backgroundColor: "#8B5CF6",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  expectedMapText: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: "#FFF",
  },
  scenarioCard: {
    backgroundColor: "#1E293B",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#8B5CF6",
  },
  scenarioHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  scenarioTitle: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: "#F9FAFB",
    flex: 1,
  },
  probabilityBadge: {
    backgroundColor: "#8B5CF6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  probabilityText: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: "#FFF",
  },
  scenarioReasoning: {
    fontSize: 13,
    color: "#94A3B8",
    lineHeight: 19,
  },
  bettingCard: {
    backgroundColor: "#1E293B",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  bettingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  bettingRecommendation: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#F9FAFB",
    flex: 1,
    marginRight: 12,
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
  },
  riskText: {
    fontSize: 10,
    fontWeight: "700" as const,
    color: "#FFF",
  },
  expectedValue: {
    fontSize: 12,
    color: "#94A3B8",
  },
  factorCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E293B",
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
    gap: 12,
  },
  factorNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#3B82F6",
    alignItems: "center",
    justifyContent: "center",
  },
  factorNumberText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#FFF",
  },
  factorText: {
    flex: 1,
    fontSize: 14,
    color: "#CBD5E1",
    fontWeight: "500" as const,
  },
  bottomSpacer: {
    height: 32,
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
    textAlign: "center",
    marginTop: 100,
  },
  modeSelector: {
    backgroundColor: "#1E293B",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
  },
  modeSelectorLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#94A3B8",
    marginBottom: 12,
  },
  modeButtons: {
    flexDirection: "row",
    gap: 8,
  },
  modeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#334155",
  },
  modeButtonActive: {
    backgroundColor: "#3B82F6",
  },
  modeButtonText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#94A3B8",
  },
  modeButtonTextActive: {
    color: "#FFF",
  },
  modeDescription: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    padding: 10,
    backgroundColor: "#334155",
    borderRadius: 6,
  },
  modeDescriptionText: {
    fontSize: 11,
    color: "#94A3B8",
    flex: 1,
  },
  reanalyzeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    backgroundColor: "#1E293B",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#3B82F6",
  },
  reanalyzeText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#3B82F6",
  },
  reanalyzeTextDisabled: {
    color: "#6B7280",
  },
  comprehensiveDataCard: {
    backgroundColor: "#1E293B",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#10B981",
  },
  comprehensiveHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  comprehensiveTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#10B981",
  },
  dataFreshness: {
    fontSize: 12,
    color: "#94A3B8",
    marginBottom: 12,
  },
  sourcesTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#F9FAFB",
    marginBottom: 8,
  },
  sourcesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  sourceChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#334155",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  sourceText: {
    fontSize: 12,
    color: "#E2E8F0",
    fontWeight: "600" as const,
  },
  reliabilityIndicator: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  reliabilityText: {
    fontSize: 10,
    fontWeight: "700" as const,
    color: "#FFF",
  },
  validationCard: {
    backgroundColor: "#334155",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  validationTitle: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#F9FAFB",
    marginBottom: 6,
  },
  consensusText: {
    fontSize: 12,
    color: "#10B981",
    fontWeight: "600" as const,
  },
  conflictsSection: {
    marginTop: 8,
  },
  conflictsTitle: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#F59E0B",
    marginBottom: 4,
  },
  conflictText: {
    fontSize: 11,
    color: "#94A3B8",
    marginLeft: 8,
  },
  factorsWeightCard: {
    backgroundColor: "#334155",
    padding: 12,
    borderRadius: 8,
  },
  factorsWeightTitle: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#F9FAFB",
    marginBottom: 10,
  },
  weightBars: {
    gap: 10,
  },
  weightBar: {
    gap: 4,
  },
  weightLabel: {
    fontSize: 11,
    color: "#94A3B8",
  },
  weightBarBg: {
    height: 6,
    backgroundColor: "#1E293B",
    borderRadius: 3,
    overflow: "hidden",
  },
  weightBarFill: {
    height: "100%",
  },
  weightValue: {
    fontSize: 11,
    color: "#E2E8F0",
    fontWeight: "600" as const,
  },
});
