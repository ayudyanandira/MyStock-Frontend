import React, { useEffect, useState, useRef } from "react";
import { Download, ShieldCheck, Calendar, Printer, Search, FileText, Loader2 } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { laporanService } from "../../api/Services/laporanService";
import { penerimaanService } from "../../api/Services/penerimaanService";
import { penggunaanService } from "../../api/Services/penggunaanService";
import { opnameService } from "../../api/Services/opnameService";

// Form Components
import { FormPenerimaanPrint } from "../../components/FormPenerimaanPrint";
import { FormPenggunaanPrint } from "../../components/FormPenggunaanPrint";
import { FormOpnamePrint } from "../../components/FormOpnamePrint";

// 1. Ambil Nomor Nota / Ref
// Helper Amankan No Nota/Ref (Mendahulukan NO PO dari Penerimaan)
const getNoNota = (tx: any) => tx?.nomor_transaksi || tx?.no_po || tx?.nomor_po || tx?.no_nota || tx?.nomor_penerimaan || tx?.nomor_penggunaan || tx?.nomor_opname || tx?.kode || (tx?.id ? `TRX-${tx.id}` : "-");

// 2. Format Tanggal
const getTanggal = (tx: any) => {
  const tgl = tx?.tanggal || tx?.tanggal_penerimaan || tx?.created_at;
  if (!tgl) return "-";
  try {
    return new Date(tgl).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return String(tgl);
  }
};

// 3. Parser Items & Kondisi Barang (Presisi untuk Penerimaan/PO & Penggunaan)
const getNormalizedItems = (tx: any) => {
  if (!tx) return [];

  // Ambil array detail dari semua kemungkinan nama property Laravel
  const rawItems = tx.details || tx.detail || tx.detail_penerimaan || tx.penerimaan_details || tx.items || tx.po?.details || [];

  return rawItems.map((item: any) => {
    const namaBarang = item.barang?.nama_barang || item.barang?.nama || item.nama_barang || "Bahan Pangan";

    const satuan = item.barang?.satuan || item.satuan || "Kg";

    // Pengecekan Kondisi Sesuai / Tidak Sesuai
    let isSesuai = true;
    if (typeof item.sesuai === "boolean") {
      isSesuai = item.sesuai;
    } else if (item.kondisi) {
      isSesuai = String(item.kondisi).toUpperCase() === "SESUAI" || String(item.kondisi).toUpperCase() === "BAIK";
    } else if (item.status_kondisi) {
      isSesuai = String(item.status_kondisi).toUpperCase() === "SESUAI";
    } else if (item.jumlah_diterima !== undefined && item.jumlah_pesan !== undefined) {
      isSesuai = Number(item.jumlah_diterima) === Number(item.jumlah_pesan);
    }

    return {
      nama_barang: namaBarang,
      jumlah: Number(item.jumlah_diterima ?? item.jumlah ?? item.qty ?? 0),
      satuan: satuan,
      stok_sistem: Number(item.stok_sistem ?? 0),
      stok_fisik: Number(item.stok_fisik ?? 0),
      selisih: Number(item.selisih ?? 0),
      sesuai: isSesuai,
      keterangan: item.keterangan || item.catatan || item.alasan || "-",
    };
  });
};

// =========================================================================
// KOMPONEN UTAMA
// =========================================================================
export const LaporanList: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"FORM" | "REKAP">("FORM");
  const [jenisForm, setJenisForm] = useState<"PENERIMAAN" | "PENGGUNAAN" | "OPNAME">("PENERIMAAN");
  const [searchNota, setSearchNota] = useState("");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTx, setLoadingTx] = useState(false);
  const [selectedData, setSelectedData] = useState<any>(null);

  const printRef = useRef<HTMLDivElement>(null);

  const handlePrintForm = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Form_${jenisForm}_${getNoNota(selectedData)}`,
  });

  // Fetch Transaksi
  useEffect(() => {
    const fetchTransactions = async () => {
      setLoadingTx(true);
      setSelectedData(null);
      try {
        let res: any = null;

        if (jenisForm === "PENERIMAAN") {
          res = await penerimaanService.getPenerimaanList();
          console.log("🔥 DATA PENERIMAAN DARI API:", res);
        } else if (jenisForm === "PENGGUNAAN") {
          res = await penggunaanService.getPenggunaanList();
          console.log("🔥 DATA PENGGUNAAN DARI API:", res);
        } else if (jenisForm === "OPNAME") {
          res = await opnameService.getOpnameList();
          console.log("🔥 DATA OPNAME DARI API:", res);
        }

        let dataList: any[] = [];
        if (Array.isArray(res)) {
          dataList = res;
        } else if (Array.isArray(res?.data)) {
          dataList = res.data;
        } else if (Array.isArray(res?.data?.data)) {
          dataList = res.data.data;
        }

        setTransactions(dataList);
      } catch (err) {
        console.error("Gagal memuat transaksi:", err);
        setTransactions([]);
      } finally {
        setLoadingTx(false);
      }
    };

    if (activeTab === "FORM") {
      fetchTransactions();
    }
  }, [jenisForm, activeTab]);

  // Search Filter
  const filteredTransactions = transactions.filter((tx) => {
    const nota = getNoNota(tx);
    return nota.toLowerCase().includes(searchNota.toLowerCase());
  });

  // State Rekap & Audit Log
  const [startDate, setStartDate] = useState("2026-08-01");
  const [endDate, setEndDate] = useState("2026-08-10");
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoadingLogs(true);
      try {
        const res = await laporanService.getAuditLog();
        const logsData = Array.isArray(res) ? res : res?.data || [];
        setAuditLogs(logsData);
      } catch (err) {
        console.error("Gagal memuat audit log:", err);
        setAuditLogs([]);
      } finally {
        setLoadingLogs(false);
      }
    };

    if (activeTab === "REKAP") {
      fetchLogs();
    }
  }, [activeTab]);

  const handleExport = (type: "pdf" | "excel") => {
    try {
      laporanService.exportReport(type, startDate, endDate);
    } catch (err) {
      alert("Gagal mengunduh laporan.");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-800">Pusat Laporan & Audit Log</h1>
        <p className="text-xs md:text-sm text-slate-500">Cetak form bukti transaksi resmi, unduh rekapitulasi data stok, dan pantau riwayat aktivitas.</p>
      </div>

      {/* TAB NAVIGATION */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab("FORM")}
          className={`pb-3 text-xs md:text-sm font-bold transition border-b-2 flex items-center gap-2 ${activeTab === "FORM" ? "border-emerald-600 text-emerald-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
          <FileText size={16} /> Cetak Form Transaksi (Satuan)
        </button>
        <button
          onClick={() => setActiveTab("REKAP")}
          className={`pb-3 text-xs md:text-sm font-bold transition border-b-2 flex items-center gap-2 ${activeTab === "REKAP" ? "border-emerald-600 text-emerald-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
          <Calendar size={16} /> Export Rekap & Audit Log
        </button>
      </div>

      {/* TAB 1: FORM CETAK */}
      {activeTab === "FORM" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Printer size={18} className="text-emerald-600" /> Pilih Transaksi Untuk Dicetak
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Form</label>
                <select value={jenisForm} onChange={(e) => setJenisForm(e.target.value as any)} className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-slate-50 outline-none focus:border-emerald-500 font-semibold">
                  <option value="PENERIMAAN">Form Penerimaan Bahan Pangan</option>
                  <option value="PENGGUNAAN">Form Penggunaan Bahan Pangan</option>
                  <option value="OPNAME">Berita Acara Stok Opname</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cari No. Nota / Referensi</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ketik No. Nota..."
                    value={searchNota}
                    onChange={(e) => setSearchNota(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl pl-8 pr-3 p-2.5 text-xs outline-none focus:border-emerald-500"
                  />
                  <Search size={14} className="absolute left-2.5 top-3.5 text-slate-400" />
                </div>
              </div>
            </div>

            {/* TABEL TRANSAKSI */}
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">No. Ref / Nota</th>
                    <th className="p-3">Tanggal</th>
                    <th className="p-3 text-center">Total Item</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loadingTx ? (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-slate-400">
                        <Loader2 size={18} className="animate-spin inline mr-2" /> Memuat data transaksi...
                      </td>
                    </tr>
                  ) : filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-slate-400">
                        Tidak ada transaksi ditemukan untuk kategori {jenisForm}.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((tx, idx) => {
                      const items = getNormalizedItems(tx);
                      return (
                        <tr key={tx.id || idx} className="hover:bg-slate-50">
                          <td className="p-3 font-mono font-bold text-slate-800">{getNoNota(tx)}</td>
                          <td className="p-3 text-slate-600">{getTanggal(tx)}</td>
                          <td className="p-3 text-center font-semibold text-slate-700">{items.length} Item</td>
                          <td className="p-3 text-right">
                            <button onClick={() => setSelectedData(tx)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-bold text-[11px] transition">
                              Preview & Cetak
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* PREVIEW CETAK */}
          {selectedData && (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 shadow-xs space-y-4">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <h3 className="font-bold text-slate-800 text-sm">Preview Lembar Cetak ({jenisForm})</h3>
                <button onClick={() => handlePrintForm()} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-sm transition active:scale-95">
                  <Printer size={16} /> Cetak / Simpan PDF
                </button>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                <div ref={printRef} className="p-4 bg-white">
                  {jenisForm === "PENERIMAAN" && <FormPenerimaanPrint noNota={getNoNota(selectedData)} hariTanggal={getTanggal(selectedData)} waktuPengecekan={selectedData?.waktu || "10:00 WIB"} items={getNormalizedItems(selectedData)} />}

                  {jenisForm === "PENGGUNAAN" && <FormPenggunaanPrint noNota={getNoNota(selectedData)} hariTanggal={getTanggal(selectedData)} waktuPengecekan={selectedData?.waktu || "10:00 WIB"} items={getNormalizedItems(selectedData)} />}

                  {jenisForm === "OPNAME" && <FormOpnamePrint noNota={getNoNota(selectedData)} hariTanggal={getTanggal(selectedData)} waktuPengecekan={selectedData?.waktu || "10:00 WIB"} items={getNormalizedItems(selectedData)} />}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: REKAP */}
      {activeTab === "REKAP" && (
        <div className="space-y-6">
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
                <button onClick={() => handleExport("pdf")} className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white p-2.5 rounded-xl font-bold text-xs transition">
                  <Download size={16} /> Export PDF
                </button>
                <button onClick={() => handleExport("excel")} className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-xl font-bold text-xs transition">
                  <Download size={16} /> Export Excel
                </button>
              </div>
            </div>
          </div>

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
                        Belum ada data audit log.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log, index) => (
                      <tr key={log.id || index} className="hover:bg-slate-50">
                        <td className="p-3 font-mono text-slate-500 text-xs">{log.created_at || "-"}</td>
                        <td className="p-3 font-bold text-slate-800">{log.user?.name || log.pengguna || "System"}</td>
                        <td className="p-3">
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold text-[10px]">{log.aksi || log.action || "Aktivitas"}</span>
                        </td>
                        <td className="p-3 text-slate-600">{log.detail || log.description || "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
