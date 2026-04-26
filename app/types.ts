export type Stance = "for" | "against";

export type Score = {
  clarity: number;
  logic: number;
  evidence: number;
  persuasiveness: number;
  summary: string;
};

export type Annotation = {
  text_span: string;
  type: "strength" | "weakness";
  explanation: string;
  suggestion: string;
};

export type Alternative = {
  text: string;
  strategy: string;
  reasoning: string;
  when_to_use: string;
};

export type DebateResult = {
  response: string;
  score: Score;
  annotations: Annotation[];
  alternatives: Alternative[];
};
