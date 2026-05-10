export function LoadingBubble() {
  return (
    <div className="bubbleRow">
      <div className="bubble bubbleBot" aria-label="Bot is thinking">
        <span className="loadingDots" aria-hidden="true">
          <span className="loadingDot" />
          <span className="loadingDot" />
          <span className="loadingDot" />
        </span>
      </div>
    </div>
  );
}

