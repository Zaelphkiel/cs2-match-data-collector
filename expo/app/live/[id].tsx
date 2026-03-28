import { useLocalSearchParams, router } from "expo-router";
import { ArrowLeft, Radio, TrendingUp, AlertCircle, DollarSign, Brain, Globe, Database, RefreshCw } from "lucide-react-native";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMatches } from "@/contexts/MatchesContext";
import { useAIAnalysis } from "@/contexts/AIAnalysisContext";
import { useState, useEffect } from "react";
import { liveScoreService, type LiveScore } from "@/services/liveScoreService";

export default function LiveMatchScreen() {
  const { id } = useLocalSearchParams();
  const { getMatchById } = useMatches();
  const { generateLivePrediction } = useAIAnalysis();
  const match = getMatchById(id as string);
  const insets = useSafeAreaInsets();

  const [liveState, setLiveState] = useState<LiveScore | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);

  const [livePrediction, setLivePrediction] = useState<{
    currentWinProbability: { team1: number; team2: number };
    suggestedBets: string[];
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [predictionMode, setPredictionMode] = useState<"standard" | "comprehensive">("standard");

  useEffect(() => {
    if (!match) return;

    console.log(`[LiveMatch] Connecting to live score updates for match ${match.id}`);
    setIsConnecting(true);

    const unsubscribe = liveScoreService.connect(match.id, (score) => {
      console.log("[LiveMatch] Received live score update:", score);
      setLiveState(score);
      setIsConnecting(false);
    });

    liveScoreService.fetchScore(match.id).then((initialScore) => {
      if (initialScore) {
        setLiveState(initialScore);
      }
      setIsConnecting(false);
    });

    return () => {
      console.log(`[LiveMatch] Disconnecting from match ${match.id}`);
      unsubscribe();
    };
  }, [match]);

  const handleGetPrediction = async () => {
    if (!match || !liveState) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const liveStateFormatted = {
        currentMap: liveState.currentMap,
        team1Score: liveState.team1Score,
        team2Score: liveState.team2Score,
        team1RoundsWon: liveState.team1RoundsWon,
        team2RoundsWon: liveState.team2RoundsWon,
        situation: `${match.team1.name} ${liveState.team1RoundsWon} - ${liveState.team2RoundsWon} ${match.team2.name} на карте ${liveState.currentMap}. Счет по картам: ${liveState.team1Score}:${liveState.team2Score}`,
      };

      const prediction = await generateLivePrediction(match, liveStateFormatted, predictionMode === "comprehensive");
      setLivePrediction(prediction);
    } catch (err) {
      console.error("❌ Live prediction error:", err);
      setError("Не удалось получить прогноз");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRefresh = async () => {
    if (!match) return;
    setIsConnecting(true);
    const score = await liveScoreService.fetchScore(match.id);
    if (score) {
      setLiveState(score);
    }
    setIsConnecting(false);
  };

  if (!match) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Матч не найден</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#F9FAFB" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Live Матч</Text>
        <View style={styles.liveBadge}>
          <Radio size={14} color="#EF4444" />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.matchHeader}>
          <View style={styles.headerRow}>
            <Text style={styles.tournamentText}>{match.tournament}</Text>
            <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton} disabled={isConnecting}>
              <RefreshCw size={18} color={isConnecting ? "#6B7280" : "#3B82F6"} />
            </TouchableOpacity>
          </View>
          {isConnecting ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={styles.loadingText}>Загрузка live-данных...</Text>
            </View>
          ) : liveState ? (
            <>
              <View style={styles.scoreBoard}>
                <View style={styles.teamScoreSection}>
                  <Text style={styles.teamName}>{match.team1.name}</Text>
                  <Text style={styles.teamScore}>{liveState.team1Score}</Text>
                </View>
                <Text style={styles.vsDivider}>:</Text>
                <View style={styles.teamScoreSection}>
                  <Text style={styles.teamName}>{match.team2.name}</Text>
                  <Text style={styles.teamScore}>{liveState.team2Score}</Text>
                </View>
              </View>

              <View style={styles.mapInfo}>
                <Text style={styles.mapLabel}>Текущая карта: {liveState.currentMap}</Text>
                <Text style={styles.mapLabel}>Карта #{liveState.mapNumber}</Text>
              </View>

              <View style={styles.roundsInfo}>
                <View style={styles.roundsRow}>
                  <Text style={styles.roundsLabel}>{match.team1.name}:</Text>
                  <Text style={styles.roundsValue}>{liveState.team1RoundsWon}</Text>
                </View>
                <View style={styles.roundsRow}>
                  <Text style={styles.roundsLabel}>{match.team2.name}:</Text>
                  <Text style={styles.roundsValue}>{liveState.team2RoundsWon}</Text>
                </View>
                <Text style={styles.currentRound}>Раунд: {liveState.currentRound}/30</Text>
              </View>

              <View style={styles.statusBadge}>
                <Radio size={12} color="#EF4444" />
                <Text style={styles.statusText}>
                  {liveState.status === "live" ? "LIVE" : "Завершен"}
                </Text>
                <Text style={styles.updateTime}>
                  Обновлено: {new Date(liveState.lastUpdate).toLocaleTimeString("ru-RU")}
                </Text>
              </View>
            </>
          ) : (
            <View style={styles.errorContainer}>
              <AlertCircle size={48} color="#EF4444" />
              <Text style={styles.errorMessage}>Нет live-данных</Text>
            </View>
          )}
        </View>

        <View style={styles.modeSelector}>
          <Text style={styles.modeSelectorLabel}>Режим прогноза:</Text>
          <View style={styles.modeButtons}>
            <TouchableOpacity
              style={[
                styles.modeButton,
                predictionMode === "standard" && styles.modeButtonActive,
              ]}
              onPress={() => setPredictionMode("standard")}
            >
              <Brain size={16} color={predictionMode === "standard" ? "#FFF" : "#94A3B8"} />
              <Text
                style={[
                  styles.modeButtonText,
                  predictionMode === "standard" && styles.modeButtonTextActive,
                ]}
              >
                Стандартный
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modeButton,
                predictionMode === "comprehensive" && styles.modeButtonActive,
              ]}
              onPress={() => setPredictionMode("comprehensive")}
            >
              <Globe size={16} color={predictionMode === "comprehensive" ? "#FFF" : "#94A3B8"} />
              <Text
                style={[
                  styles.modeButtonText,
                  predictionMode === "comprehensive" && styles.modeButtonTextActive,
                ]}
              >
                Комплексный
              </Text>
            </TouchableOpacity>
          </View>
          {predictionMode === "comprehensive" && (
            <View style={styles.modeDescription}>
              <Database size={14} color="#3B82F6" />
              <Text style={styles.modeDescriptionText}>
                Live коэффициенты, реакция сообщества, статистика камбэков
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.predictButton, isAnalyzing && styles.predictButtonDisabled]}
          onPress={handleGetPrediction}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <TrendingUp size={20} color="#FFF" />
              <Text style={styles.predictButtonText}>Получить AI прогноз</Text>
            </>
          )}
        </TouchableOpacity>

        {error && (
          <View style={styles.errorCard}>
            <AlertCircle size={20} color="#EF4444" />
            <Text style={styles.errorMessage}>{error}</Text>
          </View>
        )}

        {livePrediction && (
          <>
            <View style={styles.predictionSection}>
              <Text style={styles.sectionTitle}>Вероятность победы</Text>
              <View style={styles.probabilityCard}>
                <View style={styles.probabilityRow}>
                  <Text style={styles.probabilityTeam}>{match.team1.name}</Text>
                  <Text style={styles.probabilityValue}>
                    {livePrediction.currentWinProbability.team1}%
                  </Text>
                </View>
                <View style={styles.probabilityBar}>
                  <View
                    style={[
                      styles.probabilityFill,
                      { width: `${livePrediction.currentWinProbability.team1}%` },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.probabilityCard}>
                <View style={styles.probabilityRow}>
                  <Text style={styles.probabilityTeam}>{match.team2.name}</Text>
                  <Text style={styles.probabilityValue}>
                    {livePrediction.currentWinProbability.team2}%
                  </Text>
                </View>
                <View style={styles.probabilityBar}>
                  <View
                    style={[
                      styles.probabilityFill,
                      {
                        width: `${livePrediction.currentWinProbability.team2}%`,
                        backgroundColor: "#EF4444",
                      },
                    ]}
                  />
                </View>
              </View>
            </View>

            <View style={styles.betsSection}>
              <View style={styles.sectionHeader}>
                <DollarSign size={20} color="#10B981" />
                <Text style={styles.sectionTitle}>Рекомендуемые ставки</Text>
              </View>
              {livePrediction.suggestedBets.map((bet, index) => (
                <View key={index} style={styles.betCard}>
                  <View style={styles.betNumber}>
                    <Text style={styles.betNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.betText}>{bet}</Text>
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
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EF4444",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  liveText: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: "#FFF",
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
  },
  tournamentText: {
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
    marginBottom: 16,
  },
  scoreBoard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  teamScoreSection: {
    alignItems: "center",
    gap: 8,
  },
  teamName: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#F9FAFB",
  },
  teamScore: {
    fontSize: 48,
    fontWeight: "900" as const,
    color: "#3B82F6",
  },
  vsDivider: {
    fontSize: 36,
    fontWeight: "800" as const,
    color: "#6B7280",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  refreshButton: {
    padding: 8,
  },
  loadingContainer: {
    alignItems: "center",
    padding: 32,
  },
  loadingText: {
    fontSize: 14,
    color: "#94A3B8",
    marginTop: 12,
  },
  mapInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#334155",
  },
  roundsInfo: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#334155",
    gap: 8,
  },
  roundsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  roundsLabel: {
    fontSize: 14,
    color: "#94A3B8",
    fontWeight: "600" as const,
  },
  roundsValue: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#F9FAFB",
  },
  currentRound: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#334155",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: "#EF4444",
  },
  updateTime: {
    fontSize: 10,
    color: "#6B7280",
    marginLeft: "auto",
  },
  errorContainer: {
    alignItems: "center",
    padding: 32,
    gap: 16,
  },
  mapLabel: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "600" as const,
  },
  predictButton: {
    backgroundColor: "#3B82F6",
    marginHorizontal: 16,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  predictButtonDisabled: {
    opacity: 0.6,
  },
  predictButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFF",
  },
  errorCard: {
    backgroundColor: "#1E293B",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
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
  predictionSection: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#F9FAFB",
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  probabilityCard: {
    backgroundColor: "#1E293B",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  probabilityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  probabilityTeam: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#F9FAFB",
  },
  probabilityValue: {
    fontSize: 20,
    fontWeight: "800" as const,
    color: "#3B82F6",
  },
  probabilityBar: {
    height: 8,
    backgroundColor: "#334155",
    borderRadius: 4,
    overflow: "hidden",
  },
  probabilityFill: {
    height: "100%",
    backgroundColor: "#3B82F6",
  },
  betsSection: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  betCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E293B",
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
    gap: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#10B981",
  },
  betNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
  },
  betNumberText: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: "#FFF",
  },
  betText: {
    flex: 1,
    fontSize: 14,
    color: "#F9FAFB",
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
});
