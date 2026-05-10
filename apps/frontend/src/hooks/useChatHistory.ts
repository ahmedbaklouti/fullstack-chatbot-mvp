import { useQuery } from '@tanstack/react-query';
import type { Message } from '@chatbot/shared';
import { fetchChatHistory } from '../api/chatApi';

// Single, stable key for history to keep caching/invalidation straightforward.
export const chatHistoryQueryKey = ['chat-history'] as const;

export function useChatHistory() {
  return useQuery<Message[], Error>({
    queryKey: chatHistoryQueryKey,
    queryFn: () => fetchChatHistory(),
    // By default React Query pauses queries when offline. For this MVP we prefer:
    // - fail fast with a clear error message (so the UI isn't stuck in loading)
    networkMode: 'always',
  });
}
