import countries from "@/data/countries.json";
import majors from "@/data/majors.json";
import universities from "@/data/us-universities.json";

export type Option = {
  value: string;
  label: string;
  location?: string;
  withNumber?: { placeholder: string; min: number; max: number };
};

export type Answers = Record<string, unknown>;

export type QuestionType =
  | "single-select"
  | "multi-select"
  | "searchable-single-select"
  | "searchable-multi-select"
  | "text"
  | "number"
  | "conditional-form";

export type Question = {
  id: string;
  question: string;
  subtitle?: string;
  type: QuestionType;
  required: boolean;
  options?: Option[];
  minSelection?: number;
  maxSelection?: number;
  exclusiveOption?: string;
  allowOther?: { placeholder: string };
  min?: number;
  max?: number;
  skipIf?: (answers: Answers) => boolean;
  conditionalOn?: string;
};

const ENGLISH_SPEAKING = ["US", "GB", "CA", "AU", "IE", "NZ"];

export const questions: Question[] = [
  {
    id: "grade",
    question: "what's your current grade?",
    type: "single-select",
    required: true,
    options: [
      { value: "grade_10", label: "Grade 10" },
      { value: "grade_11", label: "Grade 11" },
      { value: "grade_12", label: "Grade 12" },
      { value: "gap_year", label: "Gap year" },
      { value: "graduated", label: "Already graduated" },
    ],
  },
  {
    id: "country",
    question: "where are you applying from?",
    subtitle: "Your country of citizenship or current residence.",
    type: "searchable-single-select",
    required: true,
    options: countries,
  },
  {
    id: "grading_system",
    question: "which grading system do you use?",
    type: "single-select",
    required: true,
    options: [
      { value: "CBSE", label: "CBSE" },
      { value: "ICSE", label: "ICSE" },
      { value: "IB", label: "International Baccalaureate (IB)" },
      { value: "ALevels", label: "A-Levels" },
      { value: "IGCSE", label: "IGCSE" },
      { value: "AmericanGPA", label: "American GPA" },
      { value: "Other", label: "Other" },
    ],
  },
  {
    id: "grades",
    question: "what are your grades?",
    subtitle: "Predicted scores are fine if you haven't sat the exam yet.",
    type: "conditional-form",
    required: true,
    conditionalOn: "grading_system",
  },
  {
    id: "sat_act",
    question: "have you taken the SAT or ACT?",
    type: "single-select",
    required: true,
    options: [
      {
        value: "sat",
        label: "I took the SAT",
        withNumber: { placeholder: "SAT score (400-1600)", min: 400, max: 1600 },
      },
      {
        value: "act",
        label: "I took the ACT",
        withNumber: { placeholder: "ACT score (1-36)", min: 1, max: 36 },
      },
      { value: "planning", label: "Planning to take one" },
      { value: "not_taking", label: "Not taking either" },
      { value: "test_optional", label: "Applying test-optional" },
    ],
  },
  {
    id: "english_proficiency",
    question: "have you taken an English proficiency test?",
    subtitle: "Most US schools require this for international applicants.",
    type: "single-select",
    required: true,
    skipIf: (a) => ENGLISH_SPEAKING.includes(a.country as string),
    options: [
      {
        value: "toefl",
        label: "TOEFL",
        withNumber: { placeholder: "TOEFL score (0-120)", min: 0, max: 120 },
      },
      {
        value: "ielts",
        label: "IELTS",
        withNumber: { placeholder: "IELTS score (0-9)", min: 0, max: 9 },
      },
      {
        value: "duolingo",
        label: "Duolingo English Test",
        withNumber: { placeholder: "Duolingo score (0-160)", min: 0, max: 160 },
      },
      { value: "native", label: "Native English speaker" },
      { value: "not_taken", label: "Haven't taken one yet" },
    ],
  },
  {
    id: "major",
    question: "what do you want to study?",
    subtitle: "Pick the closest match. You can change your mind later.",
    type: "searchable-single-select",
    required: true,
    options: majors,
  },
  {
    id: "ec_peak",
    question: "what's the highest level of recognition for your activities?",
    subtitle: "Think competitions, awards, leadership. Anything notable.",
    type: "single-select",
    required: false,
    options: [
      { value: "international", label: "International level" },
      { value: "national", label: "National level" },
      { value: "state", label: "State / regional level" },
      { value: "local", label: "Local / school level" },
      { value: "none", label: "No major recognition yet" },
    ],
  },
  {
    id: "independent_initiative",
    question: "have you led an independent project?",
    subtitle: "Research, a startup, nonprofit, app, original work. Anything you started yourself.",
    type: "single-select",
    required: false,
    options: [
      { value: "multiple", label: "Yes, multiple" },
      { value: "one", label: "Yes, one significant project" },
      { value: "in_progress", label: "Working on something now" },
      { value: "no", label: "Not yet" },
    ],
  },
  {
    id: "hooks",
    question: "do any of these describe you?",
    subtitle: "Select all that apply. These can meaningfully influence admissions.",
    type: "multi-select",
    required: true,
    exclusiveOption: "none",
    options: [
      { value: "athlete", label: "Recruited athlete" },
      { value: "first_gen", label: "First-generation college student" },
      { value: "underrepresented", label: "Underrepresented demographic" },
      { value: "legacy", label: "Legacy at a target school" },
      { value: "none", label: "None of the above" },
    ],
  },
  {
    id: "financial_aid",
    question: "how much financial aid will you need?",
    type: "single-select",
    required: true,
    options: [
      { value: "significant", label: "Significant aid (I can't attend without it)" },
      { value: "some", label: "Some aid would help" },
      { value: "merit_only", label: "Merit scholarships only" },
      { value: "full_pay", label: "No aid needed (full pay)" },
    ],
  },
  {
    id: "universities",
    question: "which schools are on your list?",
    subtitle: "Pick 1-5 you're seriously considering. Add others by name if you don't see them.",
    type: "searchable-multi-select",
    required: true,
    minSelection: 1,
    maxSelection: 5,
    allowOther: { placeholder: "Type a school name…" },
    options: universities,
  },
];
