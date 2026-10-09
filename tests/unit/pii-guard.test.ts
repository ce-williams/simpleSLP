import { describe, it, expect } from 'vitest';
import { detectPii } from '../../src/lib/pii/patterns';
import { guardText } from '../../src/lib/pii/guard';

describe('PII Guard', () => {
  describe('phone numbers', () => {
    it('detects phone with dashes', () => {
      const matches = detectPii('Call 555-123-4567 for info');
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].type).toBe('phone_number');
    });

    it('detects phone with dots', () => {
      const matches = detectPii('Phone: 555.123.4567');
      expect(matches.length).toBeGreaterThan(0);
    });

    it('detects phone without separators', () => {
      const matches = detectPii('Call 5551234567');
      expect(matches.length).toBeGreaterThan(0);
    });
  });

  describe('email addresses', () => {
    it('detects email', () => {
      const matches = detectPii('Contact john.doe@hospital.com');
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].type).toBe('email');
    });
  });

  describe('SSN patterns', () => {
    it('detects SSN format', () => {
      const matches = detectPii('SSN: 123-45-6789');
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].type).toBe('ssn');
    });
  });

  describe('dates with year', () => {
    it('detects numeric date', () => {
      const matches = detectPii('Born on 03/15/1990');
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].type).toBe('date_with_year');
    });

    it('detects named month date', () => {
      const matches = detectPii('Born on January 15, 2020');
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].type).toBe('date_with_year_named');
    });
  });

  describe('MRN patterns', () => {
    it('detects MRN', () => {
      const matches = detectPii('MRN: 12345678');
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].type).toBe('mrn');
    });

    it('detects Medical Record number', () => {
      const matches = detectPii('Medical Record #98765');
      expect(matches.length).toBeGreaterThan(0);
    });
  });

  describe('street addresses', () => {
    it('detects street address', () => {
      const matches = detectPii('Lives at 123 Main Street');
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].type).toBe('street_address');
    });

    it('detects address with Ave', () => {
      const matches = detectPii('Office at 456 Oak Ave');
      expect(matches.length).toBeGreaterThan(0);
    });
  });

  describe('patient name patterns', () => {
    it('detects patient named pattern', () => {
      const matches = detectPii('patient named John Smith was seen');
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].type).toBe('patient_name');
    });

    it('detects child named pattern', () => {
      const matches = detectPii('child named Emily Johnson');
      expect(matches.length).toBeGreaterThan(0);
    });
  });

  describe('negative cases - safe text', () => {
    it('passes clinical observations', () => {
      const result = guardText('Accepts 5 foods consistently. Gags on new textures.');
      expect(result.safe).toBe(true);
    });

    it('passes age band references', () => {
      const result = guardText('Child is in the 2-3 age band');
      expect(result.safe).toBe(true);
    });

    it('passes session counts', () => {
      const result = guardText('Attended 3 of last 4 sessions');
      expect(result.safe).toBe(true);
    });

    it('passes clinical terminology', () => {
      const result = guardText('Demonstrated rotary chew pattern in 35 percent of trials');
      expect(result.safe).toBe(true);
    });

    it('passes therapy descriptions', () => {
      const result = guardText('Introduced food play with banana slices. Child touched and smelled banana.');
      expect(result.safe).toBe(true);
    });
  });

  describe('guardText integration', () => {
    it('returns safe for clean text', () => {
      const result = guardText('Normal clinical note without PII');
      expect(result.safe).toBe(true);
      expect(result.findings).toHaveLength(0);
    });

    it('returns unsafe with findings for PII', () => {
      const result = guardText('Patient named John Smith, MRN: 12345, phone 555-123-4567');
      expect(result.safe).toBe(false);
      expect(result.findings.length).toBeGreaterThan(0);
    });
  });
});
