import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TrendingUp, 
  LineChart, 
  Briefcase, 
  FileText, 
  Bell, 
  User, 
  Settings,
  LogOut,
  Menu,
  X,
  Newspaper,
  PieChart,
  Wallet,
  Activity,
  Cpu,
  FileBarChart
} from 'lucide-react';
import { useAuthStore } from '../../store';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/markets', label: 'Markets', icon: TrendingUp },
  { path: '/trading', label: 'Trading', icon: LineChart },
  { path: '/portfolio', label: 'Portfolio', icon: Briefcase },
  { path: '/orders', label: 'Orders', icon: FileText },
  { path: '/trades', label: 'Trades', icon: Activity },
  { path: '/funds', label: 'Funds', icon: Wallet },
  { path: '/strategies', label: 'Strategies', icon: Cpu },
  { path: '/reports', label: 'Reports', icon: FileBarChart },
  { path: '/news', label: 'News', icon: Newspaper },
  { path: '/etf', label: 'ETFs', icon: PieChart },
  { path: '/alerts', label: 'Alerts', icon: Bell },
];

export default function Navbar() {
  const location = useLocation();
  const { user, notifications, logout } = useAuthStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <nav className="bg-white border-b border-panel-200 sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 h-16">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <button 
            className="lg:hidden p-2 hover:bg-panel-100 rounded-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold text-primary-700">TradePro</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-primary-50 text-primary-700 font-medium' 
                    : 'text-panel-600 hover:bg-panel-50 hover:text-panel-900'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative">
            <button 
              className="p-2 hover:bg-panel-100 rounded-lg relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={20} className="text-panel-600" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-sell-600 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-panel-200 rounded-lg shadow-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-panel-200">
                  <h3 className="font-semibold text-panel-900">Notifications</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.slice(0, 5).map((notification) => (
                    <div 
                      key={notification.id}
                      className={`px-4 py-3 border-b border-panel-100 hover:bg-panel-50 ${
                        !notification.read ? 'bg-primary-50' : ''
                      }`}
                    >
                      <p className="text-sm font-medium text-panel-900">{notification.title}</p>
                      <p className="text-sm text-panel-600 mt-1">{notification.message}</p>
                    </div>
                  ))}
                </div>
                <Link 
                  to="/alerts" 
                  className="block px-4 py-2 text-center text-primary-600 hover:bg-panel-50 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button 
              className="flex items-center gap-2 p-2 hover:bg-panel-100 rounded-lg"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <User size={18} className="text-primary-600" />
              </div>
              <span className="hidden md:block text-sm font-medium text-panel-700">
                {user?.name || 'Guest'}
              </span>
            </button>
            
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-panel-200 rounded-lg shadow-lg overflow-hidden">
                <Link 
                  to="/profile" 
                  className="flex items-center gap-2 px-4 py-2 text-panel-700 hover:bg-panel-50"
                >
                  <User size={16} />
                  Profile
                </Link>
                <Link 
                  to="/settings" 
                  className="flex items-center gap-2 px-4 py-2 text-panel-700 hover:bg-panel-50"
                >
                  <Settings size={16} />
                  Settings
                </Link>
                <hr className="my-1 border-panel-200" />
                <button 
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2 text-sell-600 hover:bg-sell-50 w-full"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-panel-200">
          <div className="px-4 py-2 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-primary-50 text-primary-700 font-medium' 
                      : 'text-panel-600 hover:bg-panel-50'
                  }`}
                >
                  <item.icon size={20} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}