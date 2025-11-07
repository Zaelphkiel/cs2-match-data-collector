import { Stack } from "expo-router";
import { AlertCircle, Filter, RefreshCw, Wifi, WifiOff } from "lucide-react-native";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MatchCard from "@/components/MatchCard";
import { useMatches } from "@/contexts/MatchesContext";
import { useMemo } from "react";
import BackendStatus from "@/components/BackendStatus";

export default function MatchesScreen() {
  const { matches, isLoading, error, filter, setFilter, refetch } = useMatches();

  const dataSource = useMemo(() => {
    if (matches.length === 0) return null;
    const firstId = matches[0]?.id?.toLowerCase();
    if (firstId?.includes('hltv')) return 'HLTV';
    if (firstId?.includes('pandascore')) return 'PandaScore';
    return 'Unknown';
  }, [matches]);

  const filters = [
    { key: "all" as const, label: "Все" },
    { key: "upcoming" as const, label: "Предстоящие" },
    { key: "live" as const, label: "Live" },
    { key: "finished" as const, label: "Завершенные" },
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "CS2 Матчи",
          headerStyle: { backgroundColor: "#1F2937" },
          headerTintColor: "#F9FAFB",
          headerShadowVisible: false,
          headerRight: () => (
            <TouchableOpacity onPress={() => refetch()} style={styles.refreshButton}>
              <RefreshCw size={20} color="#3B82F6" />
            </TouchableOpacity>
          ),
        }}
      />

      <BackendStatus />
      
      <View style={styles.filtersContainer}>
        <View style={styles.filtersRow}>
          {filters.map((filterItem) => (
          <TouchableOpacity
            key={filterItem.key}
            style={[
              styles.filterChip,
              filter === filterItem.key && styles.filterChipActive,
            ]}
            onPress={() => setFilter(filterItem.key)}
          >
            <Text
              style={[
                styles.filterText,
                filter === filterItem.key && styles.filterTextActive,
              ]}
            >
              {filterItem.label}
            </Text>
          </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.dataStatus}>
          {dataSource ? (
            <View style={styles.statusBadge}>
              <Wifi size={14} color="#10B981" />
              <Text style={styles.statusTextReal}>✅ Реальные данные ({dataSource})</Text>
            </View>
          ) : isLoading ? (
            <View style={[styles.statusBadge, styles.statusBadgeMock]}>
              <WifiOff size={14} color="#F59E0B" />
              <Text style={styles.statusTextMock}>⏳ Подключение к серверу...</Text>
            </View>
          ) : null}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Загрузка матчей...</Text>
          <Text style={styles.loadingSubtext}>
            Получение данных с HLTV, PandaScore и других источников...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color="#EF4444" />
          <Text style={styles.errorTitle}>Ошибка подключения</Text>
          <Text style={styles.errorText}>
            Не удалось загрузить данные о матчах.
          </Text>
          <Text style={styles.errorSubtext}>
            {error instanceof Error ? error.message : 'Проверьте подключение к интернету и попробуйте снова.'}
          </Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              console.log('[UI] 🔄 Manual refetch triggered');
              refetch();
            }}
          >
            <RefreshCw size={18} color="#FFF" />
            <Text style={styles.retryButtonText}>Повторить попытку</Text>
          </TouchableOpacity>
        </View>
      ) : matches.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Filter size={48} color="#6B7280" />
          <Text style={styles.emptyTitle}>Матчи не найдены</Text>
          <Text style={styles.emptyText}>
            Сегодня нет запланированных CS2 матчей.
            Попробуйте выбрать другой фильтр или обновите данные.
          </Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          renderItem={({ item }) => <MatchCard match={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
  },
  refreshButton: {
    padding: 8,
    marginRight: 4,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#1F2937",
    gap: 8,
  },
  filtersRow: {
    flexDirection: "row",
    gap: 8,
  },
  dataStatus: {
    marginTop: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(139, 92, 246, 0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.3)",
    alignSelf: "flex-start",
  },
  statusBadgeMock: {
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    borderColor: "rgba(245, 158, 11, 0.3)",
  },
  statusTextReal: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#10B981",
  },
  statusTextAI: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#8B5CF6",
  },
  statusTextMock: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#F59E0B",
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#374151",
  },
  filterChipActive: {
    backgroundColor: "#3B82F6",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#9CA3AF",
  },
  filterTextActive: {
    color: "#FFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  loadingSubtext: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    gap: 12,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#EF4444",
    marginTop: 12,
  },
  errorText: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 20,
  },
  errorSubtext: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 18,
    marginTop: 4,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#3B82F6",
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#FFF",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#F9FAFB",
    marginTop: 12,
  },
  emptyText: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 20,
  },
  listContent: {
    paddingVertical: 12,
  },
});
