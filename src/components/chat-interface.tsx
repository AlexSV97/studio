'use client';

import React, { useState, useRef, useEffect } from 'react';
import { SendHorizontal, Trash2, Brain, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { MessageBubble } from './message-bubble';
import { processChatMessage, resetMemoryAction, ChatMessage } from '@/app/actions/chat';
import { useToast } from '@/hooks/use-toast';

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'bot',
      content: '¡Hola! Soy MemoryPal. Puedo recordar tu nombre y tus preferencias. ¿Cómo te llamas o qué te gusta?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: userMessage, timestamp: new Date() },
    ]);
    setIsLoading(true);

    try {
      const response = await processChatMessage(userMessage);
      setMessages((prev) => [
        ...prev,
        { role: 'bot', content: response, timestamp: new Date() },
      ]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo procesar el mensaje.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetMemory = async () => {
    try {
      const response = await resetMemoryAction();
      setMessages([{ role: 'bot', content: response, timestamp: new Date() }]);
      toast({
        title: 'Memoria limpia',
        description: 'He olvidado toda la información guardada.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo borrar la memoria.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto h-[85vh] flex flex-col shadow-2xl border-none bg-background/50 backdrop-blur-sm overflow-hidden rounded-[2rem]">
      <CardHeader className="border-b bg-white/80 py-4 flex flex-row items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-xl">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl font-headline font-bold text-primary">MemoryPal</CardTitle>
            <p className="text-xs text-muted-foreground font-medium">Asistente con memoria persistente</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleResetMemory}
          className="rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
          title="Borrar memoria"
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </CardHeader>

      <CardContent 
        ref={scrollAreaRef}
        className="flex-1 overflow-y-auto p-6 chat-scrollbar bg-transparent space-y-2"
      >
        {messages.map((msg, index) => (
          <MessageBubble key={index} role={msg.role} content={msg.content} />
        ))}
        {isLoading && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-white border border-border rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 bg-white/80 border-t">
        <form onSubmit={handleSend} className="flex w-full gap-2 items-center">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe un mensaje... (ej: Me llamo Juan)"
            className="flex-1 bg-background border-border/50 focus-visible:ring-primary rounded-xl h-12 px-4 shadow-sm"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={!input.trim() || isLoading}
            className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/90 shadow-lg transition-all active:scale-95"
          >
            <SendHorizontal className="h-5 w-5" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}