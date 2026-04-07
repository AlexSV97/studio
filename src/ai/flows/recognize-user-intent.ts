'use server';
/**
 * @fileOverview This file defines a Genkit flow to recognize user intent from a message.
 *
 * - recognizeUserIntent - A function that handles the user intent recognition process.
 * - RecognizeUserIntentInput - The input type for the recognizeUserIntent function.
 * - RecognizeUserIntentOutput - The return type for the recognizeUserIntent function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const RecognizeUserIntentInputSchema = z.object({
  message: z.string().describe('The user message to analyze for intent.'),
});
export type RecognizeUserIntentInput = z.infer<typeof RecognizeUserIntentInputSchema>;

const RecognizeUserIntentOutputSchema = z.object({
  intent: z.enum([
    'SAVE_NAME',
    'ASK_NAME',
    'SAVE_PREFERENCE',
    'ASK_PREFERENCE',
    'UNKNOWN',
  ]).describe('The recognized intent from the user message.'),
  data: z.object({
    name: z.string().optional().describe('The user\u0027s name, if the intent is to save it.'),
    preference: z.string().optional().describe('The user\u0027s preference, if the intent is to save it.'),
  }).optional().describe('Extracted data related to the intent, such as name or preference.'),
});
export type RecognizeUserIntentOutput = z.infer<typeof RecognizeUserIntentOutputSchema>;

export async function recognizeUserIntent(input: RecognizeUserIntentInput): Promise<RecognizeUserIntentOutput> {
  return recognizeUserIntentFlow(input);
}

const recognizeUserIntentPrompt = ai.definePrompt({
  name: 'recognizeUserIntentPrompt',
  input: { schema: RecognizeUserIntentInputSchema },
  output: { schema: RecognizeUserIntentOutputSchema },
  prompt: `You are an AI assistant designed to recognize user intent from their messages.
Your task is to classify the intent and extract any relevant information.

Here are the possible intents and how to identify them:

1.  **SAVE_NAME**: The user is providing their name.
    -   Example: "Me llamo Juan", "Mi nombre es Maria", "Soy Pedro"
    -   Extract the name into the 'name' field within the 'data' object.
2.  **ASK_NAME**: The user is asking for their own name.
    -   Example: "¿Cómo me llamo?", "¿Cuál es mi nombre?"
    -   No data to extract.
3.  **SAVE_PREFERENCE**: The user is stating a preference.
    -   Example: "Me gusta el fútbol", "Prefiero la música clásica", "Mi color favorito es azul"
    -   Extract the preference into the 'preference' field within the 'data' object.
4.  **ASK_PREFERENCE**: The user is asking for their own preference.
    -   Example: "¿Qué me gusta?", "¿Cuáles son mis preferencias?"
    -   No data to extract.
5.  **UNKNOWN**: The message does not fit into any of the above categories.
    -   Example: "Hola", "¿Qué hora es?", "Cuéntame un chiste"
    -   No data to extract.

Your output must be a JSON object matching the RecognizeUserIntentOutputSchema.

User message: {{{message}}}`,
});

const recognizeUserIntentFlow = ai.defineFlow(
  {
    name: 'recognizeUserIntentFlow',
    inputSchema: RecognizeUserIntentInputSchema,
    outputSchema: RecognizeUserIntentOutputSchema,
  },
  async (input) => {
    const { output } = await recognizeUserIntentPrompt(input);
    if (!output) {
      throw new Error('Failed to recognize user intent. The model did not return an output.');
    }
    return output;
  },
);
