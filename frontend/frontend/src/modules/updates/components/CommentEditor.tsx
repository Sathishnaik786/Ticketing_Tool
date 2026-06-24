import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, AtSign, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface UserSuggestion {
    id: string;
    name: string;
    profile_image: string;
    position?: string;
}

interface CommentEditorProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: (e?: React.FormEvent) => void;
    placeholder?: string;
    isSubmitting?: boolean;
    userCache: Record<string, UserSuggestion>;
    autoFocus?: boolean;
}

export const CommentEditor: React.FC<CommentEditorProps> = ({
    value,
    onChange,
    onSubmit,
    placeholder = "Write a comment...",
    isSubmitting = false,
    userCache,
    autoFocus = false
}) => {
    const [suggestionsOpen, setSuggestionsOpen] = useState(false);
    const [suggestionFilter, setSuggestionFilter] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    const users = Object.values(userCache);
    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(suggestionFilter.toLowerCase())
    ).slice(0, 5);

    useEffect(() => {
        if (suggestionFilter.length > 0 && filteredUsers.length > 0) {
            setSuggestionsOpen(true);
        } else {
            setSuggestionsOpen(false);
        }
    }, [suggestionFilter, filteredUsers.length]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (suggestionsOpen) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % filteredUsers.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + filteredUsers.length) % filteredUsers.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                handleSelectItem(filteredUsers[selectedIndex]);
            } else if (e.key === 'Escape') {
                setSuggestionsOpen(false);
            }
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        onChange(newValue);

        const cursorPosition = e.target.selectionStart || 0;
        const textBeforeCursor = newValue.substring(0, cursorPosition);
        const lastAtSymbol = textBeforeCursor.lastIndexOf('@');

        if (lastAtSymbol !== -1 && (lastAtSymbol === 0 || textBeforeCursor[lastAtSymbol - 1] === ' ')) {
            const query = textBeforeCursor.substring(lastAtSymbol + 1);
            setSuggestionFilter(query);
        } else {
            setSuggestionFilter('');
            setSuggestionsOpen(false);
        }
    };

    const handleSelectItem = (user: UserSuggestion) => {
        const cursorPosition = inputRef.current?.selectionStart || 0;
        const textBeforeCursor = value.substring(0, cursorPosition);
        const textAfterCursor = value.substring(cursorPosition);
        const lastAtSymbol = textBeforeCursor.lastIndexOf('@');

        const newValue =
            textBeforeCursor.substring(0, lastAtSymbol) +
            `@${user.name} ` +
            textAfterCursor;

        onChange(newValue);
        setSuggestionsOpen(false);
        setSuggestionFilter('');

        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus();
                const newPos = lastAtSymbol + user.name.length + 2;
                inputRef.current.setSelectionRange(newPos, newPos);
            }
        }, 10);
    };

    return (
        <div className="relative w-full group">
            <Popover open={suggestionsOpen} onOpenChange={setSuggestionsOpen}>
                <PopoverTrigger asChild>
                    <div className="w-full">
                        <Input
                            ref={inputRef}
                            value={value}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            placeholder={placeholder}
                            className="h-12 pl-4 pr-12 rounded-2xl border-primary/10 bg-background/50 focus-visible:ring-primary/20 focus-visible:bg-background transition-all"
                            disabled={isSubmitting}
                            autoFocus={autoFocus}
                        />
                    </div>
                </PopoverTrigger>
                <PopoverContent
                    className="p-1 w-64 rounded-2xl border-primary/10 shadow-2xl bg-background/80 backdrop-blur-xl"
                    align="start"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                >
                    <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border/50 mb-1 flex items-center gap-2">
                        <AtSign className="h-3 w-3" /> Mention User
                    </div>
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map((user, index) => (
                            <button
                                key={user.id}
                                onClick={() => handleSelectItem(user)}
                                className={cn(
                                    "w-full flex items-center gap-3 p-2 rounded-xl text-left transition-all",
                                    index === selectedIndex ? "bg-primary/10 text-primary" : "hover:bg-secondary/50"
                                )}
                            >
                                <Avatar className="h-8 w-8 ring-2 ring-background">
                                    <AvatarImage src={user.profile_image} />
                                    <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col overflow-hidden">
                                    <span className="text-xs font-bold truncate">{user.name}</span>
                                    <span className="text-[9px] text-muted-foreground truncate uppercase">{user.position || 'Team Member'}</span>
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="p-4 text-center text-xs text-muted-foreground italic">No users found</div>
                    )}
                </PopoverContent>
            </Popover>

            <div className="absolute right-2 top-1.5 flex items-center gap-1">
                <Button
                    onClick={() => onSubmit()}
                    size="icon"
                    disabled={isSubmitting || !value.trim()}
                    className="h-9 w-9 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95"
                >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
            </div>
        </div>
    );
};
