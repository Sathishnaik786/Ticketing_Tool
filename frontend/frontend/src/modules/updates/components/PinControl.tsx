import React from 'react';
import { Button } from '@/components/ui/button';
import { Pin, PinOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface PinControlProps {
    isPinned: boolean;
    onPin: () => void;
    canPin: boolean;
    className?: string;
}

export const PinControl: React.FC<PinControlProps> = ({
    isPinned,
    onPin,
    canPin,
    className
}) => {
    if (!canPin) return null;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onPin}
                        className={cn(
                            "h-6 w-6 p-0 rounded-lg transition-all",
                            isPinned
                                ? "text-amber-500 bg-amber-500/10 hover:bg-amber-500/20"
                                : "text-muted-foreground/40 hover:text-amber-500 hover:bg-amber-500/5",
                            className
                        )}
                    >
                        {isPinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p className="text-[10px] font-bold uppercase tracking-widest">
                        {isPinned ? 'Unpin Comment' : 'Pin to Top'}
                    </p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};
