/**
 * useApi.js — React Query hooks wrapping every backend API call.
 * Import individual hooks wherever you need live data.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  firewallAPI,
  actionsAPI,
  analyticsAPI,
  policiesAPI,
  auditAPI,
  agentsAPI,
  trustAPI,
  ragAPI,
  secretsAPI,
} from "@/services/api";

// ── Analytics ─────────────────────────────────────────────────────────────────
export function useAnalyticsSummary() {
  return useQuery({
    queryKey: ["analytics", "summary"],
    queryFn:  analyticsAPI.getSummary,
    refetchInterval: 30_000,
    retry: 1,
  });
}

export function useAnalyticsTrends() {
  return useQuery({
    queryKey: ["analytics", "trends"],
    queryFn:  analyticsAPI.getTrends,
    refetchInterval: 60_000,
    retry: 1,
  });
}

export function useHeatmap() {
  return useQuery({
    queryKey: ["analytics", "heatmap"],
    queryFn:  analyticsAPI.getHeatmap,
    refetchInterval: 60_000,
    retry: 1,
  });
}

// ── Audit Logs ────────────────────────────────────────────────────────────────
export function useAuditLogs(params = {}) {
  return useQuery({
    queryKey: ["audit", params],
    queryFn:  () => auditAPI.list(params),
    keepPreviousData: true,
    retry: 1,
  });
}

// ── Policies ──────────────────────────────────────────────────────────────────
export function usePolicies() {
  return useQuery({
    queryKey: ["policies"],
    queryFn:  policiesAPI.list,
    staleTime: 10_000,
    retry: 1,
  });
}

export function useCreatePolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: policiesAPI.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["policies"] }),
  });
}

export function useTogglePolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, enabled }) => policiesAPI.toggle(id, enabled),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["policies"] }),
  });
}

export function useDeletePolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: policiesAPI.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["policies"] }),
  });
}

// ── Agents ────────────────────────────────────────────────────────────────────
export function useAgents() {
  return useQuery({
    queryKey: ["agents"],
    queryFn:  agentsAPI.list,
    staleTime: 30_000,
    retry: 1,
  });
}

export function useAgent(id) {
  return useQuery({
    queryKey: ["agents", id],
    queryFn:  () => agentsAPI.getById(id),
    enabled:  !!id,
    retry: 1,
  });
}

export function useAgentEvents(id) {
  return useQuery({
    queryKey: ["agents", id, "events"],
    queryFn:  () => agentsAPI.getEvents(id),
    enabled:  !!id,
    refetchInterval: 15_000,
    retry: 1,
  });
}

// ── Trust ─────────────────────────────────────────────────────────────────────
export function useTrustScore(agentId) {
  return useQuery({
    queryKey: ["trust", agentId],
    queryFn:  () => trustAPI.getScore(agentId),
    enabled:  !!agentId,
    staleTime: 30_000,
    retry: 1,
  });
}

// ── Firewall (mutation — not a persistent query) ───────────────────────────────
export function useAnalyzePrompt() {
  return useMutation({
    mutationFn: (prompt) => firewallAPI.analyze(prompt),
  });
}

// ── Action evaluation ─────────────────────────────────────────────────────────
export function useEvaluateAction() {
  return useMutation({
    mutationFn: ({ actionId, context }) => actionsAPI.evaluate(actionId, context),
  });
}

// ── RAG scan ──────────────────────────────────────────────────────────────────
export function useScanRAG() {
  return useMutation({
    mutationFn: ({ documents, query }) => ragAPI.scan(documents, query),
  });
}

// ── Secret scan ───────────────────────────────────────────────────────────────
export function useScanSecrets() {
  return useMutation({
    mutationFn: (text) => secretsAPI.scan(text),
  });
}
