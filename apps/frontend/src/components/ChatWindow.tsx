import type { Message } from '@chatbot/shared';
import { useEffect, useRef } from 'react';
import { LoadingBubble } from './LoadingBubble';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';

type Props = {
  messages: Message[];
  isSending: boolean;
  isHistoryLoading: boolean;
  errorMessage: string | null;
  onSendMessage: (message: string) => void;
};

export function ChatWindow({
  messages,
  isSending,
  isHistoryLoading,
  errorMessage,
  onSendMessage,
}: Props) {
  const endOfMessagesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, isSending]);

  return (
    <div className="chatCard">
      <header className="chatHeader">
        <h1 className="chatTitle">Chatbot</h1>
        <p className="chatSubtitle">Simple keyword-based MVP</p>
      </header>

      <main className="chatMessages" aria-live="polite">
        {messages.length === 0 ? (
          isHistoryLoading ? (
            <LoadingBubble />
          ) : (
            <div className="emptyState">
              Send a message to start the conversation.
            </div>
          )
        ) : (
          messages.map((m) => <MessageBubble key={m.id} message={m} />)
        )}

        {isSending ? <LoadingBubble /> : null}
        <div ref={endOfMessagesRef} />
      </main>

      {errorMessage ? (
        <div className="errorBanner" role="alert">
          <div className="errorBannerTitle">An error has occurred</div>
          <div className="errorBannerMessage">{errorMessage}</div>
        </div>
      ) : null}

      <MessageInput
        isSending={isSending}
        isHistoryLoading={isHistoryLoading}
        onSendMessage={onSendMessage}
      />
    </div>
  );
}
