import type { Message } from '@chatbot/shared';

type Props = {
  message: Message;
};

export function MessageBubble({ message }: Props) {
  const isUser = message.role === 'USER';

  return (
    <div className={isUser ? 'bubbleRow bubbleRowUser' : 'bubbleRow'}>
      <div className={isUser ? 'bubble bubbleUser' : 'bubble bubbleBot'}>
        {message.content}
      </div>
    </div>
  );
}
