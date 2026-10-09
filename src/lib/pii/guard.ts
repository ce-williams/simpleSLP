import { detectPii, type PiiMatch } from './patterns';

export interface GuardResult {
  safe: boolean;
  findings: PiiMatch[];
}

export function guardText(text: string): GuardResult {
  const findings = detectPii(text);
  return {
    safe: findings.length === 0,
    findings,
  };
}

export type { PiiMatch };
