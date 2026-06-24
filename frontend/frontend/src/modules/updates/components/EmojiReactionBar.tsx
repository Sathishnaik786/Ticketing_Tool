import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Smile } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface EmojiReactionBarProps {
    reactions: Record<string, string[]>;
    onReact: (emoji: string) => void;
    currentUserId: string;
}

const COMMON_EMOJIS = ['👍', '❤️', '🎉', '👀', '🚀', '🔥'];

export const EmojiReactionBar: React.FC<EmojiReactionBarProps> = ({
    reactions,
    onReact,
    currentUserId
}) => {
    return (
        <div className="flex flex-wrap items-center gap-2 mt-2">
            {Object.entries(reactions).map(([emoji, users]) => {
                if (users.length === 0) return null;
                const hasReacted = users.includes(currentUserId);
                return (
                    <button
                        key={emoji}
                        onClick={() => onReact(emoji)}
                        className={cn(
                            "flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold transition-all border",
                            hasReacted
                                ? "bg-primary/10 border-primary/20 text-primary"
                                : "bg-secondary/50 border-transparent text-muted-foreground hover:border-primary/10"
                        )}
                    >
                        <span>{emoji}</span>
                        <span>{users.length}</span>
                    </button>
                );
            })}

            <Popover>
                <PopoverTrigger asChild>
                    <button className="h-6 w-6 flex items-center justify-center rounded-full bg-secondary/30 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all border border-transparent hover:border-primary/10">
                        <Smile className="h-3 w-3" />
                    </button>
                </PopoverTrigger>
                <PopoverContent side="top" align="start" className="w-fit p-2 rounded-2xl border-primary/10 shadow-2xl backdrop-blur-xl bg-background/80">
                    <div className="flex gap-2">
                        {COMMON_EMOJIS.map(emoji => (
                            <button
                                key={emoji}
                                onClick={() => onReact(emoji)}
                                className="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-primary/10 transition-all text-lg hover:scale-110 active:scale-95"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
};
