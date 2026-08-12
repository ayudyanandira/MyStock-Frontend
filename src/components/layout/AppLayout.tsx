import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LayoutDashboard, Package, ArrowDownLeft, ArrowUpRight, ClipboardCheck, FileText, Users, LogOut, Menu, X } from "lucide-react";
import logoBGN from "../../assets/Logo-bgn.png";

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row">
      {/* 🟢 SIDEBAR (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 min-h-screen p-4 sticky top-0 h-screen">
        <div className="flex items-center gap-3 px-2 py-3 border-b border-slate-100">
          {/* GELANTI BAGIAN INI: */}
          <img src={logoBGN} alt="Logo BGN" className="h-10 w-10 object-contain rounded-xl" />

          <div>
            <h1 className="font-bold text-slate-800 text-sm leading-tight">SPPG Munggur</h1>
            <p className="text-[11px] text-slate-500">Stok Bahan Pangan</p>
          </div>
        </div>

        <nav className="flex-1 mt-6 space-y-1 overflow-y-auto">
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={isActive("/dashboard")} onClick={() => navigate("/dashboard")} />
          <NavItem icon={<Package size={20} />} label="Data Barang" active={isActive("/barang")} onClick={() => navigate("/barang")} />
          <NavItem icon={<Users size={20} />} label="Data Supplier" active={isActive("/supplier")} onClick={() => navigate("/supplier")} />

          <div className="pt-4 pb-1 px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Transaksi</div>
          <NavItem icon={<ArrowDownLeft size={20} className="text-emerald-600" />} label="Penerimaan (Masuk)" active={isActive("/penerimaan")} onClick={() => navigate("/penerimaan")} />
          <NavItem icon={<ArrowUpRight size={20} className="text-amber-600" />} label="Penggunaan (Keluar)" active={isActive("/penggunaan")} onClick={() => navigate("/penggunaan")} />
          <NavItem icon={<ClipboardCheck size={20} className="text-blue-600" />} label="Stok Opname" active={isActive("/stok-opname")} onClick={() => navigate("/stok-opname")} />

          <div className="pt-4 pb-1 px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Laporan</div>
          <NavItem icon={<FileText size={20} />} label="Laporan & Export" active={isActive("/laporan")} onClick={() => navigate("/laporan")} />
        </nav>

        {/* User Profile Footer */}
        <div className="border-t border-slate-100 pt-3 flex items-center justify-between px-2">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0">{user?.name ? user.name.substring(0, 2).toUpperCase() : "US"}</div>
            <div className="truncate">
              <p className="text-xs font-bold text-slate-800 truncate">{user?.name || "User"}</p>
              <span className="inline-block text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold">{user?.role || "Admin"}</span>
            </div>
          </div>
          <button onClick={handleLogout} title="Keluar" className="text-slate-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* 🔵 HEADER (Mobile Only) */}
      <header className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-2.5">
          <img src={logoBGN} alt="Logo BGN" className="h-10 w-10 object-contain rounded-xl" />
          <span className="font-bold text-slate-800 text-sm">SPPG Munggur</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-600 rounded-lg bg-slate-100">
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* 📱 MOBILE SIDE DRAWER MENU (Ketika tombol burger menu diklik) */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-slate-900/50 flex">
          <div className="w-4/5 max-w-sm bg-white h-full p-4 flex flex-col justify-between shadow-xl animate-in slide-in-from-left">
            <div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
                <span className="font-bold text-slate-800 text-sm">Menu Utama</span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-slate-400">
                  <X size={20} />
                </button>
              </div>
              <nav className="space-y-1">
                <NavItem
                  icon={<LayoutDashboard size={18} />}
                  label="Dashboard"
                  active={isActive("/dashboard")}
                  onClick={() => {
                    navigate("/dashboard");
                    setMobileMenuOpen(false);
                  }}
                />
                <NavItem
                  icon={<Package size={18} />}
                  label="Data Barang"
                  active={isActive("/barang")}
                  onClick={() => {
                    navigate("/barang");
                    setMobileMenuOpen(false);
                  }}
                />
                <NavItem
                  icon={<Users size={18} />}
                  label="Data Supplier"
                  active={isActive("/supplier")}
                  onClick={() => {
                    navigate("/supplier");
                    setMobileMenuOpen(false);
                  }}
                />
                <NavItem
                  icon={<ArrowDownLeft size={18} className="text-emerald-600" />}
                  label="Penerimaan (Masuk)"
                  active={isActive("/penerimaan")}
                  onClick={() => {
                    navigate("/penerimaan");
                    setMobileMenuOpen(false);
                  }}
                />
                <NavItem
                  icon={<ArrowUpRight size={18} className="text-amber-600" />}
                  label="Penggunaan (Keluar)"
                  active={isActive("/penggunaan")}
                  onClick={() => {
                    navigate("/penggunaan");
                    setMobileMenuOpen(false);
                  }}
                />
                <NavItem
                  icon={<ClipboardCheck size={18} className="text-blue-600" />}
                  label="Stok Opname"
                  active={isActive("/stok-opname")}
                  onClick={() => {
                    navigate("/stok-opname");
                    setMobileMenuOpen(false);
                  }}
                />
                <NavItem
                  icon={<FileText size={18} />}
                  label="Laporan & Export"
                  active={isActive("/laporan")}
                  onClick={() => {
                    navigate("/laporan");
                    setMobileMenuOpen(false);
                  }}
                />
              </nav>
            </div>
            <div className="border-t border-slate-100 pt-3">
              <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 p-2.5 rounded-xl text-xs font-bold">
                <LogOut size={16} /> Keluar Aplikasi
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)}></div>
        </div>
      )}

      {/* 🟡 MAIN CONTENT AREA */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full mb-16 md:mb-0">{children}</main>

      {/* 🟠 BOTTOM NAVIGATION (Mobile Only - Thumb Zone Friendly) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-2 z-30 shadow-lg">
        <MobileNavItem icon={<LayoutDashboard size={20} />} label="Home" active={isActive("/dashboard")} onClick={() => navigate("/dashboard")} />
        <MobileNavItem icon={<ArrowDownLeft size={20} />} label="Masuk" active={isActive("/penerimaan")} onClick={() => navigate("/penerimaan")} />
        <MobileNavItem icon={<ArrowUpRight size={20} />} label="Keluar" active={isActive("/penggunaan")} onClick={() => navigate("/penggunaan")} />
        <MobileNavItem icon={<ClipboardCheck size={20} />} label="Opname" active={isActive("/stok-opname")} onClick={() => navigate("/stok-opname")} />
        <MobileNavItem icon={<Package size={20} />} label="Barang" active={isActive("/barang")} onClick={() => navigate("/barang")} />
      </nav>
    </div>
  );
};

const NavItem = ({ icon, label, active = false, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${active ? "bg-emerald-50 text-emerald-700 font-bold" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>
    {icon}
    <span>{label}</span>
  </button>
);

const MobileNavItem = ({ icon, label, active = false, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick: () => void }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[11px] font-medium transition-colors ${active ? "text-emerald-600 font-bold" : "text-slate-400"}`}>
    {icon}
    <span>{label}</span>
  </button>
);
