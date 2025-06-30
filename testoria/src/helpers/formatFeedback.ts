export interface FeedbackSection {
  type: "performance" | "mastered" | "improvement" | "recommendations" | "motivation";
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

  const sections: FeedbackSection[] = [];

  // Parse structured feedback sections based on our AI format
  const sectionMarkers = [
    { marker: "**EVALUASI PERFORMA:**", type: "performance" as const, title: "📊 Evaluasi Performa", icon: "Brain" },
    { marker: "**Yang Dikuasai:**", type: "mastered" as const, title: "✅ Yang Sudah Dikuasai", icon: "CheckCircle" },
    { marker: "**Area yang Perlu Diperbaiki:**", type: "improvement" as const, title: "🎯 Area yang Perlu Diperbaiki", icon: "Target" },
    { marker: "**REKOMENDASI BELAJAR:**", type: "recommendations" as const, title: "📚 Rekomendasi Belajar", icon: "BookOpen" },
    { marker: "**MOTIVASI & LANGKAH SELANJUTNYA:**", type: "motivation" as const, title: "🚀 Motivasi & Langkah Selanjutnya", icon: "Trophy" }
  ];

  // Split feedback into sections
  let remainingText = feedback;

  for (let i = 0; i < sectionMarkers.length; i++) {
    const currentMarker = sectionMarkers[i];
    const nextMarker = sectionMarkers[i + 1];

    const startIndex = remainingText.indexOf(currentMarker.marker);
    if (startIndex === -1) continue;

    let endIndex = remainingText.length;
    if (nextMarker) {
      const nextIndex = remainingText.indexOf(nextMarker.marker);
      if (nextIndex !== -1) {
        endIndex = nextIndex;
      }
    }

    const sectionText = remainingText.substring(startIndex + currentMarker.marker.length, endIndex).trim();

    if (sectionText.length > 0) {
      // Parse content - split by bullet points or lines
      const lines = sectionText
        .split(/\n/)
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => line.replace(/^[•\-\*]\s*/, '').trim()) // Remove bullet points
        .filter(line => line.length > 0);

      if (lines.length > 0) {
        sections.push({
          type: currentMarker.type,
          title: currentMarker.title,
          icon: currentMarker.icon,
          content: lines,
          ...getColorScheme(currentMarker.type)
        });
      }
    }
  }

  // Fallback: if no structured sections found, try the old keyword-based approach
  if (sections.length === 0) {
    return formatLegacyFeedback(feedback);
  }

  return sections;
}

function getColorScheme(type: string) {
  switch (type) {
    case "performance":
      return {
        bgColor: "bg-gradient-to-r from-purple-50 to-violet-50",
        borderColor: "border-purple-400",
        textColor: "text-purple-800",
        accentColor: "bg-purple-500",
      };
    case "mastered":
      return {
        bgColor: "bg-gradient-to-r from-green-50 to-emerald-50",
        borderColor: "border-green-400",
        textColor: "text-green-800",
        accentColor: "bg-green-500",
      };
    case "improvement":
      return {
        bgColor: "bg-gradient-to-r from-orange-50 to-amber-50",
        borderColor: "border-orange-400",
        textColor: "text-orange-800",
        accentColor: "bg-orange-500",
      };
    case "recommendations":
      return {
        bgColor: "bg-gradient-to-r from-blue-50 to-indigo-50",
        borderColor: "border-blue-400",
        textColor: "text-blue-800",
        accentColor: "bg-blue-500",
      };
    case "motivation":
      return {
        bgColor: "bg-gradient-to-r from-gray-50 to-slate-50",
        borderColor: "border-gray-400",
        textColor: "text-gray-800",
        accentColor: "bg-gray-500",
      };
    default:
      return {
        bgColor: "bg-gradient-to-r from-gray-50 to-slate-50",
        borderColor: "border-gray-400",
        textColor: "text-gray-800",
        accentColor: "bg-gray-500",
      };
  }
}

function formatLegacyFeedback(feedback: string): FeedbackSection[] {
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
      type: "mastered",
      title: "✅ Yang Sudah Dikuasai",
      icon: "CheckCircle",
      content: strengths,
      ...getColorScheme("mastered")
    });
  }

  if (improvements.length > 0) {
    sections.push({
      type: "improvement",
      title: "🎯 Area untuk Diperbaiki",
      icon: "Target",
      content: improvements,
      ...getColorScheme("improvement")
    });
  }

  if (motivation.length > 0) {
    sections.push({
      type: "motivation",
      title: "🚀 Motivasi & Saran",
      icon: "Trophy",
      content: motivation,
      ...getColorScheme("motivation")
    });
  }

  // If no categorization worked, return original feedback as general
  if (sections.length === 0) {
    sections.push({
      type: "performance",
      title: "📝 Feedback AI",
      icon: "Brain",
      content: [feedback],
      ...getColorScheme("performance")
    });
  }

  return sections;
}
