import { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { User, CheckCircle, Ban, Plus, Trash2, X, AlertCircle } from 'lucide-react';
import { useNotificationStore } from '../app/notificationStore';

interface IUserRecord {
  id: string;
  fullName: string;
  email: string;
  role: string;
  active: boolean;
  phoneNumber?: string;
}

export default function AdminUsersPage() {
  const { t } = useTranslation();
  const addNotification = useNotificationStore((state) => state.addNotification);

  // Users state (mock data initialized, updates are persisted locally in state)
  const [users, setUsers] = useState<IUserRecord[]>([
    { id: '1', fullName: 'Muhammadsoleh Nusratzoda', email: 'owner@system.com', role: 'HotelOwner', active: true, phoneNumber: '+992 90 111 2233' },
    { id: '2', fullName: 'John Doe', email: 'tourist@gmail.com', role: 'Tourist', active: true, phoneNumber: '+992 91 222 3344' },
    { id: '3', fullName: 'Dilshod Guide', email: 'guide@samarkand.uz', role: 'Guide', active: true, phoneNumber: '+992 93 333 4455' },
    { id: '4', fullName: 'Spammer Account', email: 'spam@bot.net', role: 'Tourist', active: false, phoneNumber: '+992 90 999 8877' },
  ]);

  // Modal display state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New user form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('HotelOwner');
  
  // Validation / Feedback states
  const [formError, setFormError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Confirm delete modal state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const toggleStatus = (id: string) => {
    setUsers(
      users.map((u) => (u.id === id ? { ...u, active: !u.active } : u))
    );
    showToast(t('admin.statusUpdated', 'User status updated successfully!'));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenModal = () => {
    setFullName('');
    setEmail('');
    setPhoneNumber('');
    setPassword('');
    setRole('HotelOwner');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Simple validations
    if (!fullName.trim() || !email.trim() || !phoneNumber.trim() || !password.trim()) {
      setFormError(t('validation.requiredAll', 'All fields are required.'));
      return;
    }

    if (!email.includes('@')) {
      setFormError(t('validation.email', 'Please enter a valid email address.'));
      return;
    }

    if (password.length < 6) {
      setFormError(t('validation.passwordLength', 'Password must be at least 6 characters.'));
      return;
    }

    // Email unique validation
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      setFormError(t('errors.emailTaken', 'Email is already taken.'));
      return;
    }

    const newUser: IUserRecord = {
      id: (users.length + 1).toString(),
      fullName: fullName.trim(),
      email: email.trim(),
      phoneNumber: phoneNumber.trim(),
      role,
      active: true
    };

    setUsers([...users, newUser]);
    setIsModalOpen(false);
    showToast(t('admin.userCreatedSuccess', 'Account created successfully!'));
    
    // Trigger notification log
    addNotification(
      'New User Registered',
      `${fullName.trim()} has been registered as a ${t(`roles.${role}`, role)} by Admin.`,
      'Admin',
      'registration'
    );
  };

  const handleDeleteUser = (id: string) => {
    const deletedUser = users.find((u) => u.id === id);
    setUsers(users.filter((u) => u.id !== id));
    setDeleteConfirmId(null);
    showToast(t('admin.userDeletedSuccess', 'Account permanently deleted.'));
    
    if (deletedUser) {
      // Trigger notification log
      addNotification(
        'User Account Deleted',
        `${deletedUser.fullName} (${t(`roles.${deletedUser.role}`, deletedUser.role)}) has been deleted by Admin.`,
        'Admin',
        'system'
      );
    }
  };

  return (
    <div className="space-y-8 relative">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 bg-slate-900 dark:bg-slate-800 text-white border border-slate-700/50 px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 animate-bounce">
          <CheckCircle className="h-5 w-5 text-emerald-500" />
          <span className="text-xs font-bold font-sans">{toastMessage}</span>
        </div>
      )}

      {/* Title & Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            {t('admin.userDirectoryTitle', 'System User Directory')}
          </h2>
          <p className="text-sm text-slate-400 dark:text-slate-500 font-light mt-0.5">
            {t('admin.userDirectorySubtitle', 'Block unauthorized entities, register partner credentials, or delete obsolete accounts.')}
          </p>
        </div>
        <button
          onClick={handleOpenModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl text-xs font-bold shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-95 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>{t('admin.addNewUser', 'Add New User')}</span>
        </button>
      </div>

      {/* Users Card Table */}
      <div className="bg-white dark:bg-[#0d1627] border border-slate-100 dark:border-slate-800/40 rounded-2xl shadow-sm overflow-hidden text-left">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
            <thead>
              <tr className="text-left text-[10px] font-extrabold text-slate-400 uppercase bg-slate-50/40 dark:bg-slate-900/10">
                <th className="px-6 py-4 rounded-l-xl">{t('admin.userNameHeader', 'User Name')}</th>
                <th className="px-6 py-4">{t('admin.emailAddressHeader', 'Email Address')}</th>
                <th className="px-6 py-4">{t('admin.roleHeader', 'Role')}</th>
                <th className="px-6 py-4">{t('admin.statusHeader', 'Status')}</th>
                <th className="px-6 py-4 text-right rounded-r-xl">{t('admin.actionsHeader', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-slate-650 dark:text-slate-300">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/15 transition-colors">
                  
                  {/* Name cell */}
                  <td className="px-6 py-4 font-semibold text-slate-850 dark:text-white">
                    <div className="flex items-center space-x-2.5">
                      <div className="bg-blue-50 dark:bg-blue-950/40 p-2 rounded-xl text-blue-600 dark:text-blue-400 border border-blue-100/20">
                        <User className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <span className="font-bold block leading-tight">{u.fullName}</span>
                        {u.phoneNumber && (
                          <span className="text-[10px] font-sans text-slate-400 block mt-0.5">{u.phoneNumber}</span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Email address cell */}
                  <td className="px-6 py-4 font-sans text-slate-500 dark:text-slate-400">{u.email}</td>
                  
                  {/* Role label cell */}
                  <td className="px-6 py-4">
                    <span className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-850 text-slate-600 dark:text-slate-300 text-[10px] px-2.5 py-1 rounded-lg font-bold font-sans uppercase tracking-wider">
                      {t(`roles.${u.role}`, u.role)}
                    </span>
                  </td>

                  {/* Active status cell */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold font-sans tracking-wide ${
                        u.active
                          ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                          : 'bg-red-500/10 text-red-655 dark:text-red-400'
                      }`}
                    >
                      {u.active ? t('admin.statusActive', 'Active') : t('admin.statusSuspended', 'Suspended')}
                    </span>
                  </td>

                  {/* Actions cell */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      
                      {/* Suspend Toggle */}
                      <button
                        onClick={() => toggleStatus(u.id)}
                        className={`inline-flex items-center justify-center p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          u.active
                            ? 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20 text-amber-600 dark:text-amber-400'
                            : 'bg-green-500/10 hover:bg-green-500/20 border-green-500/20 text-green-600 dark:text-green-400'
                        }`}
                        title={u.active ? t('admin.suspend', 'Suspend') : t('admin.unsuspend', 'Activate')}
                      >
                        {u.active ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                      </button>

                      {/* Permanent Delete */}
                      <button
                        onClick={() => setDeleteConfirmId(u.id)}
                        className="p-2 rounded-xl border border-red-500/25 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-all cursor-pointer"
                        title={t('common.delete', 'Delete User')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* REGISTRATION MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#0d1627] border border-slate-100 dark:border-slate-800 max-w-md w-full rounded-2xl shadow-2xl overflow-hidden p-6 relative">
            
            {/* Close button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-650 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Title */}
            <h3 className="text-lg font-extrabold text-slate-850 dark:text-white leading-tight">
              {t('admin.registerNewUser', 'Register System Account')}
            </h3>
            <p className="text-xs text-slate-450 dark:text-slate-500 mt-1 font-sans">
              Create credentials for new hotel owners, restaurant owners, drivers, or administrators.
            </p>

            {/* Error Message */}
            {formError && (
              <div className="mt-4 bg-red-500/10 border border-red-500/20 text-red-650 dark:text-red-450 p-3 rounded-xl flex items-center space-x-2 text-xs text-left">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span className="font-sans">{formError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleCreateUser} className="space-y-4 mt-6 text-left">
              
              {/* Full Name */}
              <div>
                <label className="block text-[10px] font-extrabold text-slate-450 uppercase tracking-wider mb-1.5 ml-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alisher Saidov"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-[10px] font-extrabold text-slate-450 uppercase tracking-wider mb-1.5 ml-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. alisher@partner.tj"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-[10px] font-extrabold text-slate-450 uppercase tracking-wider mb-1.5 ml-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. +992 90 999 8888"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-[10px] font-extrabold text-slate-450 uppercase tracking-wider mb-1.5 ml-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Account Role Dropdown */}
              <div>
                <label className="block text-[10px] font-extrabold text-slate-450 uppercase tracking-wider mb-1.5 ml-1">
                  System Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="HotelOwner">Hotel Owner</option>
                  <option value="RestaurantOwner">Restaurant Owner</option>
                  <option value="TransportOwner">Transport Owner (Taxi / Bus)</option>
                  <option value="Guide">Local Guide</option>
                  <option value="Admin">System Administrator</option>
                  <option value="Tourist">Tourist</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 text-xs font-bold transition-all cursor-pointer"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  {t('admin.registerBtn', 'Register Account')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#0d1627] border border-slate-100 dark:border-slate-800 max-w-sm w-full rounded-2xl shadow-2xl p-6 relative text-left">
            <h3 className="text-md font-extrabold text-slate-850 dark:text-white">
              Delete User Account?
            </h3>
            <p className="text-xs text-slate-450 dark:text-slate-500 mt-2 font-sans leading-relaxed">
              Are you sure you want to permanently delete this user account? This action is irreversible and the user will lose all system access.
            </p>
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 text-xs font-bold transition-all cursor-pointer"
              >
                {t('common.cancel', 'Cancel')}
              </button>
              <button
                onClick={() => handleDeleteUser(deleteConfirmId)}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
