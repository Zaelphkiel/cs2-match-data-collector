import { useLocalSearchParams, router } from "expo-router";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowLeft,
  User,
  Target,
  Clock,
  Trophy,
  Radio,
  Brain,
  DollarSign,
  TrendingUpIcon,
} from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMatches } from "@/contexts/MatchesContext";
import { fetchBookmakerOdds, findBestOdds } from "@/services/bookmakersApi";

export default function MatchDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { getMatchById } = useMatches();
  const match = getMatchById(id as string);
  const insets = useSafeAreaInsets();

  const oddsQuery = useQuery({
    queryKey: ["odds", id, match?.team1.name, match?.team2.name],
    queryFn: () => fetchBookmakerOdds(match?.team1.name || "", match?.team2.name || ""),
    enabled: !!match,
    staleTime: 1000 * 60 * 2,
  });

  if (!match) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Матч не найден</Text>
      </View>
    );
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("ru-RU", {
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTrendIcon = (form: string[]) => {
    const recent = form.slice(-3);
    const wins = recent.filter((r) => r === "W").length;
    if (wins >= 2) return TrendingUp;
    if (wins <= 1) return TrendingDown;
    return Minus;
  };

  const TrendIcon1 = getTrendIcon(match.team1.recentForm);
  const TrendIcon2 = getTrendIcon(match.team2.recentForm);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#F9FAFB" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Детали матча</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.tournamentHeader}>
          <Trophy size={20} color="#3B82F6" />
          <Text style={styles.tournamentName}>{match.tournament}</Text>
        </View>

        <View style={styles.dateContainer}>
          <Clock size={16} color="#9CA3AF" />
          <Text style={styles.dateText}>{formatTime(match.date)}</Text>
        </View>

        <View style={styles.matchupCard}>
          <View style={styles.teamSection}>
            <Text style={styles.teamName}>{match.team1.name}</Text>
            {match.team1.score !== undefined && (
              <Text style={styles.scoreText}>{match.team1.score}</Text>
            )}
            <View style={styles.statsRow}>
              <TrendIcon1 size={16} color="#10B981" />
              <Text style={styles.winRateText}>{match.team1.winRate}% WR</Text>
            </View>
            <View style={styles.formRow}>
              {match.team1.recentForm.map((result, index) => (
                <View
                  key={index}
                  style={[
                    styles.formIndicator,
                    {
                      backgroundColor: result === "W" ? "#10B981" : "#EF4444",
                    },
                  ]}
                >
                  <Text style={styles.formText}>{result}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.vsSection}>
            <Text style={styles.vsLargeText}>VS</Text>
          </View>

          <View style={styles.teamSection}>
            <Text style={styles.teamName}>{match.team2.name}</Text>
            {match.team2.score !== undefined && (
              <Text style={styles.scoreText}>{match.team2.score}</Text>
            )}
            <View style={styles.statsRow}>
              <TrendIcon2 size={16} color="#10B981" />
              <Text style={styles.winRateText}>{match.team2.winRate}% WR</Text>
            </View>
            <View style={styles.formRow}>
              {match.team2.recentForm.map((result, index) => (
                <View
                  key={index}
                  style={[
                    styles.formIndicator,
                    {
                      backgroundColor: result === "W" ? "#10B981" : "#EF4444",
                    },
                  ]}
                >
                  <Text style={styles.formText}>{result}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {match.team1.name} - Состав
          </Text>
          {match.team1.players.map((player, index) => (
            <View key={index} style={styles.playerRow}>
              <View style={styles.playerInfo}>
                <User size={16} color="#9CA3AF" />
                <Text style={styles.playerName}>{player.name}</Text>
              </View>
              <View style={styles.playerStats}>
                <Target size={14} color="#3B82F6" />
                <Text style={styles.ratingText}>{player.rating.toFixed(2)}</Text>
              </View>
              {player.kills !== undefined && (
                <Text style={styles.kdText}>
                  {player.kills}/{player.deaths}/{player.assists}
                </Text>
              )}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {match.team2.name} - Состав
          </Text>
          {match.team2.players.map((player, index) => (
            <View key={index} style={styles.playerRow}>
              <View style={styles.playerInfo}>
                <User size={16} color="#9CA3AF" />
                <Text style={styles.playerName}>{player.name}</Text>
              </View>
              <View style={styles.playerStats}>
                <Target size={14} color="#3B82F6" />
                <Text style={styles.ratingText}>{player.rating.toFixed(2)}</Text>
              </View>
              {player.kills !== undefined && (
                <Text style={styles.kdText}>
                  {player.kills}/{player.deaths}/{player.assists}
                </Text>
              )}
            </View>
          ))}
        </View>

        {oddsQuery.data && oddsQuery.data.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <DollarSign size={18} color="#10B981" />
              <Text style={styles.sectionTitle}>Коэффициенты букмекеров</Text>
            </View>
            {oddsQuery.isLoading ? (
              <ActivityIndicator size="small" color="#3B82F6" />
            ) : (
              <View style={styles.oddsContainer}>
                {oddsQuery.data.map((odd, index) => (
                  <View key={index} style={styles.oddsCard}>
                    <Text style={styles.bookmakerName}>{odd.bookmaker}</Text>
                    <View style={styles.oddsRow}>
                      <View style={styles.oddItem}>
                        <Text style={styles.teamOddsLabel}>{match.team1.name}</Text>
                        <Text style={styles.oddsValue}>{odd.team1Win.toFixed(2)}</Text>
                      </View>
                      <View style={styles.oddsSeparator} />
                      <View style={styles.oddItem}>
                        <Text style={styles.teamOddsLabel}>{match.team2.name}</Text>
                        <Text style={styles.oddsValue}>{odd.team2Win.toFixed(2)}</Text>
                      </View>
                    </View>
                    {odd.team1Handicap && odd.team1Handicap.length > 0 && (
                      <View style={styles.handicapContainer}>
                        <Text style={styles.handicapTitle}>Фора:</Text>
                        <View style={styles.handicapRow}>
                          {odd.team1Handicap.map((h, i) => (
                            <View key={i} style={styles.handicapChip}>
                              <Text style={styles.handicapText}>{h.value}: {h.odds}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}
                    {odd.totalMaps && odd.totalMaps.length > 0 && (
                      <View style={styles.totalContainer}>
                        <Text style={styles.totalTitle}>Тотал карт:</Text>
                        {odd.totalMaps.map((t, i) => (
                          <View key={i} style={styles.totalRow}>
                            <Text style={styles.totalText}>Больше {t.line}: {t.over}</Text>
                            <Text style={styles.totalText}>Меньше {t.line}: {t.under}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                    <Text style={styles.updateTime}>
                      Обновлено: {new Date(odd.lastUpdate).toLocaleTimeString("ru-RU")}
                    </Text>
                  </View>
                ))}
                {(() => {
                  const best = findBestOdds(oddsQuery.data);
                  if (best) {
                    return (
                      <View style={styles.bestOddsCard}>
                        <View style={styles.bestOddsHeader}>
                          <TrendingUpIcon size={16} color="#10B981" />
                          <Text style={styles.bestOddsTitle}>Лучшие коэффициенты</Text>
                        </View>
                        <Text style={styles.bestOddsText}>
                          {match.team1.name}: {best.team1Win.odds.toFixed(2)} ({best.team1Win.bookmaker})
                        </Text>
                        <Text style={styles.bestOddsText}>
                          {match.team2.name}: {best.team2Win.odds.toFixed(2)} ({best.team2Win.bookmaker})
                        </Text>
                      </View>
                    );
                  }
                  return null;
                })()}
              </View>
            )}
          </View>
        )}

        {match.prediction && (
          <View style={styles.predictionSection}>
            <Text style={styles.sectionTitle}>Прогноз</Text>
            <View style={styles.predictionCard}>
              <Text style={styles.predictionWinner}>
                Победитель: {match.prediction.winner}
              </Text>
              <Text style={styles.confidenceText}>
                Уверенность: {match.prediction.confidence}%
              </Text>
              <View style={styles.factorsList}>
                {match.prediction.factors.map((factor, index) => (
                  <View key={index} style={styles.factorItem}>
                    <View style={styles.factorBullet} />
                    <Text style={styles.factorText}>{factor}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {match.stats?.maps && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Карты</Text>
            <View style={styles.mapsContainer}>
              {match.stats.maps.map((map, index) => (
                <View key={index} style={styles.mapChip}>
                  <Text style={styles.mapText}>{map}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <TouchableOpacity
          style={styles.analyzeButton}
          onPress={() => router.push({ pathname: "/analysis/[id]", params: { id: match.id } })}
        >
          <Brain size={20} color="#FFF" />
          <Text style={styles.analyzeButtonText}>AI Анализ матча</Text>
        </TouchableOpacity>

        {match.status === "live" && (
          <TouchableOpacity
            style={styles.liveButton}
            onPress={() => router.push({ pathname: "/live/[id]", params: { id: match.id } })}
          >
            <Radio size={20} color="#FFF" />
            <Text style={styles.liveButtonText}>Live прогноз</Text>
          </TouchableOpacity>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: "#1F2937",
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
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
  tournamentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 16,
    backgroundColor: "#1F2937",
    marginTop: 8,
    marginHorizontal: 16,
    borderRadius: 12,
  },
  tournamentName: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#F9FAFB",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  dateText: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  matchupCard: {
    backgroundColor: "#1F2937",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    gap: 20,
  },
  teamSection: {
    alignItems: "center",
    gap: 8,
  },
  teamName: {
    fontSize: 20,
    fontWeight: "800" as const,
    color: "#F9FAFB",
  },
  scoreText: {
    fontSize: 48,
    fontWeight: "900" as const,
    color: "#3B82F6",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  winRateText: {
    fontSize: 14,
    color: "#9CA3AF",
    fontWeight: "600" as const,
  },
  formRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 4,
  },
  formIndicator: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  formText: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: "#FFF",
  },
  vsSection: {
    alignItems: "center",
    paddingVertical: 8,
  },
  vsLargeText: {
    fontSize: 24,
    fontWeight: "800" as const,
    color: "#6B7280",
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#F9FAFB",
    marginBottom: 12,
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1F2937",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  playerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  playerName: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#F9FAFB",
  },
  playerStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#3B82F6",
  },
  kdText: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "600" as const,
    marginLeft: 8,
  },
  predictionSection: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  predictionCard: {
    backgroundColor: "#1F2937",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#3B82F6",
  },
  predictionWinner: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#F9FAFB",
    marginBottom: 8,
  },
  confidenceText: {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight: "600" as const,
    marginBottom: 12,
  },
  factorsList: {
    gap: 8,
  },
  factorItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  factorBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#3B82F6",
  },
  factorText: {
    fontSize: 13,
    color: "#D1D5DB",
  },
  mapsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  mapChip: {
    backgroundColor: "#374151",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  mapText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#F9FAFB",
  },
  analyzeButton: {
    backgroundColor: "#3B82F6",
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  analyzeButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFF",
  },
  liveButton: {
    backgroundColor: "#EF4444",
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  liveButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFF",
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
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  oddsContainer: {
    gap: 12,
  },
  oddsCard: {
    backgroundColor: "#1F2937",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#10B981",
  },
  bookmakerName: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#10B981",
    marginBottom: 12,
  },
  oddsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  oddItem: {
    alignItems: "center",
    flex: 1,
  },
  teamOddsLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 4,
    textAlign: "center",
  },
  oddsValue: {
    fontSize: 24,
    fontWeight: "800" as const,
    color: "#F9FAFB",
  },
  oddsSeparator: {
    width: 1,
    backgroundColor: "#374151",
    marginHorizontal: 12,
  },
  handicapContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#374151",
  },
  handicapTitle: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 6,
  },
  handicapRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  handicapChip: {
    backgroundColor: "#374151",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  handicapText: {
    fontSize: 11,
    color: "#D1D5DB",
    fontWeight: "600" as const,
  },
  totalContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#374151",
  },
  totalTitle: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 6,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  totalText: {
    fontSize: 12,
    color: "#D1D5DB",
  },
  updateTime: {
    fontSize: 10,
    color: "#6B7280",
    marginTop: 8,
    textAlign: "right",
  },
  bestOddsCard: {
    backgroundColor: "#065F46",
    padding: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  bestOddsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  bestOddsTitle: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#D1FAE5",
  },
  bestOddsText: {
    fontSize: 13,
    color: "#F0FDF4",
    marginTop: 4,
  },
});
