'use server';
/**
 * @fileOverview A Genkit flow for managing user preferences.
 *
 * - extractAndRecallPreference - A function that processes user messages to store or recall preferences.
 * - ExtractAndRecallPreferenceInput - The input type for the extractAndRecallPreference function.
 * - ExtractAndRecallPreferenceOutput - The return type for the extractAndRecallPreference function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import * as fs from 'fs/promises';
import path from 'path';

// --- Memory Management Setup ---
// Define a consistent path for the memory file.
// In a real application, consider a more robust database or cloud storage.
const MEMORY_FILE_PATH = path.join(process.cwd(), 'user-memory.json'); // Places it in the project root

interface UserMemory {
  preference: string | null;
  name: string | null; // Placeholder for future implementation of name storage
}

/**
 * Loads the user memory from a JSON file.
 * If the file does not exist, it returns an empty memory object.
 */
async function loadMemory(): Promise<UserMemory> {
  try {
    const data = await fs.readFile(MEMORY_FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if ((error as any).code === 'ENOENT') {
      return { preference: null, name: null };
    }
    console.error(`Error loading user memory from ${MEMORY_FILE_PATH}:`, error);
    throw new Error('Failed to load user memory.');
  }
}

/**
 * Saves the user memory to a JSON file.
 * @param memory The UserMemory object to save.
 */
async function saveMemory(memory: UserMemory): Promise<void> {
  try {
    await fs.writeFile(MEMORY_FILE_PATH, JSON.stringify(memory, null, 2), 'utf8');
  } catch (error) {
    console.error(`Error saving user memory to ${MEMORY_FILE_PATH}:`, error);
    throw new Error('Failed to save user memory.');
  }
}
// --- End Memory Management Setup ---


// --- Genkit Tools ---

/**
 * Genkit Tool to save a user's preference to persistent memory.
 */
const saveUserPreferenceTool = ai.defineTool(
  {
    name: 'saveUserPreference',
    description: 'Saves the user\u0027s preference to a persistent memory file.',
    inputSchema: z.object({
      preference: z.string().describe("The user's preference to save."),
    }),
    outputSchema: z.boolean().describe('True if the preference was saved successfully, false otherwise.'),
  },
  async (input) => {
    try {
      const memory = await loadMemory();
      memory.preference = input.preference;
      await saveMemory(memory);
      return true;
    } catch (e) {
      console.error('Error saving preference:', e);
      return false;
    }
  }
);

/**
 * Genkit Tool to retrieve a user's stored preference from persistent memory.
 */
const getUserPreferenceTool = ai.defineTool(
  {
    name: 'getUserPreference',
    description: 'Retrieves the user\u0027s stored preference from the memory file.',
    inputSchema: z.object({}).describe('No input needed for retrieving preference.'),
    outputSchema: z.string().nullable().describe('The user\u0027s preference as a string, or null if no preference is stored.'),
  },
  async () => {
    try {
      const memory = await loadMemory();
      return memory.preference;
    } catch (e) {
      console.error('Error getting preference:', e);
      return null;
    }
  }
);
// --- End Genkit Tools ---


// --- Genkit Schemas ---
const ExtractAndRecallPreferenceInputSchema = z.object({
  message: z.string().describe('The user\u0027s message to the chatbot.'),
});
export type ExtractAndRecallPreferenceInput = z.infer<typeof ExtractAndRecallPreferenceInputSchema>;

const ExtractAndRecallPreferenceOutputSchema = z.object({
  response: z.string().describe('The chatbot\u0027s response to the user.'),
});
export type ExtractAndRecallPreferenceOutput = z.infer<typeof ExtractAndRecallPreferenceOutputSchema>;
// --- End Genkit Schemas ---


// --- Genkit Prompt Definition ---
const preferenceChatPrompt = ai.definePrompt({
  name: 'preferenceChatPrompt',
  input: {
    schema: ExtractAndRecallPreferenceInputSchema,
  },
  output: {
    schema: z.string().describe('The chatbot\u0027s response integrating any tool results.'),
  },
  tools: [saveUserPreferenceTool, getUserPreferenceTool],
  prompt: `You are a helpful chatbot named MemoryPal designed to remember user preferences.\nYou can save a user\u0027s preference and recall it later.\n\nHere\u0027s how to interact:\n- If the user says something like "Me gusta [algo]", you should use the 'saveUserPreference' tool with "[algo]" as the preference. Then, respond by confirming the preference.\n- If the user asks "¿Qué me gusta?", you should use the 'getUserPreference' tool. Then, respond with the recalled preference. If no preference is stored, state that.\n- For any other message, provide a polite, neutral response that reminds the user about your capability to save and recall preferences.\n\nExamples:\n\nUser: "Me gusta el helado de fresa"\nAssistant:\n{{set "saveSuccess" (call saveUserPreferenceTool preference='el helado de fresa')}}\n{{#if saveSuccess}}¡Entendido! Recordaré que te gusta el helado de fresa.{{else}}Lo siento, tuve un problema para recordar eso.{{/if}}\n\nUser: "¿Qué me gusta?"\nAssistant:\n{{set "preferenceResult" (call getUserPreferenceTool)}}\n{{#if preferenceResult}}\nTe gusta {{preferenceResult}}.\n{{else}}\nAún no me has dicho qué te gusta.\n{{/if}}\n\nUser: "Hola"\nAssistant:\nHola, soy MemoryPal. Puedo recordar tus preferencias. ¿Hay algo que te guste que deba recordar?\n\nUser: "Cuéntame un chiste"\nAssistant:\nLo siento, mi función principal es recordar tus preferencias. ¿Hay algo que te guste que deba guardar en mi memoria?\n\nUser: "{{{message}}}"\nAssistant:\n`,
});
// --- End Genkit Prompt Definition ---


// --- Genkit Flow Definition ---
const extractAndRecallPreferenceFlow = ai.defineFlow(
  {
    name: 'extractAndRecallPreferenceFlow',
    inputSchema: ExtractAndRecallPreferenceInputSchema,
    outputSchema: ExtractAndRecallPreferenceOutputSchema,
  },
  async (input) => {
    // The prompt will directly handle tool calls and integrate their results into its text output.
    const { output } = await preferenceChatPrompt(input);

    if (!output) {
      throw new Error('Chat prompt did not return an output.');
    }

    // The output from the prompt is already the final response text.
    return {
      response: output,
    };
  }
);
// --- End Genkit Flow Definition ---


// --- Exported Wrapper Function ---
export async function extractAndRecallPreference(
  input: ExtractAndRecallPreferenceInput
): Promise<ExtractAndRecallPreferenceOutput> {
  return extractAndRecallPreferenceFlow(input);
}
// --- End Exported Wrapper Function ---
