import React from "react";

interface ItemOpname {
  nama_barang: string;
  stok_sistem: number;
  stok_fisik: number;
  selisih: number;
  satuan: string;
  keterangan?: string;
}

interface FormOpnamePrintProps {
  noNota: string;
  hariTanggal: string;
  waktuPengecekan: string;
  items: ItemOpname[];
}

export const FormOpnamePrint = React.forwardRef<HTMLDivElement, FormOpnamePrintProps>(({ noNota, hariTanggal, waktuPengecekan, items }, ref) => {
  return (
    <div ref={ref} className="p-8 bg-white text-slate-900 font-sans print:p-0 print:m-0">
      {/* CSS UNTUK MENYEMBUNYIKAN KONTEN LAIN SAAT DICETAK */}
      <style type="text/css" media="print">
        {`
            @page { size: A4 portrait; margin: 15mm; }
            body { -webkit-print-color-adjust: exact; }
          `}
      </style>

      {/* KOP SURAT (PRESISI & DISERAGAMKAN) */}
      <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 mb-4">
        {/* Logo BGN (Kiri) */}
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

        {/* Teks Kop Surat (Tengah) */}
        <div className="text-center flex-1 px-4">
          <h2 className="text-base font-bold tracking-wider uppercase leading-tight">BADAN GIZI NASIONAL</h2>
          <h1 className="text-lg font-extrabold uppercase leading-tight mt-0.5">SATUAN PELAYANAN PEMENUHAN GIZI MUNGGUR</h1>
          <p className="text-xs text-slate-600 leading-normal mt-1">Desa Tunggul Rejo RT 12 RW 04, Kelurahan Munggur, Kecamatan Mojogedang, Kabupaten Karanganyar.</p>
        </div>

        {/* Penyeimbang Layout (Kanan) */}
        <div className="w-24 h-24 shrink-0" />
      </div>

      {/* JUDUL FORM */}
      <div className="text-center my-4">
        <h3 className="text-base font-bold underline uppercase tracking-wide">BERITA ACARA STOK OPNAME</h3>
        <p className="text-xs text-slate-500 font-mono mt-0.5">No. Ref: #{noNota}</p>
      </div>

      {/* META TANGGAL & WAKTU */}
      <div className="text-xs space-y-1 mb-4 font-medium">
        <div className="flex">
          <span className="w-36 font-semibold">Hari/Tanggal</span>
          <span>: {hariTanggal}</span>
        </div>
        <div className="flex">
          <span className="w-36 font-semibold">Waktu Pelaksanaan</span>
          <span>: {waktuPengecekan}</span>
        </div>
      </div>

      {/* TABEL BUKTI OPNAME */}
      <table className="w-full border-collapse border border-slate-900 text-xs mb-8">
        <thead>
          <tr className="bg-slate-100 font-bold text-center">
            <th className="border border-slate-900 p-2 w-10">NO</th>
            <th className="border border-slate-900 p-2 text-left">NAMA BARANG</th>
            <th className="border border-slate-900 p-2 w-28">STOK SISTEM</th>
            <th className="border border-slate-900 p-2 w-28">STOK FISIK</th>
            <th className="border border-slate-900 p-2 w-28">SELISIH</th>
            <th className="border border-slate-900 p-2 text-left">CATATAN</th>
          </tr>
        </thead>
        <tbody>
          {items?.map((item, idx) => (
            <tr key={idx} className="text-center">
              <td className="border border-slate-900 p-2 text-center">{idx + 1}.</td>
              <td className="border border-slate-900 p-2 text-left font-semibold">{item.nama_barang}</td>
              <td className="border border-slate-900 p-2 font-mono text-right">
                {item.stok_sistem} {item.satuan}
              </td>
              <td className="border border-slate-900 p-2 font-mono text-right">
                {item.stok_fisik} {item.satuan}
              </td>
              <td className="border border-slate-900 p-2 font-mono font-bold text-right">
                {item.selisih} {item.satuan}
              </td>
              <td className="border border-slate-900 p-2 text-left text-[11px]">{item.keterangan || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* TANDA TANGAN PETUGAS */}
      <div className="grid grid-cols-2 text-center text-xs pt-4 gap-4">
        <div className="space-y-12">
          <p className="font-semibold">Petugas Stock Opname,</p>
          <p className="font-bold underline">( .................................... )</p>
        </div>
        <div className="space-y-12">
          <p className="font-semibold">Kepala Gudang,</p>
          <p className="font-bold underline">( .................................... )</p>
        </div>
      </div>
    </div>
  );
});

FormOpnamePrint.displayName = "FormOpnamePrint";
