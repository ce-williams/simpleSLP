'use client';

import { useState } from 'react';
import type { PicklistOption } from '@/lib/picklists';

interface PicklistSelectProps {
  label: string;
  options: PicklistOption[];
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
}

export function PicklistSelect({ label, options, value, onChange, required, placeholder }: PicklistSelectProps) {
  const isCustom = value !== '' && !options.some(o => o.value === value);
  const [showCustom, setShowCustom] = useState(isCustom);

  return (
    <div>
      <label className="label">{label}</label>
      {showCustom ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="Enter custom value..."
            required={required}
            className="input-field flex-1"
          />
          <button
            type="button"
            onClick={() => { setShowCustom(false); onChange(''); }}
            className="btn-ghost text-2xs px-3"
          >Back</button>
        </div>
      ) : (
        <select
          value={value}
          onChange={e => {
            if (e.target.value === '__other__') {
              setShowCustom(true);
              onChange('');
            } else {
              onChange(e.target.value);
            }
          }}
          required={required}
          className="input-field"
        >
          <option value="">{placeholder || 'Select...'}</option>
          {options.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
          <option value="__other__">Other (custom)...</option>
        </select>
      )}
    </div>
  );
}

interface MultiPicklistProps {
  label: string;
  options: PicklistOption[];
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

export function MultiPicklist({ label, options, values, onChange, placeholder }: MultiPicklistProps) {
  const [showCustom, setShowCustom] = useState(false);
  const [customValue, setCustomValue] = useState('');

  function addValue(val: string) {
    if (val && val !== '__other__' && !values.includes(val)) {
      onChange([...values, val]);
    }
  }

  function removeValue(val: string) {
    onChange(values.filter(v => v !== val));
  }

  function addCustom() {
    const trimmed = customValue.trim();
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
    }
    setCustomValue('');
    setShowCustom(false);
  }

  const availableOptions = options.filter(o => !values.includes(o.value));

  return (
    <div>
      <label className="label">{label}</label>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {values.map(v => {
            const opt = options.find(o => o.value === v);
            return (
              <span key={v} className="inline-flex items-center gap-1 pill bg-forest-200 text-forest-800">
                {opt?.label || v}
                <button type="button" onClick={() => removeValue(v)} className="hover:text-red-600 transition-colors ml-0.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                </button>
              </span>
            );
          })}
        </div>
      )}
      {showCustom ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={customValue}
            onChange={e => setCustomValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustom(); } }}
            placeholder="Enter custom value..."
            className="input-field flex-1"
            autoFocus
          />
          <button type="button" onClick={addCustom} className="btn-primary text-2xs px-3 py-1.5">Add</button>
          <button type="button" onClick={() => { setShowCustom(false); setCustomValue(''); }} className="btn-ghost text-2xs px-3">Cancel</button>
        </div>
      ) : (
        <select
          value=""
          onChange={e => {
            if (e.target.value === '__other__') {
              setShowCustom(true);
            } else {
              addValue(e.target.value);
            }
          }}
          className="input-field"
        >
          <option value="">{placeholder || 'Add...'}</option>
          {availableOptions.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
          <option value="__other__">Other (custom)...</option>
        </select>
      )}
    </div>
  );
}
