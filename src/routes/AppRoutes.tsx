import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Login } from "../pages/Auth/Login";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { AppLayout } from "../components/layout/AppLayout";

import { Dashboard } from "../pages/Dashboard/Dashboard";
import { SupplierList } from "../pages/Master/SupplierList";
import { BarangList } from "../pages/Master/BarangList";
import { PenerimaanForm } from "../pages/Transaksi/PenerimaanForm";
import { PenggunaanForm } from "../pages/Transaksi/PenggunaanForm";
import { StokOpnameForm } from "../pages/Transaksi/StokOpnameForm";
import { LaporanList } from "../pages/Laporan/LaporanList";
// 1. IMPORT KOMPONEN RIWAYAT MUTASI (Sesuaikan path foldernya)
import RiwayatMutasi from "../pages/RiwayatMutasi";

const LayoutWrapper = () => (
  <AppLayout>
    <Outlet />
  </AppLayout>
);

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<LayoutWrapper />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/barang" element={<BarangList />} />
            <Route path="/supplier" element={<SupplierList />} />
            <Route path="/penerimaan" element={<PenerimaanForm />} />
            <Route path="/penggunaan" element={<PenggunaanForm />} />
            <Route path="/stok-opname" element={<StokOpnameForm />} />

            {/* 2. TAMBAHKAN RUTE RIWAYAT MUTASI DI SINI */}
            <Route path="/riwayat-mutasi" element={<RiwayatMutasi />} />

            <Route path="/laporan" element={<LaporanList />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
