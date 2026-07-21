import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../app/store';
import { api } from '../services/api';
import { useTranslation } from '../hooks/useTranslation';
import type { ISaveProviderDraft, ITransportCompany, IProviderApplicationDossier } from '../types';
import {
  User, ShieldCheck, Car, Building2, MapPin, Calendar, Clock, Upload, CheckCircle2,
  AlertCircle, ChevronRight, ChevronLeft, Save, Sparkles, Phone, Award, Shield, FileText, Check
} from 'lucide-react';

const TAJIK_CITIES = ['Dushanbe', 'Khujand', 'Panjakent', 'Hisor', 'Khorog', 'Kulob', 'Bokhtar'];
const SERVICE_OPTIONS = ['Taxi', 'Ride-Hailing', 'Intercity Passenger Transport', 'Airport Transfer', 'Hotel Transfer', 'Tourist Transportation', 'VIP Transportation'];
const LANGUAGE_OPTIONS = ['Tajik', 'Russian', 'English', 'Uzbek'];
const PAYMENT_OPTIONS = ['Cash', 'Card', 'Online Payment'];
const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function ProviderRegistrationWizardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successSubmitted, setSuccessSubmitted] = useState(false);
  const [companies, setCompanies] = useState<ITransportCompany[]>([]);
  const [existingApplication, setExistingApplication] = useState<IProviderApplicationDossier | null>(null);

  // Form State
  const [form, setForm] = useState<ISaveProviderDraft>({
    fullName: user?.fullName || '',
    dateOfBirth: '1998-05-15',
    gender: 'Male',
    phone: user?.phoneNumber || '+992',
    email: user?.email || '',
    nationality: 'Tajikistan',
    currentCity: 'Dushanbe',
    currentAddress: '',
    profilePhotoUrl: user?.profileImageUrl || '',
    yearsDrivingExperience: 3,
    isProfessionalDriver: true,
    previousCompany: '',
    licenseNumber: '',
    licenseCategory: 'B',
    licenseIssueDate: '2020-01-15',
    licenseExpirationDate: '2030-01-15',
    licenseFrontPhotoUrl: '',
    licenseBackPhotoUrl: '',
    companyId: undefined,
    customCompanyName: '',
    employmentType: 'Driver',
    yearsWithCompany: 1,
    vehicle: {
      registrationNumber: '',
      brand: 'Toyota',
      model: 'Camry',
      manufacturingYear: 2021,
      color: 'White',
      passengerSeats: 4,
      hasAirConditioning: true,
      hasWifi: false,
      hasLuggageSpace: true,
      childSeatAvailable: false,
      wheelchairAccessible: false,
      petFriendly: false,
      smokingAllowed: false,
      registrationCertificateUrl: '',
      insuranceCertificateUrl: '',
      technicalInspectionCertificateUrl: '',
      vehiclePhotos: []
    },
    service: {
      serviceTypes: ['Taxi', 'Ride-Hailing'],
      availableCities: ['Dushanbe'],
      languagesSpoken: ['Tajik', 'Russian'],
      paymentMethods: ['Cash', 'Card']
    },
    workingHours: DAYS_OF_WEEK.map(day => ({
      dayOfWeek: day,
      startTime: '08:00',
      endTime: '20:00',
      is24Hours: false
    })),
    emergencyContactName: '',
    emergencyContactPhone: ''
  });

  // Calculate age live
  const calculateAge = (dobString: string) => {
    if (!dobString) return 0;
    const dob = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return Math.max(0, age);
  };

  const calculatedAge = calculateAge(form.dateOfBirth);

  // Fetch companies for selected city
  useEffect(() => {
    api.get(`/transport-companies?city=${form.currentCity}`)
      .then(res => setCompanies(res.data))
      .catch(console.error);
  }, [form.currentCity]);

  // Load existing draft/application on mount
  useEffect(() => {
    if (!user) return;
    api.get('/provider-registration/my-application')
      .then(res => {
        if (res.data) {
          const app: IProviderApplicationDossier = res.data;
          setExistingApplication(app);
          if (app.applicationStatus === 'PendingReview' || app.applicationStatus === 'Approved') {
            setSuccessSubmitted(true);
          }
          if (app.fullName) {
            setForm(prev => ({
              ...prev,
              fullName: app.fullName || prev.fullName,
              dateOfBirth: app.dateOfBirth ? app.dateOfBirth.split('T')[0] : prev.dateOfBirth,
              gender: app.gender || prev.gender,
              phone: app.phone || prev.phone,
              email: app.email || prev.email,
              nationality: app.nationality || prev.nationality,
              currentCity: app.currentCity || prev.currentCity,
              currentAddress: app.currentAddress || prev.currentAddress,
              profilePhotoUrl: app.profilePhotoUrl || prev.profilePhotoUrl,
              yearsDrivingExperience: app.yearsDrivingExperience || prev.yearsDrivingExperience,
              isProfessionalDriver: app.isProfessionalDriver ?? prev.isProfessionalDriver,
              previousCompany: app.previousCompany || prev.previousCompany,
              licenseNumber: app.licenseNumber || prev.licenseNumber,
              licenseCategory: app.licenseCategory || prev.licenseCategory,
              licenseIssueDate: app.licenseIssueDate ? app.licenseIssueDate.split('T')[0] : prev.licenseIssueDate,
              licenseExpirationDate: app.licenseExpirationDate ? app.licenseExpirationDate.split('T')[0] : prev.licenseExpirationDate,
              licenseFrontPhotoUrl: app.licenseFrontPhotoUrl || prev.licenseFrontPhotoUrl,
              licenseBackPhotoUrl: app.licenseBackPhotoUrl || prev.licenseBackPhotoUrl,
              companyId: app.companyId || prev.companyId,
              customCompanyName: app.customCompanyName || prev.customCompanyName,
              employmentType: (app.employmentType as any) || prev.employmentType,
              yearsWithCompany: app.yearsWithCompany || prev.yearsWithCompany,
              vehicle: app.vehicle || prev.vehicle,
              service: app.service || prev.service,
              workingHours: app.workingHours?.length ? app.workingHours : prev.workingHours,
              emergencyContactName: app.emergencyContactName || prev.emergencyContactName,
              emergencyContactPhone: app.emergencyContactPhone || prev.emergencyContactPhone
            }));
          }
        }
      })
      .catch(console.error);
  }, [user]);

  // Auto-Save Draft every 20 seconds
  useEffect(() => {
    if (!user || successSubmitted) return;
    const interval = setInterval(() => {
      saveDraft(true);
    }, 20000);
    return () => clearInterval(interval);
  }, [form, user, successSubmitted]);

  const saveDraft = async (silent = false) => {
    if (!user) return;
    if (!silent) setSaving(true);
    try {
      await api.post('/provider-registration/draft', form);
      if (!silent) {
        setErrorMessage('');
      }
    } catch (err: any) {
      if (!silent) setErrorMessage(err.response?.data?.message || 'Failed to auto-save draft.');
    } finally {
      if (!silent) setSaving(false);
    }
  };

  const handleFileUpload = async (file: File, category: string, callback: (url: string) => void) => {
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('File size exceeds 5 MB limit.');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

    try {
      const res = await api.post('/provider-registration/upload-document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      callback(res.data.url);
      setErrorMessage('');
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to upload document file.');
    }
  };

  const validateStep = (step: number) => {
    setErrorMessage('');
    if (step === 1) {
      if (!form.fullName || form.fullName.trim().length < 3) {
        setErrorMessage('Full Name must be at least 3 characters.');
        return false;
      }
      if (calculatedAge < 20) {
        setErrorMessage('Driver must be at least 20 years old.');
        return false;
      }
      if (!form.phone || form.phone.trim().length < 7) {
        setErrorMessage('Valid Phone Number is required.');
        return false;
      }
      if (!form.currentAddress) {
        setErrorMessage('Current Address is required.');
        return false;
      }
    } else if (step === 2) {
      if (form.yearsDrivingExperience < 1 || form.yearsDrivingExperience > 60) {
        setErrorMessage('Years of Driving Experience must be between 1 and 60 years.');
        return false;
      }
    } else if (step === 3) {
      if (!form.licenseNumber) {
        setErrorMessage('Driver License Number is required.');
        return false;
      }
      if (!form.licenseExpirationDate || new Date(form.licenseExpirationDate) <= new Date()) {
        setErrorMessage('Driver License must not be expired.');
        return false;
      }
      if (!form.licenseFrontPhotoUrl) {
        setErrorMessage('Front photo of Driver License is mandatory.');
        return false;
      }
    } else if (step === 4) {
      if (!form.vehicle?.registrationNumber) {
        setErrorMessage('Vehicle Registration Number (e.g. 5679AN08) is required.');
        return false;
      }
      if (!form.vehicle?.brand || !form.vehicle?.model) {
        setErrorMessage('Vehicle Brand and Model are required.');
        return false;
      }
      if ((form.vehicle?.vehiclePhotos?.length || 0) < 3) {
        setErrorMessage('At least 3 vehicle photos are required.');
        return false;
      }
    } else if (step === 5) {
      if (!form.companyId && !form.customCompanyName) {
        setErrorMessage('Please select a Transport Company or enter your Custom Company Name.');
        return false;
      }
    } else if (step === 6) {
      if (!form.service?.serviceTypes?.length) {
        setErrorMessage('Please select at least one Passenger Service Type.');
        return false;
      }
      if (!form.service?.availableCities?.length) {
        setErrorMessage('Please select at least one Operating City.');
        return false;
      }
    } else if (step === 7) {
      if (!form.vehicle?.registrationCertificateUrl) {
        setErrorMessage('Vehicle Registration Certificate upload is required.');
        return false;
      }
      if (!form.vehicle?.insuranceCertificateUrl) {
        setErrorMessage('Vehicle Insurance Certificate upload is required.');
        return false;
      }
      if (!form.emergencyContactName || !form.emergencyContactPhone) {
        setErrorMessage('Emergency Contact Name and Phone Number are required.');
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      saveDraft(true);
      setCurrentStep(prev => Math.min(8, prev + 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setErrorMessage('');
    setCurrentStep(prev => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitApplication = async () => {
    if (!validateStep(7)) return;
    setSubmitting(true);
    setErrorMessage('');
    try {
      await api.post('/provider-registration/submit', form);
      setSuccessSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to submit application. Please verify all required fields.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-24 bg-slate-950 text-slate-100 flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-slate-400 text-lg font-light">{t('common.mustBeSignedIn', 'You must be signed in to submit a transport provider application.')}</p>
        <button onClick={() => navigate('/login')} className="mt-4 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold">
          Sign In
        </button>
      </div>
    );
  }

  if (successSubmitted) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-slate-100 min-h-[70vh] flex flex-col justify-center items-center">
        <div className="bg-slate-900/60 border border-slate-800 p-8 sm:p-12 rounded-3xl shadow-2xl backdrop-blur-xl w-full">
          <div className="w-20 h-20 bg-green-500/20 border border-green-500/40 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-400" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">Application Submitted!</h2>
          <p className="text-slate-300 font-light max-w-lg mx-auto mb-6 leading-relaxed">
            Your passenger transport provider registration has been submitted and is currently under review by system administrators.
          </p>
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-xs text-slate-400 max-w-md mx-auto mb-8 space-y-1">
            <div className="flex justify-between"><span>Status:</span> <span className="font-bold text-amber-400 uppercase">{existingApplication?.applicationStatus || 'Pending Review'}</span></div>
            <div className="flex justify-between"><span>Submitted On:</span> <span>{new Date().toLocaleDateString()}</span></div>
            <div className="flex justify-between"><span>Verification Badge:</span> <span className="text-slate-500 font-medium">Pending Checklist Audit</span></div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg transition-all"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  const stepsList = [
    { num: 1, name: 'Personal', icon: User },
    { num: 2, name: 'Experience', icon: Award },
    { num: 3, name: 'License', icon: Shield },
    { num: 4, name: 'Vehicle', icon: Car },
    { num: 5, name: 'Company', icon: Building2 },
    { num: 6, name: 'Services', icon: Clock },
    { num: 7, name: 'Documents', icon: Upload },
    { num: 8, name: 'Review', icon: CheckCircle2 }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-slate-100 flex-grow w-full">
      {/* Header Banner */}
      <div className="text-center space-y-2 mb-8">
        <span className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/30 text-sky-400 text-xs font-semibold px-4 py-1.5 rounded-full uppercase tracking-wider">
          <Sparkles className="h-3.5 w-3.5 animate-spin" />
          <span>Passenger Transport Registration</span>
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">Become a Registered Driver</h1>
        <p className="text-slate-400 text-sm font-light max-w-2xl mx-auto">
          Register your taxi, ride-hailing, or intercity passenger service in Tajikistan.
        </p>
      </div>

      {/* Stepper Header */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-4 sm:p-6 mb-8 backdrop-blur-xl">
        <div className="flex items-center justify-between overflow-x-auto pb-2 gap-2 scrollbar-none">
          {stepsList.map(s => {
            const Icon = s.icon;
            const isActive = currentStep === s.num;
            const isDone = currentStep > s.num;
            return (
              <div
                key={s.num}
                onClick={() => isDone && setCurrentStep(s.num)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-2xl cursor-pointer transition-all shrink-0 ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/20'
                    : isDone
                    ? 'bg-slate-800/80 text-sky-400 font-semibold'
                    : 'text-slate-500 hover:text-slate-400'
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${isActive ? 'bg-white text-blue-600' : isDone ? 'bg-sky-500/20 text-sky-400' : 'bg-slate-800'}`}>
                  {isDone ? <Check className="h-4 w-4" /> : s.num}
                </div>
                <span className="text-xs hidden md:inline">{s.name}</span>
              </div>
            );
          })}
        </div>
        {/* Progress Bar */}
        <div className="w-full bg-slate-950 h-2 rounded-full mt-4 overflow-hidden border border-slate-800">
          <div className="bg-gradient-to-r from-blue-500 to-sky-400 h-full transition-all duration-500" style={{ width: `${(currentStep / 8) * 100}%` }} />
        </div>
      </div>

      {/* Error Message Alert */}
      {errorMessage && (
        <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-2xl flex items-center space-x-3 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Wizard Steps Container */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-[28px] p-6 sm:p-10 shadow-2xl backdrop-blur-xl text-left space-y-6">

        {/* STEP 1: Personal Information */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white border-b border-slate-800/60 pb-3 flex items-center gap-2">
              <User className="h-6 w-6 text-blue-500" />
              <span>Step 1: Personal Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Name *</label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={e => setForm({ ...form, fullName: e.target.value })}
                  placeholder="e.g. Alisher Navruzov"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Phone Number *</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="+992900000000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Date of Birth * (Min age: 20)</label>
                <input
                  type="date"
                  value={form.dateOfBirth}
                  onChange={e => setForm({ ...form, dateOfBirth: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                />
                <span className="text-xs text-sky-400 mt-1 block">Calculated Age: {calculatedAge} years old</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Gender</label>
                <select
                  value={form.gender}
                  onChange={e => setForm({ ...form, gender: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Current City *</label>
                <select
                  value={form.currentCity}
                  onChange={e => setForm({ ...form, currentCity: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  {TAJIK_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Current Address *</label>
                <input
                  type="text"
                  value={form.currentAddress}
                  onChange={e => setForm({ ...form, currentAddress: e.target.value })}
                  placeholder="Street, Building, Apt"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Driving Experience */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white border-b border-slate-800/60 pb-3 flex items-center gap-2">
              <Award className="h-6 w-6 text-blue-500" />
              <span>Step 2: Driving Experience</span>
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Years of Driving Experience (Min: 1, Max: 60) *</label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={form.yearsDrivingExperience}
                  onChange={e => setForm({ ...form, yearsDrivingExperience: parseInt(e.target.value) || 1 })}
                  className="w-full sm:w-1/2 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center space-x-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                <input
                  type="checkbox"
                  id="proDriver"
                  checked={form.isProfessionalDriver}
                  onChange={e => setForm({ ...form, isProfessionalDriver: e.target.checked })}
                  className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                />
                <label htmlFor="proDriver" className="text-sm font-medium text-slate-200 cursor-pointer">
                  I am a licensed professional passenger transport driver
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Previous Transport Company (Optional)</label>
                <input
                  type="text"
                  value={form.previousCompany || ''}
                  onChange={e => setForm({ ...form, previousCompany: e.target.value })}
                  placeholder="e.g. Dushanbe City Express"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Driver License */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white border-b border-slate-800/60 pb-3 flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-500" />
              <span>Step 3: Driver License Verification</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">License Serial Number *</label>
                <input
                  type="text"
                  value={form.licenseNumber}
                  onChange={e => setForm({ ...form, licenseNumber: e.target.value.toUpperCase() })}
                  placeholder="e.g. TJ9982341"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">License Category *</label>
                <select
                  value={form.licenseCategory}
                  onChange={e => setForm({ ...form, licenseCategory: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="B">Category B (Car / Taxi)</option>
                  <option value="BC">Category BC (Car & Light Truck)</option>
                  <option value="D">Category D (Bus / Minibus)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Issue Date *</label>
                <input
                  type="date"
                  value={form.licenseIssueDate}
                  onChange={e => setForm({ ...form, licenseIssueDate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Expiration Date * (Must be valid)</label>
                <input
                  type="date"
                  value={form.licenseExpirationDate}
                  onChange={e => setForm({ ...form, licenseExpirationDate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Front License Upload */}
            <div className="pt-4 border-t border-slate-800/60">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Front License Photo * (JPG, PNG, WEBP, max 5MB)</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'license', url => setForm({ ...form, licenseFrontPhotoUrl: url }))}
                className="block w-full text-xs text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
              />
              {form.licenseFrontPhotoUrl && <p className="text-xs text-green-400 mt-2 font-medium">✓ Front license photo uploaded successfully</p>}
            </div>
          </div>
        )}

        {/* STEP 4: Vehicle Information */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white border-b border-slate-800/60 pb-3 flex items-center gap-2">
              <Car className="h-6 w-6 text-blue-500" />
              <span>Step 4: Vehicle Details</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Vehicle Reg Number * (e.g. 5679AN08)</label>
                <input
                  type="text"
                  value={form.vehicle?.registrationNumber || ''}
                  onChange={e => setForm({ ...form, vehicle: { ...form.vehicle!, registrationNumber: e.target.value.toUpperCase() } })}
                  placeholder="5679AN08"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Brand *</label>
                <input
                  type="text"
                  value={form.vehicle?.brand || ''}
                  onChange={e => setForm({ ...form, vehicle: { ...form.vehicle!, brand: e.target.value } })}
                  placeholder="Toyota"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Model *</label>
                <input
                  type="text"
                  value={form.vehicle?.model || ''}
                  onChange={e => setForm({ ...form, vehicle: { ...form.vehicle!, model: e.target.value } })}
                  placeholder="Camry"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Year *</label>
                <input
                  type="number"
                  value={form.vehicle?.manufacturingYear || 2021}
                  onChange={e => setForm({ ...form, vehicle: { ...form.vehicle!, manufacturingYear: parseInt(e.target.value) || 2021 } })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Color *</label>
                <input
                  type="text"
                  value={form.vehicle?.color || ''}
                  onChange={e => setForm({ ...form, vehicle: { ...form.vehicle!, color: e.target.value } })}
                  placeholder="White"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Passenger Seats *</label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={form.vehicle?.passengerSeats || 4}
                  onChange={e => setForm({ ...form, vehicle: { ...form.vehicle!, passengerSeats: parseInt(e.target.value) || 4 } })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Vehicle Feature Toggles */}
            <div className="pt-4 border-t border-slate-800/60">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Vehicle Features</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { key: 'hasAirConditioning', label: 'Air Conditioning' },
                  { key: 'hasWifi', label: 'Free Wi-Fi' },
                  { key: 'hasLuggageSpace', label: 'Luggage Trunk' },
                  { key: 'childSeatAvailable', label: 'Child Seat' },
                  { key: 'wheelchairAccessible', label: 'Wheelchair Access' },
                  { key: 'petFriendly', label: 'Pet Friendly' },
                  { key: 'smokingAllowed', label: 'Smoking Allowed' }
                ].map(f => (
                  <label key={f.key} className="flex items-center space-x-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(form.vehicle as any)?.[f.key] || false}
                      onChange={e => setForm({ ...form, vehicle: { ...form.vehicle!, [f.key]: e.target.checked } })}
                      className="w-4 h-4 accent-blue-600"
                    />
                    <span className="text-xs text-slate-300">{f.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Vehicle Photos Upload (Min 3 / Max 10) */}
            <div className="pt-4 border-t border-slate-800/60">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Vehicle Photos * (Uploaded: {form.vehicle?.vehiclePhotos?.length || 0} / Min: 3, Max: 10)
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'vehicle', url => {
                  const currentPhotos = form.vehicle?.vehiclePhotos || [];
                  if (currentPhotos.length < 10) {
                    setForm({ ...form, vehicle: { ...form.vehicle!, vehiclePhotos: [...currentPhotos, url] } });
                  }
                })}
                className="block w-full text-xs text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
              />
              <div className="flex gap-2 mt-3 flex-wrap">
                {form.vehicle?.vehiclePhotos.map((p, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-700">
                    <img src={`http://localhost:5010${p}`} alt="Vehicle" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Transport Company */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white border-b border-slate-800/60 pb-3 flex items-center gap-2">
              <Building2 className="h-6 w-6 text-blue-500" />
              <span>Step 5: Transport Company</span>
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Select Operating Company in {form.currentCity}</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {companies.map(c => (
                    <div
                      key={c.id}
                      onClick={() => setForm({ ...form, companyId: c.id, customCompanyName: '' })}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        form.companyId === c.id
                          ? 'bg-blue-600/20 border-blue-500 text-white'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-bold text-sm">{c.name}</div>
                      <div className="text-xs text-slate-500 mt-1">Operating in {c.operatingCities?.join(', ') || 'All Cities'}</div>
                    </div>
                  ))}

                  <div
                    onClick={() => setForm({ ...form, companyId: undefined })}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      !form.companyId
                        ? 'bg-blue-600/20 border-blue-500 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-sm">Other / Custom Company</div>
                    <div className="text-xs text-slate-500 mt-1">Specify custom company for admin review</div>
                  </div>
                </div>
              </div>

              {!form.companyId && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Custom Company Name *</label>
                  <input
                    type="text"
                    value={form.customCompanyName || ''}
                    onChange={e => setForm({ ...form, customCompanyName: e.target.value })}
                    placeholder="Enter full company name"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Employment Type</label>
                <div className="flex gap-3">
                  {['Driver', 'Owner', 'Partner'].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm({ ...form, employmentType: t as any })}
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        form.employmentType === t
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-950 border border-slate-800 text-slate-400'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: Services & Schedule */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white border-b border-slate-800/60 pb-3 flex items-center gap-2">
              <Clock className="h-6 w-6 text-blue-500" />
              <span>Step 6: Services & Availability</span>
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Service Types Offered *</label>
                <div className="flex flex-wrap gap-2">
                  {SERVICE_OPTIONS.map(s => {
                    const isSelected = form.service?.serviceTypes?.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          const current = form.service?.serviceTypes || [];
                          const updated = isSelected ? current.filter(x => x !== s) : [...current, s];
                          setForm({ ...form, service: { ...form.service!, serviceTypes: updated } });
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                          isSelected ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Operating Cities *</label>
                <div className="flex flex-wrap gap-2">
                  {TAJIK_CITIES.map(c => {
                    const isSelected = form.service?.availableCities?.includes(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          const current = form.service?.availableCities || [];
                          const updated = isSelected ? current.filter(x => x !== c) : [...current, c];
                          setForm({ ...form, service: { ...form.service!, availableCities: updated } });
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                          isSelected ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Languages Spoken</label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGE_OPTIONS.map(l => {
                    const isSelected = form.service?.languagesSpoken?.includes(l);
                    return (
                      <button
                        key={l}
                        type="button"
                        onClick={() => {
                          const current = form.service?.languagesSpoken || [];
                          const updated = isSelected ? current.filter(x => x !== l) : [...current, l];
                          setForm({ ...form, service: { ...form.service!, languagesSpoken: updated } });
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                          isSelected ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        {l}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 7: Document Upload */}
        {currentStep === 7 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white border-b border-slate-800/60 pb-3 flex items-center gap-2">
              <Upload className="h-6 w-6 text-blue-500" />
              <span>Step 7: Mandatory Documents</span>
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Vehicle Registration Certificate * (JPG, PNG, WEBP)</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'reg_cert', url => setForm({ ...form, vehicle: { ...form.vehicle!, registrationCertificateUrl: url } }))}
                  className="block w-full text-xs text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white cursor-pointer"
                />
                {form.vehicle?.registrationCertificateUrl && <p className="text-xs text-green-400 mt-2 font-medium">✓ Registration Certificate uploaded</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Vehicle Insurance Policy * (JPG, PNG, WEBP)</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'insurance', url => setForm({ ...form, vehicle: { ...form.vehicle!, insuranceCertificateUrl: url } }))}
                  className="block w-full text-xs text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white cursor-pointer"
                />
                {form.vehicle?.insuranceCertificateUrl && <p className="text-xs text-green-400 mt-2 font-medium">✓ Insurance Policy uploaded</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-800/60">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Emergency Contact Name *</label>
                  <input
                    type="text"
                    value={form.emergencyContactName}
                    onChange={e => setForm({ ...form, emergencyContactName: e.target.value })}
                    placeholder="e.g. Brother / Relative"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Emergency Contact Phone *</label>
                  <input
                    type="text"
                    value={form.emergencyContactPhone}
                    onChange={e => setForm({ ...form, emergencyContactPhone: e.target.value })}
                    placeholder="+992900000000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 8: Review & Submit */}
        {currentStep === 8 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white border-b border-slate-800/60 pb-3 flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-blue-500" />
              <span>Step 8: Review Dossier & Submit</span>
            </h2>

            <div className="bg-slate-950/80 p-6 rounded-2xl border border-slate-800 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 border-b border-slate-800 pb-3">
                <div><span className="text-slate-500">Name:</span> <span className="font-bold text-white ml-2">{form.fullName}</span></div>
                <div><span className="text-slate-500">Age:</span> <span className="font-bold text-white ml-2">{calculatedAge} yrs</span></div>
                <div><span className="text-slate-500">Phone:</span> <span className="font-bold text-white ml-2">{form.phone}</span></div>
                <div><span className="text-slate-500">City:</span> <span className="font-bold text-white ml-2">{form.currentCity}</span></div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b border-slate-800 pb-3">
                <div><span className="text-slate-500">License Number:</span> <span className="font-bold text-white ml-2">{form.licenseNumber}</span></div>
                <div><span className="text-slate-500">Driving Exp:</span> <span className="font-bold text-white ml-2">{form.yearsDrivingExperience} yrs</span></div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b border-slate-800 pb-3">
                <div><span className="text-slate-500">Vehicle:</span> <span className="font-bold text-white ml-2">{form.vehicle?.brand} {form.vehicle?.model} ({form.vehicle?.registrationNumber})</span></div>
                <div><span className="text-slate-500">Vehicle Photos:</span> <span className="font-bold text-green-400 ml-2">{form.vehicle?.vehiclePhotos.length} photos</span></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-slate-500">Services:</span> <span className="font-bold text-white ml-2">{form.service?.serviceTypes.join(', ')}</span></div>
                <div><span className="text-slate-500">Emergency Contact:</span> <span className="font-bold text-white ml-2">{form.emergencyContactName} ({form.emergencyContactPhone})</span></div>
              </div>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex justify-between items-center pt-6 border-t border-slate-800/80">
          {currentStep > 1 ? (
            <button
              onClick={prevStep}
              className="flex items-center space-x-2 px-6 py-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 font-semibold rounded-2xl transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>
          ) : <div />}

          <div className="flex space-x-3">
            <button
              onClick={() => saveDraft(false)}
              disabled={saving}
              className="flex items-center space-x-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-semibold rounded-2xl transition-all cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Saving...' : 'Save Draft'}</span>
            </button>

            {currentStep < 8 ? (
              <button
                onClick={nextStep}
                className="flex items-center space-x-2 px-7 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmitApplication}
                disabled={submitting}
                className="flex items-center space-x-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl shadow-xl shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <span>{submitting ? 'Submitting...' : 'Submit Application'}</span>
                <CheckCircle2 className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
