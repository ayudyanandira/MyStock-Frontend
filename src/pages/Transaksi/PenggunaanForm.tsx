import React, { useEffect, useState } from "react";
import { Plus, Trash2, Save, ArrowUpRight } from "lucide-react";
import { masterService, type Barang } from "../../api/Services/masterService";
import { penggunaanService, type DetailPenggunaan } from "../../api/Services/penggunaanService";

export const PenggunaanForm: React.FC = () => {
  const [barangList, setBarangList] = useState<Barang[]>([]);
  const [loading, setLoading] = useState(false);

  const [tanggal, setTanggal] = useState(new Date().toISOString().split("T")[0]);
  const [keperluan, setKeperluan] = useState("Dapur Utama");
  const [catatan, setCatatan] = useState("");

  const [items, setItems] = useState<DetailPenggunaan[]>([{ barang_id: 0, jumlah: 1, keterangan: "" }]);

  useEffect(() => {
    masterService.getBarang().then((data) => setBarangList(data.filter((b) => b.is_active)));
  }, []);

  const handleAddItem = () => {
    setItems([...items, { barang_id: 0, jumlah: 1, keterangan: "" }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return alert("Minimal 1 item barang!");
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof DetailPenggunaan, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.some((i) => !i.barang_id || i.jumlah <= 0)) {
      return alert("Pastikan semua barang sudah dipilih dan jumlah lebih dari 0");
    }

    setLoading(true);
    try {
      await penggunaanService.createPenggunaan({ tanggal, keperluan, catatan, items });
      alert("Transaksi Penggunaan Barang berhasil dicatat & stok berkurang!");
      setCatatan("");
      setItems([{ barang_id: 0, jumlah: 1, keterangan: "" }]);
    } catch (error: any) {
      console.error("Error Save Penggunaan:", error);
      alert(error.response?.data?.message || "Gagal menyimpan transaksi penggunaan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-amber-100 text-amber-700 rounded-2xl">
          <ArrowUpRight size={24} />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800">Penggunaan Barang Keluar</h1>
          <p className="text-xs md:text-sm text-slate-500">Catat pengambilan bahan pangan untuk operasional dapur</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2 text-sm">Informasi Pengambilan</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Keluar *</label>
              <input type="date" required value={tanggal} onChange={(e) => setTanggal(e.target.value)} className="w-full border border-slate-300 rounded-xl p-2.5 text-xs" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tujuan / Keperluan *</label>
              <select value={keperluan} onChange={(e) => setKeperluan(e.target.value)} className="w-full border border-slate-300 rounded-xl p-2.5 text-xs">
                <option value="Dapur Utama">Dapur Utama (Masak Harian)</option>
                <option value="Kegiatan Khusus">Kegiatan Khusus / Acara</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Tambahan</label>
              <input type="text" value={catatan} onChange={(e) => setCatatan(e.target.value)} placeholder="Opsional..." className="w-full border border-slate-300 rounded-xl p-2.5 text-xs" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm">Daftar Bahan Yang Diambil</h3>
            <button type="button" onClick={handleAddItem} className="flex items-center gap-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 px-3 py-1.5 rounded-xl text-xs font-bold transition">
              <Plus size={16} /> Tambah Item
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => {
              const selectedBarang = barangList.find((b) => b.id === item.barang_id);
              return (
                <div key={index} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  <div className="md:col-span-5">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Pilih Barang #{index + 1}</label>
                    <select value={item.barang_id} onChange={(e) => handleItemChange(index, "barang_id", Number(e.target.value))} className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs font-semibold">
                      <option value={0}>-- Pilih Bahan --</option>
                      {barangList.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.kode_barang} - {b.nama_barang} (Sisa Stok: {b.stok})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Jumlah Keluar {selectedBarang ? `(${typeof selectedBarang.satuan === "object" ? (selectedBarang.satuan as any).nama : selectedBarang.satuan})` : ""}
                    </label>
                    <input
                      type="number"
                      step="any"
                      min={1}
                      max={selectedBarang?.stok}
                      value={item.jumlah}
                      onChange={(e) => handleItemChange(index, "jumlah", Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs text-center font-extrabold text-amber-700"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Keterangan / Menu</label>
                    <input
                      type="text"
                      value={item.keterangan || ""}
                      onChange={(e) => handleItemChange(index, "keterangan", e.target.value)}
                      placeholder="e.g. Masak Makan Siang"
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs"
                    />
                  </div>

                  <div className="md:col-span-1 flex justify-end pt-2 md:pt-4">
                    <button type="button" onClick={() => handleRemoveItem(index)} className="p-2 text-slate-400 hover:text-red-600 rounded-lg">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={loading} className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md transition active:scale-95 disabled:opacity-50">
            <Save size={18} /> {loading ? "Menyimpan..." : "Simpan Transaksi Keluar"}
          </button>
        </div>
      </form>
    </div>
  );
};
