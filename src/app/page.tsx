import { ChatInterface } from '@/components/chat-interface';
import { Toaster } from '@/components/ui/toaster';

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-4xl space-y-8 animate-in fade-in duration-700">
        <header className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tight text-foreground">
            Memory<span className="text-primary">Pal</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto">
            Un chatbot inteligente que recuerda quién eres y qué te gusta, siempre disponible para conversar.
          </p>
        </header>
        
        <ChatInterface />
        
        <footer className="text-center text-sm text-muted-foreground pt-4">
          <p>Toda la información se guarda localmente en un archivo JSON.</p>
        </footer>
      </div>
      <Toaster />
    </main>
  );
}