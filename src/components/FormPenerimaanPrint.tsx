import React from "react";

interface ItemPenerimaan {
  nama_barang: string;
  jumlah: number;
  satuan: string;
  sesuai: boolean;
  keterangan?: string;
}

interface FormPenerimaanPrintProps {
  noNota: string;
  hariTanggal: string;
  waktuPengecekan: string;
  items: ItemPenerimaan[];
  petugas?: string;
}

export const FormPenerimaanPrint = React.forwardRef<HTMLDivElement, FormPenerimaanPrintProps>(({ noNota, hariTanggal, waktuPengecekan, items, petugas = "Admin Gudang" }, ref) => {
  return (
    <div ref={ref} className="p-8 bg-white text-slate-900 font-sans print:p-0 print:m-0">
      {/* CSS UNTUK MENYEMBUNYIKAN KONTEN LAIN SAAT DICETAK */}
      <style type="text/css" media="print">
        {`
            @page { size: A4 portrait; margin: 15mm; }
            body { -webkit-print-color-adjust: exact; }
          `}
      </style>

      {/* KOP SURAT (DENGAN FLEXBOX RAPI) */}
      <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 mb-4">
        {/* Logo BGN (Kiri) */}
        <div className="w-20 h-20 flex items-center justify-center shrink-0">
          <img
            src="../assets/Logo-bgn.png" // Ubah ke path public (/logo-bgn.png) agar aman saat build/print
            alt="Logo BGN"
            className="h-24 w-auto object-contain"
            onError={(e) => {
              // Fallback jika path di atas belum disesuaikan
              e.currentTarget.src =
                "https://upload.wikimedia.org/wikipedia/id/thumb/2/29/Logo_Badan_Gizi_Nasional.svg/960px-Logo_Badan_Gizi_Nasional.svg.png?utm_source=id.wikipedia.org&utm_campaign=index&utm_content=thumbnail&_=20241112074750";
            }}
          />
        </div>

        {/* Teks Kop Surat (Tengah) */}
        <div className="text-center flex-1 px-4">
          <h2 className="text-xs md:text-sm font-bold tracking-wider uppercase">BADAN GIZI NASIONAL</h2>
          <h1 className="text-sm md:text-base font-extrabold uppercase">SATUAN PELAYANAN PEMENUHAN GIZI MUNGGUR</h1>
          <p className="text-[10px] md:text-[11px] text-slate-600 leading-tight mt-0.5">Desa Tunggul Rejo RT 12 RW 04, Kelurahan Munggur, Kecamatan Mojogedang, Kabupaten Karanganyar.</p>
        </div>

        {/* Penyeimbang Layout / Logo Tambahan (Kanan) */}
        <div className="w-20 h-20 shrink-0" />
      </div>

      {/* JUDUL FORM */}
      <div className="text-center my-4">
        <h3 className="text-sm font-bold underline uppercase tracking-wide">FORM PENERIMAAN BAHAN PANGAN</h3>
        <p className="text-[11px] text-slate-500 font-mono mt-0.5">No. Ref: #{noNota}</p>
      </div>

      {/* META TANGGAL & WAKTU */}
      <div className="text-xs space-y-1 mb-4 font-medium">
        <div className="flex">
          <span className="w-32">Hari/Tanggal</span>
          <span>: {hariTanggal}</span>
        </div>
        <div className="flex">
          <span className="w-32">Waktu Pengecekan</span>
          <span>: {waktuPengecekan}</span>
        </div>
      </div>

      {/* TABEL BUKTI PENERIMAAN */}
      <table className="w-full border-collapse border border-slate-900 text-xs mb-8">
        <thead>
          <tr className="bg-slate-100 text-center font-bold">
            <th className="border border-slate-900 p-2 w-10" rowSpan={2}>
              NO
            </th>
            <th className="border border-slate-900 p-2" rowSpan={2}>
              NAMA BARANG
            </th>
            <th className="border border-slate-900 p-2 w-24" rowSpan={2}>
              JUMLAH
            </th>
            <th className="border border-slate-900 p-1" colSpan={2}>
              KONDISI DAN JUMLAH BARANG
            </th>
            <th className="border border-slate-900 p-2 w-48" rowSpan={2}>
              KETERANGAN
            </th>
          </tr>
          <tr className="bg-slate-100 text-center font-bold">
            <th className="border border-slate-900 p-1 w-16">SESUAI</th>
            <th className="border border-slate-900 p-1 w-20">TIDAK SESUAI</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} className="text-center">
              <td className="border border-slate-900 p-2 text-center">{index + 1}.</td>
              <td className="border border-slate-900 p-2 text-left font-medium">{item.nama_barang}</td>
              <td className="border border-slate-900 p-2 text-right">
                {item.jumlah} {item.satuan}
              </td>
              {/* CHECKMARK SESUAI / TIDAK SESUAI */}
              <td className="border border-slate-900 p-2 font-bold">{item.sesuai ? "✓" : "-"}</td>
              <td className="border border-slate-900 p-2 font-bold">{!item.sesuai ? "✓" : "-"}</td>
              <td className="border border-slate-900 p-2 text-left text-[11px]">{item.keterangan || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* TANDA TANGAN PETUGAS */}
      <div className="flex justify-end text-xs pt-4">
        <div className="text-center w-48 space-y-12">
          <p>Petugas Penerima,</p>
          <div className="border-b border-slate-900 font-bold uppercase">{petugas}</div>
        </div>
      </div>
    </div>
  );
});

FormPenerimaanPrint.displayName = "FormPenerimaanPrint";
