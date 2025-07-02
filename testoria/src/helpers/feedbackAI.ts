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
  passage?: string; // Add passage field
  imagePrompt?: string; // Add imagePrompt field
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
    correctAnswers: answers.filter(ans => ans.isCorrect).length,
    accuracyPercentage: Math.round((answers.filter(ans => ans.isCorrect).length / answers.length) * 100)
  });

  // Debug logging untuk setiap jawaban
  console.log("🔍 FeedbackAI: Detailed answer analysis:");
  answers.forEach((ans, index) => {
    const q = questions.find(q => q._id.toString() === ans.questionId.toString());
    console.log(`  ${index + 1}. Question: "${q?.questionText?.substring(0, 50)}..." | Selected: ${ans.selectedAnswer} | Correct: ${q?.correctAnswer} | Status: ${ans.isCorrect ? 'CORRECT ✓' : 'WRONG ✗'}`);
  });

  const formatted = answers
    .map((ans, index) => {
      const q = questions.find(
        (q) => q._id.toString() === ans.questionId.toString()
      );

      let questionContext = "";
      if (q?.passage && q.passage.trim()) {
        questionContext = `[Berdasarkan bacaan/passage] `;
      }

      return `${index + 1}. ${questionContext}Q: ${q?.questionText}
Jawaban dipilih: ${ans.selectedAnswer}
Jawaban benar: ${q?.correctAnswer}
Status: ${ans.isCorrect ? "BENAR ✓" : "SALAH ✗"}
Penjelasan: ${q?.explanation || "Tidak ada penjelasan"}
${q?.passage ? `Bacaan: ${q.passage.substring(0, 150)}...` : ""}\n`;
    })
    .join("\n");

  console.log(
    "🤖 FeedbackAI: Formatted data:",
    formatted.substring(0, 200) + "..."
  );

  // Calculate performance metrics
  const totalQuestions = answers.length;
  const correctAnswers = answers.filter(ans => ans.isCorrect).length;
  const incorrectAnswers = totalQuestions - correctAnswers;
  const accuracyPercentage = Math.round((correctAnswers / totalQuestions) * 100);

  // Determine performance level
  let performanceLevel = "";
  if (score >= 80) performanceLevel = "SANGAT BAIK";
  else if (score >= 70) performanceLevel = "BAIK";
  else if (score >= 60) performanceLevel = "CUKUP";
  else if (score >= 40) performanceLevel = "KURANG";
  else performanceLevel = "PERLU PERBAIKAN SERIUS";

  // Separate correct and incorrect answers for better analysis
  const correctAnswersList = answers.filter(ans => ans.isCorrect).map((ans, index) => {
    const q = questions.find(q => q._id.toString() === ans.questionId.toString());
    return `- Soal ${answers.indexOf(ans) + 1}: ${q?.questionText?.substring(0, 100)}...`;
  });

  const incorrectAnswersList = answers.filter(ans => !ans.isCorrect).map((ans, index) => {
    const q = questions.find(q => q._id.toString() === ans.questionId.toString());
    return `- Soal ${answers.indexOf(ans) + 1}: ${q?.questionText?.substring(0, 100)}... (Dipilih: ${ans.selectedAnswer}, Benar: ${q?.correctAnswer})`;
  });

  // Debug logging untuk memastikan kategorisasi benar
  console.log("📊 FeedbackAI: Categorization check:");
  console.log(`✅ Correct answers (${correctAnswersList.length}):`, correctAnswersList);
  console.log(`❌ Incorrect answers (${incorrectAnswersList.length}):`, incorrectAnswersList);
  console.log(`📈 Performance level: ${performanceLevel} (${accuracyPercentage}%)`);

  // Calculate expected proportion
  const expectedMasteredPoints = Math.max(1, Math.min(correctAnswers, correctAnswers <= 2 ? 1 : Math.ceil(correctAnswers * 0.7)));
  const expectedImprovementPoints = Math.max(1, Math.min(incorrectAnswers, Math.ceil(incorrectAnswers * 0.8)));

  console.log(`🎯 Expected proportions: Mastered: ${expectedMasteredPoints} points, Improvement: ${expectedImprovementPoints} points`);

  const prompt = `
Anda adalah AI evaluator tes yang memberikan feedback konstruktif dan akurat. Seorang pengguna menyelesaikan tes dengan skor ${score} dari 100.

STATISTIK PERFORMA:
- Total soal: ${totalQuestions}
- Jawaban benar: ${correctAnswers} soal (${accuracyPercentage}%)
- Jawaban salah: ${incorrectAnswers} soal
- Kategori performa: ${performanceLevel}

SOAL YANG DIJAWAB BENAR:
${correctAnswersList.length > 0 ? correctAnswersList.join('\n') : 'Tidak ada soal yang dijawab benar'}

SOAL YANG DIJAWAB SALAH:
${incorrectAnswersList.length > 0 ? incorrectAnswersList.join('\n') : 'Semua soal dijawab benar'}

ATURAN PENTING UNTUK ANALISIS:
1. Proporsi "Yang Dikuasai" vs "Area Diperbaiki" harus sesuai performa:
   - Skor 0-30%: Maksimal 1-2 poin di "Yang Dikuasai", fokus pada "Area Diperbaiki"
   - Skor 31-50%: Seimbang, tapi "Area Diperbaiki" lebih banyak
   - Skor 51-70%: Seimbang antara keduanya
   - Skor 71-80%: "Yang Dikuasai" lebih banyak
   - Skor 81-100%: Fokus pada "Yang Dikuasai", minimal poin di "Area Diperbaiki"

2. HANYA masukkan topik dari soal yang benar-benar sesuai statusnya
3. Hindari judul/subjudul redundan - langsung ke poin utama
4. Gunakan bullet points (•) untuk daftar yang bersih

Format output yang HARUS diikuti:

**EVALUASI PERFORMA:**
[Penilaian objektif 2-3 kalimat berdasarkan skor ${score}%]

**Yang Dikuasai:**
[Jika skor rendah (<30%), batasi maksimal 2 poin dan fokus pada aspek paling mendasar yang benar. Jika tidak ada/sangat sedikit jawaban benar, tulis: "Berdasarkan hasil tes, belum ada area yang dapat dikatakan dikuasai dengan baik."]

**Area yang Perlu Diperbaiki:**
[Berikan lebih banyak poin jika jawaban salah lebih banyak. Identifikasi pola kesalahan dan topik spesifik.]

**REKOMENDASI BELAJAR:**
[3-4 strategi konkret dengan langkah pembelajaran yang spesifik]

**MOTIVASI & LANGKAH SELANJUTNYA:**
[Motivasi realistis minimal 2 poin dengan format:
[Aksi konkret 1]
[Aksi konkret 2]
Tambahkan kalimat motivasi tambahan setelah checklist]

PEDOMAN SKOR:
- 0-20%: "Hasil menunjukkan perlu pembelajaran dari fondasi dasar..."
- 21-40%: "Ada ruang besar untuk perbaikan, namun ini adalah titik awal yang baik..."
- 41-60%: "Menunjukkan pemahaman parsial, perlu penguatan di beberapa area..."
- 61-80%: "Pencapaian yang baik dengan beberapa area yang perlu diasah..."
- 81-100%: "Pencapaian yang sangat baik dan menunjukkan penguasaan yang solid..."

Pastikan tidak ada redundansi judul dan proporsi sesuai dengan performa aktual.
`;

  console.log("🤖 FeedbackAI: Sending request to OpenAI...");

  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini", // Use more capable model
    messages: [
      {
        role: "system",
        content: "Anda adalah AI evaluator pendidikan yang ahli dalam memberikan feedback konstruktif dan proporsional. Anda HARUS mengikuti aturan proporsi dengan ketat: jika skor rendah, batasi poin di 'Yang Dikuasai' dan perbanyak di 'Area Diperbaiki'. Hindari redundansi judul dan selalu sertakan checklist di motivasi."
      },
      { role: "user", content: prompt }
    ],
    temperature: 0.7, // Balance between consistency and creativity
    max_tokens: 1200, // Increase for detailed feedback with checklist
    top_p: 0.85, // More focused responses
  });

  const feedback =
    res.choices[0].message.content?.trim() || "No feedback generated.";
  console.log("🤖 FeedbackAI: Generated feedback:", feedback);

  return feedback;
}
