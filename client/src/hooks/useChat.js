import { useState, useCallback, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import db from '../db';
import useSettings from './useSettings';
import useStreaming from './useStreaming';

export default function useChat(conversationId) {
  const { settings } = useSettings();
  const { startStream, stopStream } = useStreaming();
  const [streamingContent, setStreamingContent] = useState('');
  const [streamingReasoning, setStreamingReasoning] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [lastUsage, setLastUsage] = useState(null);
  const usageRef = useRef(null);

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

  const sendMessage = useCallback(async (content) => {
    if (!conversationId || !content.trim() || isGenerating) return;

    setError(null);
    const now = new Date().toISOString();

    // Save user message
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

    // Update conversation updatedAt
    await db.conversations.update(conversationId, { updatedAt: now });

    // Get conversation for model
    const conversation = await db.conversations.get(conversationId);
    const model = conversation?.model || settings.defaultModel;

    // Build messages array for API
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

    // Start streaming
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
        onDelta: (content, reasoning) => {
          if (reasoning) {
            accumulatedReasoning += reasoning;
            setStreamingReasoning(accumulatedReasoning);
          }
          if (content) {
            accumulated += content;
            setStreamingContent(accumulated);
          }
        },
        onUsage: (usage) => {
          usageRef.current = usage;
          setLastUsage(usage);
        },
        onDone: async () => {
          // Save assistant message
          const assistantNow = new Date().toISOString();
          const msgData = {
            conversationId,
            role: 'assistant',
            content: accumulated,
            reasoningContent: accumulatedReasoning,
            createdAt: assistantNow,
            tokenCount: usageRef.current?.total_tokens || 0,
            isEdited: false,
            originalContent: '',
          };
          await db.messages.add(msgData);
          await db.conversations.update(conversationId, { updatedAt: assistantNow });

          setStreamingContent('');
          setStreamingReasoning('');
          setIsGenerating(false);
        },
        onError: (err) => {
          setError(err?.message || 'Unknown error');
          setIsGenerating(false);
        },
      }
    );
  }, [conversationId, settings, startStream]);

  const stop = useCallback(() => {
    stopStream();
    setIsGenerating(false);
  }, [stopStream]);

  const regenerate = useCallback(async () => {
    if (!conversationId) return;

    // Delete last assistant message
    const allMsgs = await db.messages
      .where('conversationId')
      .equals(conversationId)
      .sortBy('createdAt');

    const lastAssistant = [...allMsgs].reverse().find((m) => m.role === 'assistant');
    if (lastAssistant) {
      await db.messages.delete(lastAssistant.id);
    }

    // Find last user message and resend
    const lastUser = [...allMsgs].reverse().find((m) => m.role === 'user');
    if (lastUser) {
      await sendMessage(lastUser.content);
    }
  }, [conversationId, sendMessage]);

  const editMessage = useCallback(async (messageId, newContent) => {
    if (!conversationId || !newContent.trim()) return;

    const msg = await db.messages.get(messageId);
    if (!msg || msg.role !== 'user') return;

    // Save original content and update
    await db.messages.update(messageId, {
      content: newContent.trim(),
      isEdited: true,
      originalContent: msg.originalContent || msg.content,
    });

    // Delete all messages after this one in the conversation
    const allMsgs = await db.messages
      .where('conversationId')
      .equals(conversationId)
      .sortBy('createdAt');

    const msgsToDelete = allMsgs.filter((m) => m.createdAt > msg.createdAt);
    if (msgsToDelete.length > 0) {
      await db.messages.bulkDelete(msgsToDelete.map((m) => m.id));
    }

    // Resend with updated context
    await sendMessage(newContent.trim());
  }, [conversationId, sendMessage]);

  const deleteMessage = useCallback(async (messageId) => {
    await db.messages.delete(messageId);
  }, []);

  return {
    messages: messages || [],
    streamingContent,
    streamingReasoning,
    isGenerating,
    error,
    sendMessage,
    stop,
    regenerate,
    editMessage,
    deleteMessage,
    lastUsage,
  };
}
