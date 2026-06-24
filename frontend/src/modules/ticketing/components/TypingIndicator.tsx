import * as React from 'react';

export interface TypingIndicatorProps {
  typingUsers: string[];
}

export function TypingIndicator({ typingUsers }: TypingIndicatorProps) {
  if (typingUsers.length === 0) return null;

  const namesLabel = React.useMemo(() => {
    if (typingUsers.length === 1) return `${typingUsers[0]} is typing`;
    if (typingUsers.length === 2) return `${typingUsers[0]} and ${typingUsers[1]} are typing`;
    return 'Multiple users are typing';
  }, [typingUsers]);

  return (
    <div className="flex items-center gap-2 p-2 bg-muted/25 border border-border/30 rounded-xl max-w-max animate-pulse">
      {/* Animated Bouncing Dots */}
      <div className="flex gap-1">
        <span className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce" />
      </div>
      <span className="text-[10px] font-bold text-muted-foreground tracking-tight leading-none pt-0.5">
        {namesLabel}...
      </span>
    </div>
  );
}
export default TypingIndicator;
