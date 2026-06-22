import { createBrowserRouter } from "react-router";
import { ErrorBoundary } from "./components/shared/ErrorBoundary";
import { Login } from "./components/layout/Login";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { Dashboard } from "./components/pages/Dashboard";
import { AgendaSubKegiatan } from "./components/pages/AgendaSubKegiatan";
import { KalenderSubKegiatan } from "./components/pages/KalenderSubKegiatan";
import { ProgressSubKegiatan } from "./components/pages/ProgressSubKegiatan";
import { AnggaranRealisasi } from "./components/pages/AnggaranRealisasi";
import { LaporanSubKegiatan } from "./components/pages/LaporanSubKegiatan";
import { LaporanAnggaran } from "./components/pages/LaporanAnggaran";
import { RoleAkses } from "./components/pages/RoleAkses";
import { MasterData } from "./components/pages/MasterData";
import { DetailSubKegiatan } from "./components/pages/DetailSubKegiatan";
import { RealisasiPage } from "./components/pages/RealisasiPage";
import { LogAktifitas } from "./components/pages/LogAktifitas";
import { PengaturanAkun } from "./components/pages/PengaturanAkun";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/",
    Component: DashboardLayout,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, Component: Dashboard },
      { path: "agenda", Component: AgendaSubKegiatan },
      { path: "agenda/:id", Component: DetailSubKegiatan },
      { path: "kalender", Component: KalenderSubKegiatan },
      { path: "progress", Component: ProgressSubKegiatan },
      { path: "anggaran", Component: AnggaranRealisasi },
      { path: "anggaran/realisasi", Component: RealisasiPage },
      { path: "laporan-kegiatan", Component: LaporanSubKegiatan },
      { path: "laporan-anggaran", Component: LaporanAnggaran },
      { path: "role-akses", Component: RoleAkses },
      { path: "master-data", Component: MasterData },
      { path: "log-aktifitas", Component: LogAktifitas },
      { path: "pengaturan-akun", Component: PengaturanAkun },
    ],
  },
]);
