import Link from "next/link";
import {
  BarChart3,
  MapPin,
  Search,
  Download,
  FileText,
  Table,
  Image as ImageIcon,
  CheckCircle2,
  Ship,
  Bookmark,
  TrendingUp,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Allstats BPS: Aplikasi Data Statistik Resmi Indonesia",
  description:
    "Download Allstats BPS untuk akses data statistik resmi Indonesia. Dapatkan indikator strategis, data inflasi, & ekspor impor HS code langsung di mobile Anda!",
};

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen font-sans bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-6xl">
          <div className="flex items-center gap-2 font-bold text-xl text-bps-blue tracking-tight">
            <Image
              src={"/logo-bps.svg"}
              alt="Logo BPS"
              width={36}
              height={36}
            />
            <span>Allstats BPS</span>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
            <Link
              href="#fitur"
              className="hover:text-bps-blue transition-colors"
            >
              Fitur Unggulan
            </Link>
            <Link
              href="#eksplorasi"
              className="hover:text-bps-blue transition-colors"
            >
              Eksplorasi Data
            </Link>
            <Link
              href="#unduh"
              className="hover:text-bps-blue transition-colors"
            >
              Format Unduh
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button
              asChild
              size="sm"
              className="hidden sm:flex bg-bps-orange hover:bg-bps-orange/90 text-white rounded-full font-bold px-6"
            >
              <a
                href="https://play.google.com/store/apps/details?id=id.go.bps.allstats"
                target="_blank"
                rel="noopener noreferrer"
              >
                Download App
              </a>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative pt-20 pb-24 md:pt-32 md:pb-32 overflow-hidden bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="flex flex-col gap-6">
                <div className="inline-flex items-center rounded-full border border-bps-blue/30 bg-bps-blue/10 px-3 py-1 text-sm font-medium text-bps-blue w-fit">
                  <span className="flex h-2 w-2 rounded-full bg-bps-blue mr-2"></span>
                  Aplikasi Data Statistik Resmi
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                  Satu Genggaman untuk Seluruh{" "}
                  <span className="text-bps-blue">Data Statistik Resmi</span>{" "}
                  Indonesia
                </h1>
                <p className="text-lg text-slate-600 max-w-lg leading-relaxed">
                  Akses indikator strategis, data inflasi, hingga pertumbuhan
                  ekonomi lebih cepat dan mudah. Allstats BPS hadir untuk
                  peneliti, akademisi, dan Sahabat Data di mana saja.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <a
                    href="https://play.google.com/store/apps/details?id=id.go.bps.allstats"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-bps-green text-white px-6 py-3.5 rounded-xl hover:bg-bps-green/90 transition-colors font-bold"
                  >
                    Google Play
                  </a>
                  <a
                    href="https://apps.apple.com/id/app/allstats-bps/id1495703496"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-bps-blue text-white px-6 py-3.5 rounded-xl hover:bg-bps-blue/90 transition-colors font-bold"
                  >
                    App Store
                  </a>
                </div>
              </div>
              <div className="relative mx-auto w-full max-w-[320px] md:max-w-md">
                {/* Visual Mockup Placeholder */}
                <div className="aspect-[1/2] rounded-[2.5rem] border-[8px] border-slate-900 bg-slate-100 shadow-2xl overflow-hidden relative flex items-center justify-center">
                  <div className="absolute top-0 inset-x-0 h-6 bg-slate-900 w-1/2 mx-auto rounded-b-2xl"></div>
                  <div className="flex flex-col items-center gap-4 text-slate-400 p-8 text-center">
                    <Smartphone className="w-16 h-16 text-bps-blue" />
                    <p className="font-medium text-sm">
                      Mockup Smartphone: Menampilkan Halaman Beranda Allstats
                      BPS yang clean dan modern
                    </p>
                  </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-bps-orange/20 blur-3xl rounded-full"></div>
              </div>
            </div>
          </div>
        </section>

        {/* VALUE PROPOSITION SECTION */}
        <section className="py-20 bg-slate-50 border-y border-slate-200">
          <div className="container mx-auto px-4 max-w-6xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-12">
              Mengapa Sahabat Data Memilih Allstats BPS?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                <div className="w-14 h-14 bg-bps-blue/10 text-bps-blue rounded-2xl flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">Resmi & Tepercaya</h3>
                <p className="text-slate-600 leading-relaxed">
                  Sumber data statistik resmi langsung dari Badan Pusat
                  Statistik (BPS) Republik Indonesia, tanpa perantara.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                <div className="w-14 h-14 bg-bps-green/10 text-bps-green rounded-2xl flex items-center justify-center mb-6">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">Real-time & Akurat</h3>
                <p className="text-slate-600 leading-relaxed">
                  Dapatkan update indikator strategis Indonesia terbaru secara
                  real-time segera setelah dirilis.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                <div className="w-14 h-14 bg-bps-orange/10 text-bps-orange rounded-2xl flex items-center justify-center mb-6">
                  <MapPin className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">
                  Cakupan Wilayah Lengkap
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Akses data terstruktur dari tingkat Nasional, Provinsi, hingga
                  Kabupaten/Kota dalam hitungan detik.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FITUR UNGGULAN & EKSPLORASI DATA */}
        <section id="fitur" className="py-24 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1 relative">
                {/* Visual Mockup Placeholder */}
                <div className="relative w-full aspect-square md:aspect-video lg:aspect-square bg-slate-100 rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex items-center justify-center p-8">
                  <div className="flex flex-col items-center gap-4 text-slate-500 text-center">
                    <BarChart3 className="w-16 h-16 text-bps-blue" />
                    <p className="font-medium text-sm max-w-xs">
                      Gunakan mockup layar berjejer yang menampilkan UI Grafik
                      Indikator Strategis dan Tabel Ekspor-Impor
                    </p>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2 flex flex-col gap-8">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    Eksplorasi Data Lebih Dalam dengan Fitur Unggulan
                  </h2>
                  <p className="text-lg text-slate-600">
                    Satu aplikasi untuk menjawab semua kebutuhan riset dan
                    analisis data Anda dengan antarmuka yang ramah pengguna.
                  </p>
                </div>
                <div className="flex flex-col gap-6">
                  <div className="flex gap-4">
                    <div className="shrink-0 mt-1">
                      <div className="w-10 h-10 bg-bps-blue/10 text-bps-blue rounded-full flex items-center justify-center">
                        <BarChart3 className="w-5 h-5" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold mb-2">
                        Indikator Strategis & Tabel Dinamis
                      </h4>
                      <p className="text-slate-600">
                        Pantau data inflasi, pertumbuhan ekonomi Indonesia, dan
                        indikator kunci lainnya dengan lebih cepat. Kemudahan
                        akses ke sumber data tabel langsung dari genggaman Anda.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="shrink-0 mt-1">
                      <div className="w-10 h-10 bg-bps-orange/10 text-bps-orange rounded-full flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold mb-2">
                        Publikasi & Berita Resmi Statistik
                      </h4>
                      <p className="text-slate-600">
                        Akses seluruh Publikasi BPS, ARC Publikasi, Berita Resmi
                        Statistik (BRS), dan Berita Kegiatan BPS secara
                        komprehensif.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-4 bg-bps-green/5 rounded-2xl border border-bps-green/20">
                    <div className="shrink-0 mt-1">
                      <div className="w-10 h-10 bg-bps-green text-white rounded-full flex items-center justify-center">
                        <Ship className="w-5 h-5" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-lg font-bold text-slate-800">
                          Eksplorasi Data Ekspor-Impor
                        </h4>
                        <span className="bg-bps-orange text-white text-xs px-2 py-0.5 rounded-full font-bold tracking-wider">
                          NEW
                        </span>
                      </div>
                      <p className="text-slate-600">
                        Analisis data perdagangan internasional dengan mudah.
                        Download data ekspor impor berdasarkan HS Code, negara
                        asal/tujuan, pelabuhan, tahun, dan bulan.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CARA KERJA / PENCARIAN DATA INSTAN */}
        <section className="py-24 bg-slate-900 text-white">
          <div className="container mx-auto px-4 max-w-6xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Temukan Data dalam Hitungan Detik
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-16">
              Sistem pencarian dan navigasi yang dioptimalkan untuk memberikan
              efisiensi maksimal dalam pencarian data statistik.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700/50 flex flex-col items-center text-center">
                <MapPin className="w-12 h-12 text-bps-orange mb-6" />
                <h3 className="text-xl font-bold mb-3">
                  Filter Wilayah Akurat
                </h3>
                <p className="text-slate-400">
                  Gunakan fitur &quot;Pilih Wilayah&quot; untuk mengerucutkan
                  data spesifik dari level provinsi hingga kabupaten/kota.
                </p>
              </div>
              <div className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700/50 flex flex-col items-center text-center">
                <Search className="w-12 h-12 text-bps-green mb-6" />
                <h3 className="text-xl font-bold mb-3">
                  Pencarian Satu Halaman
                </h3>
                <p className="text-slate-400">
                  Pencarian berbasis kata kunci yang cerdas pada satu halaman
                  untuk hasil yang relevan dan efisien.
                </p>
              </div>
              <div className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700/50 flex flex-col items-center text-center">
                <Bookmark className="w-12 h-12 text-bps-blue mb-6" />
                <h3 className="text-xl font-bold mb-3">Menu Bookmarks</h3>
                <p className="text-slate-400">
                  Simpan indikator, tabel, atau publikasi penting ke dalam menu
                  Bookmarks untuk akses cepat di kemudian hari.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FORMAT MULTI-DOWNLOAD & AKSESIBILITAS */}
        <section
          id="unduh"
          className="py-24 bg-bps-blue/5 border-b border-bps-blue/10"
        >
          <div className="container mx-auto px-4 max-w-6xl text-center">
            <Download className="w-12 h-12 text-bps-blue mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-900">
              Unduh Data Sesuai Kebutuhan Anda
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-16">
              Simpan data penting langsung ke penyimpanan lokal handphone Anda
              dalam berbagai format yang siap digunakan untuk presentasi maupun
              analisis lanjutan.
            </p>
            <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <FileText className="w-10 h-10 text-bps-orange mb-4 mx-auto" />
                <h4 className="font-bold text-lg mb-2">Format PDF</h4>
                <p className="text-sm text-slate-600">
                  Sempurna untuk membaca dokumen Publikasi dan Berita Resmi
                  Statistik (BRS).
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <Table className="w-10 h-10 text-bps-green mb-4 mx-auto" />
                <h4 className="font-bold text-lg mb-2">Format Excel</h4>
                <p className="text-sm text-slate-600">
                  Unduh Tabel Dinamis BPS excel dan Tabel Statis untuk diolah
                  kembali sesuai kebutuhan riset.
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <ImageIcon className="w-10 h-10 text-bps-blue mb-4 mx-auto" />
                <h4 className="font-bold text-lg mb-2">Format JPG</h4>
                <p className="text-sm text-slate-600">
                  Simpan aset dari Galeri Infografis dan Silastik yang menarik
                  secara visual dengan resolusi tinggi.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CALL TO ACTION UTAMA */}
        <section className="py-24 bg-white text-center">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-slate-900 tracking-tight">
              Mulai Eksplorasi Data Statistik Sekarang!
            </h2>
            <p className="text-lg text-slate-600 mb-10">
              Bergabunglah dengan ribuan Sahabat Data lainnya yang telah
              menjadikan data BPS mobile sebagai referensi utama mereka.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a
                href="https://play.google.com/store/apps/details?id=id.go.bps.allstats"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-bps-green text-white px-8 py-4 rounded-xl hover:bg-bps-green/90 transition-colors font-bold text-lg"
              >
                Download di Play Store
              </a>
              <a
                href="https://apps.apple.com/id/app/allstats-bps/id1495703496"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-bps-blue text-white px-8 py-4 rounded-xl hover:bg-bps-blue/90 transition-colors font-bold text-lg"
              >
                Download di App Store
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-50 py-12 border-t border-slate-200">
        <div className="container mx-auto px-4 max-w-6xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <BarChart3 className="w-6 h-6 text-bps-blue" />
            <span>Allstats BPS</span>
          </div>
          <div className="text-center md:text-right text-sm text-slate-600">
            <p className="mb-1">
              Aplikasi resmi dari{" "}
              <strong>Badan Pusat Statistik (BPS) Republik Indonesia</strong>.
            </p>
            <p>
              Hubungi layanan dukungan kami di:{" "}
              <a
                href="mailto:dataweb@bps.go.id"
                className="text-bps-blue hover:underline font-medium"
              >
                dataweb@bps.go.id
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
