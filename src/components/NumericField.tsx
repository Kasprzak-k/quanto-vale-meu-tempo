import { useEffect, useId, useState } from 'react';

interface NumericFieldProps {
  label: string;
  value: number;
  onChange: (nextValue: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  helpText: string;
  disabled?: boolean;
  errorLabel?: string;
}

export function NumericField({
  label,
  value,
  onChange,
  min = 0,
  max = 1_000_000,
  step = 1,
  prefix,
  helpText,
  disabled = false,
  errorLabel = 'Informe um número válido.',
}: NumericFieldProps) {
  const inputId = useId();
  const helpId = useId();
  const [draft, setDraft] = useState(() => String(value));
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    setDraft(String(value));
    setInvalid(false);
  }, [value]);

  const handleChange = (raw: string) => {
    setDraft(raw);
    if (raw.trim() === '') {
      setInvalid(true);
      return;
    }
    const normalized = raw.replace(',', '.');
    const parsed = Number(normalized);
    if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    onChange(parsed);
  };

  const handleBlur = () => {
    if (invalid || draft.trim() === '') {
      setDraft(String(value));
      setInvalid(false);
    }
  };

  return (
    <div className="input-cell">
      <label className="field-label" htmlFor={inputId}>
        {label}
      </label>
      <div className="input-wrap">
        {prefix ? (
          <span className="input-prefix" aria-hidden="true">
            {prefix}
          </span>
        ) : null}
        <input
          id={inputId}
          name={inputId}
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step={step}
          value={draft}
          disabled={disabled}
          aria-invalid={invalid ? 'true' : undefined}
          aria-describedby={helpId}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          className={prefix ? 'input input--prefixed' : 'input'}
        />
      </div>
      <p
        id={helpId}
        className={invalid ? 'field-help field-help--error' : 'field-help'}
        aria-live="polite"
      >
        {invalid ? errorLabel : helpText}
      </p>
    </div>
  );
}
