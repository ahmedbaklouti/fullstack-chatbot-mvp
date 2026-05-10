import { ChatWindow } from './components/ChatWindow';
import { CHAT_MESSAGE_MAX_LENGTH } from '@chatbot/shared';
import { useChatHistory } from './hooks/useChatHistory';
import { useSendMessage } from './hooks/useSendMessage';
import './App.css';

export default function App() {
  const chatHistoryQuery = useChatHistory();
  const sendMessageMutation = useSendMessage();

  const messages = chatHistoryQuery.data ?? [];
  const isHistoryLoading = chatHistoryQuery.isLoading;
  const isSending = sendMessageMutation.isPending;

  const errorMessage =
    (chatHistoryQuery.error instanceof Error
      ? chatHistoryQuery.error.message
      : null) ??
    (sendMessageMutation.error instanceof Error
      ? sendMessageMutation.error.message
      : null);

  return (
    <div className="page">
      <ChatWindow
        messages={messages}
        isSending={isSending}
        isHistoryLoading={isHistoryLoading}
        errorMessage={errorMessage}
        onSendMessage={(message) => {
          if (isHistoryLoading) return;
          const messageText = message.trim();
          if (!messageText) return;
          if (messageText.length > CHAT_MESSAGE_MAX_LENGTH) return;
          sendMessageMutation.mutate(messageText);
        }}
      />
    </div>
  );
}
