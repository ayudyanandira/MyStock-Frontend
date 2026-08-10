import api from "../axios";

export interface Supplier {
  id: number;
  nama_supplier: string;
  alamat: string;
  nomor_telepon: string;
  jenis_barang?: string;
}

export interface Barang {
  id: number;
  kode_barang: string;
  nama_barang: string;
  kategori: string | { id: number; nama?: string; nama_kategori?: string };
  satuan: string | { id: number; nama?: string; nama_satuan?: string };
  stok: number;
  stok_minimum: number;
  is_active: boolean;
}

export const masterService = {
  // --- SUPPLIER SERVICES ---
  getSuppliers: async (): Promise<Supplier[]> => {
    try {
      const res = await api.get("/supplier");
      return res.data.data || res.data;
    } catch {
      return [
        { id: 1, nama_supplier: "CV Segar Jaya", alamat: "Jl. Pemuda No. 45", nomor_telepon: "081234567890", jenis_barang: "Sayur & Daging" },
        { id: 2, nama_supplier: "PT Sembako Makmur", alamat: "Kawasan Industri Block C", nomor_telepon: "085678901234", jenis_barang: "Bahan Pokok & Minyak" },
      ];
    }
  },
  createSupplier: async (data: Omit<Supplier, "id">) => {
    const res = await api.post("/supplier", data);
    return res.data;
  },
  updateSupplier: async (id: number, data: Partial<Supplier>) => {
    const res = await api.put(`/supplier/${id}`, data);
    return res.data;
  },
  deleteSupplier: async (id: number) => {
    const res = await api.delete(`/supplier/${id}`);
    return res.data;
  },

  // --- BARANG SERVICES ---
  getBarang: async (): Promise<Barang[]> => {
    try {
      const res = await api.get("/barang");
      return res.data.data || res.data;
    } catch {
      return [
        { id: 1, kode_barang: "BRG-001", nama_barang: "Beras Medium Cap C4", kategori: "Bahan Pokok", satuan: "Kg", stok: 450, stok_minimum: 100, is_active: true },
        { id: 2, kode_barang: "BRG-008", nama_barang: "Minyak Goreng Sawit 2L", kategori: "Minyak & Bumbu", satuan: "Pouch", stok: 8, stok_minimum: 20, is_active: true },
        { id: 3, kode_barang: "BRG-012", nama_barang: "Tepung Terigu Segitiga", kategori: "Bahan Pokok", satuan: "Kg", stok: 0, stok_minimum: 15, is_active: false },
      ];
    }
  },
  createBarang: async (data: Partial<Barang>) => {
    const res = await api.post("/barang", data);
    return res.data;
  },

  updateBarang: async (id: number, data: Partial<Barang>) => {
    const res = await api.put(`/barang/${id}`, data);
    return res.data;
  },
  toggleBarangStatus: async (id: number, currentActive: boolean) => {
    const res = await api.patch(`/barang/${id}/toggle-status`, { is_active: !currentActive });
    return res.data;
  },
};
