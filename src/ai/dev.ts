import { config } from 'dotenv';
config();

import '@/ai/flows/recognize-user-intent.ts';
import '@/ai/flows/extract-and-recall-name.ts';
import '@/ai/flows/extract-and-recall-preference.ts';