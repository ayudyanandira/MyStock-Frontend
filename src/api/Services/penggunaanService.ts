import api from "../axios";

export interface DetailPenggunaan {
  barang_id: number;
  jumlah: number;
  keterangan?: string;
}

export interface TransaksiPenggunaan {
  id?: number;
  nomor_penggunaan?: string;
  tanggal: string;
  keperluan: string; // e.g., 'Dapur Utama Munggur', 'Katering Acara'
  catatan?: string;
  items: DetailPenggunaan[];
}

export const penggunaanService = {
  createPenggunaan: async (data: TransaksiPenggunaan) => {
    const payload = {
      tanggal: data.tanggal,
      keperluan: data.keperluan,
      catatan: data.catatan || null,
      items: data.items.map((item) => ({
        barang_id: Number(item.barang_id),
        jumlah: Number(item.jumlah),
        keterangan: item.keterangan || null,
      })),
    };
    const res = await api.post("/penggunaan", payload);
    return res.data;
  },
};
