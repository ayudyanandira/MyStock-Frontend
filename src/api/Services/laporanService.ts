import api from "../axios";

export const laporanService = {
  // 1. Ambil data audit log
  getAuditLog: async () => {
    const res = await api.get("/audit-logs");
    return res.data.data || res.data;
  },

  // 2. Export Laporan (Memakai Axios + Blob agar Token Sanctum Terkirim)
  exportReport: async (type: "pdf" | "excel", startDate: string, endDate: string) => {
    try {
      // Panggil API lewat axios instance agar header Bearer token otomatis terbawa
      const response = await api.get("/laporan/export", {
        params: {
          type: type,
          start: startDate,
          end: endDate,
        },
        responseType: "blob", // Wajib agar diterima sebagai file binary
      });

      // Buat Objek File sementara di browser
      const mimeType = type === "pdf" ? "text/html" : "text/csv";
      const fileExtension = type === "pdf" ? "html" : "csv"; // Bisa sesuaikan jika pdf asli

      const blob = new Blob([response.data], { type: mimeType });
      const downloadUrl = window.URL.createObjectURL(blob);

      if (type === "pdf") {
        // Jika PDF / HTML Print preview: buka di tab baru yang sudah terautentikasi
        const newTab = window.open(downloadUrl, "_blank");
        if (!newTab) {
          alert("Pop-up diblokir oleh browser. Izinkan pop-up untuk melihat PDF.");
        }
      } else {
        // Jika Excel / CSV: Langsung trigger download otomatis ke komputer
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.setAttribute("download", `Laporan_Stok_${startDate}_sd_${endDate}.${fileExtension}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (err: any) {
      console.error("Gagal mengunduh laporan:", err);
      alert("Gagal mengunduh laporan. Pastikan Anda sudah login.");
    }
  },
};
