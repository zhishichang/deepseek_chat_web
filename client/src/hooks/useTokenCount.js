import { useState, useEffect, useRef } from 'react';
import useSettings from './useSettings';

export default function useTokenCount(messages, lastUsage) {
  const { settings } = useSettings();
  const [estimated, setEstimated] = useState(0);
  const serverReportedRef = useRef(null);

  // Use server-reported usage as ground truth when available
  useEffect(() => {
    if (lastUsage?.prompt_tokens) {
      serverReportedRef.current = lastUsage.prompt_tokens;
    }
  }, [lastUsage]);

  // Estimate tokens from messages when they change
  useEffect(() => {
    if (!messages || messages.length === 0) {
      setEstimated(0);
      return;
    }

    // Rough estimation: ~4 chars per token + 4 overhead per message
    let count = 0;
    for (const msg of messages) {
      count += Math.ceil((msg.content?.length || 0) / 4) + 4;
    }
    if (settings.systemPrompt) {
      count += Math.ceil(settings.systemPrompt.length / 4) + 4;
    }
    setEstimated(count);
  }, [messages, settings.systemPrompt]);

  const maxTokens = settings.maxContextTokens || 65536;
  const usage = serverReportedRef.current || estimated;
  const percentage = Math.min((usage / maxTokens) * 100, 100);
  const isNearLimit = percentage >= 80;
  const isOverLimit = percentage >= 95;

  return {
    usage,
    estimated,
    serverReported: serverReportedRef.current,
    maxTokens,
    percentage,
    isNearLimit,
    isOverLimit,
  };
}
