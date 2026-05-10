import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ChatResponse, Message, MessageRole } from '@chatbot/shared';
import { sendChatMessage } from '../api/chatApi';
import { chatHistoryQueryKey } from './useChatHistory';

let localMessageSequence = 0;

function createLocalMessage(role: MessageRole, content: string): Message {
  localMessageSequence += 1;

  return {
    // Negative ids keep React keys stable for optimistic messages (real DB ids are positive).
    id: -Date.now() - localMessageSequence,
    role,
    content,
    createdAt: new Date().toISOString(),
  };
}

function appendToChatHistory(
  queryClient: ReturnType<typeof useQueryClient>,
  messagesToAppend: Message[],
) {
  queryClient.setQueryData<Message[]>(chatHistoryQueryKey, (previous = []) => [
    ...previous,
    ...messagesToAppend,
  ]);
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation<ChatResponse, Error, string, { previousMessages: Message[] }>(
    {
      mutationFn: (message) => sendChatMessage(message),
      // Fail fast when offline instead of staying "pending" forever (so the user sees an error).
      networkMode: 'always',
      // Avoid duplicate messages (mutations are side-effectful).
      retry: 0,
      onMutate: async (messageText) => {
        // Optimistic update: immediately append the user's message to the cached history.
        await queryClient.cancelQueries({ queryKey: chatHistoryQueryKey });

        const previousMessages =
          queryClient.getQueryData<Message[]>(chatHistoryQueryKey) ?? [];

        appendToChatHistory(queryClient, [createLocalMessage('USER', messageText)]);

        return { previousMessages };
      },
      onError: (_error, _message, context) => {
        if (!context) return;
        queryClient.setQueryData(chatHistoryQueryKey, context.previousMessages);
      },
      onSuccess: (data) => {
        appendToChatHistory(queryClient, [createLocalMessage('BOT', data.response)]);

        queryClient.invalidateQueries({ queryKey: chatHistoryQueryKey });
      },
    },
  );
}
