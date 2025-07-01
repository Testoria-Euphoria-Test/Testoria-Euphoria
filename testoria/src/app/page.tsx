import NavbarLanding from "@/components/NavbarLanding";
import Image from "next/image";
import Link from "next/link";
import PackageCard from "@/components/PackageCard";
import { PackageResponse } from "@/types/package";

export const dynamic = "force-dynamic";


export default async function Home() {
  const data = await fetch("http://localhost:3000/api/packages")
  const response = await data.json();
  const packages = response.data as PackageResponse[];



  return (
    <>
      <NavbarLanding />

      {/* Hero Section */}
      <section className="w-full relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <div className="inline-flex items-center px-4 py-2 bg-blue-600/20 backdrop-blur-sm rounded-full border border-blue-400/30 mb-6">
                <Image
                  width={120}
                  height={40}
                  src="/testoria.svg"
                  alt="Testoria Logo"
                />
              </div>

              <h1 className="text-4xl lg:text-6xl font-black tracking-tight mb-6 leading-tight uppercase">
                Kuasai <span className="text-blue-400">Masa Depanmu</span>
              </h1>

              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Platform try out online terpercaya untuk persiapan ujian UTBK,
                CPNS, SNBT, dan Kedinasan dengan sistem pembelajaran yang
                interaktif dan komprehensif.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/login">
                  <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-full shadow-xl hover:scale-105 hover:from-blue-500 hover:to-blue-600 transition-all duration-300 text-lg">
                    Mulai Sekarang
                  </button>
                </Link>
                <Link href="#packages">
                  <button className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-full hover:bg-white hover:text-black transition-all duration-300 text-lg">
                    Jelajahi Paket
                  </button>
                </Link>
              </div>
            </div>

            <div className="relative flex justify-center lg:justify-end">
              <Image
                width={500}
                height={400}
                src="/undraw_master-plan_m8ym.svg"
                alt="Ilustrasi Rencana Master"
                className="w-full h-auto max-w-lg transform hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 py-16 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-black text-blue-600 mb-2">
                {packages?.length || 0}+
              </div>
              <div className="text-gray-600 font-medium">Paket Try Out</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-black text-green-600 mb-2">
                1,250+
              </div>
              <div className="text-gray-600 font-medium">Peserta Aktif</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-black text-purple-600 mb-2">
                98%
              </div>
              <div className="text-gray-600 font-medium">Tingkat Kepuasan</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-black text-orange-600 mb-2">
                4.8/5
              </div>
              <div className="text-gray-600 font-medium">Rating Rata-rata</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="bg-white py-16 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-black mb-4 uppercase tracking-wide">
              Kategori Ujian
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Pilih kategori ujian sesuai dengan target dan tujuan Anda
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                label: "UTBK",
                desc: "Ujian Tulis Berbasis Komputer",
                icon: "🎓",
              },
              {
                label: "SNBT",
                desc: "Seleksi Nasional Berdasarkan Tes",
                icon: "📚",
              },
              {
                label: "CPNS",
                desc: "Calon Pegawai Negeri Sipil",
                icon: "🏛️",
              },
              {
                label: "Kedinasan",
                desc: "Sekolah Kedinasan",
                icon: "⚖️",
              },
            ].map((cat) => (
              <div
                key={cat.label}
                className="group cursor-pointer transition-all duration-300 hover:scale-105"
              >
                <div className="bg-gray-50 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 text-center border hover:border-blue-200">
                  <div className="text-4xl mb-4">{cat.icon}</div>
                  <h3 className="text-xl font-bold text-black mb-2 group-hover:text-blue-600 transition-colors">
                    {cat.label}
                  </h3>
                  <p className="text-gray-600 text-sm">{cat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section className="bg-gray-50 py-16" id="packages">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black text-black uppercase tracking-wide mb-2">
                Paket Try Out Terpopuler
              </h2>
              <p className="text-gray-600 text-lg">
                Pilih paket yang sesuai dengan kebutuhan persiapan ujian Anda
              </p>
            </div>
            <Link href="/login">
              <button className="px-6 py-3 bg-blue-600 text-white font-bold rounded-full shadow-lg hover:bg-blue-700 hover:scale-105 transition-all duration-300">
                Lihat Semua Paket
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages
              ?.slice(0, 6)
              .map((pkg) => <PackageCard key={pkg._id} package={pkg} />) || (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">
                  Belum ada paket try out tersedia.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-6">
            <span className="inline-block px-4 py-2 bg-white/20 text-white text-sm font-bold rounded-full mb-4">
              BERGABUNG SEKARANG
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 uppercase tracking-wide">
              Siap Menghadapi{" "}
              <span className="text-yellow-300">Ujian Impianmu?</span>
            </h2>
          </div>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
            Bergabunglah dengan ribuan siswa lainnya yang telah merasakan
            manfaat try out di <span className="font-bold">Testoria</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <button className="px-8 py-4 bg-white text-blue-600 font-bold rounded-full shadow-xl hover:scale-105 hover:bg-gray-100 transition-all duration-300 text-lg">
                Daftar Gratis
              </button>
            </Link>
            <Link href="/login">
              <button className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-full hover:bg-white hover:text-blue-600 transition-all duration-300 text-lg">
                Masuk Akun
              </button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
