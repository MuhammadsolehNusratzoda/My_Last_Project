import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { User, CheckCircle, Ban } from 'lucide-react';

export default function AdminUsersPage() {
  const { pathname } = useLocation();
  const { t } = useTranslation();

  const isActive = (path: string) => pathname === path;

  const [users, setUsers] = useState([
    { id: '1', fullName: 'Muhammadsoleh Nusratzoda', email: 'owner@system.com', role: 'HotelOwner', active: true },
    { id: '2', fullName: 'John Doe', email: 'tourist@gmail.com', role: 'Tourist', active: true },
    { id: '3', fullName: 'Dilshod Guide', email: 'guide@samarkand.uz', role: 'Guide', active: true },
    { id: '4', fullName: 'Spammer Account', email: 'spam@bot.net', role: 'Tourist', active: false },
  ]);

  const toggleStatus = (id: string) => {
    setUsers(
      users.map((u) => (u.id === id ? { ...u, active: !u.active } : u))
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow bg-slate-950 text-slate-100 transition-colors">
      <div className="mb-8 text-left">
        <h2 className="text-3xl font-extrabold text-white tracking-tight">{t('admin.userDirectoryTitle')}</h2>
        <p className="mt-1 text-sm text-slate-400 font-light">{t('admin.userDirectorySubtitle')}</p>
      </div>

      {/* Admin Sub-navigation Links */}
      <div className="flex flex-wrap items-center gap-4 mb-8 bg-slate-900/40 border border-slate-900/60 p-4 rounded-2xl text-sm font-semibold">
        <Link to="/admin/dashboard" className={`${isActive('/admin/dashboard') ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-white'} transition-colors`}>
          {t('admin.statsOverview')}
        </Link>
        <span className="text-slate-800">|</span>
        <Link to="/admin/places" className={`${isActive('/admin/places') ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-white'} transition-colors`}>
          {t('admin.moderatePlaces')}
        </Link>
        <span className="text-slate-800">|</span>
        <Link to="/admin/users" className={`${isActive('/admin/users') ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-white'} transition-colors`}>
          {t('admin.manageUsers')}
        </Link>
        <span className="text-slate-800">|</span>
        <Link to="/admin/audit-logs" className={`${isActive('/admin/audit-logs') ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-white'} transition-colors`}>
          {t('admin.auditLogs')}
        </Link>
      </div>

      <div className="bg-slate-900/40 border border-slate-900/60 rounded-3xl overflow-hidden shadow-xl text-left">
        <table className="min-w-full divide-y divide-slate-800 text-sm">
          <thead>
            <tr className="text-left text-xs font-semibold text-slate-400 uppercase bg-slate-950/40">
              <th className="px-6 py-3 rounded-l-xl">{t('admin.userNameHeader')}</th>
              <th className="px-6 py-3">{t('admin.emailAddressHeader')}</th>
              <th className="px-6 py-3">{t('admin.roleHeader')}</th>
              <th className="px-6 py-3">{t('admin.statusHeader')}</th>
              <th className="px-6 py-3 text-right rounded-r-xl">{t('admin.actionsHeader')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-950/30 transition-colors">
                <td className="px-6 py-4 font-semibold text-white">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-blue-500" />
                    <span>{u.fullName}</span>
                  </div>
                </td>
                <td className="px-6 py-4">{u.email}</td>
                <td className="px-6 py-4">
                  <span className="bg-slate-950 border border-slate-800 text-slate-300 text-xs px-2.5 py-1 rounded-xl font-semibold">
                    {t(`roles.${u.role}`, u.role)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      u.active
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-red-500/10 text-red-400'
                    }`}
                  >
                    {u.active ? t('admin.statusActive') : t('admin.statusSuspended')}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => toggleStatus(u.id)}
                    className={`px-4 py-2 rounded-2xl text-xs font-semibold border transition-all cursor-pointer ${
                      u.active
                        ? 'bg-red-500/10 hover:bg-red-500/20 border-red-500/30 text-red-400'
                        : 'bg-green-500/10 hover:bg-green-500/20 border-green-500/30 text-green-400'
                    }`}
                  >
                    {u.active ? (
                      <span className="flex items-center space-x-1.5">
                        <Ban className="h-3.5 w-3.5" />
                        <span>{t('admin.suspendText')}</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1.5">
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>{t('admin.unsuspendText')}</span>
                      </span>
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
