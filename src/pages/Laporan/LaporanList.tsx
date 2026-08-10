import React, { useEffect, useState } from "react";
import { Download, ShieldCheck, Calendar } from "lucide-react";
import { laporanService } from "../../api/Services/laporanService";

export const LaporanList: React.FC = () => {
  const [startDate, setStartDate] = useState("2026-08-01");
  const [endDate, setEndDate] = useState("2026-08-10");
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoadingLogs(true);
      try {
        // Pemanggilan method yang sesuai dengan laporanService.ts
        const res = await laporanService.getAuditLog();
        // Memastikan data selalu berbentuk array
        const logsData = Array.isArray(res) ? res : res?.data || [];
        setAuditLogs(logsData);
      } catch (err) {
        console.error("Gagal memuat audit log:", err);
        setAuditLogs([]);
      } finally {
        setLoadingLogs(false);
      }
    };

    fetchLogs();
  }, []);

  const handleExport = (type: "pdf" | "excel") => {
    try {
      laporanService.exportReport(type, startDate, endDate);
    } catch (err) {
      console.error("Gagal mengunduh laporan:", err);
      alert("Gagal mengunduh laporan. Periksa koneksi atau fitur backend.");
    }
  };

  // Helper aman untuk mengekstrak string nama Pengguna dari berbagai struktur Objek/String
  const renderPengguna = (log: any) => {
    const userObj = log.user || log.pengguna;
    if (typeof userObj === "object" && userObj !== null) {
      return userObj.name || userObj.nama || userObj.email || "System";
    }
    if (typeof userObj === "string" && userObj.trim() !== "") {
      return userObj;
    }
    return "System";
  };

  // Helper aman untuk mengekstrak teks Waktu
  const renderWaktu = (log: any) => {
    const timeVal = log.created_at || log.waktu || log.updated_at;
    if (typeof timeVal === "string") return timeVal;
    if (typeof timeVal === "object" && timeVal !== null) {
      return JSON.stringify(timeVal);
    }
    return "-";
  };

  // Helper aman untuk mengekstrak Teks Detail/Deskripsi
  const renderDetail = (log: any) => {
    const detailVal = log.detail || log.description || log.deskripsi || log.detail_transaksi;
    if (typeof detailVal === "object" && detailVal !== null) {
      return JSON.stringify(detailVal);
    }
    return detailVal || "-";
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-800">Laporan & Audit Log</h1>
        <p className="text-xs md:text-sm text-slate-500">Filter, rekap data stok, cetak dokumen, dan riwayat aktivitas sistem</p>
      </div>

      {/* Export & Filter Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <Calendar size={18} className="text-emerald-600" /> Filter & Cetak Laporan Reorder
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Dari Tanggal</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full border border-slate-300 rounded-xl p-2.5 text-xs" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Sampai Tanggal</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full border border-slate-300 rounded-xl p-2.5 text-xs" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleExport("pdf")} className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white p-2.5 rounded-xl font-bold text-xs shadow-sm transition active:scale-95">
              <Download size={16} /> Export PDF
            </button>
            <button onClick={() => handleExport("excel")} className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-xl font-bold text-xs shadow-sm transition active:scale-95">
              <Download size={16} /> Export Excel
            </button>
          </div>
        </div>
      </div>

      {/* Audit Log Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <ShieldCheck size={18} className="text-blue-600" /> Audit Log Aktivitas Pengguna
        </h3>

        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left text-xs md:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th className="p-3">Waktu</th>
                <th className="p-3">Pengguna</th>
                <th className="p-3">Aksi</th>
                <th className="p-3">Detail Transaksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loadingLogs ? (
                <tr>
                  <td colSpan={4} className="text-center p-6 text-slate-400">
                    Memuat log...
                  </td>
                </tr>
              ) : auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center p-6 text-slate-400">
                    Belum ada data audit log aktivitas.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log, index) => (
                  <tr key={log.id || index} className="hover:bg-slate-50">
                    <td className="p-3 font-mono text-slate-500 text-xs">{renderWaktu(log)}</td>
                    <td className="p-3 font-bold text-slate-800">{renderPengguna(log)}</td>
                    <td className="p-3">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold text-[10px]">{log.aksi || log.action || log.event || "Aktivitas"}</span>
                    </td>
                    <td className="p-3 text-slate-600">{renderDetail(log)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
