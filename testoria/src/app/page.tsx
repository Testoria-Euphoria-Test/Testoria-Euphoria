export default function Home() {
  // Hardcoded data untuk paket try out
  const packages = [
    {
      _id: "1",
      title: "UTBK Saintek 2024",
      category: "UTBK",
      creator: "Dr. Ahmad Susanto",
      duration: 180,
      description:
        "Paket lengkap try out UTBK Saintek dengan soal-soal terbaru dan pembahasan detail",
      price: 150000,
      totalQuestions: 100,
      difficulty: "Medium",
      image: "/images/utbk-saintek.jpg",
    },
    {
      _id: "2",
      title: "UTBK Soshum 2024",
      category: "UTBK",
      creator: "Prof. Siti Nurhaliza",
      duration: 180,
      description:
        "Try out UTBK Soshum dengan soal prediksi dan strategi pengerjaan yang efektif",
      price: 150000,
      totalQuestions: 100,
      difficulty: "Medium",
      image: "/images/utbk-soshum.jpg",
    },
    {
      _id: "3",
      title: "CPNS 2024 - TWK",
      category: "CPNS",
      creator: "Drs. Bambang Wijaya",
      duration: 90,
      description:
        "Paket try out CPNS fokus Tes Wawasan Kebangsaan dengan materi terkini",
      price: 100000,
      totalQuestions: 35,
      difficulty: "Easy",
      image: "/images/cpns-twk.jpg",
    },
    {
      _id: "4",
      title: "CPNS 2024 - TIU",
      category: "CPNS",
      creator: "Dr. Ratna Sari",
      duration: 100,
      description:
        "Try out CPNS Tes Intelegensi Umum dengan soal logika dan matematika",
      price: 100000,
      totalQuestions: 35,
      difficulty: "Hard",
      image: "/images/cpns-tiu.jpg",
    },
    {
      _id: "5",
      title: "Simulasi SNBT 2024",
      category: "SNBT",
      creator: "Tim Edutech",
      duration: 195,
      description:
        "Simulasi lengkap SNBT dengan format terbaru dan analisis hasil detail",
      price: 200000,
      totalQuestions: 120,
      difficulty: "Hard",
      image: "/images/snbt-2024.jpg",
    },
    {
      _id: "6",
      title: "Try Out Kedinasan 2024",
      category: "Kedinasan",
      creator: "Akademi Prestasi",
      duration: 120,
      description:
        "Paket try out untuk berbagai sekolah kedinasan dengan soal prediksi akurat",
      price: 175000,
      totalQuestions: 80,
      difficulty: "Medium",
      image: "/images/kedinasan.jpg",
    },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pt-20 pb-12">
        {/* Header Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Testoria Dashboard
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Platform try out online terpercaya untuk persiapan ujian UTBK,
              CPNS, SNBT, dan Kedinasan
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">6</div>
              <div className="text-gray-600">Paket Try Out</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                1,250+
              </div>
              <div className="text-gray-600">Peserta Aktif</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">98%</div>
              <div className="text-gray-600">Tingkat Kepuasan</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                4.8/5
              </div>
              <div className="text-gray-600">Rating Rata-rata</div>
            </div>
          </div>
        </div>

        {/* Packages Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Paket Try Out Tersedia
            </h2>
            <p className="text-gray-600">
              Pilih paket try out sesuai dengan kebutuhan persiapan ujian Anda
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div
                key={pkg._id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                {/* Card Header */}
                <div className="relative">
                  <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="text-4xl font-bold mb-2">
                        {pkg.category}
                      </div>
                      <div className="text-lg opacity-90">
                        {pkg.totalQuestions} Soal
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                        pkg.difficulty
                      )}`}
                    >
                      {pkg.difficulty}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {pkg.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {pkg.description}
                    </p>
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">Pembuat:</span>{" "}
                      {pkg.creator}
                    </div>
                  </div>

                  {/* Package Info */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {pkg.duration} menit
                    </div>
                    <div className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      {pkg.totalQuestions} soal
                    </div>
                  </div>

                  {/* Price and Action */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {formatPrice(pkg.price)}
                      </div>
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200">
                      Mulai Try Out
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-4">
              Siap Menghadapi Ujian Impianmu?
            </h3>
            <p className="text-lg mb-6 opacity-90">
              Bergabunglah dengan ribuan siswa lainnya yang telah merasakan
              manfaat try out di Testoria
            </p>
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors duration-200">
              Daftar Sekarang
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
