import api from "../axios";

// Interface disesuaikan persis dengan response JSON backend
export interface DashboardResponse {
  summary: {
    total_barang: number;
    total_supplier: number;
    stok_minimum: number;
  };
  barang_stok_kritis: any[];
  penerimaan_terakhir: any[];
  penggunaan_terakhir: any[];
}

export const dashboardService = {
  getDashboardData: async (): Promise<DashboardResponse> => {
    const res = await api.get("/dashboard");
    // Mengambil objek 'data' dari response Laravel
    return res.data.data || res.data;
  },
};
