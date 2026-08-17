import api from "../axios";

export interface DetailOpname {
  barang_id: number;
  stok_sistem: number;
  stok_fisik: number;
  selisih: number;
  alasan: string;
}

export interface TransaksiOpname {
  tanggal: string;
  catatan?: string;
  items: DetailOpname[];
}

export const opnameService = {
  createOpname: async (data: TransaksiOpname) => {
    const payload = {
      tanggal: data.tanggal,
      catatan: data.catatan || null,
      items: data.items.map((item) => ({
        barang_id: Number(item.barang_id),
        stok_sistem: Number(item.stok_sistem),
        stok_fisik: Number(item.stok_fisik),
        selisih: Number(item.selisih),
        alasan: item.alasan,
      })),
    };
    const res = await api.post("/stok-opname", payload);
    return res.data;
  },

  // ➕ Tambahkan method ini
  getOpnameList: async () => {
    const res = await api.get("/stok-opname");
    return res.data;
  },
};
