import { router } from "expo-router";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  Clock,
  Trophy,
  Radio,
  Bell,
  BellOff,
} from "lucide-react-native";
import { memo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Platform } from "react-native";
import { useNotifications } from "@/contexts/NotificationsContext";
import type { Match } from "@/types/matches";

interface MatchCardProps {
  match: Match;
}

function MatchCard({ match }: MatchCardProps) {
  const { scheduleMatchNotification, cancelMatchNotification, settings } = useNotifications();
  const [notificationScheduled, setNotificationScheduled] = useState(false);
  const getStatusColor = () => {
    switch (match.status) {
      case "live":
        return "#EF4444";
      case "upcoming":
        return "#3B82F6";
      case "finished":
        return "#6B7280";
      default:
        return "#6B7280";
    }
  };

  const getStatusText = () => {
    switch (match.status) {
      case "live":
        return "LIVE";
      case "upcoming":
        return formatTime(match.date);
      case "finished":
        return "Завершен";
      default:
        return "";
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("ru-RU", {
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

  const handlePress = () => {
    router.push({
      pathname: "/match/[id]",
      params: { id: match.id },
    });
  };

  const handleNotificationToggle = async (e: any) => {
    e.stopPropagation();
    
    if (Platform.OS === "web") {
      return;
    }

    if (notificationScheduled) {
      await cancelMatchNotification(match.id);
      setNotificationScheduled(false);
    } else {
      const matchTitle = `${match.team1.name} vs ${match.team2.name}`;
      await scheduleMatchNotification(match.id, matchTitle, new Date(match.date));
      setNotificationScheduled(true);
    }
  };

  const TrendIcon1 = getTrendIcon(match.team1.recentForm);
  const TrendIcon2 = getTrendIcon(match.team2.recentForm);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.7}
      testID={`match-card-${match.id}`}
    >
      <View style={styles.header}>
        <View style={styles.tournamentContainer}>
          <Trophy size={14} color="#9CA3AF" />
          <Text style={styles.tournament} numberOfLines={1}>
            {match.tournament}
          </Text>
        </View>
        <View style={styles.headerRight}>
          {match.status === "upcoming" && settings.enabled && Platform.OS !== "web" && (
            <TouchableOpacity
              onPress={handleNotificationToggle}
              style={styles.notificationButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {notificationScheduled ? (
                <Bell size={16} color="#3B82F6" fill="#3B82F6" />
              ) : (
                <BellOff size={16} color="#6B7280" />
              )}
            </TouchableOpacity>
          )}
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
            {match.status === "live" && <Radio size={10} color="#FFF" style={styles.liveIcon} />}
            <Text style={styles.statusText}>{getStatusText()}</Text>
          </View>
        </View>
      </View>

      <View style={styles.matchContainer}>
        <View style={styles.teamContainer}>
          <View style={styles.teamInfo}>
            <Text style={styles.teamName} numberOfLines={1}>
              {match.team1.name}
            </Text>
            <View style={styles.formContainer}>
              <TrendIcon1 size={14} color="#10B981" />
              <Text style={styles.winRate}>{match.team1.winRate}%</Text>
            </View>
          </View>
          {match.team1.score !== undefined && (
            <Text style={styles.score}>{match.team1.score}</Text>
          )}
        </View>

        <View style={styles.vsContainer}>
          <Text style={styles.vsText}>VS</Text>
        </View>

        <View style={styles.teamContainer}>
          <View style={styles.teamInfo}>
            <Text style={styles.teamName} numberOfLines={1}>
              {match.team2.name}
            </Text>
            <View style={styles.formContainer}>
              <TrendIcon2 size={14} color="#10B981" />
              <Text style={styles.winRate}>{match.team2.winRate}%</Text>
            </View>
          </View>
          {match.team2.score !== undefined && (
            <Text style={styles.score}>{match.team2.score}</Text>
          )}
        </View>
      </View>

      {match.prediction && (
        <View style={styles.predictionContainer}>
          <View style={styles.predictionBar}>
            <View
              style={[
                styles.predictionFill,
                { width: `${match.prediction.confidence}%` },
              ]}
            />
            <Text style={styles.predictionText}>
              Прогноз: {match.prediction.winner} ({match.prediction.confidence}%)
            </Text>
          </View>
        </View>
      )}

      {match.status === "live" && match.stats?.viewerCount && (
        <View style={styles.viewersContainer}>
          <Clock size={12} color="#9CA3AF" />
          <Text style={styles.viewersText}>
            {match.stats.viewerCount.toLocaleString()} зрителей
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.detailsText}>Подробнее</Text>
        <ChevronRight size={16} color="#3B82F6" />
      </View>
    </TouchableOpacity>
  );
}

export default memo(MatchCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1F2937",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  notificationButton: {
    padding: 4,
  },
  tournamentContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
    marginRight: 8,
  },
  tournament: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "600" as const,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  liveIcon: {
    marginRight: 2,
  },
  statusText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "700" as const,
  },
  matchContainer: {
    gap: 12,
  },
  teamContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  teamInfo: {
    flex: 1,
    gap: 4,
  },
  teamName: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#F9FAFB",
  },
  formContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  winRate: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "600" as const,
  },
  score: {
    fontSize: 32,
    fontWeight: "800" as const,
    color: "#F9FAFB",
    marginLeft: 16,
  },
  vsContainer: {
    alignItems: "center",
    paddingVertical: 4,
  },
  vsText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#6B7280",
  },
  predictionContainer: {
    marginTop: 16,
  },
  predictionBar: {
    height: 32,
    backgroundColor: "#374151",
    borderRadius: 8,
    overflow: "hidden",
    justifyContent: "center",
  },
  predictionFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "#3B82F6",
    opacity: 0.3,
  },
  predictionText: {
    fontSize: 12,
    color: "#F9FAFB",
    fontWeight: "600" as const,
    textAlign: "center",
    zIndex: 1,
  },
  viewersContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 12,
  },
  viewersText: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#374151",
  },
  detailsText: {
    fontSize: 13,
    color: "#3B82F6",
    fontWeight: "600" as const,
    marginRight: 4,
  },
});
