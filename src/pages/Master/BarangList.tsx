import React, { useEffect, useState } from "react";
import { Plus, Search, Edit, Power } from "lucide-react";
import { masterService, type Barang } from "../../api/Services/masterService";
import { useAuth } from "../../context/AuthContext";

export const BarangList: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";

  const [barang, setBarang] = useState<Barang[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [kodeBarang, setKodeBarang] = useState("");
  const [namaBarang, setNamaBarang] = useState("");
  // Set default awal yang valid dari pilihan baru (misal: Karbohidrat & Kg)
  const [kategori, setKategori] = useState("Karbohidrat");
  const [satuan, setSatuan] = useState("Kg");
  const [stokMinimum, setStokMinimum] = useState(10);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await masterService.getBarang();
      setBarang(data);
    } catch (err) {
      console.error("Gagal mengambil data barang:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (item?: Barang) => {
    if (item && item.id) {
      setEditingId(item.id);
      setKodeBarang(item.kode_barang);
      setNamaBarang(item.nama_barang);
      setKategori(typeof item.kategori === "object" && item.kategori !== null ? (item.kategori as any).nama || (item.kategori as any).nama_kategori : item.kategori || "Karbohidrat");
      setSatuan(typeof item.satuan === "object" && item.satuan !== null ? (item.satuan as any).nama || (item.satuan as any).nama_satuan : item.satuan || "Kg");
      setStokMinimum(item.stok_minimum || 10);
    } else {
      setEditingId(null);
      setKodeBarang(`BRG-${Math.floor(100 + Math.random() * 900)}`);
      setNamaBarang("");
      setKategori("Karbohidrat");
      setSatuan("Kg");
      setStokMinimum(10);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mapping Kategori berdasarkan ID Database
    const kategoriMap: Record<string, number> = {
      Karbohidrat: 1,
      "Protein Hewani": 2,
      "Protein Nabati": 3,
      Sayuran: 4,
      Buah: 5,
      Bumbu: 6,
      Lainnya: 7,
    };

    // Mapping Satuan berdasarkan ID Database
    const satuanMap: Record<string, number> = {
      Kg: 1,
      Gram: 2,
      Liter: 3,
      Ml: 4,
      Butir: 5,
      Ikat: 6,
      Pcs: 7,
      Pack: 8,
      Karung: 9,
      Dus: 10,
    };

    const formData = {
      kode_barang: kodeBarang,
      nama_barang: namaBarang,
      kategori_id: kategoriMap[kategori] || 1, // Mengirim ID Angka
      satuan_id: satuanMap[satuan] || 1, // Mengirim ID Angka
      stok_minimum: Number(stokMinimum),
      stok: 0,
      is_active: true,
    };

    try {
      if (editingId) {
        await masterService.updateBarang(editingId, formData as any);
        alert("Data barang berhasil diperbarui!");
      } else {
        await masterService.createBarang(formData as any);
        alert("Barang baru berhasil ditambahkan!");
      }

      setIsModalOpen(false);
      loadData(); // Refresh list tabel
    } catch (err: any) {
      console.error("Error Save Barang:", err.response);

      if (err.response?.status === 422) {
        const errorsObj = err.response?.data?.errors;
        if (errorsObj) {
          const messageList = Object.values(errorsObj).flat().join("\n• ");
          alert(`Gagal menyimpan! Periksa validasi berikut:\n• ${messageList}`);
        } else {
          alert(err.response?.data?.message || "Validasi data gagal.");
        }
      } else {
        alert(err.response?.data?.message || "Terjadi kesalahan pada server.");
      }
    }
  };

  const handleToggleActive = async (item: Barang) => {
    if (!item.id) return;
    const statusText = item.is_active ? "menonaktifkan" : "mengaktifkan";
    if (confirm(`Apakah Anda yakin ingin ${statusText} barang ${item.nama_barang}?`)) {
      try {
        await masterService.updateBarang(item.id, { is_active: !item.is_active });
        loadData();
      } catch {
        alert("Gagal memperbarui status barang.");
      }
    }
  };

  const filtered = barang.filter((b) => b.nama_barang.toLowerCase().includes(search.toLowerCase()) || b.kode_barang.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800">Master Data Barang</h1>
          <p className="text-xs md:text-sm text-slate-500">Kelola katalog daftar bahan pangan & batas stok minimum</p>
        </div>
        {isAdmin && (
          <button onClick={() => handleOpenModal()} className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm transition active:scale-95">
            <Plus size={16} /> + Tambah Barang Baru
          </button>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-xs space-y-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kode atau nama barang..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
          />
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left text-xs md:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th className="p-3">Kode</th>
                <th className="p-3">Nama Barang</th>
                <th className="p-3">Kategori</th>
                <th className="p-3">Satuan</th>
                <th className="p-3">Stok Min</th>
                <th className="p-3">Status Active</th>
                {isAdmin && <th className="p-3 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center p-6 text-slate-400">
                    Memuat data barang...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-6 text-slate-400">
                    Tidak ada data barang.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className={`hover:bg-slate-50 ${!item.is_active ? "opacity-50 bg-slate-50" : ""}`}>
                    <td className="p-3 font-mono font-bold text-slate-500">{item.kode_barang}</td>
                    <td className="p-3 font-bold text-slate-800">{item.nama_barang}</td>
                    <td className="p-3 text-slate-500">{typeof item.kategori === "object" && item.kategori !== null ? (item.kategori as any).nama || (item.kategori as any).nama_kategori : item.kategori}</td>
                    <td className="p-3 text-slate-500">{typeof item.satuan === "object" && item.satuan !== null ? (item.satuan as any).nama || (item.satuan as any).nama_satuan : item.satuan}</td>
                    <td className="p-3 font-semibold text-slate-700">{item.stok_minimum}</td>
                    <td className="p-3">
                      {item.is_active !== false ? (
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">Aktif</span>
                      ) : (
                        <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold">Non-aktif</span>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="p-3 text-right space-x-1">
                        <button onClick={() => handleOpenModal(item)} className="p-1.5 text-slate-500 hover:text-emerald-600 rounded-lg">
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleToggleActive(item)}
                          title={item.is_active ? "Nonaktifkan Barang" : "Aktifkan Barang"}
                          className={`p-1.5 rounded-lg ${item.is_active ? "text-amber-600 hover:bg-amber-50" : "text-emerald-600 hover:bg-emerald-50"}`}>
                          <Power size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FORM BARANG */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">{editingId ? "Edit Data Barang" : "Tambah Barang Baru"}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kode Barang</label>
                <input type="text" disabled value={kodeBarang} className="w-full bg-slate-100 border border-slate-200 rounded-xl p-2.5 text-xs font-mono font-bold text-slate-600" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Barang *</label>
                <input
                  type="text"
                  required
                  value={namaBarang}
                  onChange={(e) => setNamaBarang(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. Minyak Goreng Sawit 2L"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kategori</label>
                  <select value={kategori} onChange={(e) => setKategori(e.target.value)} className="w-full border border-slate-300 rounded-xl p-2.5 text-xs">
                    <option value="Karbohidrat">Karbohidrat</option>
                    <option value="Protein Hewani">Protein Hewani</option>
                    <option value="Protein Nabati">Protein Nabati</option>
                    <option value="Sayuran">Sayuran</option>
                    <option value="Buah">Buah</option>
                    <option value="Bumbu">Bumbu</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Satuan</label>
                  <select value={satuan} onChange={(e) => setSatuan(e.target.value)} className="w-full border border-slate-300 rounded-xl p-2.5 text-xs">
                    <option value="Kg">Kg</option>
                    <option value="Gram">Gram</option>
                    <option value="Liter">Liter</option>
                    <option value="Ml">Ml</option>
                    <option value="Butir">Butir</option>
                    <option value="Ikat">Ikat</option>
                    <option value="Pcs">Pcs</option>
                    <option value="Pack">Pack</option>
                    <option value="Karung">Karung</option>
                    <option value="Dus">Dus</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Batas Stok Minimum *</label>
                <input type="number" required min={1} value={stokMinimum} onChange={(e) => setStokMinimum(Number(e.target.value))} className="w-full border border-slate-300 rounded-xl p-2.5 text-xs" />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">
                  Batal
                </button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700">
                  Simpan Barang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
