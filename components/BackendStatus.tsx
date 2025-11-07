import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react-native";
import { useMatches } from "@/contexts/MatchesContext";
import { useState } from "react";

export default function BackendStatus() {
  const { backendAvailable, refetch } = useMatches();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRetry = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  if (backendAvailable === true) {
    return (
      <View style={[styles.container, styles.statusOk]}>
        <View style={styles.row}>
          <CheckCircle size={16} color="#10B981" />
          <Text style={styles.textOk}>✅ Backend подключен - реальные данные</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, styles.statusError]}>
      <View style={styles.row}>
        <AlertCircle size={16} color="#F59E0B" />
        <View style={styles.textContainer}>
          <Text style={styles.textError}>⚠️ Backend недоступен - используются демо данные</Text>
          <Text style={styles.helpText}>
            Реальные данные появятся после развертывания backend
          </Text>
        </View>
        <TouchableOpacity 
          onPress={handleRetry} 
          disabled={isRefreshing}
          style={styles.retryButton}
        >
          <RefreshCw 
            size={18} 
            color="#F59E0B" 
            style={isRefreshing ? styles.spinning : undefined}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  textContainer: {
    flex: 1,
    flexDirection: "column",
    gap: 4,
  },

  statusOk: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  textOk: {
    fontSize: 12,
    color: "#10B981",
    fontWeight: "600" as const,
  },
  statusError: {
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    borderColor: "rgba(245, 158, 11, 0.3)",
  },
  textError: {
    fontSize: 12,
    color: "#F59E0B",
    fontWeight: "600" as const,
  },
  helpText: {
    fontSize: 10,
    color: "#D97706",
    fontWeight: "400" as const,
  },
  retryButton: {
    padding: 4,
  },
  spinning: {
    transform: [{ rotate: "180deg" }],
  },
});
