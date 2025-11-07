import { Platform } from "react-native";

export interface LiveScore {
  matchId: string;
  team1Score: number;
  team2Score: number;
  currentMap: string;
  mapNumber: number;
  team1RoundsWon: number;
  team2RoundsWon: number;
  currentRound: number;
  status: "live" | "finished";
  lastUpdate: string;
}

type LiveScoreCallback = (score: LiveScore) => void;

class LiveScoreService {
  private connections: Map<string, WebSocket> = new Map();
  private callbacks: Map<string, Set<LiveScoreCallback>> = new Map();
  private reconnectTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private reconnectAttempts: Map<string, number> = new Map();
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private pollingIntervals: Map<string, ReturnType<typeof setInterval>> = new Map();
  private pollingDelay = 10000;

  connect(matchId: string, callback: LiveScoreCallback): () => void {
    console.log(`[LiveScore] Connecting to match ${matchId}`);

    if (!this.callbacks.has(matchId)) {
      this.callbacks.set(matchId, new Set());
    }
    
    this.callbacks.get(matchId)!.add(callback);

    if (Platform.OS === "web" && typeof WebSocket !== "undefined") {
      this.connectWebSocket(matchId);
    } else {
      this.startPolling(matchId);
    }

    return () => this.disconnect(matchId, callback);
  }

  private connectWebSocket(matchId: string) {
    if (this.connections.has(matchId)) {
      console.log(`[LiveScore] Already connected to match ${matchId}`);
      return;
    }

    try {
      const wsUrl = `wss://hltv-score-service.example.com/match/${matchId}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log(`[LiveScore] WebSocket connected for match ${matchId}`);
        this.reconnectAttempts.set(matchId, 0);
      };

      ws.onmessage = (event) => {
        try {
          const score: LiveScore = JSON.parse(event.data);
          this.notifyCallbacks(matchId, score);
        } catch (error) {
          console.error(`[LiveScore] Failed to parse message:`, error);
        }
      };

      ws.onerror = (error) => {
        console.error(`[LiveScore] WebSocket error for match ${matchId}:`, error);
      };

      ws.onclose = () => {
        console.log(`[LiveScore] WebSocket closed for match ${matchId}`);
        this.connections.delete(matchId);
        this.scheduleReconnect(matchId);
      };

      this.connections.set(matchId, ws);
    } catch (error) {
      console.error(`[LiveScore] Failed to create WebSocket:`, error);
      this.startPolling(matchId);
    }
  }

  private scheduleReconnect(matchId: string) {
    const attempts = this.reconnectAttempts.get(matchId) || 0;

    if (attempts >= this.maxReconnectAttempts) {
      console.log(`[LiveScore] Max reconnect attempts reached for match ${matchId}, switching to polling`);
      this.startPolling(matchId);
      return;
    }

    const timer = setTimeout(() => {
      console.log(`[LiveScore] Reconnecting to match ${matchId} (attempt ${attempts + 1})`);
      this.reconnectAttempts.set(matchId, attempts + 1);
      this.connectWebSocket(matchId);
    }, this.reconnectDelay * (attempts + 1));

    this.reconnectTimers.set(matchId, timer);
  }

  private startPolling(matchId: string) {
    if (this.pollingIntervals.has(matchId)) {
      return;
    }

    console.log(`[LiveScore] Starting polling for match ${matchId}`);

    const poll = async () => {
      try {
        const score = await this.fetchLiveScore(matchId);
        if (score) {
          this.notifyCallbacks(matchId, score);
          
          if (score.status === "finished") {
            console.log(`[LiveScore] Match ${matchId} finished, stopping polling`);
            this.stopPolling(matchId);
          }
        }
      } catch (error) {
        console.error(`[LiveScore] Polling error for match ${matchId}:`, error);
      }
    };

    poll();
    
    const interval = setInterval(poll, this.pollingDelay);
    this.pollingIntervals.set(matchId, interval);
  }

  private stopPolling(matchId: string) {
    const interval = this.pollingIntervals.get(matchId);
    if (interval) {
      clearInterval(interval);
      this.pollingIntervals.delete(matchId);
      console.log(`[LiveScore] Stopped polling for match ${matchId}`);
    }
  }

  private async fetchLiveScore(matchId: string): Promise<LiveScore | null> {
    try {
      const numericId = matchId.replace('hltv-', '');
      
      console.log(`[LiveScore] 🔍 Fetching live score for match ${numericId}...`);
      
      const response = await fetch(`https://hltv-api.vercel.app/api/match/${numericId}.json`, {
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.log(`[LiveScore] ❌ HLTV API failed (${response.status}), retrying...`);
        return null;
      }
      
      const matchData = await response.json();
      console.log(`[LiveScore] 📊 Received match data for ${numericId}`);
      
      const isLive = matchData.live === true;
      const isFinished = matchData.result && matchData.result.team1Score !== undefined;
      
      const maps = matchData.maps || [];
      const currentMapIndex = maps.findIndex((m: any) => !m.result);
      const currentMap = currentMapIndex >= 0 ? maps[currentMapIndex] : (maps.length > 0 ? maps[maps.length - 1] : null);
      
      return {
        matchId,
        team1Score: matchData.result?.team1Score || 0,
        team2Score: matchData.result?.team2Score || 0,
        currentMap: currentMap?.name || "TBD",
        mapNumber: currentMapIndex >= 0 ? currentMapIndex + 1 : maps.length,
        team1RoundsWon: currentMap?.result?.team1Rounds || 0,
        team2RoundsWon: currentMap?.result?.team2Rounds || 0,
        currentRound: (currentMap?.result?.team1Rounds || 0) + (currentMap?.result?.team2Rounds || 0) + 1,
        status: isFinished ? 'finished' : (isLive ? 'live' : 'live'),
        lastUpdate: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`[LiveScore] ❌ Error fetching live score:`, error);
      return null;
    }
  }



  private notifyCallbacks(matchId: string, score: LiveScore) {
    const callbacks = this.callbacks.get(matchId);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(score);
        } catch (error) {
          console.error(`[LiveScore] Error in callback:`, error);
        }
      });
    }
  }

  disconnect(matchId: string, callback?: LiveScoreCallback) {
    if (callback) {
      const callbacks = this.callbacks.get(matchId);
      if (callbacks) {
        callbacks.delete(callback);
        
        if (callbacks.size === 0) {
          this.disconnectAll(matchId);
        }
      }
    } else {
      this.disconnectAll(matchId);
    }
  }

  private disconnectAll(matchId: string) {
    console.log(`[LiveScore] Disconnecting from match ${matchId}`);

    const ws = this.connections.get(matchId);
    if (ws) {
      ws.close();
      this.connections.delete(matchId);
    }

    this.stopPolling(matchId);

    const timer = this.reconnectTimers.get(matchId);
    if (timer) {
      clearTimeout(timer);
      this.reconnectTimers.delete(matchId);
    }

    this.callbacks.delete(matchId);
    this.reconnectAttempts.delete(matchId);
  }

  disconnectAllMatches() {
    console.log("[LiveScore] Disconnecting all matches");
    
    this.connections.forEach((ws) => ws.close());
    this.connections.clear();

    this.pollingIntervals.forEach((interval) => clearInterval(interval));
    this.pollingIntervals.clear();

    this.reconnectTimers.forEach((timer) => clearTimeout(timer));
    this.reconnectTimers.clear();

    this.callbacks.clear();
    this.reconnectAttempts.clear();
  }

  async fetchScore(matchId: string): Promise<LiveScore | null> {
    return await this.fetchLiveScore(matchId);
  }
}

export const liveScoreService = new LiveScoreService();
