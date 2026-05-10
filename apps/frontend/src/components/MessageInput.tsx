import { useEffect, useRef, useState } from 'react';
import { CHAT_MESSAGE_MAX_LENGTH } from '@chatbot/shared';

type Props = {
  isSending: boolean;
  isHistoryLoading: boolean;
  onSendMessage: (message: string) => void;
};

export function MessageInput({ isSending, isHistoryLoading, onSendMessage }: Props) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const shouldRestoreFocusRef = useRef(false);
  const isEmpty = !value.trim();
  const isDisabled = isSending || isHistoryLoading;

  useEffect(() => {
    if (!isDisabled && shouldRestoreFocusRef.current) {
      shouldRestoreFocusRef.current = false;
      inputRef.current?.focus();
    }
  }, [isDisabled]);

  return (
    <form
      className="inputRow"
      onSubmit={(e) => {
        e.preventDefault();
        if (isEmpty || isDisabled) return;
        shouldRestoreFocusRef.current = true;
        onSendMessage(value);
        setValue('');
      }}
    >
      <input
        ref={inputRef}
        className="textInput"
        disabled={isDisabled}
        maxLength={CHAT_MESSAGE_MAX_LENGTH}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type your message..."
      />
      <button
        className="sendButton"
        type="submit"
        disabled={isDisabled || isEmpty}
        onMouseDown={(e) => e.preventDefault()}
      >
        {isSending ? 'Sending...' : 'Send'}
      </button>
    </form>
  );
}
