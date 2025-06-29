import { openai } from "@/helpers/openai";

interface Question {
  _id: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  optionE: string;
  correctAnswer: string;
  explanation: string;
  images: string[];
}

interface Answer {
  _id: string;
  userId: string;
  packageId: string;
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  createdAt: string;
}

export async function generateFeedback({
  questions,
  answers,
  score,
}: {
  questions: Question[];
  answers: Answer[];
  score: number;
}) {
  console.log("🤖 FeedbackAI: Starting generation with data:", {
    questionsCount: questions.length,
    answersCount: answers.length,
    score: score,
  });

  const formatted = answers
    .map((ans) => {
      const q = questions.find(
        (q) => q._id.toString() === ans.questionId.toString()
      );
      return `Q: ${q?.questionText}
Answer: ${ans.selectedAnswer}
Correct: ${ans.isCorrect ? "Yes" : "No"}
Explanation: ${q?.explanation || "-"}\n`;
    })
    .join("\n");

  console.log(
    "🤖 FeedbackAI: Formatted data:",
    formatted.substring(0, 200) + "..."
  );

  const prompt = `
You are a test evaluator AI. A user completed a test with a score of ${score} out of 100. Below are the questions and answers:

${formatted}

Please provide structured feedback in Indonesian language that includes:

1. KEKUATAN (Strengths): What the user has done well and mastered
2. AREA PERBAIKAN (Areas for Improvement): Specific topics or skills that need more attention  
3. SARAN MOTIVASI (Motivational Advice): Encouraging words and next steps

Format your response as natural sentences, but organize the content clearly. Start strengths with words like "Pengguna telah memahami/menguasai..." and improvements with "Perlu meningkatkan pemahaman tentang..." and motivation with "Terus berlatih..." or "Jangan khawatir..."

Keep the tone encouraging and educational. Limit to maximum 8 sentences total.
`;

  console.log("🤖 FeedbackAI: Sending request to OpenAI...");

  const res = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
  });

  const feedback =
    res.choices[0].message.content?.trim() || "No feedback generated.";
  console.log("🤖 FeedbackAI: Generated feedback:", feedback);

  return feedback;
}
