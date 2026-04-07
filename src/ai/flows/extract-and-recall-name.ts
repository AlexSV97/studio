'use server';
/**
 * @fileOverview A Genkit flow to intelligently extract a user's name from a message.
 *
 * - extractAndRecallName - A function that processes a user message to extract their name.
 * - ExtractNameInput - The input type for the extractAndRecallName function.
 * - ExtractNameOutput - The return type for the extractAndRecallName function, containing the extracted name if found.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

/**
 * Defines the input schema for extracting a user's name.
 */
const ExtractNameInputSchema = z.object({
  message: z.string().describe("The user's message from which to extract a name."),
});
export type ExtractNameInput = z.infer<typeof ExtractNameInputSchema>;

/**
 * Defines the output schema for the extracted name.
 */
const ExtractNameOutputSchema = z.object({
  extractedName: z
    .string()
    .optional()
    .describe("The user's name extracted from the message, or null/empty string if no name was found or the message is a recall query."),
});
export type ExtractNameOutput = z.infer<typeof ExtractNameOutputSchema>;

/**
 * Genkit prompt definition for extracting a user's name.
 * It instructs the LLM to find a name or return an empty string if it's a recall query or no name is found.
 */
const extractNamePrompt = ai.definePrompt({
  name: 'extractNamePrompt',
  input: {schema: ExtractNameInputSchema},
  output: {schema: ExtractNameOutputSchema},
  prompt: `You are a helpful assistant specialized in understanding user identity.
Your task is to identify and extract the user's name from the provided message.
If the message explicitly states the user's name (e.g., "Me llamo John", "Mi nombre es Sarah", "Soy Alex"), then extract ONLY the name.
If the message is a question asking for the user's name (e.g., "¿Cómo me llamo?"), or if no name is clearly stated or implied as an introduction, then you MUST return an empty string for 'extractedName'.

Message: "{{{message}}}"`,
});

/**
 * Genkit flow definition for extracting and potentially recalling a user's name.
 * This flow primarily handles the extraction using the defined prompt.
 */
const extractAndRecallNameFlow = ai.defineFlow(
  {
    name: 'extractAndRecallNameFlow',
    inputSchema: ExtractNameInputSchema,
    outputSchema: ExtractNameOutputSchema,
  },
  async input => {
    const {output} = await extractNamePrompt(input);
    // The prompt is designed to return an empty string for 'extractedName'
    // if no name is found or if it's a recall query.
    return output!;
  }
);

/**
 * Wrapper function to execute the Genkit flow for extracting a user's name.
 * @param input - The input object containing the user's message.
 * @returns A promise that resolves to an object containing the extracted name, if any.
 */
export async function extractAndRecallName(input: ExtractNameInput): Promise<ExtractNameOutput> {
  return extractAndRecallNameFlow(input);
}
