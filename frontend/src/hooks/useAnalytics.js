/**
 * useAnalytics.js
 *
 * Fetches live analytics from the backend when available.
 * Falls back gracefully to the local Zustand store so the UI
 * always has data to show even without a running backend.
 */
import { useAnalyticsSummary, useHeatmap } from "./useApi";
import { useGuardianStore } from "./useGuardianStore";

export function useAnalytics() {
  const { data: summary, isLoading, isError } = useAnalyticsSummary();
  const { data: heatmap }                      = useHeatmap();
  const localStats                             = useGuardianStore((s) => s.stats);

  // Merge: backend data wins, local store is the fallback
  const stats = isError || !summary
    ? {
        total:      localStats.total,
        threats:    localStats.threats,
        warned:     localStats.warned,
        safe:       localStats.safe,
        injections: localStats.injections,
        jailbreaks: localStats.jailbreaks,
        exfil:      localStats.exfil,
        toolAbuse:  localStats.toolAbuse,
        by_type:    [],
      }
    : {
        ...summary,
        injections: localStats.injections,
        jailbreaks: localStats.jailbreaks,
        exfil:      localStats.exfil,
        toolAbuse:  localStats.toolAbuse,
      };

  return {
    stats,
    heatmap:   heatmap?.heatmap ?? [],
    isLoading: isLoading && !localStats.total,
    fromBackend: !isError && !!summary,
  };
}
