export interface PiiMatch {
  type: string;
  start: number;
  end: number;
  matchedText: string;
}

const patterns: Array<{ type: string; regex: RegExp }> = [
  {
    type: 'phone_number',
    regex: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
  },
  {
    type: 'email',
    regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
  },
  {
    type: 'ssn',
    regex: /\b\d{3}-\d{2}-\d{4}\b/g,
  },
  {
    type: 'date_with_year',
    regex: /\b(?:0?[1-9]|1[0-2])[/-](?:0?[1-9]|[12]\d|3[01])[/-](?:19|20)\d{2}\b/g,
  },
  {
    type: 'date_with_year_named',
    regex: /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/gi,
  },
  {
    type: 'mrn',
    regex: /\b(?:MRN|mrn|Medical Record)\s*[:#]?\s*\d{4,}\b/gi,
  },
  {
    type: 'street_address',
    regex: /\b\d{1,5}\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:St|Street|Ave|Avenue|Blvd|Boulevard|Dr|Drive|Rd|Road|Ln|Lane|Ct|Court|Way|Pl|Place|Cir|Circle)\b\.?/g,
  },
  {
    type: 'patient_name',
    regex: /\b(?:patient|client|child|resident|individual)\s+(?:named?|called)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/gi,
  },
  {
    type: 'zip_with_context',
    regex: /\b\d{5}(?:-\d{4})?\b(?=.*(?:St|Street|Ave|Avenue|Blvd|Dr|Drive|Rd|Road))|(?:St|Street|Ave|Avenue|Blvd|Dr|Drive|Rd|Road).*\b\d{5}(?:-\d{4})?\b/g,
  },
];

export function detectPii(text: string): PiiMatch[] {
  const matches: PiiMatch[] = [];

  for (const { type, regex } of patterns) {
    const re = new RegExp(regex.source, regex.flags);
    let match;
    while ((match = re.exec(text)) !== null) {
      matches.push({
        type,
        start: match.index,
        end: match.index + match[0].length,
        matchedText: match[0],
      });
    }
  }

  matches.sort((a, b) => a.start - b.start);

  const deduped: PiiMatch[] = [];
  for (const m of matches) {
    const last = deduped[deduped.length - 1];
    if (last && m.start < last.end) {
      if (m.end > last.end) {
        last.end = m.end;
        last.type = `${last.type}+${m.type}`;
      }
      continue;
    }
    deduped.push({ ...m });
  }

  return deduped;
}
