import { cn } from "@/lib/utils";

interface RichTextDisplayProps {
    content: string | undefined;
    className?: string;
    fallback?: string;
}

export const RichTextDisplay = ({ content, className, fallback }: RichTextDisplayProps) => {
    if (!content || content.trim() === '' || content === '<p></p>') {
        return <p className={cn("text-sm text-muted-foreground italic", className)}>{fallback || "No content provided."}</p>;
    }

    // Simple heuristic: if it contains any HTML tags, treat as HTML
    const isHtml = /<[a-z][\s\S]*>/i.test(content);

    if (isHtml) {
        return (
            <div
                className={cn(
                    "prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-li:my-0",
                    className
                )}
                dangerouslySetInnerHTML={{ __html: content }}
            />
        );
    }

    return <p className={cn("text-sm whitespace-pre-wrap leading-relaxed", className)}>{content}</p>;
};
