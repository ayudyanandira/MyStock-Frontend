import React, { useState, useEffect } from "react";
import { penerimaanService, type CreatePOPayload, type ConfirmReceiptPayload } from "../../api/Services/penerimaanService";
import { masterService } from "../../api/Services/masterService"; // 🟢 Pakai masterService

export const PenerimaanForm: React.FC = () => {
  const [listPO, setListPO] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [barangs, setBarangs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [selectedPO, setSelectedPO] = useState<any>(null);

  // Form State: Buat PO Baru
  const [formPO, setFormPO] = useState<CreatePOPayload>({
    nomor_transaksi: `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    supplier_id: 0,
    tanggal: new Date().toISOString().split("T")[0],
    items: [{ barang_id: 0, jumlah_pesanan: 1 }],
  });

  // Form State: Verifikasi Gudang
  const [formConfirm, setFormConfirm] = useState<ConfirmReceiptPayload>({
    tanggal_terima: new Date().toISOString().split("T")[0],
    items: [],
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // 1. Load Data PO
      const dataPO = await penerimaanService.getPenerimaanList();
      setListPO(Array.isArray(dataPO) ? dataPO : (dataPO as any)?.data || []);

      // 2. Load Data Supplier lewat masterService
      // (Sesuaikan nama method di masterService.ts kamu, misal: getSuppliers, getSupplier, atau getMaster)
      const resSup: any = (await (masterService as any).getSuppliers?.()) || (await (masterService as any).getSupplier?.()) || [];
      setSuppliers(Array.isArray(resSup) ? resSup : resSup?.data || []);

      // 3. Load Data Barang lewat masterService
      // (Sesuaikan nama method di masterService.ts kamu, misal: getBarang atau getAllBarang)
      const resBrg: any = (await (masterService as any).getBarang?.()) || (await (masterService as any).getBarangs?.()) || [];
      setBarangs(Array.isArray(resBrg) ? resBrg : resBrg?.data || []);
    } catch (err) {
      console.error("Gagal memuat data:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS: BUAT PO BARU ---
  const handleAddRowItem = () => {
    setFormPO({
      ...formPO,
      items: [...formPO.items, { barang_id: 0, jumlah_pesanan: 1 }],
    });
  };

  const handleRemoveRowItem = (index: number) => {
    if (formPO.items.length === 1) return;
    const updatedItems = formPO.items.filter((_, i) => i !== index);
    setFormPO({ ...formPO, items: updatedItems });
  };

  const handleSavePO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPO.supplier_id) {
      alert("Silakan pilih supplier terlebih dahulu!");
      return;
    }

    try {
      // 1. Ekstrak data yang DIBUTUHKAN saja (Abaikan nomor_transaksi)
      const payload = {
        supplier_id: formPO.supplier_id,
        tanggal: formPO.tanggal,
        items: formPO.items,
      };

      // 2. Kirim payload bersih ke backend
      await penerimaanService.createPO(payload);

      alert("Dokumen PO Berhasil Dibuat!");
      setShowCreateModal(false);

      // 3. Reset form tanpa nomor_transaksi acak lagi
      setFormPO({
        nomor_transaksi: "", // Kosongkan saja karena di-generate oleh backend
        supplier_id: 0,
        tanggal: new Date().toISOString().split("T")[0],
        items: [{ barang_id: 0, jumlah_pesanan: 1 }],
      });

      fetchInitialData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal membuat dokumen PO.");
    }
  };

  // --- HANDLERS: VERIFIKASI GUDANG ---
  const handleOpenConfirm = (po: any) => {
    setSelectedPO(po);
    setFormConfirm({
      tanggal_terima: new Date().toISOString().split("T")[0],
      items: po.details.map((d: any) => ({
        barang_id: d.barang_id,
        nama_barang: d.barang?.nama_barang || `Barang #${d.barang_id}`,
        jumlah_pesanan: d.jumlah_pesanan,
        jumlah_diterima: d.jumlah_pesanan,
        kondisi: "Baik",
      })),
    });
    setShowConfirmModal(true);
  };

  const handleSaveConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPO) return;

    try {
      await penerimaanService.confirmReceipt(selectedPO.id, formConfirm);
      alert("Penerimaan barang berhasil dikonfirmasi! Stok telah diperbarui.");
      setShowConfirmModal(false);
      fetchInitialData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal mengonfirmasi barang.");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Penerimaan Barang Masuk</h1>
          <p className="text-sm text-gray-500">Kelola pembuatan Purchase Order (PO) dan verifikasi barang masuk gudang</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2.5 rounded-lg shadow-sm transition flex items-center gap-2">
          <span>+</span> Buat PO Baru
        </button>
      </div>

      {/* TABEL DAFTAR PO / NOTA */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
            <tr>
              <th className="p-4">No. PO / Nota</th>
              <th className="p-4">Supplier</th>
              <th className="p-4">Tgl Pemesanan</th>
              <th className="p-4">Tgl Diterima</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center p-6 text-gray-500">
                  Memuat data penerimaan...
                </td>
              </tr>
            ) : listPO.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-6 text-gray-400">
                  Belum ada riwayat PO atau penerimaan barang.
                </td>
              </tr>
            ) : (
              listPO.map((po) => (
                <tr key={po.id} className="hover:bg-gray-50/80 transition">
                  <td className="p-4 font-semibold text-gray-800">{po.nomor_transaksi}</td>
                  <td className="p-4 text-gray-600">{po.supplier?.nama || po.supplier?.nama_supplier || "-"}</td>
                  <td className="p-4 text-gray-600">{po.tanggal}</td>
                  <td className="p-4 text-gray-600">{po.tanggal_terima || "-"}</td>
                  <td className="p-4">
                    {po.status === "pending" ? (
                      <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 text-xs font-medium px-2.5 py-1 rounded-full border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        Menunggu Barang
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-medium px-2.5 py-1 rounded-full border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Selesai (Diterima)
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedPO(po);
                        setShowDetailModal(true);
                      }}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md text-xs font-medium transition">
                      👁️ Lihat Nota
                    </button>
                    {po.status === "pending" && (
                      <button onClick={() => handleOpenConfirm(po)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-md text-xs font-medium transition shadow-sm">
                        📦 Verifikasi Gudang
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL 1: BUAT PO BARU */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Buat Purchase Order (PO) Baru</h2>
            <form onSubmit={handleSavePO} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Nomor PO</label>
                  <input type="text" value="(Otomatis oleh sistem)" disabled className="w-full border rounded-lg p-2 text-sm bg-gray-100 text-gray-500 cursor-not-allowed outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Supplier *</label>
                  <select
                    value={formPO.supplier_id}
                    onChange={(e) =>
                      setFormPO({
                        ...formPO,
                        supplier_id: Number(e.target.value),
                      })
                    }
                    className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    required>
                    <option value={0}>-- Pilih Supplier --</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nama || s.nama_supplier}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Tanggal Pesan *</label>
                  <input type="date" value={formPO.tanggal} onChange={(e) => setFormPO({ ...formPO, tanggal: e.target.value })} className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" required />
                </div>
              </div>

              {/* LIST ITEM PESANAN */}
              <div className="border-t pt-4 mt-2">
                <label className="block font-semibold text-sm text-gray-700 mb-2">Daftar Bahan / Barang Dipesan</label>
                {formPO.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 mb-2">
                    <select
                      value={item.barang_id}
                      onChange={(e) => {
                        const newItems = [...formPO.items];
                        newItems[idx].barang_id = Number(e.target.value);
                        setFormPO({ ...formPO, items: newItems });
                      }}
                      className="flex-1 border rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      required>
                      <option value={0}>-- Pilih Barang --</option>
                      {barangs.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.nama_barang}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="Jumlah"
                      value={item.jumlah_pesanan}
                      onChange={(e) => {
                        const newItems = [...formPO.items];
                        newItems[idx].jumlah_pesanan = Number(e.target.value);
                        setFormPO({ ...formPO, items: newItems });
                      }}
                      className="w-28 border rounded-lg p-2 text-sm text-center focus:ring-2 focus:ring-emerald-500 outline-none"
                      min="1"
                      required
                    />
                    {formPO.items.length > 1 && (
                      <button type="button" onClick={() => handleRemoveRowItem(idx)} className="text-red-500 hover:text-red-700 font-bold p-1 text-sm">
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={handleAddRowItem} className="text-xs text-emerald-600 font-semibold hover:underline mt-1 inline-block">
                  + Tambah Baris Barang
                </button>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">
                  Simpan PO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: VERIFIKASI BARANG SAMPAL (STAF GUDANG) */}
      {showConfirmModal && selectedPO && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-3xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="border-b pb-3 mb-4">
              <h2 className="text-lg font-bold text-gray-800">Verifikasi Barang Masuk Gudang</h2>
              <p className="text-xs text-gray-500">
                Nomor PO: <span className="font-semibold text-gray-700">{selectedPO.nomor_transaksi}</span> | Supplier: {selectedPO.supplier?.nama || selectedPO.supplier?.nama_supplier}
              </p>
            </div>

            <form onSubmit={handleSaveConfirm} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Tanggal Terima Fisik *</label>
                <input
                  type="date"
                  value={formConfirm.tanggal_terima}
                  onChange={(e) =>
                    setFormConfirm({
                      ...formConfirm,
                      tanggal_terima: e.target.value,
                    })
                  }
                  className="w-full md:w-1/3 border rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b text-xs font-semibold text-gray-600 uppercase">
                    <tr>
                      <th className="p-3">Nama Barang</th>
                      <th className="p-3 text-center">Jml Dipesan</th>
                      <th className="p-3 text-center">Jml Diterima Fisik</th>
                      <th className="p-3">Kondisi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {formConfirm.items.map((item: any, idx: number) => (
                      <tr key={idx}>
                        <td className="p-3 font-medium text-gray-800">{item.nama_barang}</td>
                        <td className="p-3 text-center bg-gray-50 font-bold text-gray-700">{item.jumlah_pesanan}</td>
                        <td className="p-3 text-center">
                          <input
                            type="number"
                            value={item.jumlah_diterima}
                            onChange={(e) => {
                              const updated = [...formConfirm.items];
                              updated[idx].jumlah_diterima = Number(e.target.value);
                              setFormConfirm({
                                ...formConfirm,
                                items: updated,
                              });
                            }}
                            className="w-24 border rounded p-1 text-center font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                            min="0"
                            required
                          />
                        </td>
                        <td className="p-3">
                          <select
                            value={item.kondisi || "Baik"}
                            onChange={(e) => {
                              const updated = [...formConfirm.items];
                              updated[idx].kondisi = e.target.value;
                              setFormConfirm({
                                ...formConfirm,
                                items: updated,
                              });
                            }}
                            className="border rounded p-1 text-xs outline-none">
                            <option value="Baik">Baik</option>
                            <option value="Rusak Sebagian">Rusak Sebagian</option>
                            <option value="Kurang">Kurang</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button type="button" onClick={() => setShowConfirmModal(false)} className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 shadow-sm">
                  Konfirmasi & Tambah Stok
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: BUKA DETIL NOTA (KAPAN SAJA) */}
      {showDetailModal && selectedPO && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl">
            <div className="flex justify-between items-start border-b pb-3 mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Nota PO #{selectedPO.nomor_transaksi}</h2>
                <p className="text-xs text-gray-500">Supplier: {selectedPO.supplier?.nama || selectedPO.supplier?.nama_supplier}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedPO.status === "completed" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>{selectedPO.status.toUpperCase()}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 text-xs bg-gray-50 p-3 rounded-lg border">
              <div>
                <span className="text-gray-500">Tanggal Pesan:</span> <span className="font-semibold text-gray-800">{selectedPO.tanggal}</span>
              </div>
              <div>
                <span className="text-gray-500">Tanggal Diterima Fisik:</span> <span className="font-semibold text-gray-800">{selectedPO.tanggal_terima || "Belum Diterima"}</span>
              </div>
            </div>

            <h3 className="font-semibold mb-2 text-xs text-gray-600 uppercase tracking-wider">Rincian Barang Dipesan & Diterima:</h3>
            <div className="border rounded-lg overflow-hidden mb-6">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-100 border-b text-xs font-semibold text-gray-600">
                  <tr>
                    <th className="p-2.5">Nama Barang</th>
                    <th className="p-2.5 text-center">Dipesan</th>
                    <th className="p-2.5 text-center">Diterima</th>
                    <th className="p-2.5 text-center">Selisih</th>
                    <th className="p-2.5">Kondisi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {selectedPO.details?.map((d: any) => (
                    <tr key={d.id}>
                      <td className="p-2.5 font-medium text-gray-800">{d.barang?.nama_barang || `-`}</td>
                      <td className="p-2.5 text-center text-gray-600">{d.jumlah_pesanan}</td>
                      <td className="p-2.5 text-center font-bold text-emerald-600">{d.jumlah_diterima}</td>
                      <td className="p-2.5 text-center text-amber-600 font-semibold">{d.selisih}</td>
                      <td className="p-2.5 text-gray-600">{d.kondisi}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <button onClick={() => setShowDetailModal(false)} className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-sm font-medium transition">
                Tutup Nota
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
