import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { IProviderApplicationDossier } from '../types';
import {
  ShieldCheck, CheckCircle2, XCircle, AlertTriangle, Eye, Search, Filter,
  Building2, Car, Phone, User, Calendar, Shield, Award, MapPin, X
} from 'lucide-react';

export default function AdminProviderApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDossier, setSelectedDossier] = useState<IProviderApplicationDossier | null>(null);
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (searchQuery) params.append('search', searchQuery);

      const res = await api.get(`/admin/provider-applications?${params.toString()}`);
      setApplications(res.data.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const viewDossier = async (id: string) => {
    try {
      const res = await api.get(`/admin/provider-applications/${id}`);
      setSelectedDossier(res.data);
      setAdminNotes(res.data.adminInternalNotes || '');
    } catch (err) {
      console.error(err);
    }
  };

  const handleApprove = async () => {
    if (!selectedDossier) return;
    try {
      await api.put(`/admin/provider-applications/${selectedDossier.id}/approve`, { adminNotes });
      setSelectedDossier(null);
      fetchApplications();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Approval failed.');
    }
  };

  const handleReject = async () => {
    if (!selectedDossier || !rejectionReason) return;
    try {
      await api.put(`/admin/provider-applications/${selectedDossier.id}/reject`, { rejectionReason, adminNotes });
      setRejectionModalOpen(false);
      setSelectedDossier(null);
      fetchApplications();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Rejection failed.');
    }
  };

  const handleSuspend = async () => {
    if (!selectedDossier) return;
    try {
      await api.put(`/admin/provider-applications/${selectedDossier.id}/suspend`, { reason: 'Administrative Suspension' });
      setSelectedDossier(null);
      fetchApplications();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Suspension failed.');
    }
  };

  const toggleChecklist = async (key: string, value: boolean) => {
    if (!selectedDossier) return;
    const updated = {
      isIdentityVerified: key === 'identity' ? value : selectedDossier.isIdentityVerified,
      isLicenseVerified: key === 'license' ? value : selectedDossier.isLicenseVerified,
      isVehicleVerified: key === 'vehicle' ? value : selectedDossier.isVehicleVerified,
      isInsuranceVerified: key === 'insurance' ? value : selectedDossier.isInsuranceVerified,
      isCompanyVerified: key === 'company' ? value : selectedDossier.isCompanyVerified
    };

    try {
      await api.put(`/admin/provider-applications/${selectedDossier.id}/verification-checklist`, updated);
      setSelectedDossier({ ...selectedDossier, ...updated });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-slate-100 flex-grow w-full text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Passenger Transport Applications</h1>
          <p className="text-slate-400 text-sm font-light">Review, verify documents, and approve passenger transport providers.</p>
        </div>

        {/* Search & Filters */}
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchApplications()}
              placeholder="Search driver, vehicle..."
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="PendingReview">Pending Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Applications Data Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl overflow-hidden backdrop-blur-xl shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Driver Name</th>
                <th className="px-6 py-4">City</th>
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Vehicle</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Verification Badge</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10 text-slate-500">Loading provider applications...</td></tr>
              ) : applications.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-slate-500">No applications found matching criteria.</td></tr>
              ) : (
                applications.map(app => (
                  <tr key={app.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-semibold text-white">
                      <div>{app.fullName}</div>
                      <div className="text-[11px] text-slate-500 font-normal">{app.phone}</div>
                    </td>
                    <td className="px-6 py-4">{app.currentCity}</td>
                    <td className="px-6 py-4">{app.companyName}</td>
                    <td className="px-6 py-4">
                      <div>{app.vehicleInfo}</div>
                      <div className="text-[10px] text-sky-400 font-mono">{app.vehicleRegNumber}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase ${
                        app.applicationStatus === 'Approved' ? 'bg-green-500/10 text-green-400 border border-green-500/30' :
                        app.applicationStatus === 'PendingReview' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                        app.applicationStatus === 'Rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/30' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {app.applicationStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {app.isFullyVerified ? (
                        <span className="inline-flex items-center gap-1 text-sky-400 font-bold text-[11px]">
                          <ShieldCheck className="h-4 w-4" /> ✔ Verified Provider
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">Incomplete</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => viewDossier(app.id)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all inline-flex items-center gap-1"
                      >
                        <Eye className="h-3.5 w-3.5" /> Dossier
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dossier Side Panel / Modal */}
      {selectedDossier && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex justify-end overflow-y-auto">
          <div className="w-full max-w-3xl bg-slate-900 border-l border-slate-800 p-6 sm:p-8 min-h-screen overflow-y-auto space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-blue-400" />
                <span>Driver Dossier: {selectedDossier.fullName}</span>
              </h2>
              <button onClick={() => setSelectedDossier(null)} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Verification Checklist Drawer */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">5-Point Verification Audit Checklist</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { key: 'identity', label: 'Identity Verified', val: selectedDossier.isIdentityVerified },
                  { key: 'license', label: 'License Verified', val: selectedDossier.isLicenseVerified },
                  { key: 'vehicle', label: 'Vehicle Verified', val: selectedDossier.isVehicleVerified },
                  { key: 'insurance', label: 'Insurance Verified', val: selectedDossier.isInsuranceVerified },
                  { key: 'company', label: 'Company Verified', val: selectedDossier.isCompanyVerified }
                ].map(item => (
                  <label key={item.key} className="flex items-center space-x-2 bg-slate-900 p-2.5 rounded-xl border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.val}
                      onChange={e => toggleChecklist(item.key, e.target.checked)}
                      className="w-4 h-4 accent-blue-600"
                    />
                    <span className="text-xs text-slate-300">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Personal Details & License */}
            <div className="grid grid-cols-2 gap-4 bg-slate-950 p-5 rounded-2xl border border-slate-800 text-xs">
              <div><span className="text-slate-500">Full Name:</span> <span className="font-bold text-white ml-1">{selectedDossier.fullName}</span></div>
              <div><span className="text-slate-500">Age:</span> <span className="font-bold text-white ml-1">{selectedDossier.age} yrs</span></div>
              <div><span className="text-slate-500">Phone:</span> <span className="font-bold text-white ml-1">{selectedDossier.phone}</span></div>
              <div><span className="text-slate-500">City:</span> <span className="font-bold text-white ml-1">{selectedDossier.currentCity}</span></div>
              <div><span className="text-slate-500">License No:</span> <span className="font-bold text-white ml-1">{selectedDossier.licenseNumber}</span></div>
              <div><span className="text-slate-500">Exp Date:</span> <span className="font-bold text-white ml-1">{selectedDossier.licenseExpirationDate?.split('T')[0]}</span></div>
            </div>

            {/* Documents Preview */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Submitted Vehicle & License Documents</h3>
              <div className="grid grid-cols-2 gap-3">
                {selectedDossier.licenseFrontPhotoUrl && (
                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 mb-1">Front License Photo</div>
                    <a href={`http://localhost:5010${selectedDossier.licenseFrontPhotoUrl}`} target="_blank" rel="noreferrer">
                      <img src={`http://localhost:5010${selectedDossier.licenseFrontPhotoUrl}`} alt="License Front" className="w-full h-32 object-cover rounded-xl border border-slate-700" />
                    </a>
                  </div>
                )}
                {selectedDossier.vehicle?.registrationCertificateUrl && (
                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 mb-1">Registration Certificate</div>
                    <a href={`http://localhost:5010${selectedDossier.vehicle.registrationCertificateUrl}`} target="_blank" rel="noreferrer">
                      <img src={`http://localhost:5010${selectedDossier.vehicle.registrationCertificateUrl}`} alt="Reg Cert" className="w-full h-32 object-cover rounded-xl border border-slate-700" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Admin Internal Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Admin Internal Notes</label>
              <textarea
                value={adminNotes}
                onChange={e => setAdminNotes(e.target.value)}
                placeholder="Enter internal audit remarks..."
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white focus:outline-none focus:border-blue-500 h-20"
              />
            </div>

            {/* Decision Controls */}
            <div className="flex gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={handleApprove}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs transition-all shadow-lg"
              >
                Approve & Escalated Role
              </button>

              <button
                onClick={() => setRejectionModalOpen(true)}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl text-xs transition-all shadow-lg"
              >
                Reject Application
              </button>

              <button
                onClick={handleSuspend}
                className="py-3 px-4 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 font-bold rounded-2xl text-xs border border-amber-600/40"
              >
                Suspend
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {rejectionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-white">Rejection Reason Mandatory</h3>
            <textarea
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              placeholder="Provide clear reason why the application was rejected..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white h-24"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setRejectionModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs">Cancel</button>
              <button onClick={handleReject} className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold">Confirm Rejection</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
