import { describe, it, expect } from 'vitest';

describe('Outcome Comparison', () => {
  function compareOutcomes(baseline: number, latest: number, target: number) {
    const progressFromBaseline = latest - baseline;
    const totalNeeded = target - baseline;
    const percentProgress = totalNeeded !== 0 ? (progressFromBaseline / totalNeeded) * 100 : 0;
    return {
      progressFromBaseline,
      totalNeeded,
      percentProgress: Math.round(percentProgress),
      isImproved: latest > baseline,
      isMet: latest >= target,
    };
  }

  it('calculates positive progress', () => {
    const result = compareOutcomes(5, 7, 12);
    expect(result.progressFromBaseline).toBe(2);
    expect(result.totalNeeded).toBe(7);
    expect(result.percentProgress).toBe(29);
    expect(result.isImproved).toBe(true);
    expect(result.isMet).toBe(false);
  });

  it('detects goal met', () => {
    const result = compareOutcomes(5, 12, 12);
    expect(result.isMet).toBe(true);
    expect(result.percentProgress).toBe(100);
  });

  it('detects exceeded target', () => {
    const result = compareOutcomes(5, 15, 12);
    expect(result.isMet).toBe(true);
    expect(result.isImproved).toBe(true);
  });

  it('handles no change', () => {
    const result = compareOutcomes(5, 5, 12);
    expect(result.progressFromBaseline).toBe(0);
    expect(result.percentProgress).toBe(0);
    expect(result.isImproved).toBe(false);
  });

  it('handles regression', () => {
    const result = compareOutcomes(5, 3, 12);
    expect(result.progressFromBaseline).toBe(-2);
    expect(result.isImproved).toBe(false);
  });

  it('handles zero range (baseline equals target)', () => {
    const result = compareOutcomes(5, 5, 5);
    expect(result.percentProgress).toBe(0);
    expect(result.isMet).toBe(true);
  });
});
