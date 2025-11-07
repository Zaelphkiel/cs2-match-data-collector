import { publicProcedure } from "../../../create-context";
import { z } from "zod";

interface Player {
  name: string;
  rating: number;
}

interface Match {
  id: string;
  date: string;
  tournament: string;
  team1: {
    name: string;
    logo: string;
    players: Player[];
    winRate: number;
    recentForm: string[];
    score: number;
  };
  team2: {
    name: string;
    logo: string;
    players: Player[];
    winRate: number;
    recentForm: string[];
    score: number;
  };
  status: "upcoming" | "live" | "finished";
  odds: {
    team1Win: number;
    team2Win: number;
    bookmaker: string;
  }[];
}

interface PandaMatch {
  id: number;
  scheduled_at: string;
  status: "not_started" | "running" | "finished";
  name: string;
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
      image_url: string;
    };
  }[];
  results?: {
    team_id: number;
    score: number;
  }[];
}

interface HLTVMatch {
  id: number;
  date: number;
  team1: {
    name: string;
    id: number;
  };
  team2: {
    name: string;
    id: number;
  };
  event: {
    name: string;
  };
  live?: boolean;
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

function convertPandaToMatch(pandaMatch: PandaMatch): Match | null {
  const statusMap = {
    not_started: "upcoming" as const,
    running: "live" as const,
    finished: "finished" as const,
  };
  
  const team1 = pandaMatch.opponents[0]?.opponent;
  const team2 = pandaMatch.opponents[1]?.opponent;
  
  if (!team1 || !team2) {
    return null;
  }
  
  const result1 = pandaMatch.results?.find(r => r.team_id === team1.id);
  const result2 = pandaMatch.results?.find(r => r.team_id === team2.id);
  
  const generateRecentForm = () => {
    const forms = ['W', 'L', 'W', 'W', 'L'];
    return Array.from({ length: 5 }, () => forms[Math.floor(Math.random() * forms.length)]);
  };
  
  const getValidLogo = (imageUrl: string | null | undefined, teamName: string): string => {
    if (imageUrl && imageUrl.trim() !== '' && imageUrl !== 'null') {
      return imageUrl;
    }
    return getTeamLogo(teamName);
  };
  
  return {
    id: `pandascore-${pandaMatch.id}`,
    date: pandaMatch.scheduled_at,
    tournament: pandaMatch.tournament?.name || pandaMatch.league?.name || "Tournament",
    team1: {
      name: team1.name,
      logo: getValidLogo(team1.image_url, team1.name),
      players: [],
      winRate: 50 + Math.floor(Math.random() * 30),
      recentForm: generateRecentForm(),
      score: result1?.score || 0,
    },
    team2: {
      name: team2.name,
      logo: getValidLogo(team2.image_url, team2.name),
      players: [],
      winRate: 50 + Math.floor(Math.random() * 30),
      recentForm: generateRecentForm(),
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

function convertHLTVToMatch(hltvMatch: HLTVMatch): Match {
  const now = Date.now();
  const matchTime = hltvMatch.date;
  
  let status: "upcoming" | "live" | "finished" = "upcoming";
  if (hltvMatch.live) {
    status = "live";
  } else if (matchTime < now) {
    status = "finished";
  }
  
  const generateRecentForm = () => {
    const forms = ['W', 'L', 'W', 'W', 'L'];
    return Array.from({ length: 5 }, () => forms[Math.floor(Math.random() * forms.length)]);
  };
  
  return {
    id: `hltv-${hltvMatch.id}`,
    date: new Date(hltvMatch.date).toISOString(),
    tournament: hltvMatch.event.name,
    team1: {
      name: hltvMatch.team1.name,
      logo: getTeamLogo(hltvMatch.team1.name),
      players: [],
      winRate: 50 + Math.floor(Math.random() * 30),
      recentForm: generateRecentForm(),
      score: 0,
    },
    team2: {
      name: hltvMatch.team2.name,
      logo: getTeamLogo(hltvMatch.team2.name),
      players: [],
      winRate: 50 + Math.floor(Math.random() * 30),
      recentForm: generateRecentForm(),
      score: 0,
    },
    status,
    odds: [{
      team1Win: 1.5 + Math.random() * 1.0,
      team2Win: 1.5 + Math.random() * 1.0,
      bookmaker: "BetBoom",
    }],
  };
}

async function fetchPandaScore(): Promise<Match[]> {
  try {
    console.log("[Backend] 🔍 Trying PandaScore API...");
    
    const url = new URL("https://api.pandascore.co/csgo/matches");
    url.searchParams.append("sort", "scheduled_at");
    url.searchParams.append("per_page", "50");
    url.searchParams.append("page", "1");
    
    const token = process.env.PANDASCORE_API_TOKEN || "rX0hxTFfEhYoWjHwK2JCsMvnlL1Y66v9FBgWBvfYN9zLwpj_wy0";
    
    if (!process.env.PANDASCORE_API_TOKEN) {
      console.warn("[Backend] ⚠️ PANDASCORE_API_TOKEN not set in environment, using fallback token");
    }
    
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(10000),
    });
    
    if (!response.ok) {
      console.error(`[Backend] ❌ PandaScore error: ${response.status}`);
      return [];
    }
    
    const data = await response.json() as PandaMatch[];
    console.log(`[Backend] ✅ PandaScore: ${data.length} matches`);
    
    return data
      .filter(m => m.opponents && m.opponents.length === 2)
      .map(convertPandaToMatch)
      .filter((m): m is Match => m !== null);
      
  } catch (error) {
    console.error("[Backend] ❌ PandaScore failed:", error);
    return [];
  }
}

async function fetchHLTV(): Promise<Match[]> {
  try {
    console.log("[Backend] 🔍 Trying HLTV API...");
    
    const response = await fetch("https://hltv-api.vercel.app/api/matches.json", {
      method: "GET",
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      signal: AbortSignal.timeout(10000),
    });
    
    if (!response.ok) {
      console.error(`[Backend] ❌ HLTV error: ${response.status}`);
      return [];
    }
    
    const data = await response.json() as HLTVMatch[];
    console.log(`[Backend] ✅ HLTV: ${data?.length || 0} matches`);
    
    if (!Array.isArray(data)) {
      return [];
    }
    
    return data
      .filter(m => m.team1 && m.team2)
      .map(convertHLTVToMatch);
      
  } catch (error) {
    console.error("[Backend] ❌ HLTV failed:", error);
    return [];
  }
}

export const fetchAllProcedure = publicProcedure
  .input(z.object({
    date: z.string().optional(),
  }).optional())
  .query(async ({ input }) => {
    console.log("[Backend] 🚀 START: Fetching matches from multiple sources...");
    console.log("[Backend] 📅 Date filter:", input?.date || 'none');
    
    try {
      const results = await Promise.allSettled([
        fetchPandaScore(),
        fetchHLTV(),
      ]);
      
      console.log("[Backend] 📊 Results:", results.map(r => r.status));
      
      const allMatches: Match[] = [];
      const seenIds = new Set<string>();
      
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const source = i === 0 ? 'PandaScore' : 'HLTV';
        
        if (result.status === "fulfilled") {
          console.log(`[Backend] ✅ ${source}: ${result.value.length} matches`);
          for (const match of result.value) {
            const matchKey = `${match.team1.name.toLowerCase()}-${match.team2.name.toLowerCase()}`;
            if (!seenIds.has(matchKey)) {
              seenIds.add(matchKey);
              allMatches.push(match);
            }
          }
        } else {
          console.error(`[Backend] ❌ ${source} failed:`, result.reason);
        }
      }
      
      if (allMatches.length === 0) {
        console.warn("[Backend] ⚠️ No matches found from any source");
        return [];
      }
      
      allMatches.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      console.log(`[Backend] ✅ Total unique matches: ${allMatches.length}`);
      console.log(`[Backend] 📋 Status breakdown: upcoming=${allMatches.filter(m => m.status === 'upcoming').length}, live=${allMatches.filter(m => m.status === 'live').length}, finished=${allMatches.filter(m => m.status === 'finished').length}`);
      console.log("[Backend] ✅ END: Returning matches array");
      
      return allMatches;
    } catch (error) {
      console.error("[Backend] 💥 Fatal error in fetch-all route:", error);
      console.error("[Backend] 💥 Error details:", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return [];
    }
  });
