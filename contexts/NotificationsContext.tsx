import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useEffect, useState, useCallback, useMemo } from "react";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface NotificationSettings {
  enabled: boolean;
  matchStartNotifications: boolean;
  liveMatchUpdates: boolean;
  minutesBefore: number;
  importantMatchesOnly: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  matchStartNotifications: true,
  liveMatchUpdates: false,
  minutesBefore: 30,
  importantMatchesOnly: false,
};

export const [NotificationsContext, useNotifications] = createContextHook(() => {
  const [expoPushToken, setExpoPushToken] = useState<string>("");
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
    registerForPushNotificationsAsync();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem("notificationSettings");
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading notification settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = useCallback(async (newSettings: NotificationSettings) => {
    try {
      await AsyncStorage.setItem("notificationSettings", JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error("Error saving notification settings:", error);
    }
  }, []);

  const registerForPushNotificationsAsync = async () => {
    if (Platform.OS === "web") {
      console.log("Push notifications are not available on web");
      return;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Failed to get push token for push notification!");
        return;
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log("Expo push token:", token);
      setExpoPushToken(token);
    } catch (error) {
      console.error("Error getting push token:", error);
    }
  };

  const scheduleMatchNotification = useCallback(
    async (matchId: string, matchTitle: string, matchDate: Date) => {
      if (!settings.enabled || !settings.matchStartNotifications) {
        return;
      }

      if (Platform.OS === "web") {
        console.log("Notifications not supported on web");
        return;
      }

      try {
        const notificationTime = new Date(matchDate);
        notificationTime.setMinutes(notificationTime.getMinutes() - settings.minutesBefore);

        if (notificationTime.getTime() <= Date.now()) {
          console.log("Match notification time is in the past, skipping");
          return;
        }

        await Notifications.cancelScheduledNotificationAsync(matchId);

        await Notifications.scheduleNotificationAsync({
          content: {
            title: "🎮 Матч начинается скоро!",
            body: matchTitle,
            data: { matchId, type: "match_start" },
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: notificationTime,
          },
          identifier: matchId,
        });

        console.log(`Notification scheduled for match ${matchId} at ${notificationTime}`);
      } catch (error) {
        console.error("Error scheduling notification:", error);
      }
    },
    [settings]
  );

  const cancelMatchNotification = useCallback(async (matchId: string) => {
    if (Platform.OS === "web") return;

    try {
      await Notifications.cancelScheduledNotificationAsync(matchId);
      console.log(`Notification cancelled for match ${matchId}`);
    } catch (error) {
      console.error("Error cancelling notification:", error);
    }
  }, []);

  const sendLiveMatchUpdate = useCallback(
    async (matchId: string, title: string, body: string) => {
      if (!settings.enabled || !settings.liveMatchUpdates) {
        return;
      }

      if (Platform.OS === "web") return;

      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            data: { matchId, type: "live_update" },
            sound: true,
          },
          trigger: null,
        });

        console.log(`Live update notification sent for match ${matchId}`);
      } catch (error) {
        console.error("Error sending live update:", error);
      }
    },
    [settings]
  );

  const cancelAllNotifications = useCallback(async () => {
    if (Platform.OS === "web") return;

    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log("All notifications cancelled");
    } catch (error) {
      console.error("Error cancelling all notifications:", error);
    }
  }, []);

  return useMemo(() => ({
    expoPushToken,
    settings,
    isLoading,
    updateSettings: saveSettings,
    scheduleMatchNotification,
    cancelMatchNotification,
    sendLiveMatchUpdate,
    cancelAllNotifications,
  }), [expoPushToken, settings, isLoading, saveSettings, scheduleMatchNotification, cancelMatchNotification, sendLiveMatchUpdate, cancelAllNotifications]);
});
