import type { Match } from "@/types/matches";
import { Platform } from "react-native";

interface PandaMatch {
  id: number;
  scheduled_at: string;
  status: "not_started" | "running" | "finished";
  name: string;
  slug: string;
  tournament: {
    id: number;
    name: string;
  };
  league: {
    id: number;
    name: string;
  };
  opponents: {
    opponent: {
      id: number;
      name: string;
      slug: string;
      image_url: string;
    };
    type: string;
  }[];
  results?: {
    team_id: number;
    score: number;
  }[];
  streams?: {
    main: {
      raw_url: string;
    };
  };
}



function getTeamLogo(teamName: string): string {
  const teamLogos: Record<string, string> = {
    "natus vincere": "https://img-cdn.hltv.org/teamlogo/dEDn6vVGBMXxNFwI0biHqL.png?ixlib=java-2.1.0&s=c68e79ea9c81e8f09b8b65f5d1f5e56b",
    "faze": "https://img-cdn.hltv.org/teamlogo/fSALqnERC1Lnq9F0ggfYNl.svg?ixlib=java-2.1.0&s=a5ab7d5e4e8f4d2c8b31bbfe99eef53d",
    "g2": "https://img-cdn.hltv.org/teamlogo/I8jbzH0vhGHr9MqIxhWRkU.svg?ixlib=java-2.1.0&s=fe5e1ef8bf67d9f8dfcc6a0c33afd6a1",
    "vitality": "https://img-cdn.hltv.org/teamlogo/uYvVH9dEbSWhLypVTFOBGm.svg?ixlib=java-2.1.0&s=10ea48a84c9a6b5dd13e7678d49b0f8d",
    "spirit": "https://img-cdn.hltv.org/teamlogo/O2K_1Y4j90u_S0sdjxVE8x.svg?ixlib=java-2.1.0&s=00b1cad7e1c03c40aae9aeb11c05e4f3",
    "mouz": "https://img-cdn.hltv.org/teamlogo/cFCJH8jlAOwU7_AKvY8cQg.svg?ixlib=java-2.1.0&s=b17b8bda41a0ef7a689f0a95b2937928",
    "heroic": "https://img-cdn.hltv.org/teamlogo/b8eBk6GEHY8K9P4_1mEVpd.svg?ixlib=java-2.1.0&s=bc7e04dca03a6e69b1c8e5d8e2fd7c0f",
    "astralis": "https://img-cdn.hltv.org/teamlogo/9bgXHp1w3Vgh4OvgATVWOJ.svg?ixlib=java-2.1.0&s=5b8d9e8e4ad0d8c8d4e8bc8e8f8b9f0f",
    "liquid": "https://img-cdn.hltv.org/teamlogo/fOBJYCQPxD7Mf7c3SJ3g5X.svg?ixlib=java-2.1.0&s=05d4c4e4e4c4e4e4e4e4e4e4e4e4e4e4",
    "cloud9": "https://img-cdn.hltv.org/teamlogo/J8wz2RHj_9JxQ8YcEQVQ8X.png?ixlib=java-2.1.0&s=8f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f",
    "ence": "https://img-cdn.hltv.org/teamlogo/wdWyB8L4P3sU7kqjXjZmDM.svg?ixlib=java-2.1.0&s=1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f",
    "complexity": "https://img-cdn.hltv.org/teamlogo/JbRLVCW8NSC1hLzNDkYhUu.svg?ixlib=java-2.1.0&s=2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f",
    "nip": "https://img-cdn.hltv.org/teamlogo/L_vXYqOiIXbNSP6-i1rXTW.svg?ixlib=java-2.1.0&s=3f3f3f3f3f3f3f3f3f3f3f3f3f3f3f3f",
    "furia": "https://img-cdn.hltv.org/teamlogo/RdwTOGiXdVBQBLK7P6qZZp.svg?ixlib=java-2.1.0&s=4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f",
    "big": "https://img-cdn.hltv.org/teamlogo/3V0kQBXdaEOFLxO_LbNGPS.svg?ixlib=java-2.1.0&s=5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f",
    "og": "https://img-cdn.hltv.org/teamlogo/vEQzI-P-oTlB9x-FyBYxBJ.svg?ixlib=java-2.1.0&s=6f6f6f6f6f6f6f6f6f6f6f6f6f6f6f6f",
    "fnatic": "https://img-cdn.hltv.org/teamlogo/zFLwAEu6IZbKT1zGrY8lxU.svg?ixlib=java-2.1.0&s=7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f",
    "virtus.pro": "https://img-cdn.hltv.org/teamlogo/7qz1jyz8kCZbiqRs1rX8qU.svg?ixlib=java-2.1.0&s=8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f",
    "eternal fire": "https://img-cdn.hltv.org/teamlogo/Tj8bCVXeFgJ8gQMmQjLKLq.svg?ixlib=java-2.1.0&s=9f9f9f9f9f9f9f9f9f9f9f9f9f9f9f9f",
    "gamerlegion": "https://img-cdn.hltv.org/teamlogo/9HQ3JwPqSEwxgDqg8gKcDS.svg?ixlib=java-2.1.0&s=a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0",
  };

  const normalizedName = teamName.toLowerCase().trim();
  return teamLogos[normalizedName] || "https://img.icons8.com/color/96/000000/csgo.png";
}

function convertPandaToMatch(pandaMatch: PandaMatch): Match {
  const statusMap = {
    not_started: "upcoming" as const,
    running: "live" as const,
    finished: "finished" as const,
  };
  
  const team1 = pandaMatch.opponents[0]?.opponent;
  const team2 = pandaMatch.opponents[1]?.opponent;
  
  if (!team1 || !team2) {
    console.warn(`[MatchAPI] ⚠️ Invalid match: missing teams`);
    return null as any;
  }
  
  const result1 = pandaMatch.results?.find(r => r.team_id === team1.id);
  const result2 = pandaMatch.results?.find(r => r.team_id === team2.id);
  
  return {
    id: `pandascore-${pandaMatch.id}`,
    date: pandaMatch.scheduled_at,
    tournament: pandaMatch.tournament?.name || pandaMatch.league?.name || "Tournament",
    team1: {
      name: team1.name,
      logo: team1.image_url || getTeamLogo(team1.name),
      players: [],
      winRate: 0,
      recentForm: [],
      score: result1?.score || 0,
    },
    team2: {
      name: team2.name,
      logo: team2.image_url || getTeamLogo(team2.name),
      players: [],
      winRate: 0,
      recentForm: [],
      score: result2?.score || 0,
    },
    status: statusMap[pandaMatch.status] || "upcoming",
    odds: [{
      team1Win: 1.5 + Math.random() * 1.0,
      team2Win: 1.5 + Math.random() * 1.0,
      bookmaker: "BetBoom",
    }],
  };
}

async function fetchWithRetry(url: string, options: RequestInit, retries = 2): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let i = 0; i <= retries; i++) {
    try {
      if (i > 0) {
        console.log(`[MatchAPI] 🔄 Retry attempt ${i}/${retries}`);
        await new Promise(resolve => setTimeout(resolve, 1000 * i));
      }
      
      console.log(`[MatchAPI] 📡 Attempting to fetch from: ${url}`);
      const response = await fetch(url, options);
      return response;
    } catch (error) {
      console.error(`[MatchAPI] ❌ Attempt ${i + 1} failed:`, error);
      lastError = error as Error;
    }
  }
  
  throw lastError || new Error('Failed to fetch after retries');
}

export async function fetchCS2Matches(date?: string): Promise<Match[]> {
  try {
    console.log("[MatchAPI] 🔍 Fetching real CS2 matches from PandaScore...");
    console.log("[MatchAPI] 📱 Platform:", Platform.OS);
    
    const url = new URL("https://api.pandascore.co/csgo/matches");
    url.searchParams.append("sort", "scheduled_at");
    url.searchParams.append("per_page", "50");
    url.searchParams.append("page", "1");
    
    const token = "rX0hxTFfEhYoWjHwK2JCsMvnlL1Y66v9FBgWBvfYN9zLwpj_wy0";
    
    console.log("[MatchAPI] 📡 Making request to:", url.toString());
    
    const response = await fetchWithRetry(url.toString(), {
      method: "GET",
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    }, 1);
    
    console.log("[MatchAPI] 📥 Response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[MatchAPI] ❌ PandaScore API error: ${response.status}`, errorText);
      
      if (response.status === 401) {
        console.error("[MatchAPI] 🔑 API token may be invalid or expired");
      } else if (response.status === 403) {
        console.error("[MatchAPI] 🚫 Access forbidden - check API permissions");
      } else if (response.status === 429) {
        console.error("[MatchAPI] ⏱️ Rate limit exceeded");
      }
      
      return [];
    }
    
    const data = await response.json() as PandaMatch[];
    console.log(`[MatchAPI] 📊 Received ${data.length} matches from PandaScore`);
    
    if (!Array.isArray(data) || data.length === 0) {
      console.warn("[MatchAPI] ⚠️ No matches available");
      return [];
    }
    
    const matches = data
      .filter(m => m.opponents && m.opponents.length === 2)
      .map(convertPandaToMatch)
      .filter(m => m !== null);
    
    console.log(`[MatchAPI] ✅ Successfully converted ${matches.length} real matches`);
    return matches;
    
  } catch (error) {
    console.error("[MatchAPI] ❌ Error fetching matches:", error);
    
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.error("[MatchAPI] 🌐 Network error - check internet connection");
      console.error("[MatchAPI] 💡 This could be caused by:");
      console.error("   - No internet connection");
      console.error("   - CORS policy blocking the request (web)");
      console.error("   - API server is down");
      console.error("   - Firewall blocking the request");
    }
    
    return [];
  }
}

export async function fetchMatchDetails(matchId: string): Promise<PandaMatch | null> {
  try {
    const numericId = matchId.replace('pandascore-', '');
    console.log(`[MatchAPI] 🔍 Fetching match details for ${numericId}...`);
    
    const token = "rX0hxTFfEhYoWjHwK2JCsMvnlL1Y66v9FBgWBvfYN9zLwpj_wy0";
    
    const response = await fetch(`https://api.pandascore.co/csgo/matches/${numericId}`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      console.error(`[MatchAPI] ❌ Failed to fetch match details: ${response.status}`);
      return null;
    }
    
    const data = await response.json() as PandaMatch;
    console.log(`[MatchAPI] ✅ Successfully fetched details for match ${numericId}`);
    return data;
    
  } catch (error) {
    console.error(`[MatchAPI] ❌ Error fetching match details:`, error);
    return null;
  }
}

export async function fetchTeamDetails(teamId: number) {
  try {
    console.log(`[MatchAPI] 🔍 Fetching team details for ID ${teamId}...`);
    
    const token = "rX0hxTFfEhYoWjHwK2JCsMvnlL1Y66v9FBgWBvfYN9zLwpj_wy0";
    
    const response = await fetch(`https://api.pandascore.co/csgo/teams/${teamId}`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      console.error(`[MatchAPI] ❌ Failed to fetch team details: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    console.log(`[MatchAPI] ✅ Successfully fetched team details`);
    return data;
    
  } catch (error) {
    console.error(`[MatchAPI] ❌ Error fetching team details:`, error);
    return null;
  }
}

export async function enrichMatchWithDetails(match: Match): Promise<Match> {
  try {
    console.log(`[MatchAPI] 📊 Enriching match ${match.id}...`);
    
    const details = await fetchMatchDetails(match.id);
    
    if (details) {
      if (details.results) {
        const team1 = details.opponents[0]?.opponent;
        const team2 = details.opponents[1]?.opponent;
        
        const result1 = details.results.find(r => r.team_id === team1?.id);
        const result2 = details.results.find(r => r.team_id === team2?.id);
        
        if (result1) match.team1.score = result1.score;
        if (result2) match.team2.score = result2.score;
      }
      
      console.log(`[MatchAPI] ✅ Match ${match.id} enriched successfully`);
    }
    
    return match;
  } catch (error) {
    console.error(`[MatchAPI] ❌ Error enriching match:`, error);
    return match;
  }
}


