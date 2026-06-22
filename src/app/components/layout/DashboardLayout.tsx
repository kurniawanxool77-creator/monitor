import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router';
import logoJateng from '../../../imports/logo_jateng.png';
import {
  LayoutDashboard,
  Calendar,
  FileText,
  DollarSign,
  BarChart3,
  Settings,
  Shield,
  Database,
  Bell,
  ChevronRight,
  ChevronDown,
  User,
  LogOut,
  Menu,
  X,
  TrendingUp,
  ListChecks,
  Activity,
} from 'lucide-react';

interface MenuItemChild { icon: any; label: string; path: string; }
interface MenuItem { icon: any; label: string; path: string; children?: MenuItemChild[]; }
interface MenuSection { section: string; items: MenuItem[]; }

const menuItems: MenuSection[] = [
  {
    section: 'SISTEM PENGENDALIAN KEGIATAN',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    ],
  },
  {
    section: 'KEGIATAN',
    items: [
      { icon: FileText, label: 'Agenda & Kegiatan', path: '/agenda' },
      { icon: Calendar, label: 'Kalender Kegiatan', path: '/kalender' },
      { icon: TrendingUp, label: 'Progress Kegiatan', path: '/progress' },
    ],
  },
  {
    section: 'ANGGARAN',
    items: [
      {
        icon: DollarSign,
        label: 'Anggaran & Realisasi',
        path: '/anggaran',
        children: [
          { icon: ListChecks, label: 'Realisasi', path: '/anggaran/realisasi' },
        ],
      },
    ],
  },
  {
    section: 'LAPORAN',
    items: [
      { icon: BarChart3, label: 'Laporan Kegiatan', path: '/laporan-kegiatan' },
      { icon: FileText, label: 'Laporan Anggaran', path: '/laporan-anggaran' },
    ],
  },
  {
    section: 'PENGATURAN',
    items: [
      { icon: User, label: 'Profil Akun', path: '/pengaturan-akun' },
      { icon: Shield, label: 'Role Akses', path: '/role-akses' },
      { icon: Database, label: 'Master Data', path: '/master-data' },
      { icon: Activity, label: 'Log Aktifitas', path: '/log-aktifitas' },
    ],
  },
];

export function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [notificationCount] = useState(4);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = () => {
      const userData = localStorage.getItem('user');
      if (!userData) {
        navigate('/login');
      } else {
        setUser(JSON.parse(userData));
      }
    };

    loadUser();

    window.addEventListener('user-updated', loadUser);
    return () => window.removeEventListener('user-updated', loadUser);
  }, [navigate]);

  // Auto-expand parent if child route is active
  useEffect(() => {
    menuItems.forEach(section => {
      section.items.forEach(item => {
        if ('children' in item && item.children) {
          const childActive = item.children.some(c => location.pathname === c.path);
          if (childActive || location.pathname === item.path) {
            setExpandedMenu(item.path);
          }
        }
      });
    });
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getPageTitle = () => {
    for (const section of menuItems) {
      for (const item of section.items) {
        if (item.path === location.pathname) {
          return { title: item.label, subtitle: 'Sistem Pengendalian Kegiatan DPRD Provinsi Jawa Tengah' };
        }
        if ('children' in item && item.children) {
          for (const child of item.children) {
            if (child.path === location.pathname) {
               return { title: `${item.label} — ${child.label}`, subtitle: 'Sistem Pengendalian Kegiatan DPRD Provinsi Jawa Tengah' };
            }
          }
        }
      }
    }
    return { title: 'Dashboard Monitoring', subtitle: 'Sistem Pengendalian Kegiatan DPRD Provinsi Jawa Tengah' };
  };

  const { title: pageTitle, subtitle: pageSubtitle } = getPageTitle();

  if (!user) return null;

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-72' : 'w-20'} bg-[#0f1623] text-white flex flex-col transition-all duration-300 flex-shrink-0`}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 flex items-center justify-center flex-shrink-0">
              <img src={logoJateng} alt="Logo Jawa Tengah" className="w-full h-full object-contain drop-shadow-sm" />
            </div>
            {sidebarOpen && (
              <div>
                <div className="text-sm font-extrabold tracking-wide">SEKRETARIAT DPRD</div>
                <div className="text-[11px] text-neutral-400 tracking-wider uppercase">Provinsi Jawa Tengah</div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {menuItems.map((section, idx) => {
            const visibleItems = section.items.filter(item => {
              if (item.path === '/role-akses' && user.role !== 'superadmin') return false;
              return true;
            });
            
            if (visibleItems.length === 0) return null;

            return (
              <div key={idx} className="mb-6">
                {sidebarOpen && <div className="px-5 text-[10px] font-extrabold text-white/30 tracking-[0.2em] mb-3">{section.section}</div>}
                <div className="space-y-1 px-3">
                  {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const hasChildren = 'children' in item && item.children && item.children.length > 0;
                  const isActive = location.pathname === item.path;
                  const isChildActive = hasChildren && item.children!.some((c: any) => location.pathname === c.path);
                  const isExpanded = expandedMenu === item.path;
                  const isHighlighted = isActive || isChildActive;

                  return (
                    <div key={item.path}>
                      <div className="flex items-center">
                        <Link
                          to={item.path}
                          onClick={() => {
                            if (hasChildren) {
                              setExpandedMenu(isExpanded ? null : item.path);
                            }
                          }}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all flex-1 ${
                            isHighlighted
                              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                              : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                          }`}
                          title={!sidebarOpen ? item.label : undefined}
                        >
                          <Icon className="w-5 h-5 flex-shrink-0" />
                          {sidebarOpen && (
                            <>
                              <span className={`text-sm flex-1 ${isHighlighted ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
                              {hasChildren ? (
                                <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-0' : '-rotate-90'} ${isHighlighted ? 'text-white' : 'text-neutral-600'}`} />
                              ) : (
                                <ChevronRight className={`w-4 h-4 flex-shrink-0 ${isHighlighted ? 'text-white' : 'text-neutral-600'}`} />
                              )}
                            </>
                          )}
                        </Link>
                      </div>

                      {/* Children */}
                      {hasChildren && isExpanded && sidebarOpen && (
                        <div className="ml-6 mt-1 space-y-0.5 border-l border-white/10 pl-3">
                          {item.children!.map((child: any) => {
                            const isChildItemActive = location.pathname === child.path;
                            const ChildIcon = child.icon;
                            return (
                              <Link
                                key={child.path}
                                to={child.path}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                                  isChildItemActive
                                    ? 'bg-blue-600 text-white font-semibold shadow-md'
                                    : 'text-neutral-400 hover:bg-white/5 hover:text-neutral-200'
                                }`}
                              >
                                {ChildIcon && <ChildIcon className="w-4 h-4 flex-shrink-0" />}
                                <span>{child.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        </nav>

        {/* User Section */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-neutral-300 hover:text-white"
            title={!sidebarOpen ? 'Logout' : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && (
              <>
                <span className="text-sm font-medium flex-1 text-left">Keluar</span>
                <ChevronRight className="w-4 h-4 text-neutral-600" />
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{pageTitle}</h1>
                <p className="text-sm text-gray-600">{pageSubtitle}</p>
              </div>
            </div>

            <div className="flex-1 px-8 flex justify-end items-center gap-4">
              <button className="relative p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all">
                <Bell className="w-5 h-5" />
                {notificationCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </button>

              <Link to="/pengaturan-akun" className="flex items-center gap-3 pl-4 border-l border-gray-200 hover:bg-gray-50 p-2 rounded-lg transition-colors cursor-pointer">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{user.nama}</div>
                  <div className="text-xs text-gray-600 bg-blue-100 text-blue-700 px-2 py-0.5 rounded mt-0.5 capitalize">
                    {user.role === 'superadmin' ? 'Superadmin' : 'Admin'}
                  </div>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors overflow-hidden">
                  {user.avatar ? (
                    <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-blue-600" />
                  )}
                </div>
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 w-full max-w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
