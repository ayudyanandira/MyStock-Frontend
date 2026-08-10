import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, ArrowDownLeft, ArrowUpRight, AlertTriangle, Search, Plus, RefreshCw, Truck } from "lucide-react";
import { dashboardService, type DashboardResponse } from "../../api/Services/dashboardService";

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await dashboardService.getDashboardData();
      setData(res);
    } catch (error) {
      console.error("Gagal memuat data dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Ekstraksi data aman dari response backend
  const summary = data?.summary || { total_barang: 0, total_supplier: 0, stok_minimum: 0 };
  const barangStokKritis = data?.barang_stok_kritis || [];
  const penerimaanTerakhir = data?.penerimaan_terakhir || [];
  const penggunaanTerakhir = data?.penggunaan_terakhir || [];

  // Helper untuk membaca nilai string / objek dengan aman
  const getSafeString = (val: any, fallbackKey: string = "nama") => {
    if (!val) return "-";
    if (typeof val === "object") return val[fallbackKey] || val.nama_kategori || val.nama_satuan || "-";
    return String(val);
  };

  // Filter pencarian untuk daftar barang stok kritis
  const filteredBarangKritis = barangStokKritis.filter((b: any) => {
    const nama = (b.nama_barang || b.nama || "").toLowerCase();
    const kode = (b.kode_barang || b.kode || "").toLowerCase();
    const kat = getSafeString(b.kategori).toLowerCase();
    const query = search.toLowerCase();
    return nama.includes(query) || kode.includes(query) || kat.includes(query);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 🚀 Header & Action Fast-Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800">Dashboard Stok</h1>
          <p className="text-xs md:text-sm text-slate-500">Ringkasan kondisi bahan pangan SPPG Munggur hari ini</p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={loadData} className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition shadow-xs" title="Refresh Data">
            <RefreshCw size={18} className={loading ? "animate-spin text-emerald-600" : ""} />
          </button>

          <button
            onClick={() => navigate("/penerimaan")}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-xs active:scale-95 transition">
            <Plus size={16} /> Barang Masuk
          </button>

          <button
            onClick={() => navigate("/penggunaan")}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-xs active:scale-95 transition">
            <Plus size={16} /> Pakai Barang
          </button>
        </div>
      </div>

      {/* 📊 KPI / Stat Cards (Auto-Layout Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        <StatCard title="Total Jenis Barang" value={summary.total_barang} unit="Item" icon={<Package className="text-blue-600" size={22} />} color="bg-blue-50/70 border-blue-200 text-blue-900" />
        <StatCard title="Total Supplier" value={summary.total_supplier} unit="Mitra" icon={<Truck className="text-emerald-600" size={22} />} color="bg-emerald-50/70 border-emerald-200 text-emerald-900" />
        <StatCard title="Stok Menipis / Kritis" value={summary.stok_minimum} unit="Perlu Reorder" icon={<AlertTriangle className="text-red-600" size={22} />} color="bg-red-50/70 border-red-200 text-red-900" />
      </div>

      {/* ⚠️ NOTIFIKASI STOK MINIMUM (FR-11) */}
      {barangStokKritis.length > 0 ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-100 text-red-600 rounded-xl shrink-0 mt-0.5">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h4 className="font-bold text-red-900 text-xs md:text-sm">Peringatan Stok Minimum!</h4>
              <p className="text-xs text-red-700 mt-0.5">
                Terdapat {barangStokKritis.length} bahan baku berada di bawah batas minimum:{" "}
                <span className="font-bold underline">{barangStokKritis.map((b: any) => `${b.nama_barang || b.nama} (${b.stok} ${getSafeString(b.satuan)})`).join(", ")}</span>
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs md:text-sm shadow-xs">
          <span className="font-bold">Kondisi Stok Aman 👍</span>
          <p className="mt-0.5 text-emerald-700">Seluruh persediaan bahan baku saat ini berada di atas batas minimum stok.</p>
        </div>
      )}

      {/* 📋 TABEL STOK REORDER / KRITIS REAL-TIME */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-800 text-sm md:text-base">Pantauan Stok Kritis (Reorder)</h3>
            <p className="text-xs text-slate-500">Daftar bahan pangan yang membutuhkan penambahan pasokan segera</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kode, nama, atau kategori..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left text-xs md:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th className="p-3">Kode</th>
                <th className="p-3">Nama Bahan Pangan</th>
                <th className="p-3">Kategori</th>
                <th className="p-3">Stok Saat Ini</th>
                <th className="p-3">Stok Min</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-slate-400">
                    Memuat data stok...
                  </td>
                </tr>
              ) : filteredBarangKritis.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-slate-400">
                    Tidak ada bahan pangan dengan stok kritis saat ini.
                  </td>
                </tr>
              ) : (
                filteredBarangKritis.map((item: any, idx: number) => (
                  <tr key={item.id || idx} className="bg-red-50/30 hover:bg-red-50/50 transition">
                    <td className="p-3 font-mono text-slate-500 font-bold">{item.kode_barang || item.kode || "-"}</td>
                    <td className="p-3 font-bold text-slate-800">{item.nama_barang || item.nama}</td>
                    <td className="p-3 text-slate-500">{getSafeString(item.kategori)}</td>
                    <td className="p-3 font-extrabold text-red-700">
                      {item.stok} <span className="text-xs font-normal text-slate-500">{getSafeString(item.satuan)}</span>
                    </td>
                    <td className="p-3 text-slate-500">
                      {item.stok_minimum || item.min_stok || 0} {getSafeString(item.satuan)}
                    </td>
                    <td className="p-3">
                      <span className="bg-red-100 text-red-800 px-2.5 py-1 rounded-full text-[10px] font-extrabold">Menipis</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🔄 GRID TRANSAKSI TERAKHIR (PENERIMAAN & PENGGUNAAN) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Penerimaan Terakhir */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <ArrowDownLeft size={18} className="text-emerald-600" /> Penerimaan Terakhir
            </h3>
            <button onClick={() => navigate("/penerimaan")} className="text-xs text-emerald-600 hover:underline font-bold">
              Lihat Semua
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                <tr>
                  <th className="p-2.5">No. PO / Nota</th>
                  <th className="p-2.5">Supplier</th>
                  <th className="p-2.5">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {penerimaanTerakhir.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center p-4 text-slate-400">
                      Belum ada transaksi penerimaan
                    </td>
                  </tr>
                ) : (
                  penerimaanTerakhir.map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2.5 font-mono font-bold text-slate-700">{item.nomor_po || item.no_po || "-"}</td>
                      <td className="p-2.5 text-slate-600">{getSafeString(item.supplier, "nama_supplier")}</td>
                      <td className="p-2.5 text-slate-500">{item.tanggal_terima || item.tanggal || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Penggunaan Terakhir */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <ArrowUpRight size={18} className="text-amber-600" /> Penggunaan Terakhir
            </h3>
            <button onClick={() => navigate("/penggunaan")} className="text-xs text-amber-600 hover:underline font-bold">
              Lihat Semua
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                <tr>
                  <th className="p-2.5">Tanggal</th>
                  <th className="p-2.5">Keperluan</th>
                  <th className="p-2.5">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {penggunaanTerakhir.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center p-4 text-slate-400">
                      Belum ada transaksi penggunaan
                    </td>
                  </tr>
                ) : (
                  penggunaanTerakhir.map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2.5 font-mono text-slate-700">{item.tanggal || "-"}</td>
                      <td className="p-2.5 font-bold text-slate-700">{item.keperluan || "-"}</td>
                      <td className="p-2.5 text-slate-500">{item.catatan || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

/* Komponen Card Statistik */
const StatCard = ({ title, value, unit, icon, color }: { title: string; value: number; unit: string; icon: React.ReactNode; color: string }) => (
  <div className={`p-4 md:p-5 rounded-2xl border ${color} shadow-xs relative overflow-hidden transition hover:shadow-md`}>
    <div className="flex justify-between items-start">
      <p className="text-xs font-bold opacity-80">{title}</p>
      {icon}
    </div>
    <div className="mt-3 flex items-baseline gap-1.5">
      <span className="text-2xl md:text-3xl font-black">{value}</span>
      <span className="text-xs font-semibold opacity-75">{unit}</span>
    </div>
  </div>
);
