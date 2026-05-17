"use client";

import { useMemo, useState } from "react";
import type { Answers, Option, Question } from "@/data/onboarding-questions";

type Props = {
  question: Question;
  answer: unknown;
  answers: Answers;
  onChange: (value: unknown) => void;
};

export function QuestionRenderer({ question, answer, answers, onChange }: Props) {
  switch (question.type) {
    case "single-select":
      return <SingleSelect question={question} answer={answer} onChange={onChange} />;
    case "multi-select":
      return <MultiSelect question={question} answer={answer} onChange={onChange} />;
    case "searchable-single-select":
      return <SearchableSingleSelect question={question} answer={answer} onChange={onChange} />;
    case "searchable-multi-select":
      return <SearchableMultiSelect question={question} answer={answer} onChange={onChange} />;
    case "text":
      return <TextInput answer={answer} onChange={onChange} />;
    case "number":
      return <NumberField question={question} answer={answer} onChange={onChange} />;
    case "conditional-form":
      return <GradesSubform answers={answers} answer={answer} onChange={onChange} />;
  }
}

function SingleSelect({
  question,
  answer,
  onChange,
}: {
  question: Question;
  answer: unknown;
  onChange: (v: unknown) => void;
}) {
  const current = parseSingle(answer);

  function select(option: Option) {
    if (option.withNumber) {
      onChange({ choice: option.value, number: current?.number ?? null });
    } else {
      onChange(option.value);
    }
  }

  function setNumber(value: number | null) {
    if (!current) return;
    onChange({ choice: current.choice, number: value });
  }

  return (
    <div className="flex flex-col gap-2">
      {question.options?.map((option) => {
        const selected = current?.choice === option.value;
        return (
          <div key={option.value} className="flex flex-col gap-2">
            <OptionButton selected={selected} onClick={() => select(option)}>
              {option.label}
            </OptionButton>
            {selected && option.withNumber && (
              <input
                type="number"
                inputMode="numeric"
                min={option.withNumber.min}
                max={option.withNumber.max}
                placeholder={option.withNumber.placeholder}
                value={current?.number ?? ""}
                onChange={(e) =>
                  setNumber(e.target.value === "" ? null : Number(e.target.value))
                }
                className="ml-4 h-11 rounded-lg border border-white/30 bg-white/10 px-3 text-white placeholder:text-white/50 focus:border-white focus:bg-white/20 focus:outline-none"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function MultiSelect({
  question,
  answer,
  onChange,
}: {
  question: Question;
  answer: unknown;
  onChange: (v: unknown) => void;
}) {
  const current = Array.isArray(answer) ? (answer as string[]) : [];
  const exclusive = question.exclusiveOption;

  function toggle(value: string) {
    if (exclusive && value === exclusive) {
      onChange(current.includes(exclusive) ? [] : [exclusive]);
      return;
    }
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current.filter((v) => v !== exclusive), value];
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-2">
      {question.options?.map((option) => (
        <OptionButton
          key={option.value}
          selected={current.includes(option.value)}
          onClick={() => toggle(option.value)}
        >
          {option.label}
        </OptionButton>
      ))}
    </div>
  );
}

function SearchableSingleSelect({
  question,
  answer,
  onChange,
}: {
  question: Question;
  answer: unknown;
  onChange: (v: unknown) => void;
}) {
  const [query, setQuery] = useState("");
  const selectedLabel = useMemo(
    () => question.options?.find((o) => o.value === answer)?.label ?? "",
    [question.options, answer],
  );
  const filtered = useMemo(() => {
    const opts = question.options ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return opts.slice(0, 50);
    return opts.filter((o) => o.label.toLowerCase().includes(q)).slice(0, 50);
  }, [question.options, query]);

  return (
    <div className="flex flex-col gap-3">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={selectedLabel ? `Selected: ${selectedLabel}` : "Type to search…"}
        className="h-11 rounded-lg border border-white/30 bg-white/10 px-3 text-white placeholder:text-white/50 focus:border-white focus:bg-white/20 focus:outline-none"
      />
      <div className="flex max-h-64 flex-col gap-1.5 overflow-y-auto pr-1">
        {filtered.map((option) => (
          <OptionButton
            key={option.value}
            selected={answer === option.value}
            onClick={() => {
              onChange(option.value);
              setQuery("");
            }}
            compact
          >
            <span>{option.label}</span>
            {option.location && (
              <span className="text-xs opacity-70">{option.location}</span>
            )}
          </OptionButton>
        ))}
        {filtered.length === 0 && (
          <p className="px-3 py-2 text-sm text-white/60">No matches.</p>
        )}
      </div>
    </div>
  );
}

type MultiSelectValue = { selected: string[]; other?: string };

function SearchableMultiSelect({
  question,
  answer,
  onChange,
}: {
  question: Question;
  answer: unknown;
  onChange: (v: unknown) => void;
}) {
  const [query, setQuery] = useState("");
  const current: MultiSelectValue =
    answer && typeof answer === "object" && "selected" in answer
      ? (answer as MultiSelectValue)
      : { selected: [] };
  const max = question.maxSelection ?? Infinity;
  const atMax = current.selected.length >= max;

  const filtered = useMemo(() => {
    const opts = question.options ?? [];
    const q = query.trim().toLowerCase();
    const base = q
      ? opts.filter((o) => o.label.toLowerCase().includes(q))
      : opts;
    return base.slice(0, 50);
  }, [question.options, query]);

  function toggle(value: string) {
    const next = current.selected.includes(value)
      ? current.selected.filter((v) => v !== value)
      : atMax
        ? current.selected
        : [...current.selected, value];
    onChange({ ...current, selected: next });
  }

  function setOther(value: string) {
    onChange({ ...current, other: value || undefined });
  }

  const selectedOptions = current.selected
    .map((v) => question.options?.find((o) => o.value === v))
    .filter((o): o is Option => Boolean(o));

  return (
    <div className="flex flex-col gap-3">
      {selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedOptions.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => toggle(o.value)}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-sm text-[#4F46E5]"
            >
              {o.label}
              <span aria-hidden className="text-base leading-none">×</span>
            </button>
          ))}
        </div>
      )}
      <p className="text-xs text-white/60">
        {current.selected.length} of {max} selected
      </p>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Type to search…"
        className="h-11 rounded-lg border border-white/30 bg-white/10 px-3 text-white placeholder:text-white/50 focus:border-white focus:bg-white/20 focus:outline-none"
      />
      <div className="flex max-h-56 flex-col gap-1.5 overflow-y-auto pr-1">
        {filtered.map((option) => {
          const selected = current.selected.includes(option.value);
          return (
            <OptionButton
              key={option.value}
              selected={selected}
              disabled={!selected && atMax}
              onClick={() => toggle(option.value)}
              compact
            >
              <span>{option.label}</span>
              {option.location && (
                <span className="text-xs opacity-70">{option.location}</span>
              )}
            </OptionButton>
          );
        })}
        {filtered.length === 0 && (
          <p className="px-3 py-2 text-sm text-white/60">No matches.</p>
        )}
      </div>
      {question.allowOther && (
        <input
          type="text"
          value={current.other ?? ""}
          onChange={(e) => setOther(e.target.value)}
          placeholder={question.allowOther.placeholder}
          className="h-11 rounded-lg border border-white/30 bg-white/10 px-3 text-white placeholder:text-white/50 focus:border-white focus:bg-white/20 focus:outline-none"
        />
      )}
    </div>
  );
}

function TextInput({
  answer,
  onChange,
}: {
  answer: unknown;
  onChange: (v: unknown) => void;
}) {
  return (
    <input
      type="text"
      value={typeof answer === "string" ? answer : ""}
      onChange={(e) => onChange(e.target.value)}
      className="h-12 rounded-lg border border-white/30 bg-white/10 px-3 text-white placeholder:text-white/50 focus:border-white focus:bg-white/20 focus:outline-none"
    />
  );
}

function NumberField({
  question,
  answer,
  onChange,
}: {
  question: Question;
  answer: unknown;
  onChange: (v: unknown) => void;
}) {
  return (
    <input
      type="number"
      inputMode="numeric"
      min={question.min}
      max={question.max}
      value={typeof answer === "number" ? answer : ""}
      onChange={(e) =>
        onChange(e.target.value === "" ? null : Number(e.target.value))
      }
      className="h-12 rounded-lg border border-white/30 bg-white/10 px-3 text-white placeholder:text-white/50 focus:border-white focus:bg-white/20 focus:outline-none"
    />
  );
}

// --- Grades subform (conditional-form) -----------------------------------

type GradeRow = { subject: string; grade: string };

function GradesSubform({
  answers,
  answer,
  onChange,
}: {
  answers: Answers;
  answer: unknown;
  onChange: (v: unknown) => void;
}) {
  const system = answers.grading_system as string | undefined;

  if (!system) {
    return (
      <p className="text-sm text-white/70">
        Pick a grading system on the previous question first.
      </p>
    );
  }

  if (system === "CBSE" || system === "ICSE") {
    const v = (answer as { grade10?: number; grade12?: number }) ?? {};
    return (
      <div className="flex flex-col gap-4">
        <LabeledNumber
          label="Grade 10 percentage"
          min={0}
          max={100}
          value={v.grade10}
          onChange={(n) => onChange({ ...v, grade10: n })}
        />
        <LabeledNumber
          label="Predicted / actual Grade 12 percentage"
          min={0}
          max={100}
          value={v.grade12}
          onChange={(n) => onChange({ ...v, grade12: n })}
        />
      </div>
    );
  }

  if (system === "IB") {
    const v = (answer as { totalScore?: number }) ?? {};
    return (
      <LabeledNumber
        label="Predicted / actual total IB score"
        min={0}
        max={45}
        value={v.totalScore}
        onChange={(n) => onChange({ ...v, totalScore: n })}
      />
    );
  }

  if (system === "ALevels" || system === "IGCSE") {
    const rows = Array.isArray(answer) ? (answer as GradeRow[]) : [];
    const gradeOptions =
      system === "ALevels"
        ? ["A*", "A", "B", "C", "D", "E"]
        : ["A*", "A", "B", "C", "D", "E", "F", "G"];
    return (
      <SubjectGradeList rows={rows} gradeOptions={gradeOptions} onChange={onChange} />
    );
  }

  if (system === "AmericanGPA") {
    const v = (answer as { gpa?: number; scale?: string }) ?? {};
    return (
      <div className="flex flex-col gap-4">
        <LabeledNumber
          label="GPA"
          min={0}
          max={Number(v.scale ?? "4.0") || 100}
          step={0.01}
          value={v.gpa}
          onChange={(n) => onChange({ ...v, gpa: n })}
        />
        <div className="flex flex-col gap-2">
          <span className="text-sm text-white/80">Scale</span>
          <div className="flex gap-2">
            {["4.0", "5.0", "100"].map((s) => (
              <OptionButton
                key={s}
                selected={v.scale === s}
                onClick={() => onChange({ ...v, scale: s })}
                compact
              >
                {s}
              </OptionButton>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Other
  return (
    <textarea
      value={typeof answer === "string" ? answer : ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Describe your grades in your system…"
      rows={4}
      className="rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-white placeholder:text-white/50 focus:border-white focus:bg-white/20 focus:outline-none"
    />
  );
}

function SubjectGradeList({
  rows,
  gradeOptions,
  onChange,
}: {
  rows: GradeRow[];
  gradeOptions: string[];
  onChange: (v: unknown) => void;
}) {
  const safeRows = rows.length > 0 ? rows : [{ subject: "", grade: "" }];

  function update(index: number, patch: Partial<GradeRow>) {
    const next = safeRows.map((row, i) => (i === index ? { ...row, ...patch } : row));
    onChange(next);
  }
  function add() {
    if (safeRows.length >= 8) return;
    onChange([...safeRows, { subject: "", grade: "" }]);
  }
  function remove(index: number) {
    const next = safeRows.filter((_, i) => i !== index);
    onChange(next.length > 0 ? next : [{ subject: "", grade: "" }]);
  }

  return (
    <div className="flex flex-col gap-3">
      {safeRows.map((row, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            type="text"
            value={row.subject}
            onChange={(e) => update(i, { subject: e.target.value })}
            placeholder="Subject"
            className="h-11 flex-1 rounded-lg border border-white/30 bg-white/10 px-3 text-white placeholder:text-white/50 focus:border-white focus:bg-white/20 focus:outline-none"
          />
          <select
            value={row.grade}
            onChange={(e) => update(i, { grade: e.target.value })}
            className="h-11 rounded-lg border border-white/30 bg-white/10 px-3 text-white focus:border-white focus:outline-none"
          >
            <option value="" className="text-neutral-900">
              Grade
            </option>
            {gradeOptions.map((g) => (
              <option key={g} value={g} className="text-neutral-900">
                {g}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => remove(i)}
            aria-label="Remove row"
            className="h-11 w-11 rounded-lg border border-white/30 text-white hover:bg-white/10"
          >
            −
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="self-start rounded-full border border-white/40 px-4 py-2 text-sm text-white hover:bg-white/10"
      >
        + Add subject
      </button>
    </div>
  );
}

function LabeledNumber({
  label,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number | undefined;
  onChange: (n: number | null) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm text-white/80">
      {label}
      <input
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step={step}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
        className="h-11 rounded-lg border border-white/30 bg-white/10 px-3 text-white placeholder:text-white/50 focus:border-white focus:bg-white/20 focus:outline-none"
      />
    </label>
  );
}

function OptionButton({
  selected,
  disabled,
  onClick,
  compact,
  children,
}: {
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
  compact?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        "flex w-full items-center justify-between gap-3 rounded-lg border text-left transition",
        compact ? "px-3 py-2 text-sm" : "px-4 py-3 text-base",
        selected
          ? "border-white bg-white text-[#4F46E5]"
          : "border-white/30 bg-white/5 text-white hover:bg-white/15",
        disabled && !selected ? "cursor-not-allowed opacity-40" : "",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

// Helper to normalize single-select answer (string or {choice, number})
function parseSingle(answer: unknown): { choice: string; number: number | null } | null {
  if (typeof answer === "string") return { choice: answer, number: null };
  if (answer && typeof answer === "object" && "choice" in answer) {
    const a = answer as { choice: string; number?: number | null };
    return { choice: a.choice, number: a.number ?? null };
  }
  return null;
}

