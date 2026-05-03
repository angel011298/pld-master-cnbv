export interface QuizQuestion {
  id: number;
  question_id?: number;
  question: string;
  options: string[];
  answer: string;
  justification: string;
  source?: "bank" | "gemini";
}
