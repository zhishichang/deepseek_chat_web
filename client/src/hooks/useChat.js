import { useState, useCallback, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import db from '../db';
import useSettings from './useSettings';
import useStreaming from './useStreaming';
import useOnlineStatus from './useOnlineStatus';
import { enqueue, drain } from '../utils/offlineQueue';

export default function useChat(conversationId) {
  const { settings } = useSettings();
  const { startStream, stopStream } = useStreaming();
  const online = useOnlineStatus();
  const [streamingContent, setStreamingContent] = useState('');
  const [streamingReasoning, setStreamingReasoning] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [retryAfter, setRetryAfter] = useState(null);
  const [lastUsage, setLastUsage] = useState(null);
  const usageRef = useRef(null);
  const lastUserContentRef = useRef(null);

  const messages = useLiveQuery(
    () => {
      if (!conversationId) return [];
      return db.messages
        .where('conversationId')
        .equals(conversationId)
        .sortBy('createdAt');
    },
    [conversationId],
    []
  );

  const sendApiRequest = useCallback(async (content, { skipSave } = {}) => {
    if (!conversationId || !content.trim() || isGenerating) return;

    setError(null);
    setRetryAfter(null);
    const now = new Date().toISOString();

    if (!skipSave) {
      await db.messages.add({
        conversationId,
        role: 'user',
        content: content.trim(),
        reasoningContent: '',
        createdAt: now,
        tokenCount: 0,
        isEdited: false,
        originalContent: '',
      });
      await db.conversations.update(conversationId, { updatedAt: now });
    }

    lastUserContentRef.current = content.trim();

    const conversation = await db.conversations.get(conversationId);
    const model = conversation?.model || settings.defaultModel;

    const allMessages = await db.messages
      .where('conversationId')
      .equals(conversationId)
      .sortBy('createdAt');

    const apiMessages = [];
    if (settings.systemPrompt) {
      apiMessages.push({ role: 'system', content: settings.systemPrompt });
    }
    for (const msg of allMessages) {
      apiMessages.push({ role: msg.role, content: msg.content });
    }

    setIsGenerating(true);
    setStreamingContent('');
    setStreamingReasoning('');
    usageRef.current = null;

    let accumulated = '';
    let accumulatedReasoning = '';

    await startStream(
      {
        model,
        messages: apiMessages,
        temperature: settings.temperature,
        max_tokens: settings.maxTokens,
        stream: settings.streamMode,
      },
      {
        onDelta: (delta, reasoning) => {
          if (reasoning) {
            accumulatedReasoning += reasoning;
            setStreamingReasoning(accumulatedReasoning);
          }
          if (delta) {
            accumulated += delta;
            setStreamingContent(accumulated);
          }
        },
        onUsage: (usage) => {
          usageRef.current = usage;
          setLastUsage(usage);
        },
        onDone: async () => {
          const assistantNow = new Date().toISOString();
          await db.messages.add({
            conversationId,
            role: 'assistant',
            content: accumulated,
            reasoningContent: accumulatedReasoning,
            createdAt: assistantNow,
            tokenCount: usageRef.current?.total_tokens || 0,
            isEdited: false,
            originalContent: '',
          });
          await db.conversations.update(conversationId, { updatedAt: assistantNow });

          setStreamingContent('');
          setStreamingReasoning('');
          setIsGenerating(false);
        },
        onError: (err) => {
          const retry = err?.retryAfter;
          setError(mapErrorMessage(err));
          if (retry) setRetryAfter(retry);
          setIsGenerating(false);
        },
      }
    );
  }, [conversationId, settings, startStream, isGenerating]);

  const sendMessage = useCallback(async (content) => {
    if (!online) {
      if (conversationId) {
        enqueue(conversationId, content);
        setError('当前离线，消息将在恢复网络后自动发送');
      }
      return;
    }
    await sendApiRequest(content);
  }, [online, sendApiRequest, conversationId]);

  const retryLast = useCallback(async () => {
    if (!lastUserContentRef.current) return;

    // Delete the failed assistant message if it exists (empty content from error)
    const allMsgs = await db.messages
      .where('conversationId')
      .equals(conversationId)
      .sortBy('createdAt');
    const lastAssistant = [...allMsgs].reverse().find((m) => m.role === 'assistant');
    if (lastAssistant && !lastAssistant.content) {
      await db.messages.delete(lastAssistant.id);
    }

    await sendApiRequest(lastUserContentRef.current, { skipSave: true });
  }, [conversationId, sendApiRequest]);

  const stop = useCallback(async () => {
    stopStream();
    setIsGenerating(false);
  }, [stopStream]);

  const regenerate = useCallback(async () => {
    if (!conversationId) return;

    const allMsgs = await db.messages
      .where('conversationId')
      .equals(conversationId)
      .sortBy('createdAt');

    const lastAssistant = [...allMsgs].reverse().find((m) => m.role === 'assistant');
    if (lastAssistant) {
      await db.messages.delete(lastAssistant.id);
    }

    const lastUser = [...allMsgs].reverse().find((m) => m.role === 'user');
    if (lastUser) {
      await sendApiRequest(lastUser.content, { skipSave: true });
    }
  }, [conversationId, sendApiRequest]);

  const editMessage = useCallback(async (messageId, newContent) => {
    if (!conversationId || !newContent.trim()) return;

    const msg = await db.messages.get(messageId);
    if (!msg || msg.role !== 'user') return;

    await db.messages.update(messageId, {
      content: newContent.trim(),
      isEdited: true,
      originalContent: msg.originalContent || msg.content,
    });

    const allMsgs = await db.messages
      .where('conversationId')
      .equals(conversationId)
      .sortBy('createdAt');

    const msgsToDelete = allMsgs.filter((m) => m.createdAt > msg.createdAt);
    if (msgsToDelete.length > 0) {
      await db.messages.bulkDelete(msgsToDelete.map((m) => m.id));
    }

    await sendApiRequest(newContent.trim(), { skipSave: true });
  }, [conversationId, sendApiRequest]);

  const deleteMessage = useCallback(async (messageId) => {
    await db.messages.delete(messageId);
  }, []);

  return {
    messages: messages || [],
    streamingContent,
    streamingReasoning,
    isGenerating,
    error,
    retryAfter,
    online,
    sendMessage,
    stop,
    regenerate,
    retryLast,
    editMessage,
    deleteMessage,
    lastUsage,
  };
}

function mapErrorMessage(err) {
  if (!err) return '未知错误';
  const type = err.error;
  const msg = err.message || '';

  if (type === 'rate_limit') return '请求过于频繁，请稍后再试';
  if (type === 'auth') return 'API 密钥无效，请检查服务器配置';
  if (type === 'network') return '无法连接到 DeepSeek API，请检查网络';
  if (type === 'server') return 'DeepSeek 服务暂时不可用，请稍后再试';
  if (type === 'validation') return `请求参数错误：${msg}`;
  return msg || '请求失败，请重试';
}
