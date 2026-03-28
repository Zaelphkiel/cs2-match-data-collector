
import createContextHook from "@nkzw/create-context-hook";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Match, MatchAnalysis } from "@/types/matches";
import { generateMatchAnalysis, mockMatches } from "@/mocks/matches";
import { trpc } from "@/lib/trpc";

export const [MatchesContext, useMatches] = createContextHook(() => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0] as string
  );
  const [filter, setFilter] = useState<"all" | "upcoming" | "live" | "finished">("all");

  const [backendAvailable, setBackendAvailable] = useState<boolean>(false);
  const [hasCheckedBackend, setHasCheckedBackend] = useState<boolean>(false);

  const matchesQuery = trpc.matches.all.useQuery(
    { date: selectedDate },
    {
      staleTime: 1000 * 30,
      refetchInterval: backendAvailable ? 1000 * 60 * 3 : false,
      retry: 1,
      retryDelay: 1000,
      enabled: !hasCheckedBackend,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    }
  );

  useEffect(() => {
    if (!hasCheckedBackend) {
      console.log('[MatchesContext] 🔍 Checking backend availability...');
      
      const hasData = matchesQuery.data && Array.isArray(matchesQuery.data) && matchesQuery.data.length > 0;
      const hasError = matchesQuery.error || matchesQuery.isError;
      const isDone = matchesQuery.status === 'success' || matchesQuery.status === 'error';
      
      if (hasData) {
        console.log('[MatchesContext] ✅ Backend available - using real matches:', matchesQuery.data.length);
        setBackendAvailable(true);
        setHasCheckedBackend(true);
        setMatches(matchesQuery.data);
      } else if (hasError || (isDone && !hasData)) {
        console.warn('[MatchesContext] ⚠️ Backend not available - using mock data');
        console.log('[MatchesContext] 💡 To enable backend, deploy your backend server');
        setBackendAvailable(false);
        setHasCheckedBackend(true);
        setMatches(mockMatches);
      }
    } else if (backendAvailable && matchesQuery.data && Array.isArray(matchesQuery.data)) {
      console.log('[MatchesContext] 🔄 Updating matches from backend:', matchesQuery.data.length);
      setMatches(matchesQuery.data);
    }
  }, [matchesQuery.data, matchesQuery.status, matchesQuery.isError, matchesQuery.error, backendAvailable, hasCheckedBackend]);

  const filteredMatches = useMemo(
    () =>
      matches.filter((match) => {
        if (filter === "all") return true;
        return match.status === filter;
      }),
    [matches, filter]
  );

  const getMatchById = useCallback(
    (id: string): Match | undefined => {
      return matches.find((match) => match.id === id);
    },
    [matches]
  );

  const getMatchAnalysis = useCallback(
    (matchId: string): MatchAnalysis => {
      const match = getMatchById(matchId);
      if (!match) {
        throw new Error("Match not found");
      }
      return generateMatchAnalysis(match);
    },
    [getMatchById]
  );

  return useMemo(
    () => ({
    matches: filteredMatches,
    isLoading: !hasCheckedBackend && matchesQuery.status === 'pending',
    error: matchesQuery.error,
    selectedDate,
    setSelectedDate,
    filter,
    setFilter,
    getMatchById,
    getMatchAnalysis,
      refetch: matchesQuery.refetch,
      backendAvailable,
    }),
    [
      filteredMatches,
      hasCheckedBackend,
      matchesQuery.status,
      matchesQuery.error,
      selectedDate,
      filter,
      getMatchById,
      getMatchAnalysis,
      matchesQuery.refetch,
      backendAvailable,
    ]
  );
});
