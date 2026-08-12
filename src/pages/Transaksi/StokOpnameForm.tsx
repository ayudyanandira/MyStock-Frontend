import React, { useEffect, useState } from "react";
import { ClipboardCheck, Save, AlertTriangle, CheckCircle2 } from "lucide-react";
import { masterService, type Barang } from "../../api/Services/masterService";
import { opnameService, type DetailOpname } from "../../api/Services/opnameService";

export const StokOpnameForm: React.FC = () => {
  const [barangList, setBarangList] = useState<Barang[]>([]);
  const [loading, setLoading] = useState(false);
  const [tanggal, setTanggal] = useState(new Date().toISOString().split("T")[0]);
  const [catatan, setCatatan] = useState("");

  const [opnameItems, setOpnameItems] = useState<DetailOpname[]>([]);

  useEffect(() => {
    masterService.getBarang().then((data) => {
      const activeBarang = data.filter((b) => b.is_active);
      setBarangList(activeBarang);
      setOpnameItems(
        activeBarang.map((b) => ({
          barang_id: b.id,
          stok_sistem: b.stok,
          stok_fisik: b.stok,
          selisih: 0,
          alasan: "",
        })),
      );
    });
  }, []);

  const handleFisikChange = (index: number, fisikVal: number) => {
    const updated = [...opnameItems];
    const current = updated[index];
    const selisih = fisikVal - current.stok_sistem;
    updated[index] = { ...current, stok_fisik: fisikVal, selisih };
    setOpnameItems(updated);
  };

  const handleAlasanChange = (index: number, alasanVal: string) => {
    const updated = [...opnameItems];
    updated[index] = { ...updated[index], alasan: alasanVal };
    setOpnameItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const hasUnexplainedSelisih = opnameItems.some((i) => i.selisih !== 0 && !i.alasan.trim());
    if (hasUnexplainedSelisih) {
      return alert("Barang yang memiliki selisih fisik WAJIB diisi alasannya!");
    }

    setLoading(true);
    try {
      await opnameService.createOpname({ tanggal, catatan, items: opnameItems });
      alert("Stok Opname berhasil disimpan & stok sistem telah disesuaikan!");
    } catch (error: any) {
      console.error("Error Opname:", error);
      alert(error.response?.data?.message || "Gagal menyimpan stok opname.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-100 text-blue-700 rounded-2xl">
          <ClipboardCheck size={24} />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800">Stok Opname (Penyesuaian Fisik)</h1>
          <p className="text-xs md:text-sm text-slate-500">Verifikasi kuantitas bahan baku riil gudang dengan data sistem</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 shadow-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Opname *</label>
              <input type="date" required value={tanggal} onChange={(e) => setTanggal(e.target.value)} className="w-full border border-slate-300 rounded-xl p-2.5 text-xs" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Tambahan</label>
              <input type="text" value={catatan} onChange={(e) => setCatatan(e.target.value)} placeholder="e.g. Opname Rutin Akhir Bulan" className="w-full border border-slate-300 rounded-xl p-2.5 text-xs" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-800 text-sm">Lembar Hitung Fisik</h3>
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left text-xs md:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="p-3">Nama Bahan</th>
                  <th className="p-3 text-center">Stok Sistem</th>
                  <th className="p-3 text-center">Stok Fisik Gudang</th>
                  <th className="p-3 text-center">Selisih</th>
                  <th className="p-3">Alasan / Penjelasan Selisih</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {opnameItems.map((item, idx) => {
                  const brg = barangList.find((b) => b.id === item.barang_id);
                  const isDiff = item.selisih !== 0;

                  return (
                    <tr key={item.barang_id} className={isDiff ? "bg-amber-50/50" : ""}>
                      <td className="p-3 font-bold text-slate-800">
                        {brg?.nama_barang}
                        <span className="block text-[10px] text-slate-400 font-normal">{brg?.kode_barang}</span>
                      </td>
                      <td className="p-3 text-center font-semibold text-slate-600">{item.stok_sistem}</td>
                      <td className="p-3 text-center">
                        <input
                          type="number"
                          step="any"
                          min={0}
                          value={item.stok_fisik}
                          onChange={(e) => handleFisikChange(idx, Number(e.target.value))}
                          className="w-20 text-center bg-white border border-slate-300 rounded-lg p-1.5 font-bold focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="p-3 text-center">
                        {isDiff ? (
                          <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded text-xs">
                            <AlertTriangle size={12} /> {item.selisih}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-xs">
                            <CheckCircle2 size={12} /> 0
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          required={isDiff}
                          disabled={!isDiff}
                          value={item.alasan}
                          onChange={(e) => handleAlasanChange(idx, e.target.value)}
                          placeholder={isDiff ? "Wajib isi alasan selisih..." : "Tidak ada selisih"}
                          className={`w-full p-1.5 border rounded-lg text-xs ${isDiff ? "bg-white border-amber-300 focus:ring-2 focus:ring-amber-500" : "bg-slate-100 border-transparent"}`}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={loading} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md transition active:scale-95 disabled:opacity-50">
            <Save size={18} /> {loading ? "Menyimpan..." : "Simpan & Sesuaikan Stok Sistem"}
          </button>
        </div>
      </form>
    </div>
  );
};
