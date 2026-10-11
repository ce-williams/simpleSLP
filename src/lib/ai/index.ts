import type { AIProvider } from './provider';
import { MockProvider } from './mock';

export function getProvider(): AIProvider {
  if (
    process.env.AI_PROVIDER === 'anthropic' &&
    process.env.ANTHROPIC_API_KEY &&
    process.env.ALLOW_EXTERNAL_AI === 'true'
  ) {
    // AnthropicProvider would be imported here when implemented
    console.warn('AnthropicProvider not yet implemented, falling back to MockProvider');
    return new MockProvider();
  }
  return new MockProvider();
}

export type { AIProvider } from './provider';
export type { TreatmentPlanInput, ActivityInput, ProgressNoteInput, PatientSummaryInput, PayerProgressReportInput } from './provider';
