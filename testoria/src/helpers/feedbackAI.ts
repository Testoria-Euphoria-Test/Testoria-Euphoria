import { openai } from "@/helpers/openai";

export async function generateFeedback({ questions, answers, score }: {
    questions: any[],
    answers: any[],
    score: number
}) {
    const formatted = answers.map(ans => {
        const q = questions.find(q => q._id.toString() === ans.questionId.toString());
        return `Q: ${q?.questionText}
Answer: ${ans.selectedAnswer}
Correct: ${ans.isCorrect ? "Yes" : "No"}
Explanation: ${q?.explanation || "-"}\n`;
    }).join("\n");

    const prompt = `
You are a test evaluator AI. A user completed a test with a score of ${score} out of 100. Below are the questions and answers:

${formatted}

Based on the data:
- What has the user done well?
- What topics or areas does the user need to improve?
- Provide constructive and motivational feedback in no more than 5 sentences.
Use an encouraging tone as if speaking to a student.
`;

    const res = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
    });

    return res.choices[0].message.content?.trim() || "No feedback generated.";
}