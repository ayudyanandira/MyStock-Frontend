import api from "../axios";

// 1. Interface Detail Barang Dipesan (Saat Buat PO)
export interface DetailPOItem {
  barang_id: number;
  jumlah_pesanan: number;
}

// 2. Interface Payload Buat PO Baru (Pembuat PO)
export interface CreatePOPayload {
  nomor_transaksi?: string; // ✅ Ditambahkan '?' agar opsional
  supplier_id: number;
  tanggal: string;
  items: Array<{ barang_id: number; jumlah_pesanan: number }>;
}

// 3. Interface Detail Barang Diterima (Saat Barang Sampai)
export interface ConfirmReceiptItem {
  barang_id: number;
  jumlah_diterima: number;
  kondisi?: string; // 'Baik', 'Rusak Sebagian', dll.
  keterangan?: string;
}

// 4. Interface Payload Konfirmasi Barang Sampai (Staf Gudang)
export interface ConfirmReceiptPayload {
  tanggal_terima: string;
  items: ConfirmReceiptItem[];
}

export const penerimaanService = {
  // Ambil semua daftar PO & Riwayat Nota
  getPenerimaanList: async () => {
    try {
      const res = await api.get("/penerimaan");
      return res.data.data || res.data;
    } catch (error) {
      console.error("Gagal mengambil data penerimaan:", error);
      return [];
    }
  },

  // Ambil detail 1 PO/Nota berdasarkan ID
  getPenerimaanById: async (id: number) => {
    try {
      const res = await api.get(`/penerimaan/${id}`);
      return res.data.data || res.data;
    } catch (error) {
      console.error("Gagal mengambil detail nota:", error);
      throw error;
    }
  },

  // Tahap 1: Buat PO Baru (Stok BELUM bertambah)
  createPO: async (data: CreatePOPayload) => {
    const payload = {
      nomor_transaksi: data.nomor_transaksi,
      supplier_id: Number(data.supplier_id),
      tanggal: data.tanggal,
      items: data.items.map((item) => ({
        barang_id: Number(item.barang_id),
        jumlah_pesanan: Number(item.jumlah_pesanan),
      })),
    };

    const res = await api.post("/penerimaan", payload);
    return res.data;
  },

  // Tahap 2: Konfirmasi Penerimaan Fisik di Gudang (Stok BARU bertambah)
  confirmReceipt: async (id: number, data: ConfirmReceiptPayload) => {
    const payload = {
      tanggal_terima: data.tanggal_terima,
      items: data.items.map((item) => ({
        barang_id: Number(item.barang_id),
        jumlah_diterima: Number(item.jumlah_diterima),
        kondisi: item.kondisi || "Baik",
        keterangan: item.keterangan || null,
      })),
    };

    const res = await api.put(`/penerimaan/${id}/confirm`, payload);
    return res.data;
  },
};
