'use server';

import { recognizeUserIntent } from '@/ai/flows/recognize-user-intent';
import { extractAndRecallName } from '@/ai/flows/extract-and-recall-name';
import { extractAndRecallPreference } from '@/ai/flows/extract-and-recall-preference';
import { loadMemory, saveMemory, clearMemory as clearFileMemory } from '@/lib/memory';

export type ChatMessage = {
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
};

export async function processChatMessage(message: string): Promise<string> {
  try {
    // 1. Recognize intent
    const { intent } = await recognizeUserIntent({ message });

    // 2. Load current memory
    const memory = await loadMemory();

    // 3. Handle intents
    switch (intent) {
      case 'SAVE_NAME': {
        const { extractedName } = await extractAndRecallName({ message });
        if (extractedName) {
          memory.name = extractedName;
          await saveMemory(memory);
          return `¡Hola ${extractedName}! He guardado tu nombre en mi memoria.`;
        }
        return 'Entendido, pero no pude captar tu nombre claramente. ¿Podrías repetirlo?';
      }

      case 'ASK_NAME': {
        if (memory.name) {
          return `Tu nombre es ${memory.name}. ¡Es un placer saludarte de nuevo!`;
        }
        return 'Aún no me has dicho cómo te llamas. ¿Cómo te gustaría que te llame?';
      }

      case 'SAVE_PREFERENCE':
      case 'ASK_PREFERENCE': {
        const { response } = await extractAndRecallPreference({ message });
        return response;
      }

      case 'UNKNOWN':
      default: {
        // Use the preference flow as it handles generic conversational fallback
        const { response } = await extractAndRecallPreference({ message });
        return response;
      }
    }
  } catch (error) {
    console.error('Chat processing error:', error);
    return 'Lo siento, tuve un pequeño problema procesando tu mensaje. ¿Podrías intentarlo de nuevo?';
  }
}

export async function resetMemoryAction() {
  await clearFileMemory();
  return 'He borrado todo lo que recordaba sobre ti.';
}