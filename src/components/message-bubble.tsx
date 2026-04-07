'use client';

import { cn } from '@/lib/utils';
import { User, Cpu } from 'lucide-react';

interface MessageBubbleProps {
  role: 'user' | 'bot';
  content: string;
}

export function MessageBubble({ role, content }: MessageBubbleProps) {
  const isUser = role === 'user';

  return (
    <div
      className={cn(
        'flex w-full mb-4 animate-message-in',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'flex max-w-[85%] md:max-w-[70%] gap-3 items-end',
          isUser ? 'flex-row-reverse' : 'flex-row'
        )}
      >
        <div
          className={cn(
            'flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full border shadow-sm',
            isUser ? 'bg-accent text-accent-foreground' : 'bg-white text-primary'
          )}
        >
          {isUser ? <User className="h-4 w-4" /> : <Cpu className="h-4 w-4" />}
        </div>
        <div
          className={cn(
            'relative rounded-2xl px-4 py-3 text-sm shadow-sm transition-all',
            isUser
              ? 'bg-primary text-primary-foreground rounded-br-none'
              : 'bg-white text-foreground border border-border rounded-bl-none'
          )}
        >
          <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
        </div>
      </div>
    </div>
  );
}