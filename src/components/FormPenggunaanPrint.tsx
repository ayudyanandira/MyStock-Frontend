import React from "react";

interface ItemPenggunaan {
  nama_barang: string;
  jumlah: number;
  satuan: any; // Mengakomodasi tipe string maupun Object dari API
  keterangan?: string;
}

interface FormPenggunaanPrintProps {
  noNota: string;
  hariTanggal: string;
  waktuPengecekan: string;
  items: ItemPenggunaan[];
}

export const FormPenggunaanPrint = React.forwardRef<HTMLDivElement, FormPenggunaanPrintProps>(({ noNota, hariTanggal, waktuPengecekan, items }, ref) => {
  return (
    <div ref={ref} className="p-8 bg-white text-slate-900 font-sans print:p-0 print:m-0">
      {/* CSS CETAK LENGKAP */}
      <style type="text/css" media="print">
        {`
            @page { 
              size: A4 portrait; 
              margin: 12mm 15mm; 
            }
            body { 
              -webkit-print-color-adjust: exact; 
            }
            tr { 
              page-break-inside: avoid; 
            }
            thead { 
              display: table-header-group; 
            }
            .signature-container { 
              page-break-inside: avoid; 
              break-inside: avoid; 
            }
          `}
      </style>

      {/* KOP SURAT */}
      <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 mb-4">
        <div className="w-24 h-24 flex items-center justify-center shrink-0">
          <img
            src="/logo-bgn.png"
            alt="Logo BGN"
            className="h-20 w-auto object-contain"
            onError={(e) => {
              e.currentTarget.src = "https://upload.wikimedia.org/wikipedia/id/thumb/2/29/Logo_Badan_Gizi_Nasional.svg/960px-Logo_Badan_Gizi_Nasional.svg.png";
            }}
          />
        </div>

        <div className="text-center flex-1 px-4">
          <h2 className="text-base font-bold tracking-wider uppercase leading-tight">BADAN GIZI NASIONAL</h2>
          <h1 className="text-lg font-extrabold uppercase leading-tight mt-0.5">SATUAN PELAYANAN PEMENUHAN GIZI MUNGGUR</h1>
          <p className="text-xs text-slate-600 leading-normal mt-1">Desa Tunggul Rejo RT 12 RW 04, Kelurahan Munggur, Kecamatan Mojogedang, Kabupaten Karanganyar.</p>
        </div>

        <div className="w-24 h-24 shrink-0" />
      </div>

      {/* JUDUL FORM */}
      <div className="text-center my-4">
        <h3 className="text-base font-bold underline uppercase tracking-wide">FORM PENGGUNAAN BAHAN PANGAN</h3>
        <p className="text-xs text-slate-500 font-mono mt-0.5">No. Ref: #{noNota}</p>
      </div>

      {/* META TANGGAL & WAKTU */}
      <div className="text-xs space-y-1 mb-4 font-medium">
        <div className="flex">
          <span className="w-36 font-semibold">Hari/Tanggal</span>
          <span>: {hariTanggal}</span>
        </div>
        <div className="flex">
          <span className="w-36 font-semibold">Waktu Pengeluaran</span>
          <span>: {waktuPengecekan}</span>
        </div>
      </div>

      {/* TABEL BUKTI PENGGUNAAN */}
      <table className="w-full border-collapse border border-slate-900 text-xs mb-8">
        <thead>
          <tr className="bg-slate-100 font-bold text-center">
            <th className="border border-slate-900 p-2 w-10">NO</th>
            <th className="border border-slate-900 p-2 text-left">NAMA BARANG</th>
            <th className="border border-slate-900 p-2 w-32">JUMLAH KELUAR</th>
            <th className="border border-slate-900 p-2 text-left">KETERANGAN / DIBUTUHKAN UNTUK</th>
          </tr>
        </thead>
        <tbody>
          {items?.map((item, idx) => {
            // Extract string nama satuan secara presisi
            const namaSatuan = typeof item.satuan === "object" && item.satuan !== null ? item.satuan.nama_satuan || item.satuan.nama || "" : item.satuan || "";

            return (
              <tr key={idx} className="text-center">
                <td className="border border-slate-900 p-2 text-center">{idx + 1}.</td>
                <td className="border border-slate-900 p-2 text-left font-semibold">{item.nama_barang}</td>
                <td className="border border-slate-900 p-2 font-mono text-center whitespace-nowrap">
                  {item.jumlah} {namaSatuan}
                </td>
                <td className="border border-slate-900 p-2 text-left text-[11px]">{item.keterangan || "-"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* TANDA TANGAN PETUGAS */}
      <div className="signature-container grid grid-cols-2 text-center text-xs pt-4 gap-4">
        <div className="space-y-12">
          <p className="font-semibold">Petugas Gudang,</p>
          <p className="font-bold underline">( .................................... )</p>
        </div>
        <div className="space-y-12">
          <p className="font-semibold">Penanggung Jawab Dapur,</p>
          <p className="font-bold underline">( .................................... )</p>
        </div>
      </div>
    </div>
  );
});

FormPenggunaanPrint.displayName = "FormPenggunaanPrint";
