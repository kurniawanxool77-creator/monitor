import { createBrowserRouter } from "react-router-dom";
import { ErrorBoundary } from "./components/shared/ErrorBoundary";
import { Login } from "./components/layout/Login";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { Dashboard } from "./components/dashboard/Dashboard";
import { AgendaSubKegiatan } from "./components/pages/agenda/AgendaSubKegiatan";
import { KalenderSubKegiatan } from "./components/pages/kalender/KalenderSubKegiatan";
import { ProgressSubKegiatan } from "./components/pages/progress/ProgressSubKegiatan";
import { AnggaranRealisasi } from "./components/pages/anggaran/AnggaranRealisasi";
import { LaporanSubKegiatan } from "./components/pages/laporan/LaporanSubKegiatan";
import { LaporanAnggaran } from "./components/pages/laporan/LaporanAnggaran";
import { LaporanPendapatan } from "./components/pages/laporan/LaporanPendapatan";
import { RoleAkses } from "./components/pages/roleakses/RoleAkses";
import { MasterData } from "./components/pages/masterdata/MasterData";
import { DetailSubKegiatan } from "./components/pages/detail/DetailSubKegiatan";
import { RealisasiPage } from "./components/pages/anggaran/RealisasiPage";
import { LogAktifitas } from "./components/pages/logaktifitas/LogAktifitas";
import { PengaturanAkun } from "./components/pages/pengaturanakun/PengaturanAkun";
import { DetailSSKView } from "./components/pages/detail/DetailSSKView";

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
      { path: "laporan-pendapatan", Component: LaporanPendapatan },
      { path: "role-akses", Component: RoleAkses },
      { path: "master-data", Component: MasterData },
      { path: "log-aktifitas", Component: LogAktifitas },
      { path: "pengaturan-akun", Component: PengaturanAkun },
      { path: "detail-ssk", Component: DetailSSKView },
    ],
  },
]);
