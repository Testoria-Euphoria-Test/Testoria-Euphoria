export interface FeedbackSection {
  type: "strength" | "improvement" | "motivation" | "general";
  title: string;
  icon: string;
  content: string[];
  bgColor: string;
  borderColor: string;
  textColor: string;
  accentColor: string;
}

export function formatAIFeedback(feedback: string): FeedbackSection[] {
  if (!feedback || feedback.trim().length === 0) {
    return [];
  }

  // Clean and split feedback into sentences
  const sentences = feedback
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const sections: FeedbackSection[] = [];

  // Categorize sentences based on keywords and context
  const strengthKeywords = [
    "well",
    "good",
    "excellent",
    "strong",
    "mastered",
    "understanding",
    "mampu",
    "memahami",
    "menguasai",
    "baik",
    "hebat",
    "bagus",
    "kuat",
    "telah",
    "sudah",
    "berhasil",
    "paham",
  ];

  const improvementKeywords = [
    "improve",
    "review",
    "focus",
    "need",
    "should",
    "better",
    "perlu",
    "tingkatkan",
    "difokuskan",
    "perbaiki",
    "kurang",
    "lemah",
    "harus",
    "sebaiknya",
    "disarankan",
  ];

  const motivationKeywords = [
    "keep",
    "continue",
    "practice",
    "don't worry",
    "great job",
    "terus",
    "jangan",
    "lanjutkan",
    "berlatih",
    "semangat",
    "hebat",
    "bagus",
    "selangkah",
    "yakin",
    "percaya",
  ];

  const strengths = sentences.filter((s) =>
    strengthKeywords.some((keyword) =>
      s.toLowerCase().includes(keyword.toLowerCase())
    )
  );

  const improvements = sentences.filter(
    (s) =>
      improvementKeywords.some((keyword) =>
        s.toLowerCase().includes(keyword.toLowerCase())
      ) && !strengths.includes(s)
  );

  const motivation = sentences.filter(
    (s) =>
      motivationKeywords.some((keyword) =>
        s.toLowerCase().includes(keyword.toLowerCase())
      ) &&
      !strengths.includes(s) &&
      !improvements.includes(s)
  );

  const generalSentences = sentences.filter(
    (s) =>
      !strengths.includes(s) &&
      !improvements.includes(s) &&
      !motivation.includes(s)
  );

  // Add sections if they have content
  if (strengths.length > 0) {
    sections.push({
      type: "strength",
      title: "✅ Yang Sudah Dikuasai",
      icon: "CheckCircle",
      content: strengths,
      bgColor: "bg-gradient-to-r from-green-50 to-emerald-50",
      borderColor: "border-green-400",
      textColor: "text-green-800",
      accentColor: "bg-green-500",
    });
  }

  if (improvements.length > 0) {
    sections.push({
      type: "improvement",
      title: "🎯 Area untuk Diperbaiki",
      icon: "Target",
      content: improvements,
      bgColor: "bg-gradient-to-r from-yellow-50 to-amber-50",
      borderColor: "border-yellow-400",
      textColor: "text-yellow-800",
      accentColor: "bg-yellow-500",
    });
  }

  if (motivation.length > 0) {
    sections.push({
      type: "motivation",
      title: "🚀 Motivasi & Saran",
      icon: "Trophy",
      content: motivation,
      bgColor: "bg-gradient-to-r from-blue-50 to-indigo-50",
      borderColor: "border-blue-400",
      textColor: "text-blue-800",
      accentColor: "bg-blue-500",
    });
  }

 

  // If no categorization worked, return original feedback as general
  if (sections.length === 0) {
    sections.push({
      type: "general",
      title: "📝 Feedback AI",
      icon: "Brain",
      content: [feedback],
      bgColor: "bg-gradient-to-r from-purple-50 to-violet-50",
      borderColor: "border-purple-400",
      textColor: "text-purple-800",
      accentColor: "bg-purple-500",
    });
  }

  return sections;
}
