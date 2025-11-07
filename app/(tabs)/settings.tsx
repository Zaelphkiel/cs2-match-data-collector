import { Stack } from "expo-router";
import { Bell, Globe, Moon, Info, MessageSquare, Clock, BellRing, AlertTriangle, Activity, CheckCircle, XCircle } from "lucide-react-native";
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View, Platform, ActivityIndicator } from "react-native";
import { useState } from "react";
import { useNotifications } from "@/contexts/NotificationsContext";
import { trpcClient } from "@/lib/trpc";

export default function SettingsScreen() {
  const { settings, updateSettings, isLoading, cancelAllNotifications } = useNotifications();
  const [darkMode, setDarkMode] = useState(true);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const testConnection = async () => {
    setTestingConnection(true);
    setConnectionStatus('idle');
    
    try {
      console.log('[Settings] 🔍 Testing connection to backend...');
      const data = await trpcClient.matches.all.query({ date: new Date().toISOString().split('T')[0] });
      
      if (data && data.length >= 0) {
        console.log('[Settings] ✅ Connection test successful, matches:', data.length);
        setConnectionStatus('success');
      } else {
        console.error('[Settings] ❌ Connection test failed: no data');
        setConnectionStatus('error');
      }
    } catch (error) {
      console.error('[Settings] ❌ Connection test exception:', error);
      setConnectionStatus('error');
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Настройки",
          headerStyle: { backgroundColor: "#1F2937" },
          headerTintColor: "#F9FAFB",
          headerShadowVisible: false,
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Основные</Text>

          {Platform.OS !== "web" && (
            <>
              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <Bell size={20} color="#3B82F6" />
                  <Text style={styles.settingLabel}>Уведомления</Text>
                </View>
                <Switch
                  value={settings.enabled}
                  onValueChange={(value) => updateSettings({ ...settings, enabled: value })}
                  trackColor={{ false: "#374151", true: "#3B82F6" }}
                  thumbColor="#FFF"
                  disabled={isLoading}
                />
              </View>

              {settings.enabled && (
                <View style={styles.subSettings}>
                  <View style={styles.settingRow}>
                    <View style={styles.settingLeft}>
                      <BellRing size={18} color="#9CA3AF" />
                      <Text style={styles.settingLabel}>О начале матча</Text>
                    </View>
                    <Switch
                      value={settings.matchStartNotifications}
                      onValueChange={(value) => updateSettings({ ...settings, matchStartNotifications: value })}
                      trackColor={{ false: "#374151", true: "#3B82F6" }}
                      thumbColor="#FFF"
                      disabled={isLoading}
                    />
                  </View>

                  {settings.matchStartNotifications && (
                    <View style={styles.settingRow}>
                      <View style={styles.settingLeft}>
                        <Clock size={18} color="#9CA3AF" />
                        <View>
                          <Text style={styles.settingLabel}>За сколько минут</Text>
                          <Text style={styles.settingSubtext}>До начала матча</Text>
                        </View>
                      </View>
                      <View style={styles.timeOptions}>
                        {[15, 30, 60].map((minutes) => (
                          <TouchableOpacity
                            key={minutes}
                            style={[
                              styles.timeOption,
                              settings.minutesBefore === minutes && styles.timeOptionActive,
                            ]}
                            onPress={() => updateSettings({ ...settings, minutesBefore: minutes })}
                            disabled={isLoading}
                          >
                            <Text
                              style={[
                                styles.timeOptionText,
                                settings.minutesBefore === minutes && styles.timeOptionTextActive,
                              ]}
                            >
                              {minutes}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}

                  <View style={styles.settingRow}>
                    <View style={styles.settingLeft}>
                      <AlertTriangle size={18} color="#9CA3AF" />
                      <View>
                        <Text style={styles.settingLabel}>Только важные</Text>
                        <Text style={styles.settingSubtext}>Уведомления о важных матчах</Text>
                      </View>
                    </View>
                    <Switch
                      value={settings.importantMatchesOnly}
                      onValueChange={(value) => updateSettings({ ...settings, importantMatchesOnly: value })}
                      trackColor={{ false: "#374151", true: "#3B82F6" }}
                      thumbColor="#FFF"
                      disabled={isLoading}
                    />
                  </View>

                  <TouchableOpacity
                    style={styles.dangerButton}
                    onPress={cancelAllNotifications}
                  >
                    <Bell size={16} color="#EF4444" />
                    <Text style={styles.dangerButtonText}>Отменить все уведомления</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Moon size={20} color="#3B82F6" />
              <Text style={styles.settingLabel}>Темная тема</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: "#374151", true: "#3B82F6" }}
              thumbColor="#FFF"
            />
          </View>

          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Globe size={20} color="#3B82F6" />
              <Text style={styles.settingLabel}>Язык</Text>
            </View>
            <Text style={styles.settingValue}>Русский</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Диагностика</Text>

          <TouchableOpacity 
            style={styles.settingRow}
            onPress={testConnection}
            disabled={testingConnection}
          >
            <View style={styles.settingLeft}>
              <Activity size={20} color="#3B82F6" />
              <Text style={styles.settingLabel}>Проверить подключение</Text>
            </View>
            {testingConnection ? (
              <ActivityIndicator size="small" color="#3B82F6" />
            ) : connectionStatus === 'success' ? (
              <CheckCircle size={20} color="#10B981" />
            ) : connectionStatus === 'error' ? (
              <XCircle size={20} color="#EF4444" />
            ) : null}
          </TouchableOpacity>

          {connectionStatus === 'success' && (
            <View style={styles.statusCard}>
              <CheckCircle size={16} color="#10B981" />
              <Text style={styles.statusTextSuccess}>
                Сервер доступен! Подключение работает.
              </Text>
            </View>
          )}

          {connectionStatus === 'error' && (
            <View style={[styles.statusCard, styles.statusCardError]}>
              <XCircle size={16} color="#EF4444" />
              <Text style={styles.statusTextError}>
                Не удалось подключиться к серверу. Проверьте интернет.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Информация</Text>

          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Info size={20} color="#3B82F6" />
              <Text style={styles.settingLabel}>О приложении</Text>
            </View>
            <Text style={styles.settingValue}>v1.0.0</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <MessageSquare size={20} color="#3B82F6" />
              <Text style={styles.settingLabel}>Обратная связь</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>CS2 Match Analyzer AI</Text>
          <Text style={styles.infoText}>
            Передовое AI-приложение для глубокого анализа матчей Counter-Strike 2.
          </Text>
          <Text style={styles.infoSubtext}>
            ✓ AI-анализ с множественными источниками данных{"\n"}
            ✓ Прогнозы в реальном времени для Live матчей{"\n"}
            ✓ Детальная статистика команд и игроков{"\n"}
            ✓ Рекомендации для ставок BetBoom{"\n"}
            ✓ Анализ формы, H2H, карт и стратегий
          </Text>
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
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#9CA3AF",
    textTransform: "uppercase",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1F2937",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#F9FAFB",
  },
  settingValue: {
    fontSize: 14,
    color: "#9CA3AF",
    fontWeight: "500" as const,
  },
  infoCard: {
    backgroundColor: "#1F2937",
    marginHorizontal: 16,
    marginTop: 24,
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#3B82F6",
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#F9FAFB",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#9CA3AF",
    lineHeight: 20,
    marginBottom: 12,
  },
  infoSubtext: {
    fontSize: 13,
    color: "#10B981",
    lineHeight: 22,
    fontWeight: "500" as const,
  },
  bottomSpacer: {
    height: 32,
  },
  subSettings: {
    marginLeft: 12,
    marginTop: 8,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: "#374151",
  },
  settingSubtext: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  timeOptions: {
    flexDirection: "row",
    gap: 8,
  },
  timeOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#374151",
    borderRadius: 8,
  },
  timeOptionActive: {
    backgroundColor: "#3B82F6",
  },
  timeOptionText: {
    fontSize: 13,
    color: "#9CA3AF",
    fontWeight: "600" as const,
  },
  timeOptionTextActive: {
    color: "#FFF",
  },
  dangerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#1F2937",
    padding: 14,
    borderRadius: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  dangerButtonText: {
    fontSize: 14,
    color: "#EF4444",
    fontWeight: "600" as const,
  },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    padding: 14,
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  statusCardError: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  statusTextSuccess: {
    flex: 1,
    fontSize: 13,
    color: "#10B981",
    fontWeight: "600" as const,
  },
  statusTextError: {
    flex: 1,
    fontSize: 13,
    color: "#EF4444",
    fontWeight: "600" as const,
  },
});
