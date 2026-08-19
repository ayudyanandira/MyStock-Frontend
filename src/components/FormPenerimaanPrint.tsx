import React from "react";

// 1. UPDATE INTERFACE
export interface ItemPenerimaan {
  nama_barang: string;
  jumlah_po: number; // Menggunakan Jumlah PO awal
  jumlah_diterima?: number; // Jumlah aktual fisik yang datang
  satuan: string;
  kondisi?: string; // 'Baik', 'Rusak', dsb.
  keterangan_manual?: string; // Catatan tambahan dari user (opsional)
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
      {/* CSS ATURAN CETAK */}
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
        <div className="w-20 h-20 flex items-center justify-center shrink-0">
          <img
            src="../assets/Logo-bgn.png"
            alt="Logo BGN"
            className="h-24 w-auto object-contain"
            onError={(e) => {
              e.currentTarget.src = "https://upload.wikimedia.org/wikipedia/id/thumb/2/29/Logo_Badan_Gizi_Nasional.svg/960px-Logo_Badan_Gizi_Nasional.svg.png";
            }}
          />
        </div>

        <div className="text-center flex-1 px-4">
          <h2 className="text-xs md:text-sm font-bold tracking-wider uppercase">BADAN GIZI NASIONAL</h2>
          <h1 className="text-sm md:text-base font-extrabold uppercase">SATUAN PELAYANAN PEMENUHAN GIZI MUNGGUR</h1>
          <p className="text-[10px] md:text-[11px] text-slate-600 leading-tight mt-0.5">Desa Tunggul Rejo RT 12 RW 04, Kelurahan Munggur, Kecamatan Mojogedang, Kabupaten Karanganyar.</p>
        </div>

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
      <table className="w-full border-collapse border border-slate-900 text-xs mb-6">
        <thead>
          <tr className="bg-slate-100 text-center font-bold">
            <th className="border border-slate-900 p-2 w-10" rowSpan={2}>
              NO
            </th>
            <th className="border border-slate-900 p-2" rowSpan={2}>
              NAMA BARANG
            </th>
            <th className="border border-slate-900 p-2 w-28" rowSpan={2}>
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
          {items.map((item, index) => {
            const poQty = Number(item.jumlah_po || 0);
            const recQty = item.jumlah_diterima !== undefined ? Number(item.jumlah_diterima) : poQty;
            const selisih = recQty - poQty;
            const kondisi = item.kondisi || "Baik";

            // 2. LOGIKA KRITERIA KEEPOSAN/KESUAIAN
            const isSesuai = selisih === 0 && kondisi.toLowerCase() === "baik";
            const isTidakSesuai = !isSesuai;

            // 3. LOGIKA KETERANGAN DINAMIS
            const notes: string[] = [];
            if (selisih > 0) {
              notes.push(`Datang ${recQty} ${item.satuan} (Lebih +${selisih} ${item.satuan})`);
            } else if (selisih < 0) {
              notes.push(`Datang ${recQty} ${item.satuan} (Kurang ${selisih} ${item.satuan})`);
            }

            if (kondisi.toLowerCase() !== "baik") {
              notes.push(`Kondisi: ${kondisi}`);
            }

            if (item.keterangan_manual) {
              notes.push(item.keterangan_manual);
            }

            const displayKeterangan = notes.length > 0 ? notes.join(" | ") : "-";

            return (
              <tr key={index} className="text-center">
                <td className="border border-slate-900 p-2 text-center">{index + 1}.</td>
                <td className="border border-slate-900 p-2 text-left font-medium">{item.nama_barang}</td>

                {/* DISPLAY HANYA JUMLAH PO AWAL */}
                <td className="border border-slate-900 p-2 text-center font-semibold">
                  {poQty} {item.satuan}
                </td>

                {/* CENTANG KONDISI */}
                <td className="border border-slate-900 p-2 font-bold">{isSesuai ? "✓" : "-"}</td>
                <td className="border border-slate-900 p-2 font-bold">{isTidakSesuai ? "✓" : "-"}</td>

                {/* RINCIAN DI KETERANGAN */}
                <td className="border border-slate-900 p-2 text-left text-[11px]">{displayKeterangan}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* TANDA TANGAN PETUGAS */}
      <div className="signature-container flex justify-end text-xs pt-2">
        <div className="text-center w-48 space-y-12">
          <p>Petugas Penerima,</p>
          <div className="border-b border-slate-900 font-bold uppercase">{petugas}</div>
        </div>
      </div>
    </div>
  );
});

FormPenerimaanPrint.displayName = "FormPenerimaanPrint";
