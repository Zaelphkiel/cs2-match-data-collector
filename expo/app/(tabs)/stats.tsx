import { Stack } from "expo-router";
import { TrendingUp, Users, Trophy, Target } from "lucide-react-native";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useMatches } from "@/contexts/MatchesContext";

export default function StatsScreen() {
  const { matches } = useMatches();

  const totalMatches = matches.length;
  const liveMatches = matches.filter((m) => m.status === "live").length;
  const upcomingMatches = matches.filter((m) => m.status === "upcoming").length;
  const finishedMatches = matches.filter((m) => m.status === "finished").length;

  const allTeams = [
    ...matches.map((m) => m.team1),
    ...matches.map((m) => m.team2),
  ];

  const topTeams = allTeams
    .reduce<{ name: string; winRate: number; matches: number }[]>((acc, team) => {
      const existing = acc.find((t) => t.name === team.name);
      if (existing) {
        existing.matches += 1;
      } else {
        acc.push({ name: team.name, winRate: team.winRate, matches: 1 });
      }
      return acc;
    }, [])
    .sort((a, b) => b.winRate - a.winRate)
    .slice(0, 5);

  const allPlayers = allTeams.flatMap((team) => team.players);
  const topPlayers = allPlayers
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Статистика",
          headerStyle: { backgroundColor: "#1F2937" },
          headerTintColor: "#F9FAFB",
          headerShadowVisible: false,
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Trophy size={28} color="#3B82F6" />
            <Text style={styles.statValue}>{totalMatches}</Text>
            <Text style={styles.statLabel}>Всего матчей</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.liveIndicator} />
            <Text style={styles.statValue}>{liveMatches}</Text>
            <Text style={styles.statLabel}>Live</Text>
          </View>

          <View style={styles.statCard}>
            <TrendingUp size={28} color="#10B981" />
            <Text style={styles.statValue}>{upcomingMatches}</Text>
            <Text style={styles.statLabel}>Предстоящие</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{finishedMatches}</Text>
            <Text style={styles.statLabel}>Завершенные</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Users size={20} color="#3B82F6" />
            <Text style={styles.sectionTitle}>Топ команд</Text>
          </View>
          {topTeams.map((team, index) => (
            <View key={index} style={styles.teamRow}>
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>{index + 1}</Text>
              </View>
              <Text style={styles.teamName}>{team.name}</Text>
              <View style={styles.teamStats}>
                <Text style={styles.winRate}>{team.winRate}%</Text>
                <Text style={styles.matchCount}>{team.matches} матчей</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Target size={20} color="#F59E0B" />
            <Text style={styles.sectionTitle}>Топ игроков</Text>
          </View>
          {topPlayers.map((player, index) => (
            <View key={index} style={styles.playerRow}>
              <View
                style={[
                  styles.rankBadge,
                  index === 0 && styles.goldBadge,
                  index === 1 && styles.silverBadge,
                  index === 2 && styles.bronzeBadge,
                ]}
              >
                <Text style={styles.rankText}>{index + 1}</Text>
              </View>
              <Text style={styles.playerName}>{player.name}</Text>
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>{player.rating.toFixed(2)}</Text>
              </View>
            </View>
          ))}
        </View>

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
  scrollView: {
    flex: 1,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 12,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#1F2937",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    gap: 8,
  },
  liveIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#EF4444",
  },
  statValue: {
    fontSize: 32,
    fontWeight: "900" as const,
    color: "#F9FAFB",
  },
  statLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "600" as const,
  },
  section: {
    marginTop: 12,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#F9FAFB",
  },
  teamRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F2937",
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#374151",
    alignItems: "center",
    justifyContent: "center",
  },
  goldBadge: {
    backgroundColor: "#F59E0B",
  },
  silverBadge: {
    backgroundColor: "#9CA3AF",
  },
  bronzeBadge: {
    backgroundColor: "#CD7F32",
  },
  rankText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#FFF",
  },
  teamName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#F9FAFB",
  },
  teamStats: {
    alignItems: "flex-end",
  },
  winRate: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#3B82F6",
  },
  matchCount: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F2937",
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  playerName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#F9FAFB",
  },
  ratingBadge: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#FFF",
  },
  bottomSpacer: {
    height: 32,
  },
});
