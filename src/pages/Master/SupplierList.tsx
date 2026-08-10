import React, { useEffect, useState } from "react";
import { Plus, Search, Trash2, Edit, Phone, MapPin, Users } from "lucide-react";
import { masterService, type Supplier } from "../../api/Services/masterService";
import { useAuth } from "../../context/AuthContext";

export const SupplierList: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [namaSupplier, setNamaSupplier] = useState("");
  const [alamat, setAlamat] = useState("");
  const [nomorTelepon, setNomorTelepon] = useState("");
  const [jenisBarang, setJenisBarang] = useState("");

  const loadData = async () => {
    setLoading(true);
    const data = await masterService.getSuppliers();
    setSuppliers(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (sup?: Supplier) => {
    if (sup) {
      setEditingId(sup.id);
      setNamaSupplier(sup.nama_supplier);
      setAlamat(sup.alamat);
      setNomorTelepon(sup.nomor_telepon);
      setJenisBarang(sup.jenis_barang || "");
    } else {
      setEditingId(null);
      setNamaSupplier("");
      setAlamat("");
      setNomorTelepon("");
      setJenisBarang("");
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await masterService.updateSupplier(editingId, { nama_supplier: namaSupplier, alamat, nomor_telepon: nomorTelepon, jenis_barang: jenisBarang });
      } else {
        await masterService.createSupplier({ nama_supplier: namaSupplier, alamat, nomor_telepon: nomorTelepon, jenis_barang: jenisBarang });
      }
      setIsModalOpen(false);
      loadData();
    } catch {
      alert("Gagal menyimpan data supplier.");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus supplier ini?")) {
      try {
        await masterService.deleteSupplier(id);
        loadData();
      } catch {
        alert("Gagal menghapus supplier.");
      }
    }
  };

  const filtered = suppliers.filter((s) => s.nama_supplier.toLowerCase().includes(search.toLowerCase()) || s.alamat.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800">Data Supplier</h1>
          <p className="text-xs md:text-sm text-slate-500">Kelola informasi mitra pemasok bahan pangan SPPG</p>
        </div>
        {isAdmin && (
          <button onClick={() => handleOpenModal()} className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm transition active:scale-95">
            <Plus size={16} /> + Tambah Supplier
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
            placeholder="Cari nama supplier atau alamat..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
          />
        </div>

        {/* Card Grid Layout for Responsive Mobile View */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <p className="col-span-full text-center text-slate-400 py-8 text-xs">Memuat data supplier...</p>
          ) : filtered.length === 0 ? (
            <p className="col-span-full text-center text-slate-400 py-8 text-xs">Tidak ada data supplier.</p>
          ) : (
            filtered.map((item) => (
              <div key={item.id} className="border border-slate-200 rounded-2xl p-4 bg-white hover:border-slate-300 transition flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                      <Users size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">{item.nama_supplier}</h3>
                      {item.jenis_barang && <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">{item.jenis_barang}</span>}
                    </div>
                  </div>
                  <div className="space-y-1 text-xs text-slate-500">
                    <p className="flex items-center gap-2">
                      <Phone size={14} className="shrink-0 text-slate-400" /> {item.nomor_telepon}
                    </p>
                    <p className="flex items-start gap-2">
                      <MapPin size={14} className="shrink-0 text-slate-400 mt-0.5" /> {item.alamat}
                    </p>
                  </div>
                </div>

                {isAdmin && (
                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                    <button onClick={() => handleOpenModal(item)} className="p-2 text-slate-500 hover:text-emerald-600 rounded-lg hover:bg-slate-50">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-500 hover:text-red-600 rounded-lg hover:bg-slate-50">
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL FORM SUPPLIER */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">{editingId ? "Edit Supplier" : "Tambah Supplier Baru"}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Supplier *</label>
                <input
                  type="text"
                  required
                  value={namaSupplier}
                  onChange={(e) => setNamaSupplier(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. CV Segar Jaya"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Telepon *</label>
                <input
                  type="text"
                  required
                  value={nomorTelepon}
                  onChange={(e) => setNomorTelepon(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500"
                  placeholder="081234567890"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Barang (Opsional)</label>
                <input
                  type="text"
                  value={jenisBarang}
                  onChange={(e) => setJenisBarang(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. Sayuran & Daging Segar"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Lengkap *</label>
                <textarea
                  required
                  rows={3}
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500"
                  placeholder="Alamat kantor / gudang supplier"></textarea>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">
                  Batal
                </button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700">
                  Simpan Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
