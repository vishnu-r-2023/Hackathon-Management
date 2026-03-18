import { useEffect } from "react";

import { evaluationsApi } from "../services/api/evaluations.js";
import { useAsyncData } from "./useAsyncData.js";

export function useSubmissionEvaluations(submissionIds, options = {}) {
  const normalizedIds = [...new Set((submissionIds || []).filter(Boolean))];
  const idsKey = normalizedIds.join("|");

  const query = useAsyncData(
    async () => {
      const entries = await Promise.all(
        normalizedIds.map(async (submissionId) => {
          const response = await evaluationsApi.bySubmission(submissionId);
          return [submissionId, response.evaluations || []];
        })
      );

      return Object.fromEntries(entries);
    },
    [idsKey],
    {
      enabled: Boolean(idsKey),
      initialData: {},
      refreshInterval: options.refreshInterval,
    }
  );

  useEffect(() => {
    if (!idsKey) {
      query.setData({});
    }
  }, [idsKey, query.setData]);

  return {
    ...query,
    data: idsKey ? query.data || {} : {},
  };
}
