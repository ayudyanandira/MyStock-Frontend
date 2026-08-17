import { useEffect, useState } from "react";
import axios from "@/api/axios";

interface StockMovementItem {
  id: number;
  created_at: string;
  qty_in: number;
  qty_out: number;
  stock_before: number;
  stock_after: number;
  reference_type?: string;
  reference_id?: string | number;
  keterangan?: string;
  barang?: {
    nama_barang?: string;
    satuan?: { nama: string } | string;
  };
  product?: {
    nama_barang?: string;
    satuan?: { nama: string } | string;
  };
}

export default function RiwayatMutasi() {
  const [logs, setLogs] = useState<StockMovementItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMutasi = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/stock-movements", {
        headers: { Accept: "application/json" },
      });

      const responseData = res.data;
      let logsData: StockMovementItem[] = [];
      if (Array.isArray(responseData?.data)) {
        logsData = responseData.data;
      } else if (Array.isArray(responseData)) {
        logsData = responseData;
      }

      setLogs(logsData);
    } catch (err) {
      console.error("Gagal mengambil data mutasi:", err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMutasi();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Riwayat Mutasi Stok (Log)</h1>
          <p className="text-xs text-slate-500 mt-1">Memantau seluruh transaksi barang masuk & keluar beserta timestamp presisi.</p>
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Waktu & Tanggal</th>
                <th className="py-3 px-4">Nama Barang</th>
                <th className="py-3 px-4 text-center">Jenis</th>
                <th className="py-3 px-4 text-right">Jumlah</th>
                <th className="py-3 px-4 text-right">Stok Awal</th>
                <th className="py-3 px-4 text-right">Stok Akhir</th>
                <th className="py-3 px-4">Referensi / Ket</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Memuat data riwayat...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Belum ada riwayat mutasi stok.
                  </td>
                </tr>
              ) : (
                logs.map((item) => {
                  const dateObj = new Date(item.created_at);
                  const formattedDate = !isNaN(dateObj.getTime())
                    ? dateObj.toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "-";
                  const formattedTime = !isNaN(dateObj.getTime())
                    ? dateObj.toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "";

                  const isMasuk = Number(item.qty_in) > 0;
                  const jenisTransaksi = isMasuk ? "MASUK" : "KELUAR";
                  const jumlah = isMasuk ? item.qty_in : item.qty_out;

                  const namaBarang = item.barang?.nama_barang || item.product?.nama_barang || "Barang Tanpa Nama";
                  const barangObj = item.barang || item.product;
                  const satuanName = typeof barangObj?.satuan === "object" ? barangObj?.satuan?.nama : barangObj?.satuan || "";

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* WAKTU & TANGGAL */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-700 block">{formattedDate}</span>
                        {formattedTime && <span className="text-[11px] text-slate-400 font-mono">{formattedTime} WIB</span>}
                      </td>

                      {/* NAMA BARANG */}
                      <td className="py-3 px-4 font-medium text-slate-800 capitalize">{namaBarang}</td>

                      {/* BADGE JENIS */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${
                            jenisTransaksi === "MASUK" ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-rose-100 text-rose-700 border border-rose-200"
                          }`}>
                          {jenisTransaksi}
                        </span>
                      </td>

                      {/* JUMLAH */}
                      <td className="py-3 px-4 text-right font-semibold text-slate-700 whitespace-nowrap">
                        {jumlah} <span className="text-xs font-normal text-slate-500">{satuanName}</span>
                      </td>

                      {/* STOK AWAL */}
                      <td className="py-3 px-4 text-right text-slate-500 font-mono">{item.stock_before}</td>

                      {/* STOK AKHIR */}
                      <td className="py-3 px-4 text-right font-bold text-slate-800 font-mono">{item.stock_after}</td>

                      {/* REFERENSI / KET */}
                      <td className="py-3 px-4 text-slate-600 max-w-[200px] truncate">
                        <div className="flex items-center gap-1.5">
                          {item.reference_id && <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[11px] font-mono border border-slate-200">#{item.reference_id}</span>}
                          <span className="text-xs text-slate-500 truncate">{item.keterangan && item.keterangan !== "-" ? item.keterangan : ""}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
