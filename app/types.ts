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

export type Fallacy = {
  name: string;
  span: string;
  note: string;
};

export type Bias = {
  name: string;
  note: string;
};

// Single-turn analysis result (what the coach surfaces for one user turn)
export type DebateResult = {
  response: string;
  score: Score;
  annotations: Annotation[];
  alternatives: Alternative[];
  fallacies: Fallacy[];
  biases: Bias[];
  missed_points: string[];
};

// Multi-round match types
export type Topic = {
  category: string;
  text: string;
};

export type Turn = {
  id: string;
  side: "user" | "claude";
  round: number;
  text: string;
  score: Score;
  annotations: Annotation[];
  fallacies: Fallacy[];
  biases: Bias[];
  missed_points: string[];
  alternatives: Alternative[];
};

// What the API returns when a user submits a new turn
export type TurnResponse = {
  user_analysis: {
    score: Score;
    annotations: Annotation[];
    fallacies: Fallacy[];
    biases: Bias[];
    missed_points: string[];
    alternatives: Alternative[];
  };
  claude_response: {
    text: string;
    score: Score;
  };
};
