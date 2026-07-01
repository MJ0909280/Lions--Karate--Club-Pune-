import React, { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc,
  setDoc,
  addDoc,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { db, auth, handleFirestoreError, OperationType, checkFirestoreConnection } from '../firebase';
import { Admission, BatchInfo, BATCH_TIMINGS, DOJO_BRANCHES, BELT_LEVELS } from '../types';
import IDCard from './IDCard';
import SEOVisibilityConsole from './SEOVisibilityConsole';
import { 
  ShieldCheck, 
  LogOut, 
  Users, 
  CheckCircle, 
  XCircle, 
  X,
  Clock, 
  Search, 
  Filter,
  Eye, 
  Trash2, 
  Award,
  Calendar,
  Phone,
  Mail,
  Home,
  AlertCircle,
  FileText,
  Plus,
  Edit2,
  Save,
  Check,
  Target,
  MapPin,
  DollarSign,
  Video,
  RefreshCw,
  Upload,
  Camera,
  Sparkles,
  Download
} from 'lucide-react';

// Required Admin check email literal configuration
const AUTHORIZED_ADMIN_EMAIL = "writingandreserching18@gmail.com";

function AdmissionsTableSkeleton() {
  return (
    <div className="animate-pulse w-full">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950 border-b border-zinc-900 text-zinc-500 uppercase font-heading font-black text-[9px] tracking-widest">
              <th className="py-4.5 px-6">ID Pass</th>
              <th className="py-4.5 px-6">Student Bio</th>
              <th className="py-4.5 px-6">Branch & Coach</th>
              <th className="py-4.5 px-6">Batch Timings</th>
              <th className="py-4.5 px-6">Rank Belt</th>
              <th className="py-4.5 px-6">Review Status</th>
              <th className="py-4.5 px-6">Fees Status</th>
              <th className="py-4.5 px-6 text-right">Interactive Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900/40 text-xs">
            {[1, 2, 3, 4, 5].map((idx) => (
              <tr key={idx} className="border-b border-zinc-900/20">
                <td className="py-4 px-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded bg-zinc-850" />
                    <div className="w-20 h-4 bg-zinc-900 rounded" />
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="space-y-1.5">
                    <div className="w-28 h-4.5 bg-zinc-800 rounded" />
                    <div className="w-24 h-3 bg-zinc-900 rounded" />
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="space-y-1.5">
                    <div className="w-32 h-4 bg-zinc-800 rounded" />
                    <div className="w-20 h-3 bg-zinc-900 rounded" />
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="w-24 h-4 bg-zinc-850 rounded" />
                </td>
                <td className="py-4 px-6">
                  <div className="w-24 h-5 bg-zinc-850 rounded" />
                </td>
                <td className="py-4 px-6">
                  <div className="w-16 h-5 bg-zinc-900 rounded" />
                </td>
                <td className="py-4 px-6">
                  <div className="w-14 h-5 bg-zinc-900 rounded" />
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex justify-end space-x-2">
                    <div className="w-16 h-7 bg-zinc-850 rounded" />
                    <div className="w-8 h-7 bg-zinc-900 rounded" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ExamsTableSkeleton() {
  return (
    <div className="animate-pulse w-full">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950 text-zinc-450 text-[10px] uppercase font-bold tracking-wider font-mono border-b border-zinc-900">
              <th className="py-4 px-6">Student details</th>
              <th className="py-4 px-6">Dojo training Branch</th>
              <th className="py-4 px-6">Current & Target Belt</th>
              <th className="py-4 px-6">Registry state</th>
              <th className="py-4 px-6">Score & Comments</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900/40 text-xs">
            {[1, 2, 3, 4, 5].map((idx) => (
              <tr key={idx} className="border-b border-zinc-900/20">
                <td className="py-4 px-6">
                  <div className="space-y-1.5">
                    <div className="w-20 h-3 bg-zinc-900 rounded" />
                    <div className="w-32 h-4 bg-zinc-800 rounded" />
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="w-28 h-4 bg-zinc-850 rounded" />
                </td>
                <td className="py-4 px-6">
                  <div className="space-y-1.5">
                    <div className="w-24 h-4 bg-zinc-800 rounded" />
                    <div className="w-24 h-3 bg-zinc-900 rounded" />
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="w-16 h-5 bg-zinc-900 rounded" />
                </td>
                <td className="py-4 px-6">
                  <div className="space-y-1">
                    <div className="w-32 h-4.5 bg-zinc-850 rounded" />
                    <div className="w-24 h-3.5 bg-zinc-900 rounded" />
                  </div>
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex justify-end space-x-2">
                    <div className="w-20 h-7 bg-zinc-850 rounded" />
                    <div className="w-8 h-7 bg-zinc-900 rounded" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BatchesGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse text-left">
      {[1, 2, 3].map((idx) => (
        <div key={idx} className="flex flex-col bg-slate-900/20 border border-zinc-900 overflow-hidden rounded-xl p-6 space-y-4">
          <div className="w-24 h-3 bg-zinc-900 rounded" />
          <div className="w-48 h-5.5 bg-zinc-800 rounded" />
          
          <div className="bg-slate-950/60 border border-zinc-900/50 p-3 rounded-lg space-y-2.5">
            <div className="flex items-center space-x-2">
              <div className="w-3.5 h-3.5 bg-zinc-900 rounded-full" />
              <div className="w-32 h-3 bg-zinc-900 rounded" />
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3.5 h-3.5 bg-zinc-900 rounded-full" />
              <div className="w-24 h-3.5 bg-zinc-800 rounded" />
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-zinc-900/30 p-2.5 rounded-lg">
            <div className="w-4 h-4 bg-zinc-850 rounded-full" />
            <div className="space-y-1">
              <div className="w-16 h-2.5 bg-zinc-900 rounded" />
              <div className="w-28 h-3.5 bg-zinc-800 rounded" />
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-900/40 flex justify-between items-center">
            <div className="w-20 h-4 bg-zinc-900 rounded" />
            <div className="flex space-x-1">
              <div className="w-7 h-7 bg-zinc-850 rounded" />
              <div className="w-7 h-7 bg-zinc-850 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SchedulesGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-pulse text-left">
      {[1, 2].map((idx) => (
        <div key={idx} className="bg-slate-900/20 border border-zinc-900 p-5 rounded-2xl space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-28 h-4.5 bg-zinc-800 rounded" />
            <div className="w-full h-3 bg-zinc-900 rounded" />
          </div>
          
          <div className="bg-slate-950/60 border border-zinc-900/50 p-3.5 rounded-xl space-y-2.5">
            <div className="w-24 h-3 bg-zinc-900 rounded" />
            <div className="w-48 h-3.5 bg-zinc-800 rounded" />
            <div className="w-32 h-3 bg-zinc-900 rounded" />
          </div>

          <div className="pt-2 border-t border-zinc-900/40 flex justify-between items-center">
            <div className="w-24 h-3 bg-zinc-900 rounded" />
            <div className="flex space-x-1.5">
              <div className="w-7 h-7 bg-zinc-850 rounded" />
              <div className="w-7 h-7 bg-zinc-850 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminPanel() {
  // Auth and state managers
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Database live diagnostics state
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const [checkingDb, setCheckingDb] = useState(false);

  const verifyDbConn = async () => {
    setCheckingDb(true);
    try {
      const res = await checkFirestoreConnection();
      setDbConnected(res);
    } catch {
      setDbConnected(false);
    } finally {
      setCheckingDb(false);
    }
  };

  useEffect(() => {
    verifyDbConn();
    const interval = setInterval(verifyDbConn, 30000);
    return () => clearInterval(interval);
  }, []);

  // Tab navigation console state
  const [adminTab, setAdminTab] = useState<'admissions' | 'batches' | 'site_settings' | 'exams' | 'seo_ai'>('admissions');

  // Live Exams Admin Syncing States
  const [exams, setExams] = useState<any[]>([]);
  const [examsLoading, setExamsLoading] = useState(false);
  const [gradingExam, setGradingExam] = useState<any | null>(null);
  const [enteredGrade, setEnteredGrade] = useState('');
  const [enteredRemarks, setEnteredRemarks] = useState('');
  const [gradingSaving, setGradingSaving] = useState(false);
  const [gradingError, setGradingError] = useState('');

  // Live Exam Schedules State
  const [examSchedules, setExamSchedules] = useState<any[]>([]);
  const [schedulesLoading, setSchedulesLoading] = useState(false);
  const [examsSubTab, setExamsSubTab] = useState<'applications' | 'schedules'>('applications');

  // Exam Schedule Form inputs
  const [schedModalOpen, setSchedModalOpen] = useState(false);
  const [editingSched, setEditingSched] = useState<any | null>(null);
  const [schedDate, setSchedDate] = useState('');
  const [schedBelt, setSchedBelt] = useState('');
  const [schedVenue, setSchedVenue] = useState('');
  const [schedPrereq, setSchedPrereq] = useState('');
  const [schedError, setSchedError] = useState('');
  const [schedSaving, setSchedSaving] = useState(false);

  // Search/Filters for exams tab
  const [examSearch, setExamSearch] = useState('');
  const [examStatusFilter, setExamStatusFilter] = useState<'all' | 'pending' | 'approved' | 'passed' | 'failed'>('all');

  // Site Video Configuration Inputs
  const [heroVideoInput, setHeroVideoInput] = useState('');
  const [aboutVideoInput, setAboutVideoInput] = useState('');
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [settingsError, setSettingsError] = useState('');

  // WhatsApp Alert Configuration Inputs
  const [waEnabled, setWaEnabled] = useState(false);
  const [waPhoneNumber, setWaPhoneNumber] = useState('');
  const [waApiKey, setWaApiKey] = useState('');

  // Dynamic state managers represent batches in db
  const [batches, setBatches] = useState<BatchInfo[]>([]);
  const [batchesLoading, setBatchesLoading] = useState(false);

  // Batch detailed Form states
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<BatchInfo | null>(null);
  const [bName, setBName] = useState('');
  const [bAgeGroup, setBAgeGroup] = useState('');
  const [bDays, setBDays] = useState('');
  const [bTiming, setBTiming] = useState('');
  const [bFocus, setBFocus] = useState('');
  const [bPrice, setBPrice] = useState('');
  const [bCoaches, setBCoaches] = useState('');
  const [batchFormError, setBatchFormError] = useState('');
  const [batchFormSaving, setBatchFormSaving] = useState(false);

  // Modal displaying lists of users enrolled back
  const [viewingEnrolledBatch, setViewingEnrolledBatch] = useState<BatchInfo | null>(null);

  // Filter controllers
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [batchFilter, setBatchFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [feesFilter, setFeesFilter] = useState<'all' | 'Paid' | 'Unpaid'>('all');

  // Detail Modal view
  const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(null);
  const [viewingIDCard, setViewingIDCard] = useState<Admission | null>(null);

  // Custom modal-dialog state to replace native window.confirm (which gets blocked inside iframe environments)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    onConfirm: () => void | Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    onConfirm: () => {},
  });
  
  // Custom operational states
  const [loginError, setLoginError] = useState('');

  // Manual Student Entry States
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [manualFormError, setManualFormError] = useState('');
  const [manualSaving, setManualSaving] = useState(false);

  const [mStudentId, setMStudentId] = useState('');
  const [mFullName, setMFullName] = useState('');
  const [mDob, setMDob] = useState('');
  const [mAge, setMAge] = useState<number | ''>('');
  const [mGender, setMGender] = useState<'male' | 'female' | 'other'>('male');
  const [mParentName, setMParentName] = useState('');
  const [mPhone, setMPhone] = useState('');
  const [mWhatsApp, setMWhatsApp] = useState('');
  const [mEmail, setMEmail] = useState('');
  const [mAddress, setMAddress] = useState('');
  const [mBatch, setMBatch] = useState('');
  const [mBeltLevel, setMBeltLevel] = useState('White Belt (10th Kyu - Beginner)');
  const [mBranch, setMBranch] = useState('Manaji Nagar Branch');
  const [mFeesStatus, setMFeesStatus] = useState<'Paid' | 'Unpaid'>('Paid');
  const [mJoiningDate, setMJoiningDate] = useState('');
  const [mPhotoUrl, setMPhotoUrl] = useState('');
  const [mDragOver, setMDragOver] = useState(false);

  // 1. Manage Firebase Authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Enforce secure whitelist rule
        if (currentUser.email === AUTHORIZED_ADMIN_EMAIL) {
          setIsAdmin(true);
          setLoginError('');
        } else {
          setIsAdmin(false);
          setLoginError(`Access Denied. The logged-in Google account (${currentUser.email}) is not authorized as the Shihan Administrator.`);
        }
      } else {
        setIsAdmin(null);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Manage Real-time Admissions synced listeners
  useEffect(() => {
    if (!user || !isAdmin) {
      setAdmissions([]);
      return;
    }

    setDataLoading(true);
    const admissionsRef = collection(db, 'admissions');
    
    // Attach standard onSnapshot listener for instant state refresh on submissions
    const unsubscribe = onSnapshot(admissionsRef, (snapshot) => {
      const records: Admission[] = [];
      snapshot.forEach((docSnap) => {
        records.push({
          id: docSnap.id,
          ...docSnap.data()
        } as Admission);
      });
      // Sort newest submissions first
      records.sort((a, b) => b.createdAt - a.createdAt);
      setAdmissions(records);
      setDataLoading(false);
    }, (error) => {
      console.error("Firestore loading error: ", error);
      setDataLoading(false);
      handleFirestoreError(error, OperationType.LIST, 'admissions');
    });

    return () => unsubscribe();
  }, [user, isAdmin]);

  // Handle standard google pop-up session triggers
  const handleGoogleLogin = async () => {
    setLoginError('');
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error(err);
      const errorCode = err?.code || '';
      const errorMessage = err?.message || '';
      
      if (errorCode === 'auth/unauthorized-domain') {
        setLoginError(
          `🔑 UNAUTHORIZED DOMAIN ERROR\n\n` +
          `The domain "${window.location.hostname}" is not allowed to sign in with your Firebase Project.\n\n` +
          `How to authorize this domain:\n` +
          `1. Open your Firebase Console (https://console.firebase.google.com)\n` +
          `2. Click on "Authentication" in the left sidebar.\n` +
          `3. Go to the "Settings" tab at the top.\n` +
          `4. Click on "Authorized domains" from the list.\n` +
          `5. Click "Add domain" and enter:\n` +
          `   👉   ${window.location.hostname}\n` +
          `6. Click Add, wait 1 minute, and try clicking "Log in with Google" again!`
        );
      } else if (errorCode === 'auth/popup-blocked') {
        setLoginError(
          `🚫 POPUP BLOCKED\n\n` +
          `Your browser blocked the Google Authentication window.\n\n` +
          `How to fix:\n` +
          `1. Click the "Log in with Google" button again.\n` +
          `2. Watch the browser address bar for a "Popup Blocked" icon.\n` +
          `3. Click that icon and choose "Always allow popups from this site".`
        );
      } else if (errorCode === 'auth/operation-not-allowed') {
        setLoginError(
          `⚙️ GOOGLE PROVIDER IS DISABLED\n\n` +
          `Google Sign-In hasn't been enabled under your Firebase Project yet.\n\n` +
          `How to enable:\n` +
          `1. Go to Firebase Console -> Authentication -> Sign-in method.\n` +
          `2. Click "Add new provider" and select Google.\n` +
          `3. Enable it, fill in your project support email, and save.`
        );
      } else {
        setLoginError(
          `⚠️ AUTHENTICATION ERROR (${errorCode || 'unknown'})\n\n` +
          `${errorMessage || 'Verify popup settings or network connection.'}\n\n` +
          `Tip: If this is running on your Vercel URL, make sure "${window.location.hostname}" is added to "Authorized domains" in your Firebase console under Authentication -> Settings.`
        );
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setViewingIDCard(null);
      setSelectedAdmission(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Sync Batches dynamically
  useEffect(() => {
    if (!user || !isAdmin) {
      setBatches([]);
      return;
    }

    setBatchesLoading(true);
    const batchesRef = collection(db, 'batches');
    const unsubscribe = onSnapshot(batchesRef, (snapshot) => {
      const records: BatchInfo[] = [];
      snapshot.forEach((docSnap) => {
        records.push({
          id: docSnap.id,
          ...docSnap.data()
        } as BatchInfo);
      });
      setBatches(records);
      setBatchesLoading(false);
    }, (error) => {
      console.error("Firestore batches loading error: ", error);
      setBatchesLoading(false);
      handleFirestoreError(error, OperationType.LIST, 'batches');
    });

    return () => unsubscribe();
  }, [user, isAdmin]);

  // Sync Site Video Settings in real-time
  useEffect(() => {
    if (!user || !isAdmin) return;
    const unsub = onSnapshot(doc(db, 'settings', 'video'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setHeroVideoInput(data.heroVideoUrl || 'https://res.cloudinary.com/dlzdagymx/video/upload/q_auto/f_auto/v1779342942/lions-karate-website-media/m3hfwi7bsfujadlsy5sl.mp4');
        setAboutVideoInput(data.aboutVideoUrl || 'https://res.cloudinary.com/dlzdagymx/video/upload/q_auto/f_auto/v1781891366/WhatsApp_Video_2026-06-19_at_9.51.10_PM_pog0dc.mp4');
      } else {
        setHeroVideoInput('https://res.cloudinary.com/dlzdagymx/video/upload/q_auto/f_auto/v1779342942/lions-karate-website-media/m3hfwi7bsfujadlsy5sl.mp4');
        setAboutVideoInput('https://res.cloudinary.com/dlzdagymx/video/upload/q_auto/f_auto/v1781891366/WhatsApp_Video_2026-06-19_at_9.51.10_PM_pog0dc.mp4');
      }
    }, (error) => {
      console.error("Firestore settings sync error: ", error);
    });
    return () => unsub();
  }, [user, isAdmin]);

  // Sync WhatsApp Site Notification Settings in real-time
  useEffect(() => {
    if (!user || !isAdmin) return;
    const unsub = onSnapshot(doc(db, 'settings', 'whatsapp'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setWaEnabled(!!data.enabled);
        setWaPhoneNumber(data.phoneNumber || '');
        setWaApiKey(data.apiKey || '');
      } else {
        setWaEnabled(false);
        setWaPhoneNumber('+91 90496 88172');
        setWaApiKey('');
      }
    }, (error) => {
      console.error("Firestore settings/whatsapp sync error: ", error);
    });
    return () => unsub();
  }, [user, isAdmin]);

  // Sync real-time Exams database
  useEffect(() => {
    if (!user || !isAdmin) {
      setExams([]);
      return;
    }

    setExamsLoading(true);
    const examsRef = collection(db, 'exams');
    const unsubscribe = onSnapshot(examsRef, (snapshot) => {
      const records: any[] = [];
      snapshot.forEach((docSnap) => {
        records.push({
          id: docSnap.id,
          ...docSnap.data()
        });
      });
      records.sort((a, b) => b.createdAt - a.createdAt);
      setExams(records);
      setExamsLoading(false);
    }, (error) => {
      console.error("Firestore exams sync error:", error);
      setExamsLoading(false);
      handleFirestoreError(error, OperationType.LIST, 'exams');
    });

    return () => unsubscribe();
  }, [user, isAdmin]);

  // Sync real-time Exam Schedules database
  useEffect(() => {
    if (!user || !isAdmin) {
      setExamSchedules([]);
      return;
    }

    setSchedulesLoading(true);
    const schedulesRef = collection(db, 'exam_schedules');
    const unsubscribe = onSnapshot(schedulesRef, (snapshot) => {
      const records: any[] = [];
      snapshot.forEach((docSnap) => {
        records.push({
          id: docSnap.id,
          ...docSnap.data()
        });
      });
      records.sort((a, b) => b.createdAt - a.createdAt);
      setExamSchedules(records);
      setSchedulesLoading(false);
    }, (error) => {
      console.error("Firestore schedules sync error:", error);
      setSchedulesLoading(false);
      handleFirestoreError(error, OperationType.LIST, 'exam_schedules');
    });

    return () => unsubscribe();
  }, [user, isAdmin]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isAdmin) return;

    setSettingsSaving(true);
    setSettingsSuccess(false);
    setSettingsError('');

    try {
      await setDoc(doc(db, 'settings', 'video'), {
        heroVideoUrl: heroVideoInput.trim(),
        aboutVideoUrl: aboutVideoInput.trim(),
        updatedAt: Date.now()
      });
      await setDoc(doc(db, 'settings', 'whatsapp'), {
        enabled: waEnabled,
        phoneNumber: waPhoneNumber.trim(),
        apiKey: waApiKey.trim(),
        updatedAt: Date.now()
      });
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 4000);
    } catch (err: any) {
      console.error("Firestore settings write failure: ", err);
      setSettingsError("Failure executing write operation. Please check your admin privileges.");
      handleFirestoreError(err, OperationType.WRITE, 'settings/video');
    } finally {
      setSettingsSaving(false);
    }
  };

  const suggestNextStudentId = () => {
    const currentYear = new Date().getFullYear();
    const count = admissions.length + 100;
    const paddedSerial = String(count).padStart(3, '0');
    setMStudentId(`LKCP-${currentYear}-${paddedSerial}`);
  };

  const openEnrollModal = () => {
    const defaultBatch = batches.length > 0 ? batches[0].name : BATCH_TIMINGS[0].name;
    setMBatch(defaultBatch);
    setMStudentId('');
    setMFullName('');
    setMDob('');
    setMAge('');
    setMGender('male');
    setMParentName('');
    setMPhone('');
    setMWhatsApp('');
    setMEmail('');
    setMAddress('');
    setMBeltLevel('White Belt (10th Kyu - Beginner)');
    setMBranch('Manaji Nagar Branch');
    setMFeesStatus('Paid');
    setMPhotoUrl('');
    setManualFormError('');
    setMJoiningDate(new Date().toISOString().split('T')[0]);
    
    // Auto-generate suggested ID
    suggestNextStudentId();
    
    setEnrollModalOpen(true);
  };

  const exportToCSV = () => {
    if (filteredAdmissions.length === 0) {
      return;
    }

    const headers = [
      "Roll ID",
      "Full Name",
      "DOB",
      "Age",
      "Gender",
      "Parent Name",
      "Phone",
      "WhatsApp",
      "Email",
      "Address",
      "Batch",
      "Belt Level",
      "Branch",
      "Coach Name",
      "Review Status",
      "Fees Status",
      "Registration Date"
    ];

    const escapeCSVValue = (val: any) => {
      if (val === undefined || val === null) return "";
      let str = String(val);
      // Replace double quotes with double double quotes
      str = str.replace(/"/g, '""');
      // Wrap in double quotes if there are commas, double quotes, or newlines
      if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
        return `"${str}"`;
      }
      return str;
    };

    const rows = filteredAdmissions.map((student) => {
      const regDate = student.createdAt ? new Date(student.createdAt).toLocaleDateString() : "";
      return [
        student.studentId || "N/A",
        student.fullName || "",
        student.dob || "",
        student.age !== undefined ? student.age : "",
        student.gender || "",
        student.parentName || "",
        student.phone || "",
        student.whatsApp || "",
        student.email || "",
        student.address || "",
        student.batch || "",
        student.beltLevel || "",
        student.branch || "N/A",
        student.coachName || "N/A",
        student.status || "",
        student.feesStatus || "Unpaid",
        regDate
      ].map(escapeCSVValue).join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    // Generate clean filename with current date
    const today = new Date().toISOString().split("T")[0];
    link.setAttribute("href", url);
    link.setAttribute("download", `lions_karate_registry_${today}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const compressAndProcessMImage = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setManualFormError('Please select a valid image file (.png, .jpg, .webp).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 250;
        const MAX_HEIGHT = 250;
        let width = img.width;
        let height = img.height;

        const size = Math.min(width, height);
        const offsetX = (width - size) / 2;
        const offsetY = (height - size) / 2;

        canvas.width = MAX_WIDTH;
        canvas.height = MAX_HEIGHT;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, MAX_WIDTH, MAX_HEIGHT);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
          setMPhotoUrl(dataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleMPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      compressAndProcessMImage(files[0]);
    }
  };

  const handleMDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setMDragOver(true);
  };

  const handleMDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setMDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      compressAndProcessMImage(files[0]);
    }
  };

  const handleSaveManualStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mStudentId.trim()) {
      setManualFormError('Student Roll ID is required.');
      return;
    }
    if (!mFullName.trim()) {
      setManualFormError('Student full name is required.');
      return;
    }
    if (!mPhone.trim()) {
      setManualFormError('Contact phone is required.');
      return;
    }
    
    setManualSaving(true);
    setManualFormError('');

    try {
      const selectedBranch = DOJO_BRANCHES.find(b => b.name === mBranch) || DOJO_BRANCHES[0];
      const coachName = selectedBranch.coach;

      const cleanStudentId = mStudentId.trim().toUpperCase();

      const duplicate = admissions.some(a => a.studentId === cleanStudentId);
      if (duplicate) {
        setManualFormError(`The student roll ID "${cleanStudentId}" is already taken in the directory. Please use a unique sequence.`);
        setManualSaving(false);
        return;
      }

      const joiningTimestamp = mJoiningDate ? new Date(mJoiningDate).getTime() : Date.now();

      const studentData = {
        studentId: cleanStudentId,
        fullName: mFullName.trim(),
        dob: mDob || new Date(Date.now() - 315576000000).toISOString().split('T')[0],
        age: Number(mAge) || 10,
        gender: mGender,
        parentName: mParentName.trim() || 'Parent/Guardian',
        phone: mPhone.trim(),
        whatsApp: mWhatsApp.trim() || mPhone.trim(),
        email: mEmail.trim() || 'student@dojo.com',
        address: mAddress.trim() || 'Pune, Maharashtra',
        batch: mBatch,
        beltLevel: mBeltLevel,
        photoUrl: mPhotoUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=60',
        status: 'approved',
        createdAt: joiningTimestamp,
        updatedAt: Date.now(),
        approvedAt: Date.now(),
        branch: mBranch,
        coachName: coachName,
        feesStatus: mFeesStatus
      };

      await addDoc(collection(db, 'admissions'), studentData);
      setEnrollModalOpen(false);
    } catch (err: any) {
      console.error("Failed to manually register previous student:", err);
      setManualFormError(err.message || 'Failed to sync to database. Please retry.');
    } finally {
      setManualSaving(false);
    }
  };

  // Exam Grading Operations
  const handleApproveExamSlot = async (examId: string) => {
    try {
      const examRef = doc(db, 'exams', examId);
      await updateDoc(examRef, {
        status: 'approved',
        updatedAt: Date.now()
      });
    } catch (error) {
      console.error("Failed to approve exam slot:", error);
      handleFirestoreError(error, OperationType.UPDATE, `exams/${examId}`);
    }
  };

  const handleGradeExamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingExam) return;

    setGradingSaving(true);
    setGradingError('');

    try {
      // 1. Grade the exam document
      const examRef = doc(db, 'exams', gradingExam.id);
      await updateDoc(examRef, {
        status: gradingExam.statusAction,
        grade: enteredGrade.trim(),
        remarks: enteredRemarks.trim(),
        updatedAt: Date.now()
      });

      // 2. If Passed, automatically graduate the student's belt level in the admissions profile collection
      if (gradingExam.statusAction === 'passed') {
        const admissionsRef = collection(db, 'admissions');
        const q = query(admissionsRef, where('studentId', '==', gradingExam.studentId));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const studentDoc = snap.docs[0];
          await updateDoc(doc(db, 'admissions', studentDoc.id), {
            beltLevel: gradingExam.targetBelt,
            updatedAt: Date.now()
          });
        }
      }

      setGradingExam(null);
      setEnteredGrade('');
      setEnteredRemarks('');
    } catch (error: any) {
      console.error("Failed to grade exam:", error);
      setGradingError(error.message || 'Verification failed.');
      handleFirestoreError(error, OperationType.UPDATE, `exams/${gradingExam.id}`);
    } finally {
      setGradingSaving(false);
    }
  };

  const handleDeleteExamRecord = (examId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Erase Exam Registration",
      message: "Are you absolutely sure you want to permanently erase this exam registration? This action is irreversible.",
      confirmText: "Erase Record",
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'exams', examId));
        } catch (error) {
          console.error("Failed to delete exam record:", error);
          handleFirestoreError(error, OperationType.DELETE, `exams/${examId}`);
        }
      }
    });
  };

  const handleSaveScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isAdmin) return;
    if (!schedDate || !schedBelt || !schedVenue || !schedPrereq) {
      setSchedError('All fields are required.');
      return;
    }

    setSchedSaving(true);
    setSchedError('');

    try {
      const scheduleData = {
        examDate: schedDate.trim(),
        beltLevel: schedBelt.trim(),
        venueDetails: schedVenue.trim(),
        prerequisites: schedPrereq.trim(),
        updatedAt: Date.now()
      };

      if (editingSched) {
        await updateDoc(doc(db, 'exam_schedules', editingSched.id), {
          ...scheduleData
        });
      } else {
        await addDoc(collection(db, 'exam_schedules'), {
          ...scheduleData,
          createdAt: Date.now()
        });
      }

      setSchedModalOpen(false);
      setEditingSched(null);
      setSchedDate('');
      setSchedBelt('');
      setSchedVenue('');
      setSchedPrereq('');
    } catch (err: any) {
      console.error("Failed to save schedule:", err);
      setSchedError(err.message || "Failed to save schedule.");
      handleFirestoreError(err, OperationType.WRITE, 'exam_schedules');
    } finally {
      setSchedSaving(false);
    }
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Exam Schedule",
      message: "Are you sure you want to delete this scheduled exam? This will remove it from the scheduling boards and list.",
      confirmText: "Delete Schedule",
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'exam_schedules', scheduleId));
        } catch (error) {
          console.error("Failed to delete exam schedule:", error);
          handleFirestoreError(error, OperationType.DELETE, `exam_schedules/${scheduleId}`);
        }
      }
    });
  };

  const openCreateScheduleModal = () => {
    setEditingSched(null);
    setSchedDate('');
    setSchedBelt('All Belt Levels (Open Exam)');
    setSchedVenue('');
    setSchedPrereq('');
    setSchedError('');
    setSchedModalOpen(true);
  };

  const openEditScheduleModal = (sched: any) => {
    setEditingSched(sched);
    setSchedDate(sched.examDate);
    setSchedBelt(sched.beltLevel);
    setSchedVenue(sched.venueDetails);
    setSchedPrereq(sched.prerequisites);
    setSchedError('');
    setSchedModalOpen(true);
  };

  // Seeding initial batch models if clean empty db
  const seedDefaultBatches = async () => {
    if (batches.length > 0) return;
    try {
      setBatchesLoading(true);
      for (const batchItem of BATCH_TIMINGS) {
        await setDoc(doc(db, 'batches', batchItem.id), {
          name: batchItem.name,
          ageGroup: batchItem.ageGroup,
          timing: batchItem.timing,
          days: batchItem.days,
          focus: batchItem.focus,
          price: batchItem.price,
          coaches: "Sensei Maruti Jadhav, Sensei Shivraj Jejure"
        });
      }
    } catch (error) {
      console.error("Failed to seed batches: ", error);
      handleFirestoreError(error, OperationType.WRITE, 'batches');
    } finally {
      setBatchesLoading(false);
    }
  };

  const openCreateBatchModal = () => {
    setEditingBatch(null);
    setBName('');
    setBAgeGroup('');
    setBDays('');
    setBTiming('');
    setBFocus('');
    setBPrice('');
    setBCoaches('');
    setBatchFormError('');
    setBatchModalOpen(true);
  };

  const openEditBatchModal = (b: BatchInfo) => {
    setEditingBatch(b);
    setBName(b.name);
    setBAgeGroup(b.ageGroup || '');
    setBDays(b.days);
    setBTiming(b.timing);
    setBFocus(b.focus || '');
    setBPrice(b.price || '');
    setBCoaches(b.coaches || '');
    setBatchFormError('');
    setBatchModalOpen(true);
  };

  const handleSaveBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bName || !bDays || !bTiming) {
      setBatchFormError('Name, Days, and Timings schedule can not be blank.');
      return;
    }

    setBatchFormSaving(true);
    setBatchFormError('');
    try {
      const batchData = {
        name: bName.trim(),
        ageGroup: bAgeGroup.trim(),
        days: bDays.trim(),
        timing: bTiming.trim(),
        focus: bFocus.trim(),
        price: bPrice.trim(),
        coaches: bCoaches.trim()
      };

      if (editingBatch) {
        const bDocRef = doc(db, 'batches', editingBatch.id);
        await updateDoc(bDocRef, batchData);
      } else {
        const bColRef = collection(db, 'batches');
        await addDoc(bColRef, batchData);
      }
      setBatchModalOpen(false);
    } catch (error: any) {
      console.error("Failed to save batch: ", error);
      setBatchFormError(error.message || 'Error occurred while saving training program.');
      handleFirestoreError(error, editingBatch ? OperationType.UPDATE : OperationType.CREATE, `batches/${editingBatch?.id || ''}`);
    } finally {
      setBatchFormSaving(false);
    }
  };

  const handleDeleteBatch = (batchId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Training Batch",
      message: "Are you sure you want to delete this training batch? Direct selection on enrollment will be removed.",
      confirmText: "Delete Batch",
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'batches', batchId));
        } catch (error) {
          console.error("Failed to delete batch: ", error);
          handleFirestoreError(error, OperationType.DELETE, `batches/${batchId}`);
        }
      }
    });
  };

  // Perform operational status changes: Approve / Reject
  const updateAdmissionStatus = async (docId: string, nextStatus: 'approved' | 'rejected') => {
    try {
      const docRef = doc(db, 'admissions', docId);
      const updateData: any = {
        status: nextStatus,
        updatedAt: Date.now()
      };
      if (nextStatus === 'approved') {
        updateData.approvedAt = Date.now();
      } else {
        updateData.rejectedAt = Date.now();
      }
      await updateDoc(docRef, updateData);
      
      // Update local detailed states if looking at the active record
      if (selectedAdmission && selectedAdmission.id === docId) {
        setSelectedAdmission({
          ...selectedAdmission,
          status: nextStatus,
          ...updateData
        });
      }
    } catch (error) {
      console.error("Failed to update status", error);
      handleFirestoreError(error, OperationType.UPDATE, `admissions/${docId}`);
    }
  };

  // Update Fees Payment state dynamically
  const updateFeesStatus = async (studentId: string, nextStatus: 'Paid' | 'Unpaid') => {
    try {
      const docRef = doc(db, 'admissions', studentId);
      await updateDoc(docRef, {
        feesStatus: nextStatus,
        updatedAt: Date.now()
      });
      
      // Sync detailed viewer active state copy
      if (selectedAdmission && selectedAdmission.id === studentId) {
        setSelectedAdmission({
          ...selectedAdmission,
          feesStatus: nextStatus
        });
      }
    } catch (error) {
      console.error("Failed to toggle fees status status", error);
      handleFirestoreError(error, OperationType.UPDATE, `admissions/${studentId}`);
    }
  };

  // Perform destructive entry removal
  const deleteAdmissionRecord = (docId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Erase Student Admission File",
      message: "Are you absolutely sure you want to permanently erase this student's admission files? This action is irreversible.",
      confirmText: "Erase Entry",
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'admissions', docId));
          setSelectedAdmission(null);
          setViewingIDCard(null);
        } catch (error) {
          console.error("Failed to delete record: ", error);
          handleFirestoreError(error, OperationType.DELETE, `admissions/${docId}`);
        }
      }
    });
  };

  // Calculate high-fidelity stats aggregates
  const stats = {
    total: admissions.length,
    pending: admissions.filter(a => a.status === 'pending').length,
    approved: admissions.filter(a => a.status === 'approved').length,
    rejected: admissions.filter(a => a.status === 'rejected').length,
    // Managed batches stats count
    totalBatches: batches.length || 4,
  };

  // Perform search criteria match filters
  const filteredAdmissions = admissions.filter((student) => {
    // 1. Search Query
    const searchLower = searchQuery.toLowerCase().trim();
    const nameMatch = student.fullName.toLowerCase().includes(searchLower);
    const phoneMatch = student.phone.includes(searchLower);
    const idMatch = student.studentId?.toLowerCase().includes(searchLower);
    const beltMatch = student.beltLevel?.toLowerCase().includes(searchLower);
    const matchesSearch = !searchLower || nameMatch || phoneMatch || idMatch || beltMatch;

    // 2. Status Match
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;

    // 3. Batch Match
    const matchesBatch = batchFilter === 'all' || student.batch === batchFilter;

    // 4. Branch Match (graceful fallback for existing documents without a set branch)
    const matchesBranch = branchFilter === 'all' || (student.branch || 'Manaji Nagar Branch').toLowerCase().trim() === branchFilter.toLowerCase().trim();

    // 5. Fees Match (graceful fallback for existing documents without state)
    const matchesFees = feesFilter === 'all' || (student.feesStatus || 'Unpaid') === feesFilter;

    return matchesSearch && matchesStatus && matchesBatch && matchesBranch && matchesFees;
  });

  // Extract unique batches list dynamically from Firestore if loaded, else fallback to actual admissions lists
  const batchesList: string[] = batches.length > 0
    ? batches.map(b => b.name)
    : Array.from(new Set(admissions.map(a => a.batch)));

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center text-zinc-400">
        <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4" />
        <span className="font-heading font-medium text-xs tracking-widest uppercase">Verifying Admin Credentials...</span>
      </div>
    );
  }

  // A. Access-Denied / Secure Auth wall
  if (!user || isAdmin !== true) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12">
        <div className="w-full max-w-md bg-slate-900/40 border border-zinc-900 rounded-2xl p-8 text-center shadow-2xl relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-yellow-500 rounded-t-2xl" />

          <div className="bg-yellow-500/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 text-yellow-500 glow-gold">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <h1 className="font-title text-2xl font-black text-white uppercase tracking-wider mb-2">Shihan Admin Area</h1>
          <p className="text-zinc-500 text-xs px-2 mb-6 leading-relaxed">
            Authentication is sandboxed to the secure administrator account. Please log in using your Google credentials below.
          </p>

          {loginError && (
            <div className="mb-6 bg-red-950/40 border border-red-500/20 text-red-400 p-4 rounded-lg flex items-start space-x-2 text-left text-[11px] leading-relaxed max-h-[300px] overflow-y-auto">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="whitespace-pre-line break-words flex-1 text-red-300 font-sans">
                {loginError}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center space-x-3 bg-white hover:bg-zinc-100 text-slate-900 font-heading font-bold text-xs uppercase tracking-widest py-4 px-6 rounded-lg transition-all transform hover:-translate-y-0.5 shadow-md cursor-pointer"
            >
              <svg className="w-4 h-4 text-slate-900" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.7 0 3.3.65 4.5 1.8l2.423-2.423C17.385 1.745 14.93 1 12.24 1 6.58 1 2 5.58 2 11.24s4.58 10.24 10.24 10.24c5.9 0 9.8-4.15 9.8-9.98 0-.67-.06-1.3-.16-1.9H12.24z" />
              </svg>
              <span>LOG IN WITH GOOGLE</span>
            </button>

            {user && (
              <button
                onClick={handleLogout}
                className="w-full font-heading font-semibold text-xs text-zinc-400 hover:text-white pt-2 block text-center uppercase tracking-widest underline"
              >
                Sign Out {user.email?.substring(0, 10)}...
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // B. Full Admin Console Workspace
  return (
    <div className="min-h-screen bg-slate-950 pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Dynamic header row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-900 pb-8">
          <div>
            <div className="flex items-center space-x-2.5 text-yellow-500 mb-1.5">
              <ShieldCheck className="w-5 h-5" />
              <span className="font-heading text-xs font-black uppercase tracking-widest block">SECURE DIRECTORY MASTER CONSOLE</span>
            </div>
            <h1 className="font-title text-3xl sm:text-4xl font-extrabold text-white tracking-tight uppercase">
              Dojo Admission Registry
            </h1>
          </div>

          {/* Connected admin account details with dynamic DB indicators */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Live Database status diagnostics check */}
            <div 
              onClick={verifyDbConn}
              title="Click to manually reverify connection to the live Firestore Database"
              className="flex items-center space-x-2 bg-slate-900/60 border border-zinc-900 rounded-xl px-4 py-2.5 cursor-pointer hover:bg-zinc-900/80 transition-all text-left"
            >
              <div className={`w-2 h-2 rounded-full ${
                dbConnected === true ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]' : 
                dbConnected === false ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.7)] animate-pulse' :
                'bg-amber-500 animate-pulse'
              }`} />
              <div className="flex flex-col select-none">
                <span className="font-heading font-black text-[9px] text-zinc-100 uppercase tracking-widest leading-none">
                  {dbConnected === true ? 'DATABASE ONLINE' : 
                   dbConnected === false ? 'DATABASE OFFLINE' : 
                   'PINGING DATABASE...'}
                </span>
                <span className="text-[7px] font-mono text-zinc-500 uppercase tracking-wider block mt-1">
                  {dbConnected === true ? 'FIREBASE CLOUD CONNECTED' : 
                   dbConnected === false ? 'CONNECTION LOST (RETRYING...)' : 
                   'VERIFYING RESPONSIVENESS'}
                </span>
              </div>
              <RefreshCw className={`w-3 h-3 text-zinc-500 hover:text-white transition-colors ml-1 ${checkingDb ? 'animate-spin' : ''}`} />
            </div>

            <div className="flex items-center space-x-4 bg-slate-900/60 border border-zinc-900 rounded-xl px-4 py-2.5">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-yellow-500/30">
                <img src={user.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=80&auto=format&fit=crop"} alt="Admin Profile" />
              </div>
              <div className="leading-none flex flex-col">
                <span className="font-heading font-black text-[10px] text-zinc-100 uppercase tracking-wider truncate max-w-[150px]">{user.displayName}</span>
                <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest mt-1">SHIHAN ADMINISTRATOR</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-md hover:bg-zinc-850 text-zinc-400 hover:text-red-500 transition-colors tooltip cursor-pointer"
                title="Disconnect Panel"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Aggregate Stats Dashboard */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-slate-900/40 border border-zinc-900 p-5 rounded-xl flex items-center space-x-4">
            <div className="p-3 bg-zinc-800 rounded-lg text-zinc-300">
              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <span className="text-[10px] text-zinc-550 uppercase font-bold block tracking-wider">Total Registers</span>
              <span className="font-mono text-lg sm:text-2xl font-black text-white mt-1 block">{stats.total}</span>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-zinc-900 p-5 rounded-xl flex items-center space-x-4">
            <div className="p-3 bg-yellow-500/10 rounded-lg text-yellow-500">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <span className="text-[10px] text-yellow-500/80 uppercase font-bold block tracking-wider">Pending Review</span>
              <span className="font-mono text-lg sm:text-2xl font-black text-yellow-500 mt-1 block">{stats.pending}</span>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-zinc-900 p-5 rounded-xl flex items-center space-x-4">
            <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-500">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <span className="text-[10px] text-emerald-500/80 uppercase font-bold block tracking-wider">Approved Members</span>
              <span className="font-mono text-lg sm:text-2xl font-black text-emerald-500 mt-1 block">{stats.approved}</span>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-zinc-900 p-5 rounded-xl flex items-center space-x-4">
            <div className="p-3 bg-red-400/10 rounded-lg text-[#FF3B3F]">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <span className="text-[10px] text-zinc-350 uppercase font-bold block tracking-wider">Managed Batches</span>
              <span className="font-mono text-lg sm:text-2xl font-black text-yellow-500 mt-1 block">{stats.totalBatches}</span>
            </div>
          </div>
        </div>

        {/* Tab Selection Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-900 pb-px">
          <div className="flex space-x-6">
            <button
              onClick={() => setAdminTab('admissions')}
              className={`font-heading font-black text-xs tracking-widest uppercase pb-4 border-b-2 transition-all cursor-pointer ${
                adminTab === 'admissions' 
                  ? 'border-yellow-500 text-yellow-500 font-extrabold' 
                  : 'border-transparent text-zinc-550 hover:text-zinc-300'
              }`}
            >
              Student Directory
            </button>
            <button
              onClick={() => setAdminTab('batches')}
              className={`font-heading font-black text-xs tracking-widest uppercase pb-4 border-b-2 transition-all cursor-pointer ${
                adminTab === 'batches' 
                  ? 'border-yellow-500 text-yellow-500 font-extrabold' 
                  : 'border-transparent text-zinc-550 hover:text-zinc-300'
              }`}
            >
              Karate Batches
            </button>
            <button
              onClick={() => setAdminTab('site_settings')}
              className={`font-heading font-black text-xs tracking-widest uppercase pb-4 border-b-2 transition-all cursor-pointer ${
                adminTab === 'site_settings' 
                  ? 'border-yellow-500 text-yellow-500 font-extrabold' 
                  : 'border-transparent text-zinc-550 hover:text-zinc-350'
              }`}
            >
              Site Videos
            </button>
            <button
              onClick={() => setAdminTab('exams')}
              className={`font-heading font-black text-xs tracking-widest uppercase pb-4 border-b-2 transition-all cursor-pointer ${
                adminTab === 'exams' 
                  ? 'border-yellow-500 text-yellow-500 font-extrabold' 
                  : 'border-transparent text-zinc-555 hover:text-zinc-350'
              }`}
            >
              Exams & Belt Grading
            </button>
            <button
              onClick={() => setAdminTab('seo_ai')}
              className={`font-heading font-black text-xs tracking-widest uppercase pb-4 border-b-2 transition-all cursor-pointer flex items-center space-x-1 ${
                adminTab === 'seo_ai' 
                  ? 'border-yellow-500 text-yellow-500 font-extrabold' 
                  : 'border-transparent text-zinc-550 hover:text-zinc-300'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>GSC & AI SEO</span>
            </button>
          </div>

          {adminTab === 'admissions' && (
            <div className="flex items-center space-x-3 pb-4 sm:pb-0">
              <button
                onClick={exportToCSV}
                disabled={filteredAdmissions.length === 0}
                className="font-heading font-extrabold text-[10px] uppercase tracking-wider bg-slate-950 hover:bg-slate-900 border border-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-300 px-4 py-2 rounded transition-all flex items-center space-x-1.5 shadow-md cursor-pointer"
                title="Export currently filtered student directory as CSV"
              >
                <Download className="w-3.5 h-3.5 text-zinc-550" />
                <span>Export Registry (CSV)</span>
              </button>
              <button
                onClick={openEnrollModal}
                className="font-heading font-extrabold text-[10px] uppercase tracking-wider bg-yellow-500 hover:bg-yellow-400 text-slate-950 px-4 py-2 rounded transition-all flex items-center space-x-1.5 shadow-md cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Existing Student</span>
              </button>
            </div>
          )}

          {adminTab === 'batches' && (
            <div className="flex items-center space-x-3 pb-4 sm:pb-0">
              {batches.length === 0 && (
                <button
                  onClick={seedDefaultBatches}
                  disabled={batchesLoading}
                  className="font-heading font-extrabold text-[10px] uppercase tracking-wider hover:bg-slate-900 border border-zinc-800 text-zinc-400 px-4 py-2 rounded transition-all flex items-center space-x-1.5 cursor-pointer"
                >
                  <span>Seed standard Batches</span>
                </button>
              )}
              <button
                onClick={openCreateBatchModal}
                className="font-heading font-extrabold text-[10px] uppercase tracking-wider bg-yellow-500 hover:bg-yellow-400 text-slate-950 px-4 py-2 rounded transition-all flex items-center space-x-1.5 shadow cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Batch</span>
              </button>
            </div>
          )}
        </div>

        {/* TAB 1: Real-time Admissions directory */}
        {adminTab === 'admissions' && (
          <div className="bg-slate-900/40 border border-zinc-900 rounded-2xl overflow-hidden shadow-xl">
          {/* Filtering bar */}
          <div className="p-5 sm:p-6 border-b border-zinc-900 flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search inputs */}
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search by student name, phone, belt, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-zinc-850 text-zinc-300 placeholder:text-zinc-600 pl-11 pr-4 py-3 rounded-lg text-xs focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all"
              />
            </div>

            {/* Selector dropdown filters */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              {/* Status selectors */}
              <div className="flex items-center bg-slate-950 border border-zinc-850 rounded-lg px-2.5 py-1.5 shrink-0">
                <Filter className="w-3.5 h-3.5 text-zinc-500 mr-2" />
                <select
                  value={statusFilter}
                  onChange={(e: any) => setStatusFilter(e.target.value)}
                  className="bg-transparent text-zinc-400 font-heading text-xs tracking-wider outline-none cursor-pointer pr-4"
                >
                  <option value="all">ANY STATUS</option>
                  <option value="pending">PENDING</option>
                  <option value="approved">APPROVED</option>
                  <option value="rejected">REJECTED</option>
                </select>
              </div>

              {/* Batches selectors */}
              <div className="flex items-center bg-slate-950 border border-zinc-850 rounded-lg px-2.5 py-1.5 shrink-0">
                <Calendar className="w-3.5 h-3.5 text-zinc-500 mr-2" />
                <select
                  value={batchFilter}
                  onChange={(e) => setBatchFilter(e.target.value)}
                  className="bg-transparent text-zinc-400 font-heading text-xs tracking-wider outline-none cursor-pointer pr-4"
                >
                  <option value="all">ALL BATCHES</option>
                  {batchesList.map((st) => (
                    <option key={st} value={st}>{st.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              {/* Dojo Branches selectors */}
              <div className="flex items-center bg-slate-950 border border-zinc-850 rounded-lg px-2.5 py-1.5 shrink-0">
                <MapPin className="w-3.5 h-3.5 text-zinc-500 mr-2" />
                <select
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                  className="bg-transparent text-zinc-400 font-heading text-xs tracking-wider outline-none cursor-pointer pr-4"
                >
                  <option value="all">ALL BRANCHES</option>
                  {DOJO_BRANCHES.map((b) => (
                    <option key={b.name} value={b.name}>{b.name.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              {/* Admission Fees selectors */}
              <div className="flex items-center bg-slate-950 border border-zinc-850 rounded-lg px-2.5 py-1.5 shrink-0">
                <DollarSign className="w-3.5 h-3.5 text-zinc-500 mr-2" />
                <select
                  value={feesFilter}
                  onChange={(e: any) => setFeesFilter(e.target.value)}
                  className="bg-transparent text-zinc-400 font-heading text-xs tracking-wider outline-none cursor-pointer pr-4"
                >
                  <option value="all">ALL FEES</option>
                  <option value="Paid">PAID ONLY</option>
                  <option value="Unpaid">UNPAID ONLY</option>
                </select>
              </div>

              <div className="text-zinc-500 text-[10px] font-mono whitespace-nowrap lg:ml-2">
                Matching: {filteredAdmissions.length} records
              </div>
            </div>
          </div>

          {/* Actual Admissions list table container */}
          {dataLoading ? (
            <AdmissionsTableSkeleton />
          ) : filteredAdmissions.length === 0 ? (
            <div className="py-20 text-center text-zinc-600 text-xs font-light">
              No matching submission files recorded.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-zinc-900 text-zinc-500 uppercase font-heading font-black text-[9px] tracking-widest">
                    <th className="py-4.5 px-6">ID Pass</th>
                    <th className="py-4.5 px-6">Student Bio</th>
                    <th className="py-4.5 px-6">Branch & Coach</th>
                    <th className="py-4.5 px-6">Batch Timings</th>
                    <th className="py-4.5 px-6">Rank Belt</th>
                    <th className="py-4.5 px-6">Review Status</th>
                    <th className="py-4.5 px-6">Fees Status</th>
                    <th className="py-4.5 px-6 text-right">Interactive Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/40 text-xs text-zinc-300">
                  {filteredAdmissions.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-900/10 transition-colors">
                      {/* Photo + Pass ID */}
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-md overflow-hidden bg-neutral-900 border border-zinc-800 shrink-0">
                            <img src={student.photoUrl} alt="Portrait" className="w-full h-full object-cover" />
                          </div>
                          <span className="font-mono text-xs font-bold text-zinc-100">{student.studentId}</span>
                        </div>
                      </td>

                      {/* Name, Parent, Phone details */}
                      <td className="py-4 px-6 space-y-0.5">
                        <span className="font-bold text-zinc-200 block text-sm">{student.fullName}</span>
                        <div className="flex items-center space-x-3 text-[10px] text-zinc-500">
                          <span>Age: {student.age} yrs</span>
                          <span>•</span>
                          <span>Phone: {student.phone}</span>
                        </div>
                      </td>

                      {/* Dojo Branch & Dedicated Coach */}
                      <td className="py-4 px-6 space-y-0.5">
                        <span className="text-zinc-200 font-bold block text-xs whitespace-nowrap">{student.branch || 'Manaji Nagar Branch'}</span>
                        <span className="text-zinc-500 block text-[10px] truncate max-w-[200px]" title={student.coachName || 'Maruti Jadhav Sir 2nd dan Black Belt'}>
                          Coach: {student.coachName || 'Maruti Jadhav Sir 2nd dan Black Belt'}
                        </span>
                      </td>

                      {/* Selected Batch timins */}
                      <td className="py-4 px-6 text-zinc-400 font-medium">
                        {student.batch}
                      </td>

                      {/* Belt rank level details */}
                      <td className="py-4 px-6">
                        <span className="font-semibold text-yellow-500 text-[11px] uppercase tracking-wide whitespace-nowrap">
                          {student.beltLevel.split(' ')[0]} Belt
                        </span>
                      </td>

                      {/* Operational Status tags */}
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center space-x-1 uppercase font-heading font-black text-[9px] tracking-widest px-2.5 py-1 rounded border ${
                          student.status === 'approved'
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                            : student.status === 'rejected'
                            ? 'bg-red-500/10 border-red-500/20 text-red-500'
                            : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            student.status === 'approved' ? 'bg-emerald-500' : student.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                          }`} />
                          <span>{student.status}</span>
                        </span>
                      </td>

                      {/* Connection state tracker with direct interactive toggle */}
                      <td className="py-4 px-6">
                        <button
                          onClick={() => {
                            const currentFees = student.feesStatus || 'Unpaid';
                            const nextFees = currentFees === 'Paid' ? 'Unpaid' : 'Paid';
                            updateFeesStatus(student.id, nextFees);
                          }}
                          className={`inline-flex items-center space-x-1 uppercase font-heading font-black text-[9px] tracking-widest px-2 py-0.5 rounded border transition-all cursor-pointer hover:scale-105 ${
                            (student.feesStatus || 'Unpaid') === 'Paid'
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                              : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                          }`}
                          title="Click to toggle Paid/Unpaid status directly"
                        >
                          <span className={`w-1 h-1 rounded-full ${
                            (student.feesStatus || 'Unpaid') === 'Paid' ? 'bg-emerald-400' : 'bg-red-400'
                          }`} />
                          <span>{student.feesStatus || 'Unpaid'}</span>
                        </button>
                      </td>

                      {/* Action buttons triggers */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setSelectedAdmission(student)}
                            className="p-2 rounded bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                            title="View Full File"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setViewingIDCard(student)}
                            className="p-2 rounded bg-yellow-500/10 hover:bg-yellow-500 text-yellow-500 hover:text-slate-950 transition-all border border-yellow-500/10 cursor-pointer"
                            title="Issue Pass"
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => deleteAdmissionRecord(student.id)}
                            className="p-2 rounded bg-red-500/10 hover:bg-red-650 text-red-500 hover:text-white transition-all border border-red-500/10 cursor-pointer"
                            title="Erase Entry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        )}

        {/* TAB 2: Dynamic Karate Batches management console */}
        {adminTab === 'batches' && (
          <div className="space-y-6">
            {batchesLoading ? (
              <BatchesGridSkeleton />
            ) : batches.length === 0 ? (
              <div className="bg-slate-905 border border-zinc-900/60 rounded-2xl p-16 text-center space-y-6 max-w-xl mx-auto">
                <div className="bg-yellow-500/5 p-4 rounded-full w-14 h-14 flex items-center justify-center mx-auto text-yellow-500">
                  <Calendar className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-title text-base font-bold text-white uppercase tracking-wider">No Batches Configured</h3>
                  <p className="text-zinc-500 text-xs leading-relaxed max-w-sm mx-auto mt-2">
                    Initialize your Karate Dojo by setting up batch programs. These listings update admission form choices automatically.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row justify-center gap-3">
                  <button
                    onClick={seedDefaultBatches}
                    className="font-heading font-black text-[10px] uppercase tracking-wider hover:bg-zinc-900 border border-zinc-805 text-zinc-350 px-5 py-3 rounded-lg transition-all cursor-pointer"
                  >
                    Seed Standard Presets
                  </button>
                  <button
                    onClick={openCreateBatchModal}
                    className="font-heading font-black text-[10px] uppercase tracking-wider bg-yellow-500 hover:bg-yellow-400 text-slate-950 px-5 py-3 rounded-lg transition-all shadow cursor-pointer"
                  >
                    Create Custom Batch
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {batches.map((b) => {
                  const enrolledCount = admissions.filter(
                    (a) => a.batch.toLowerCase().trim() === b.name.toLowerCase().trim()
                  ).length;

                  return (
                    <div 
                      key={b.id} 
                      className="group relative flex flex-col bg-slate-900/40 border border-zinc-900 overflow-hidden rounded-xl transition-all duration-300 hover:border-yellow-500/30 hover:-translate-y-1"
                    >
                      <div className="absolute top-0 inset-x-0 h-[3px] bg-zinc-850 group-hover:bg-yellow-500 transition-all duration-300" />
                      
                      <div className="p-6 flex flex-col flex-grow">
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">
                            {b.ageGroup || "All Age Groups"}
                          </span>
                        </div>
                        <h3 className="font-title text-base font-black text-white group-hover:text-yellow-500 transition-colors uppercase leading-tight mb-4">
                          {b.name}
                        </h3>

                        {/* Times & Days details */}
                        <div className="bg-slate-950/60 border border-zinc-900/50 p-3 rounded-lg mb-4 space-y-2 text-[10px] font-mono">
                          <div className="flex items-start space-x-2 text-zinc-400">
                            <Calendar className="w-3.5 h-3.5 text-yellow-500 shrink-0 mt-0.5" />
                            <span>{b.days}</span>
                          </div>
                          <div className="flex items-start space-x-2 text-zinc-400">
                            <Clock className="w-3.5 h-3.5 text-yellow-500 shrink-0 mt-0.5" />
                            <span className="text-zinc-300 font-bold">{b.timing}</span>
                          </div>
                        </div>

                        {/* Coaches row */}
                        {b.coaches && (
                          <div className="flex items-center space-x-2.5 bg-yellow-500/[0.04] border border-yellow-500/10 p-2.5 rounded-lg mb-4 text-[10px] leading-tight">
                            <Users className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                            <div>
                              <span className="text-[8px] uppercase tracking-widest text-zinc-500 block font-bold font-sans">INSTRUCTORS</span>
                              <span className="text-zinc-300 font-semibold mt-0.5 block font-sans">{b.coaches}</span>
                            </div>
                          </div>
                        )}

                        {/* Curriculum focus info */}
                        <div className="text-[11px] leading-relaxed text-zinc-400 mb-6 flex-grow font-sans">
                          <span className="text-[8px] uppercase font-mono tracking-widest text-[#FF3B3F] block font-bold mb-0.5">Focus Syllabus</span>
                          <p className="italic text-zinc-400">"{b.focus || "Traditional shotokan mechanics & defensive principles"}"</p>
                        </div>

                        {/* Enrolled Students statistics connector and views trigger */}
                        <div className="flex items-center justify-between bg-zinc-950/50 border border-zinc-900 p-3 rounded-lg mb-4 text-xs font-mono">
                          <span className="text-zinc-500 font-bold uppercase tracking-wider text-[9px]">ENROLLMENT ROSTER</span>
                          <button
                            onClick={() => setViewingEnrolledBatch(b)}
                            className="font-bold text-yellow-500 px-2 py-1 rounded bg-yellow-500/10 hover:bg-yellow-500 hover:text-slate-950 border border-yellow-500/10 transition-all text-[11px] cursor-pointer"
                          >
                            {enrolledCount} {enrolledCount === 1 ? 'Student' : 'Students'} &rarr;
                          </button>
                        </div>                        {/* Card bottom footer editing deleting */}
                        <div className="pt-4 border-t border-zinc-900 flex items-center justify-end text-xs font-mono mt-auto">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => openEditBatchModal(b)}
                              className="p-1.5 rounded bg-zinc-900 border border-zinc-800 hover:border-yellow-500/20 text-zinc-400 hover:text-yellow-500 transition-all cursor-pointer"
                              title="Edit Timings"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteBatch(b.id)}
                              className="p-1.5 rounded bg-red-950/10 border border-red-500/10 hover:border-red-500 text-red-500/85 hover:text-white transition-all cursor-pointer"
                              title="Erase Batch"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Site Videos Configuration Console */}
        {adminTab === 'site_settings' && (
          <div className="bg-slate-905 border border-zinc-900/60 rounded-2xl p-6 sm:p-10 max-w-3xl mx-auto space-y-8 animate-fade-in">
            <div className="flex items-center space-x-3.5 border-b border-zinc-900 pb-5">
              <div className="p-2.5 bg-yellow-500/10 text-yellow-500 rounded-lg">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-black text-base uppercase text-white tracking-wider">Dynamic Video Administration</h3>
                <p className="text-[11px] font-medium text-zinc-500 mt-0.5">Customize background loops and live Dojo session videos instantly.</p>
              </div>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6">
              {/* Hero Background Video field */}
              <div className="space-y-2">
                <label className="block text-[10px] font-mono text-zinc-400 font-extrabold uppercase tracking-widest">
                  Hero Section Background Video URL
                </label>
                <input
                  type="text"
                  value={heroVideoInput}
                  onChange={(e) => setHeroVideoInput(e.target.value)}
                  placeholder="e.g. https://example.com/club_hero_loop.mp4"
                  className="w-full bg-slate-950/80 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white font-medium focus:outline-none focus:border-yellow-500/50 transition-all font-mono placeholder:text-zinc-650"
                />
                <span className="block text-[10px] text-zinc-500 leading-normal">
                  Requires direct MP4 links, YouTube URL structures, or local relative files (e.g., <code className="text-zinc-400 font-mono bg-zinc-950 px-1 py-0.5 rounded text-[9px]">/hero.mp4</code>). Leave blank to revert to traditional Dojo loops automatically.
                </span>
              </div>

              {/* Dojo Live Practice Video URL (About Section) */}
              <div className="space-y-2">
                <label className="block text-[10px] font-mono text-zinc-400 font-extrabold uppercase tracking-widest">
                  Dojo Live Practice Video URL (About Section)
                </label>
                <input
                  type="text"
                  value={aboutVideoInput}
                  onChange={(e) => setAboutVideoInput(e.target.value)}
                  placeholder="e.g. https://example.com/dojo_practice.mp4"
                  className="w-full bg-slate-950/80 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white font-medium focus:outline-none focus:border-yellow-500/50 transition-all font-mono placeholder:text-zinc-650"
                />
                <span className="block text-[10px] text-zinc-500 leading-normal">
                  Requires direct MP4 links, YouTube URL structures, or local files (e.g., <code className="text-zinc-400 font-mono bg-zinc-950 px-1 py-0.5 rounded text-[9px]">/about_video.mp4</code>). Unmute volume toggle is equipped automatically.
                </span>
              </div>

              {/* WhatsApp Auto-Alert server integration configuration */}
              <div className="border-t border-zinc-900/60 pt-6 space-y-5">
                <div className="flex items-center space-x-3.5 pb-2">
                  <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg border border-emerald-500/20">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-black text-sm uppercase text-white tracking-wider">WhatsApp Auto-Alert Server Integration</h3>
                    <p className="text-[10px] font-medium text-zinc-500 mt-0.5">Receive instant WhatsApp alerts automatically as soon as any student registers or submits inquiries.</p>
                  </div>
                </div>

                {/* Enable toggle switches */}
                <div className="flex items-center space-x-3 bg-zinc-950/40 p-3.5 border border-zinc-900/60 rounded-xl">
                  <input
                    type="checkbox"
                    id="waEnabled"
                    checked={waEnabled}
                    onChange={(e) => setWaEnabled(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                  <label htmlFor="waEnabled" className="text-xs text-zinc-300 font-medium select-none cursor-pointer">
                    Enable automatic background alerts on student admission forms and quick register inquiries.
                  </label>
                </div>

                {waEnabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in text-left">
                    {/* Admin WhatsApp Number phone prefix */}
                    <div className="space-y-2">
                      <label className="block text-[9px] font-mono text-zinc-400 font-extrabold uppercase tracking-wider">
                        My WhatsApp Phone Number (with Country Code)
                      </label>
                      <input
                        type="text"
                        value={waPhoneNumber}
                        onChange={(e) => setWaPhoneNumber(e.target.value)}
                        placeholder="e.g. 919049688172 (No spaces, pluses or dashes)"
                        className="w-full bg-slate-950/80 border border-zinc-800 rounded-lg px-4 py-2.5 text-xs text-white font-medium focus:outline-none focus:border-emerald-500/50 transition-all font-mono placeholder:text-zinc-650"
                      />
                      <span className="block text-[8px] text-zinc-500">
                        Include prefix code (e.g. <code className="font-mono text-zinc-400">91</code> for India, <code className="font-mono text-zinc-400">1</code> for US). Avoid leading sign (+).
                      </span>
                    </div>

                    {/* CallMeBot key credentials API key */}
                    <div className="space-y-2">
                      <label className="block text-[9px] font-mono text-zinc-400 font-extrabold uppercase tracking-wider">
                        CallMeBot Free API Key (Apikey)
                      </label>
                      <input
                        type="text"
                        value={waApiKey}
                        onChange={(e) => setWaApiKey(e.target.value)}
                        placeholder="e.g. 783295"
                        className="w-full bg-slate-950/80 border border-zinc-800 rounded-lg px-4 py-2.5 text-xs text-white font-medium focus:outline-none focus:border-emerald-500/50 transition-all font-mono placeholder:text-zinc-650"
                      />
                      <span className="block text-[8px] text-zinc-500">
                        Required to dispatch free WhatsApp API streams continuously directly into your inbox.
                      </span>
                    </div>

                    {/* Obtain instructions block guide box */}
                    <div className="md:col-span-2 bg-emerald-950/10 border border-emerald-500/10 p-4 rounded-xl space-y-2 text-left">
                      <span className="block font-heading font-black text-[9px] text-emerald-400 uppercase tracking-widest">
                        ⚡ Quick Guide: Obtain Free CallMeBot API Key in 60 Seconds:
                      </span>
                      <ol className="list-decimal list-inside text-[9px] text-zinc-400 leading-relaxed font-mono space-y-1">
                        <li>
                          Save one of CallMeBot's active bot numbers as a contact:
                          <ul className="list-disc list-inside pl-4 mt-0.5 space-y-0.5 text-[8px] text-zinc-500">
                            <li>Primary Bot: <strong className="text-emerald-400 select-all">+34 694 23 67 31</strong></li>
                            <li>Backup Bot A: <strong className="text-zinc-300 select-all">+34 623 78 64 49</strong></li>
                            <li>Backup Bot B: <strong className="text-zinc-300 select-all">+34 644 97 50 14</strong></li>
                          </ul>
                        </li>
                        <li className="mt-1">Send a WhatsApp message containing: <strong className="text-emerald-400 select-all">I allow callmebot to send me messages</strong></li>
                        <li>The bot will instantly reply with your personalized <strong className="text-zinc-300 font-bold">Apikey</strong> (e.g. <span className="text-yellow-500 font-bold">129482</span>). Copy and paste it here!</li>
                      </ol>
                    </div>
                  </div>
                )}
              </div>

              {/* Uploaded File Helper Alert Info */}
              <div className="bg-red-400/[0.03] border border-red-500/10 p-4.5 rounded-lg flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed text-zinc-400 font-mono">
                  <span className="text-zinc-350 font-bold block uppercase tracking-wider mb-1">To use your uploaded Karate videos:</span>
                  1. Simply paste your host URL or cloud-hosted link dynamically above.<br />
                  2. Or if you uploaded the file via repository editor, use relative file coordinates (e.g. <code className="text-yellow-500 bg-black/40 px-1 py-0.5 rounded">/hero.mp4</code> or <code className="text-yellow-500 bg-black/40 px-1 py-0.5 rounded">/about_video.mp4</code>).
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  {settingsSuccess && (
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
                      <Check className="w-4 h-4 text-emerald-400" />
                      Configuration saved successfully!
                    </span>
                  )}
                  {settingsError && (
                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest flex items-center gap-1.5">
                      <XCircle className="w-4 h-4 text-red-500" />
                      {settingsError}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={settingsSaving}
                  className="w-full sm:w-auto font-heading font-black text-xs uppercase tracking-widest bg-yellow-500 hover:bg-yellow-400 text-slate-950 px-8 py-3.5 rounded shadow hover:shadow-yellow-500/25 transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {settingsSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>SAVING CHANGES...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>APPLY DIRECTORIES</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 4: EXAMS & BELT GRADING TAB CONTENT */}
        {adminTab === 'exams' && (
          <div className="space-y-6 animate-fade-in">
            {/* Sub-Tabs Selector */}
            <div className="flex border-b border-zinc-900 gap-4 mb-2">
              <button
                onClick={() => setExamsSubTab('applications')}
                className={`py-3 px-1.5 text-xs font-heading font-black tracking-widest uppercase transition-all border-b-2 cursor-pointer ${
                  examsSubTab === 'applications'
                    ? 'border-yellow-500 text-yellow-500'
                    : 'border-transparent text-zinc-500 hover:text-white'
                }`}
              >
                Candidate Registrations ({exams.length})
              </button>
              <button
                onClick={() => setExamsSubTab('schedules')}
                className={`py-3 px-1.5 text-xs font-heading font-black tracking-widest uppercase transition-all border-b-2 cursor-pointer ${
                  examsSubTab === 'schedules'
                    ? 'border-yellow-500 text-yellow-500'
                    : 'border-transparent text-zinc-500 hover:text-white'
                }`}
              >
                Exam Manager / Schedules ({examSchedules.length})
              </button>
            </div>

            {examsSubTab === 'applications' && (
              <div className="space-y-6">
                {/* Filter Bar */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900/40 border border-zinc-900 p-4.5 rounded-xl">
                  <div className="relative w-full md:max-w-sm">
                    <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-550 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Query Student LKCP Roll ID or Name..."
                      value={examSearch}
                      onChange={(e) => setExamSearch(e.target.value)}
                      className="w-full bg-slate-950 border border-zinc-855 py-2 pl-10 pr-4 rounded-lg text-xs font-medium text-white focus:outline-none focus:border-yellow-500 placeholder:text-zinc-650"
                    />
                  </div>

                  <div className="flex items-center space-x-3 w-full md:w-auto">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold shrink-0 font-mono">STATUS FILTER:</span>
                    <select
                      value={examStatusFilter}
                      onChange={(e: any) => setExamStatusFilter(e.target.value)}
                      className="bg-slate-950 border border-zinc-850 py-2 px-3 rounded-lg text-xs font-medium text-zinc-350 focus:outline-none w-full md:w-auto hover:border-zinc-800"
                    >
                      <option value="all">All Submissions</option>
                      <option value="pending">Review Pending</option>
                      <option value="approved">Slot Approved</option>
                      <option value="passed">Completed Passed</option>
                      <option value="failed">Requires Review</option>
                    </select>
                  </div>
                </div>

                {examsLoading && (
                  <ExamsTableSkeleton />
                )}

                {!examsLoading && (
                  <div className="bg-slate-905 border border-zinc-900 overflow-hidden rounded-xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left whitespace-nowrap">
                        <thead>
                          <tr className="bg-slate-950 text-zinc-450 text-[10px] uppercase font-bold tracking-wider font-mono border-b border-zinc-900">
                            <th className="py-4 px-6">Student details</th>
                            <th className="py-4 px-6">Dojo training Branch</th>
                            <th className="py-4 px-6">Current & Target Belt</th>
                            <th className="py-4 px-6">Registry state</th>
                            <th className="py-4 px-6">Score & Comments</th>
                            <th className="py-4 px-6 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900/40 text-xs">
                          {exams
                            .filter(item => {
                              const sQuery = examSearch.toLowerCase();
                              const matchQuery = item.studentId.toLowerCase().includes(sQuery) || item.studentName.toLowerCase().includes(sQuery);
                              const matchStatus = examStatusFilter === 'all' || item.status === examStatusFilter;
                              return matchQuery && matchStatus;
                            })
                            .map((item) => {
                              return (
                                <tr key={item.id} className="hover:bg-slate-900/15 transition-colors">
                                  <td className="py-4.5 px-6 text-left">
                                    <span className="font-heading font-black text-yellow-500 font-mono tracking-wider block">{item.studentId}</span>
                                    <span className="text-white font-extrabold uppercase mt-1 block">{item.studentName}</span>
                                    {item.parentPhone && <span className="text-zinc-500 text-[10px] mt-0.5 block">Phone: {item.parentPhone}</span>}
                                    {item.coachName && <span className="text-zinc-500 text-[10px] mt-0.5 block">Coach: {item.coachName}</span>}
                                  </td>
                                  <td className="py-4.5 px-6 text-zinc-400 font-medium text-left">
                                    {item.branch}
                                  </td>
                                  <td className="py-4.5 px-6 text-left font-mono">
                                    <span className="text-zinc-550 block">Current: {item.currentBelt.split(' (')[0]}</span>
                                    <span className="text-emerald-400 font-semibold block mt-1">Target: {item.targetBelt.split(' (')[0]}</span>
                                  </td>
                                  <td className="py-4.5 px-6 text-left">
                                    <div className="space-y-1.5">
                                      {item.status === 'pending' && (
                                        <span className="inline-block bg-yellow-500/10 text-yellow-550 border border-yellow-500/20 text-[9px] font-heading font-black px-2 py-0.5 rounded uppercase tracking-wider">
                                          Pending Approval
                                        </span>
                                      )}
                                      {item.status === 'approved' && (
                                        <span className="inline-block bg-blue-500/10 text-blue-550 border border-blue-500/20 text-[9px] font-heading font-black px-2 py-0.5 rounded uppercase tracking-wider">
                                          Slot Approved
                                        </span>
                                      )}
                                      {item.status === 'passed' && (
                                        <span className="inline-block bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 text-[9px] font-heading font-black px-2 py-0.5 rounded uppercase tracking-wider">
                                          Completed Passed
                                        </span>
                                      )}
                                      {item.status === 'failed' && (
                                        <span className="inline-block bg-red-500/10 text-red-450 border border-red-500/25 text-[9px] font-heading font-black px-2 py-0.5 rounded uppercase tracking-wider">
                                          Requires Review
                                        </span>
                                      )}

                                      <div className="block mt-1">
                                        <span className={`inline-block text-[9px] font-heading font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                                          item.feesStatus === 'Paid'
                                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                        }`}>
                                          Fees: {item.feesStatus || 'Pending'}
                                        </span>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-4.5 px-6 text-left">
                                    {item.grade ? (
                                      <div>
                                        <span className="text-white font-bold block">Grade: {item.grade}</span>
                                        {item.remarks && <span className="text-zinc-500 text-[10px] block truncate max-w-xs mt-0.5" title={item.remarks}>{item.remarks}</span>}
                                      </div>
                                    ) : (
                                      <span className="text-zinc-650 italic">Not graded yet</span>
                                    )}
                                  </td>
                                  <td className="py-4.5 px-6 text-right">
                                    <div className="flex items-center justify-end space-x-2">
                                      {item.status === 'pending' && (
                                        <button
                                          onClick={() => handleApproveExamSlot(item.id)}
                                          className="bg-blue-600 hover:bg-blue-550 text-white text-[9px] font-heading font-black uppercase tracking-wider px-2.5 py-1.5 rounded transition-all cursor-pointer"
                                          title="Confirm exam slot or fee payment"
                                        >
                                          Approve slot
                                        </button>
                                      )}

                                      {/* Toggle for Fees Status in Admin for easy management */}
                                      <button
                                        onClick={async () => {
                                          try {
                                            const newFees = item.feesStatus === 'Paid' ? 'Pending' : 'Paid';
                                            await updateDoc(doc(db, 'exams', item.id), {
                                              feesStatus: newFees,
                                              updatedAt: Date.now()
                                            });
                                          } catch (err) {
                                            console.error("Failed to toggle fees status:", err);
                                          }
                                        }}
                                        className="bg-zinc-900 border border-zinc-800 hover:border-yellow-500/20 text-zinc-400 hover:text-yellow-500 text-[9px] font-heading font-black uppercase tracking-wider px-2.5 py-1.5 rounded transition-all cursor-pointer"
                                        title="Toggle fee status"
                                      >
                                        Toggle Fee
                                      </button>
                                      
                                      {item.status === 'approved' && (
                                        <div className="flex items-center space-x-1.5">
                                          <button
                                            onClick={() => setGradingExam({ ...item, statusAction: 'passed' })}
                                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-heading font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
                                            title="Assessed and passed"
                                          >
                                            Pass
                                          </button>
                                          <button
                                            onClick={() => setGradingExam({ ...item, statusAction: 'failed' })}
                                            className="bg-red-650 hover:bg-red-600 text-white text-[10px] font-heading font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
                                            title="Assessed and failed"
                                          >
                                            Fail
                                          </button>
                                        </div>
                                      )}
                                      
                                      <button
                                        onClick={() => handleDeleteExamRecord(item.id)}
                                        className="p-1 px-2 border border-zinc-800 text-zinc-500 hover:text-red-500 hover:bg-red-500/5 rounded transition-all cursor-pointer"
                                        title="Erase Entry"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          {exams.length === 0 && (
                            <tr>
                              <td colSpan={6} className="py-20 text-center text-zinc-600">
                                No belt examinations registered on this branch yet.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {examsSubTab === 'schedules' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-slate-900/40 border border-zinc-900 p-5 rounded-xl">
                  <div>
                    <h3 className="font-heading font-black text-sm uppercase text-white tracking-wider">Exam schedules list</h3>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Manage upcoming examinations, belt targets, venue locations, and entry criteria.</p>
                  </div>
                  <button
                    onClick={openCreateScheduleModal}
                    className="bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-heading font-black text-[10px] uppercase tracking-widest px-4 py-2.5 rounded-lg transition-all flex items-center space-x-1.5 shadow-md hover:shadow-yellow-500/20 active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-slate-950 stroke-[3px]" />
                    <span>Create Exam Schedule</span>
                  </button>
                </div>

                {schedulesLoading && (
                  <SchedulesGridSkeleton />
                )}

                {!schedulesLoading && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {examSchedules.map((sched) => (
                      <div key={sched.id} className="bg-slate-905 border border-zinc-900 p-5 rounded-2xl relative shadow-lg flex flex-col justify-between hover:border-zinc-800 transition-all duration-200">
                        <div className="absolute top-4 right-4 flex items-center space-x-1.5">
                          <button
                            onClick={() => openEditScheduleModal(sched)}
                            className="p-1.5 bg-zinc-900 border border-zinc-800 hover:border-yellow-500/20 text-zinc-400 hover:text-yellow-500 rounded transition-all cursor-pointer"
                            title="Edit Exam"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSchedule(sched.id)}
                            className="p-1.5 bg-zinc-900 border border-zinc-800 hover:border-red-500/20 text-zinc-400 hover:text-red-500 rounded transition-all cursor-pointer"
                            title="Delete Exam"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-1">
                            <span className="text-[10px] font-heading font-black text-yellow-500 bg-yellow-500/10 px-2.5 py-0.5 rounded border border-yellow-500/15 uppercase tracking-wider inline-block">
                              {sched.beltLevel.includes('All Belt Levels') ? sched.beltLevel : `Target: ${sched.beltLevel}`}
                            </span>
                            <h4 className="font-title text-base font-black text-white uppercase tracking-tight pt-1 flex items-center gap-2">
                              <Calendar className="w-4.5 h-4.5 text-zinc-500" />
                              {sched.examDate}
                            </h4>
                          </div>

                          <div className="space-y-2.5 text-xs text-zinc-450 border-t border-zinc-900/60 pt-3">
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-zinc-550 shrink-0 mt-0.5" />
                              <div>
                                <span className="text-[10px] uppercase font-bold text-zinc-500 block">Venue / location details</span>
                                <span className="font-mono text-zinc-300">{sched.venueDetails}</span>
                              </div>
                            </div>

                            <div className="flex items-start gap-2">
                              <FileText className="w-4 h-4 text-zinc-550 shrink-0 mt-0.5" />
                              <div>
                                <span className="text-[10px] uppercase font-bold text-zinc-500 block">Required prerequisites</span>
                                <span className="text-zinc-350 whitespace-pre-line leading-relaxed">{sched.prerequisites}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 pt-3 border-t border-zinc-900/60 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                          <span>Updated: {new Date(sched.updatedAt).toLocaleDateString()}</span>
                          <span className="text-emerald-500 font-bold bg-emerald-500/5 px-2.5 py-0.5 rounded border border-emerald-500/10 uppercase tracking-widest">Active Schedule</span>
                        </div>
                      </div>
                    ))}

                    {examSchedules.length === 0 && (
                      <div className="col-span-1 md:col-span-2 py-16 text-center text-zinc-650 bg-slate-900/10 border border-zinc-900 rounded-xl">
                        No upcoming exams scheduled yet. Click "Create Exam Schedule" to add entry.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* NESTED SCHEDULER DIALOG MODAL */}
            {schedModalOpen && (
              <div className="fixed inset-0 z-55 overflow-y-auto bg-black/85 backdrop-blur-sm flex justify-center p-4 items-center">
                <div className="bg-slate-900 border border-zinc-800 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl relative">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-yellow-500" />
                  
                  {/* Header */}
                  <div className="px-6 py-4 border-b border-zinc-850 flex items-center justify-between">
                    <span className="font-heading font-black text-xs uppercase tracking-widest text-white">
                      {editingSched ? 'Modify Exam Schedule' : 'Create Exam Schedule'}
                    </span>
                    <button
                      onClick={() => setSchedModalOpen(false)}
                      className="p-1 text-zinc-500 hover:text-white transition-all cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSaveScheduleSubmit} className="p-6 space-y-4">
                    {schedError && (
                      <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded text-xs font-medium">
                        {schedError}
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono text-zinc-400 font-extrabold uppercase tracking-widest">
                        Exam Date & Time
                      </label>
                      <input
                        type="text"
                        value={schedDate}
                        placeholder="e.g. Sunday, Oct 18, 2026 - 10:00 AM"
                        onChange={(e) => setSchedDate(e.target.value)}
                        className="w-full bg-slate-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-yellow-500 transition-all font-medium placeholder:text-zinc-650"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono text-zinc-400 font-extrabold uppercase tracking-widest">
                        Target Belt Level
                      </label>
                      <select
                        value={schedBelt}
                        onChange={(e) => setSchedBelt(e.target.value)}
                        className="w-full bg-slate-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-yellow-500"
                        required
                      >
                        <option value="">-- Choose Belt Level --</option>
                        <option value="All Belt Levels (Open Exam)">All Belt Levels (Open Exam)</option>
                        {BELT_LEVELS.map((belt) => (
                          <option key={belt.name} value={belt.name}>{belt.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono text-zinc-400 font-extrabold uppercase tracking-widest">
                        Venue / Location Details
                      </label>
                      <input
                        type="text"
                        value={schedVenue}
                        placeholder="e.g. Lions Head Dojo, Shahu Stadium Road, Kohinoor Center"
                        onChange={(e) => setSchedVenue(e.target.value)}
                        className="w-full bg-slate-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-yellow-500 transition-all font-medium placeholder:text-zinc-650"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono text-zinc-400 font-extrabold uppercase tracking-widest">
                        Rules & Prerequisites
                      </label>
                      <textarea
                        value={schedPrereq}
                        placeholder="e.g. Minimum 3 Months as Orange Belt, 80% Attendance, Shivan Recommendation"
                        rows={3}
                        onChange={(e) => setSchedPrereq(e.target.value)}
                        className="w-full bg-slate-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-yellow-500 transition-all font-medium placeholder:text-zinc-650 min-h-[80px]"
                        required
                      />
                    </div>

                    <div className="pt-4 border-t border-zinc-850 flex items-center justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => setSchedModalOpen(false)}
                        className="px-4 py-2 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg text-xs font-bold uppercase tracking-widest cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={schedSaving}
                        className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-heading font-black rounded-lg text-xs uppercase tracking-widest flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        {schedSaving ? (
                          <>
                            <RefreshCw className="w-3 animate-spin text-slate-950" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <span>Publish Schedule</span>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {adminTab === 'seo_ai' && (
          <div className="animate-fade-in py-2">
            <SEOVisibilityConsole />
          </div>
        )}

      </div>

      {/* MODAL 1: Complete Admission File Profile Drawer */}
      {selectedAdmission && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-sm flex justify-center p-4 items-start sm:items-center">
          <div className="bg-slate-900 border border-zinc-850 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl relative my-6 sm:my-12">
            <div className="absolute top-0 left-0 right-0 h-1 bg-yellow-500" />
            
            {/* Header */}
            <div className="px-6 py-5 border-b border-zinc-850 flex items-center justify-between">
              <div className="flex items-center space-x-3 uppercase">
                <ShieldCheck className="w-5 h-5 text-yellow-500" />
                <h3 className="font-title text-base font-bold text-white tracking-wider">Student Registry File</h3>
              </div>
              <button 
                type="button"
                onClick={() => setSelectedAdmission(null)}
                className="bg-[#FF3B3F] hover:bg-rose-600 text-white font-heading font-black text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all duration-150 flex items-center gap-1 shadow-md active:scale-95 cursor-pointer"
                aria-label="Close"
              >
                <X className="w-3.5 h-3.5 text-white stroke-[3px]" />
                <span className="hidden xs:inline">CLOSE</span>
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                {/* Profile Photo */}
                <div className="w-24 h-24 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950 shrink-0 mx-auto sm:mx-0">
                  <img src={selectedAdmission.photoUrl} alt="Student" className="w-full h-full object-cover object-top" />
                </div>
                {/* Visual Metadata banner */}
                <div className="text-center sm:text-left space-y-1.5 flex-grow">
                  <h4 className="font-title text-lg font-bold text-white uppercase tracking-wider">{selectedAdmission.fullName}</h4>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-zinc-500 font-mono">
                    <span>ID: {selectedAdmission.studentId}</span>
                    <span>•</span>
                    <span>Age: {selectedAdmission.age} yrs</span>
                    <span>•</span>
                    <span>Gender: {selectedAdmission.gender}</span>
                  </div>
                  <div className="pt-1.5 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="text-[10px] uppercase font-bold text-yellow-500 bg-yellow-500/10 px-2.5 py-0.5 rounded border border-yellow-500/10 whitespace-nowrap">
                      {selectedAdmission.beltLevel.split(' ')[0]} Belt
                    </span>
                    <span className="text-[10px] uppercase font-bold text-zinc-400 bg-zinc-900 px-2.5 py-0.5 rounded whitespace-nowrap">
                      Batch: {selectedAdmission.batch}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-sky-400 bg-sky-500/5 border border-sky-500/15 px-2.5 py-0.5 rounded whitespace-nowrap">
                      Branch: {selectedAdmission.branch || 'Manaji Nagar Branch'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Comprehensive parameters list grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-b border-zinc-850/60 py-5 text-xs">
                <div className="space-y-3">
                  <div>
                    <span className="text-zinc-550 uppercase tracking-widest text-[9px] block">DOB / Age</span>
                    <span className="text-zinc-300 font-medium mt-0.5 block">{selectedAdmission.dob} / {selectedAdmission.age} yrs</span>
                  </div>
                  <div>
                    <span className="text-zinc-550 uppercase tracking-widest text-[9px] block">Guardian Name</span>
                    <span className="text-zinc-300 font-medium mt-0.5 block">{selectedAdmission.parentName || 'Self / Legal Guardian'}</span>
                  </div>
                  <div>
                    <span className="text-zinc-550 uppercase tracking-widest text-[9px] block">Physical Address</span>
                    <span className="text-zinc-300 font-medium mt-0.5 block leading-relaxed">{selectedAdmission.address}</span>
                  </div>
                  <div className="pt-1.5 border-t border-zinc-850/30">
                    <span className="text-zinc-550 uppercase tracking-widest text-[9px] block">Training Branch</span>
                    <span className="text-yellow-500 font-bold mt-0.5 block">{selectedAdmission.branch || 'Manaji Nagar Branch'}</span>
                  </div>
                  <div>
                    <span className="text-zinc-550 uppercase tracking-widest text-[9px] block">Designated Coach</span>
                    <span className="text-zinc-400 font-medium mt-0.5 block leading-tight">{selectedAdmission.coachName || 'Maruti Jadhav Sir 2nd dan Black Belt'}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-zinc-550 uppercase tracking-widest text-[9px] block">Active Primary Phone</span>
                    <a href={`tel:${selectedAdmission.phone}`} className="text-yellow-500 hover:underline mt-0.5 flex items-center space-x-1.5">
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      <span>{selectedAdmission.phone}</span>
                    </a>
                  </div>
                  <div>
                    <span className="text-zinc-550 uppercase tracking-widest text-[9px] block">WhatsApp Contact</span>
                    <a href={`https://wa.me/${selectedAdmission.whatsApp}`} target="_blank" rel="noreferrer" className="text-yellow-500 hover:underline mt-0.5 flex items-center space-x-1.5">
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      <span>{selectedAdmission.whatsApp}</span>
                    </a>
                  </div>
                  <div>
                    <span className="text-zinc-550 uppercase tracking-widest text-[9px] block">Email Identifier</span>
                    <a href={`mailto:${selectedAdmission.email}`} className="text-zinc-300 hover:text-white mt-0.5 flex items-center space-x-1.5">
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span>{selectedAdmission.email}</span>
                    </a>
                  </div>
                  <div className="pt-1.5 border-t border-zinc-850/30">
                    <span className="text-zinc-550 uppercase tracking-widest text-[9px] block">Registration Induction Fees</span>
                    <div className="flex items-center space-x-2.5 mt-1.5">
                      <span className={`inline-flex items-center space-x-1.5 uppercase font-heading font-black text-[9px] tracking-widest px-2.5 py-0.5 rounded border ${
                        (selectedAdmission.feesStatus || 'Unpaid') === 'Paid'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-red-500/10 border-red-500/30 text-red-400'
                      }`}>
                        <span className={`w-1 h-1 rounded-full ${
                          (selectedAdmission.feesStatus || 'Unpaid') === 'Paid' ? 'bg-emerald-400' : 'bg-red-400'
                        }`} />
                        <span>{selectedAdmission.feesStatus || 'Unpaid'}</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          const currentFees = selectedAdmission.feesStatus || 'Unpaid';
                          const nextFees = currentFees === 'Paid' ? 'Unpaid' : 'Paid';
                          updateFeesStatus(selectedAdmission.id, nextFees);
                        }}
                        className="text-[10px] bg-zinc-805 hover:bg-zinc-800 hover:text-white text-zinc-350 px-2 py-0.5 rounded border border-zinc-800 transition-colors uppercase font-heading font-semibold cursor-pointer"
                      >
                        Toggle Fees
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions approval panel */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-2.5">
                  <span className="text-[10px] text-zinc-500 font-mono">Current review status:</span>
                  <span className={`uppercase text-[10px] font-bold px-2.5 py-0.5 rounded border border-yellow-500/10 ${
                    selectedAdmission.status === 'approved' ? 'bg-emerald-500/5 text-emerald-500' : selectedAdmission.status === 'rejected' ? 'bg-red-500/5 text-red-500' : 'bg-yellow-500/5 text-yellow-500'
                  }`}>{selectedAdmission.status}</span>
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  {selectedAdmission.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateAdmissionStatus(selectedAdmission.id, 'rejected')}
                        className="w-full sm:w-auto text-center font-heading font-black text-[10px] uppercase tracking-wider bg-transparent hover:bg-red-950/20 border border-red-500/30 hover:border-red-500 text-red-500 px-5 py-2.5 rounded transition-all cursor-pointer"
                      >
                        REJECT REGISTER
                      </button>
                      <button
                        onClick={() => updateAdmissionStatus(selectedAdmission.id, 'approved')}
                        className="w-full sm:w-auto text-center font-heading font-black text-[10px] uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-2.5 rounded transition-all shadow shadow-emerald-500/10 cursor-pointer"
                      >
                        APPROVE DOJO ENTRY
                      </button>
                    </>
                  )}

                  {selectedAdmission.status === 'approved' && (
                    <button
                      onClick={() => updateAdmissionStatus(selectedAdmission.id, 'rejected')}
                      className="w-full sm:w-auto text-center font-heading font-black text-[10px] uppercase tracking-wider border border-zinc-800 hover:bg-zinc-850 hover:text-zinc-200 text-zinc-400 px-5 py-2.5 rounded transition-all cursor-pointer"
                    >
                      REVOKE APPROVAL
                    </button>
                  )}

                  {selectedAdmission.status === 'rejected' && (
                    <button
                      onClick={() => updateAdmissionStatus(selectedAdmission.id, 'approved')}
                      className="w-full sm:w-auto text-center font-heading font-black text-[10px] uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-2.5 rounded transition-all cursor-pointer"
                    >
                      RE-APPROVE
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ID Card generation popup panel */}
      {viewingIDCard && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-zinc-850 rounded-2xl overflow-hidden p-6 relative my-8">
            
            {/* Nav */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-850/60 uppercase">
              <span className="font-heading font-bold text-sm text-zinc-100 uppercase tracking-widest block">Issue Pass Terminal</span>
              <button 
                type="button"
                onClick={() => setViewingIDCard(null)}
                className="bg-[#FF3B3F] hover:bg-rose-600 text-white font-heading font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-lg transition-all duration-150 flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
              >
                <X className="w-3.5 h-3.5 text-white stroke-[3px]" />
                <span>CLOSE</span>
              </button>
            </div>

            {/* Passes */}
            <IDCard admission={viewingIDCard} showSuccessBanner={false} />

            {/* Bottom close helper to guarantee ease of use */}
            <div className="mt-8 pt-4 border-t border-zinc-850/60 flex justify-center">
              <button
                type="button"
                onClick={() => setViewingIDCard(null)}
                className="w-full sm:w-auto px-6 py-3 border border-zinc-850 hover:border-zinc-700 bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded-lg text-[10px] font-heading font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4 stroke-[2.5px]" />
                <span>Close Terminal & Return</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 3: Batch Timing Creator & Editor Dialog */}
      {batchModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-zinc-855 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-yellow-500" />
            
            {/* Header */}
            <div className="px-6 py-5 border-b border-zinc-850 flex items-center justify-between">
              <span className="font-heading font-black text-xs uppercase tracking-widest text-zinc-100 flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-yellow-500" />
                <span>{editingBatch ? 'Edit Dojo Timing Program' : 'Initiate Dojo Training Batch'}</span>
              </span>
              <button 
                type="button"
                onClick={() => setBatchModalOpen(false)}
                className="text-zinc-550 hover:text-white text-xs font-heading font-black cursor-pointer uppercase"
              >
                Cancel
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveBatch} className="p-6 space-y-4">
              {batchFormError && (
                <div className="bg-red-950/40 border border-red-500/20 text-red-400 p-3.5 rounded-lg flex items-start space-x-2 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{batchFormError}</span>
                </div>
              )}

              {/* Batch Name */}
              <div>
                <label className="text-zinc-400 uppercase tracking-widest text-[9px] block font-bold mb-1.5">Cohort Program Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Little Tigers, Elite Dojo, Young Warriors"
                  value={bName}
                  onChange={(e) => setBName(e.target.value)}
                  className="w-full bg-slate-950 border border-zinc-850 text-zinc-200 pl-3.5 pr-4 py-2.5 rounded-lg text-xs font-medium focus:outline-none focus:border-yellow-500 transition-all placeholder:text-zinc-650"
                />
              </div>

              {/* Age Level Target */}
              <div>
                <label className="text-zinc-400 uppercase tracking-widest text-[9px] block font-bold mb-1.5">Age Group Classification</label>
                <input
                  type="text"
                  placeholder="e.g. Kids (Ages 4-7), Adults (Ages 15+)"
                  value={bAgeGroup}
                  onChange={(e) => setBAgeGroup(e.target.value)}
                  className="w-full bg-slate-950 border border-zinc-850 text-zinc-200 pl-3.5 pr-4 py-2.5 rounded-lg text-xs font-medium focus:outline-none focus:border-yellow-500 transition-all placeholder:text-zinc-650"
                />
              </div>

              {/* Schedule Days */}
              <div>
                <label className="text-zinc-400 uppercase tracking-widest text-[9px] block font-bold mb-1.5">Days of Training Week *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mon, Wed, Fri or Tuesday & Thursday"
                  value={bDays}
                  onChange={(e) => setBDays(e.target.value)}
                  className="w-full bg-slate-950 border border-zinc-850 text-zinc-200 pl-3.5 pr-4 py-2.5 rounded-lg text-xs font-medium focus:outline-none focus:border-yellow-500 transition-all placeholder:text-zinc-650"
                />
              </div>

              {/* Timing */}
              <div>
                <label className="text-zinc-400 uppercase tracking-widest text-[9px] block font-bold mb-1.5">Class Time Range *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 05:00 PM - 06:00 PM"
                  value={bTiming}
                  onChange={(e) => setBTiming(e.target.value)}
                  className="w-full bg-slate-950 border border-zinc-850 text-zinc-200 pl-3.5 pr-4 py-2.5 rounded-lg text-xs font-medium focus:outline-none focus:border-yellow-500 transition-all placeholder:text-zinc-650"
                />
              </div>

              {/* Coaches Assigned */}
              <div>
                <label className="text-zinc-400 uppercase tracking-widest text-[9px] block font-bold mb-1.5">Assigned Shihan / Sensei Instructors</label>
                <input
                  type="text"
                  placeholder="e.g. Sensei Maruti Jadhav, Sensei Shivraj Jejure"
                  value={bCoaches}
                  onChange={(e) => setBCoaches(e.target.value)}
                  className="w-full bg-slate-950 border border-zinc-850 text-zinc-200 pl-3.5 pr-4 py-2.5 rounded-lg text-xs font-medium focus:outline-none focus:border-yellow-500 transition-all placeholder:text-zinc-650"
                />
              </div>

              {/* Syllabus Focus */}
              <div>
                <label className="text-zinc-400 uppercase tracking-widest text-[9px] block font-bold mb-1.5">Syllabus Curriculum Focus</label>
                <input
                  type="text"
                  placeholder="e.g. Traditional Katas, Kumite and basic self defence drill block"
                  value={bFocus}
                  onChange={(e) => setBFocus(e.target.value)}
                  className="w-full bg-slate-950 border border-zinc-850 text-zinc-200 pl-3.5 pr-4 py-2.5 rounded-lg text-xs font-medium focus:outline-none focus:border-yellow-500 transition-all placeholder:text-zinc-650"
                />
              </div>

              {/* Price / Monthly tuition Fee */}
              <div>
                <label className="text-zinc-400 uppercase tracking-widest text-[9px] block font-bold mb-1.5">Investment / Tuition Fee</label>
                <input
                  type="text"
                  placeholder="e.g. $85/month"
                  value={bPrice}
                  onChange={(e) => setBPrice(e.target.value)}
                  className="w-full bg-slate-950 border border-zinc-850 text-zinc-200 pl-3.5 pr-4 py-2.5 rounded-lg text-xs font-medium focus:outline-none focus:border-yellow-500 transition-all placeholder:text-zinc-650"
                />
              </div>

              {/* Bottom buttons */}
              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setBatchModalOpen(false)}
                  className="font-heading font-black text-[10px] uppercase tracking-wider hover:bg-zinc-850 border border-zinc-800 text-zinc-400 px-5 py-3 rounded-lg transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={batchFormSaving}
                  className="font-heading font-black text-[10px] uppercase tracking-wider bg-yellow-500 hover:bg-yellow-400 text-slate-950 px-5 py-3 rounded-lg transition-all flex items-center space-x-1.5 shadow cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{batchFormSaving ? 'Saving...' : 'Commit cohort'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Dynamic Enrolled Student Roster Modal */}
      {viewingEnrolledBatch && (() => {
        const enrolledStudents = admissions.filter(
          (a) => a.batch.toLowerCase().trim() === viewingEnrolledBatch.name.toLowerCase().trim()
        );

        return (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-zinc-850 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl relative">
              <div className="absolute top-0 left-0 right-0 h-1 bg-yellow-500" />
              
              {/* Header */}
              <div className="px-6 py-5 border-b border-zinc-850 flex items-center justify-between">
                <div className="flex items-center space-x-3 uppercase">
                  <Users className="w-5 h-5 text-yellow-500" />
                  <div>
                    <h3 className="font-title text-base font-bold text-white tracking-wider">Cohort Enrollment Roster</h3>
                    <span className="text-[9px] font-mono text-zinc-505 uppercase font-black block mt-0.5">{viewingEnrolledBatch.name}</span>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setViewingEnrolledBatch(null)}
                  className="text-zinc-505 hover:text-white text-xs font-heading font-black cursor-pointer uppercase"
                >
                  Dismiss
                </button>
              </div>

              {/* Roster list */}
              <div className="p-6">
                {enrolledStudents.length === 0 ? (
                  <div className="py-12 text-center text-zinc-650 font-light text-xs">
                    No students currently registered under this timing cohort.
                  </div>
                ) : (
                  <div className="max-h-[380px] overflow-y-auto divide-y divide-zinc-900/50 pr-2">
                    {enrolledStudents.map((st) => (
                      <div key={st.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                        <div className="flex items-center space-x-3.5">
                          <div className="w-9 h-9 rounded-md overflow-hidden bg-neutral-900 border border-zinc-800 shrink-0">
                            <img src={st.photoUrl} alt={st.fullName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                          <div>
                            <span className="font-bold text-zinc-150 block">{st.fullName}</span>
                            <span className="text-[10px] text-zinc-500 font-mono">ID: {st.studentId || 'LKCP-NEW'}</span>
                          </div>
                        </div>

                        {/* Middle belt */}
                        <div className="hidden sm:block">
                          <span className="font-mono text-[10px] font-bold text-yellow-500 uppercase bg-yellow-500/5 px-2 py-0.5 rounded border border-yellow-550/10">
                            {st.beltLevel}
                          </span>
                        </div>

                        {/* Quick reviews actions */}
                        <div className="flex items-center space-x-1.5 flex-row">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedAdmission(st);
                              setViewingEnrolledBatch(null);
                            }}
                            className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 hover:text-white text-zinc-400 cursor-pointer"
                            title="Inspect Student's file"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setViewingIDCard(st);
                              setViewingEnrolledBatch(null);
                            }}
                            className="p-1.5 rounded bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 hover:text-slate-950 duration-200 cursor-pointer"
                            title="Review Dojo pass card"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-slate-950 border-t border-zinc-850 flex items-center justify-between text-[10px] font-mono">
                <span className="text-zinc-500 font-bold uppercase">MATCHING: {enrolledStudents.length} ENROLLED STUDENT FILES</span>
                <button
                  type="button"
                  onClick={() => setViewingEnrolledBatch(null)}
                  className="text-yellow-505 font-black hover:text-white cursor-pointer uppercase tracking-widest bg-yellow-500/10 px-3 py-1.5 rounded border border-yellow-500/20 hover:bg-yellow-500"
                >
                  Close Roster
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL 5: Manual Student Registry */}
      {enrollModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-zinc-850 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl relative col-span-1 border-0">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-yellow-500" />
            
            {/* Header */}
            <div className="px-6 py-5 border-b border-zinc-850 flex items-center justify-between">
              <span className="font-heading font-black text-xs uppercase tracking-widest text-zinc-100 flex items-center space-x-2">
                <Users className="w-4 h-4 text-yellow-500" />
                <span>Enroll Previous Student (Manual Registry)</span>
              </span>
              <button 
                type="button"
                onClick={() => setEnrollModalOpen(false)}
                className="text-zinc-550 hover:text-white text-xs font-heading font-black cursor-pointer uppercase"
              >
                Cancel
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveManualStudent} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar text-left grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {manualFormError && (
                <div className="md:col-span-2 bg-red-955/40 border border-red-500/20 text-red-400 p-3.5 rounded-lg flex items-start space-x-2 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{manualFormError}</span>
                </div>
              )}

              {/* Photo Upload Row (Col Span 2) */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-zinc-400 uppercase tracking-widest text-[9px] block font-bold">1. Student Photo Passport</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <div
                    onDragOver={handleMDragOver}
                    onDragLeave={() => setMDragOver(false)}
                    onDrop={handleMDrop}
                    onClick={() => document.getElementById('manual-photo-file-input')?.click()}
                    className={`md:col-span-2 h-[120px] border-2 border-dashed rounded-xl flex flex-col justify-center items-center px-4 text-center cursor-pointer transition-all ${
                      mDragOver ? 'border-yellow-500 bg-yellow-500/5' : 'border-zinc-800 bg-slate-950/20 hover:border-zinc-700'
                    }`}
                  >
                    <input 
                      id="manual-photo-file-input"
                      type="file"
                      onChange={handleMPhotoSelect}
                      accept="image/*"
                      className="hidden"
                    />
                    <Upload className="w-6 h-6 text-zinc-500 mb-1" />
                    <span className="text-zinc-400 text-xs font-heading font-medium">Drag & Drop photo here or <span className="text-yellow-500 font-semibold">Browse</span></span>
                    <span className="text-zinc-650 text-[9px] mt-0.5 block">Square badge sizing recommended</span>
                  </div>

                  <div className="flex flex-col items-center justify-center p-3 bg-slate-950/40 border border-zinc-900 rounded-xl h-[120px]">
                    {mPhotoUrl ? (
                      <div className="relative w-18 h-18 rounded-lg overflow-hidden border border-yellow-500/20">
                        <img src={mPhotoUrl} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setMPhotoUrl('')}
                          className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center text-red-500 text-[9px] uppercase font-bold tracking-wide transition-opacity"
                        >
                          Erase
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-zinc-700">
                        <Camera className="w-6 h-6 mb-1 text-zinc-600" />
                        <span className="text-[9px] uppercase font-bold tracking-wider">Preview Badge</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Student ID */}
              <div>
                <label className="text-zinc-400 uppercase tracking-widest text-[9px] block font-bold mb-1.5">LKCP Student Roll ID *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LKCP-2025-001"
                  value={mStudentId}
                  onChange={(e) => setMStudentId(e.target.value)}
                  className="w-full bg-slate-950 border border-zinc-850 text-zinc-205 px-3.5 py-2.5 rounded-lg text-xs font-mono uppercase tracking-widest focus:outline-none focus:border-yellow-500 transition-all placeholder:text-zinc-750"
                />
                <span className="text-[10px] text-zinc-600 mt-1 block">Editable sequence. Type exact previous ID if existing.</span>
              </div>

              {/* Full Name */}
              <div>
                <label className="text-zinc-400 uppercase tracking-widest text-[9px] block font-bold mb-1.5">Student Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Atharva Maruti Jadhav"
                  value={mFullName}
                  onChange={(e) => setMFullName(e.target.value)}
                  className="w-full bg-slate-950 border border-zinc-855 text-zinc-200 px-3.5 py-2.5 rounded-lg text-xs font-semibold focus:outline-none focus:border-yellow-500 transition-all placeholder:text-zinc-700"
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label className="text-zinc-400 uppercase tracking-widest text-[9px] block font-bold mb-1.5">Date of Birth</label>
                <input
                  type="date"
                  value={mDob}
                  onChange={(e) => setMDob(e.target.value)}
                  className="w-full bg-slate-950 border border-zinc-850 text-zinc-200 px-3.5 py-2.5 rounded-lg text-xs focus:outline-none focus:border-yellow-500 transition-all"
                />
              </div>

              {/* Age */}
              <div>
                <label className="text-zinc-400 uppercase tracking-widest text-[9px] block font-bold mb-1.5">Student Age *</label>
                <input
                  type="number"
                  required
                  min="3"
                  max="90"
                  placeholder="e.g. 10"
                  value={mAge}
                  onChange={(e) => setMAge(e.target.value ? Number(e.target.value) : '')}
                  className="w-full bg-slate-950 border border-zinc-850 text-zinc-200 px-3.5 py-2.5 rounded-lg text-xs focus:outline-none focus:border-yellow-500 transition-all"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="text-zinc-400 uppercase tracking-widest text-[9px] block font-bold mb-1.5">Gender *</label>
                <select
                  value={mGender}
                  onChange={(e: any) => setMGender(e.target.value)}
                  className="w-full bg-slate-950 border border-zinc-850 text-zinc-202 px-3.5 py-2.5 rounded-lg text-xs focus:outline-none focus:border-yellow-500 transition-all"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Joining Date */}
              <div>
                <label className="text-zinc-400 uppercase tracking-widest text-[9px] block font-bold mb-1.5">Admission Joining Date *</label>
                <input
                  type="date"
                  required
                  value={mJoiningDate}
                  onChange={(e) => setMJoiningDate(e.target.value)}
                  className="w-full bg-slate-950 border border-zinc-850 text-zinc-200 px-3.5 py-2.5 rounded-lg text-xs focus:outline-none focus:border-yellow-500 transition-all"
                />
                <span className="text-[10px] text-zinc-650 mt-1 block">Very important for backlogging previous students correctly!</span>
              </div>

              {/* Current Belt Level */}
              <div>
                <label className="text-zinc-400 uppercase tracking-widest text-[9px] block font-bold mb-1.5">Current Belt level *</label>
                <select
                  value={mBeltLevel}
                  onChange={(e) => setMBeltLevel(e.target.value)}
                  className="w-full bg-slate-950 border border-zinc-850 text-zinc-200 px-3.5 py-2.5 rounded-lg text-xs focus:outline-none focus:border-yellow-500 transition-all"
                >
                  {BELT_LEVELS.map(b => (
                    <option key={b.name} value={b.name}>{b.name}</option>
                  ))}
                </select>
              </div>

              {/* Dojo Branch */}
              <div>
                <label className="text-zinc-400 uppercase tracking-widest text-[9px] block font-bold mb-1.5">Dojo Branch Selection *</label>
                <select
                  value={mBranch}
                  onChange={(e) => setMBranch(e.target.value)}
                  className="w-full bg-slate-950 border border-zinc-850 text-zinc-200 px-3.5 py-2.5 rounded-lg text-xs focus:outline-none focus:border-yellow-500 transition-all"
                >
                  {DOJO_BRANCHES.map(b => (
                    <option key={b.id} value={b.name}>{b.name}</option>
                  ))}
                </select>
              </div>

              {/* Program Batch Cohort */}
              <div>
                <label className="text-zinc-400 uppercase tracking-widest text-[9px] block font-bold mb-1.5">Program Batch Cohort *</label>
                <select
                  value={mBatch}
                  onChange={(e) => setMBatch(e.target.value)}
                  className="w-full bg-slate-950 border border-zinc-850 text-zinc-200 px-3.5 py-2.5 rounded-lg text-xs focus:outline-none focus:border-yellow-500 transition-all"
                >
                  {batches.map(b => (
                    <option key={b.id} value={b.name}>{b.name} ({b.ageGroup})</option>
                  ))}
                  {batches.length === 0 && BATCH_TIMINGS.map(b => (
                    <option key={b.id} value={b.name}>{b.name} ({b.ageGroup})</option>
                  ))}
                </select>
              </div>

              {/* Fees Status */}
              <div>
                <label className="text-zinc-400 uppercase tracking-widest text-[9px] block font-bold mb-1.5">Annual / Admission Fee Status *</label>
                <select
                  value={mFeesStatus}
                  onChange={(e: any) => setMFeesStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-zinc-850 text-zinc-200 px-3.5 py-2.5 rounded-lg text-xs focus:outline-none focus:border-yellow-500 transition-all"
                >
                  <option value="Paid">Mark as PAID</option>
                  <option value="Unpaid">Mark as UNPAID</option>
                </select>
              </div>

              {/* Parent / Guardian Name */}
              <div>
                <label className="text-zinc-400 uppercase tracking-widest text-[9px] block font-bold mb-1.5">Parent / Guardian Name</label>
                <input
                  type="text"
                  placeholder="Parent Name"
                  value={mParentName}
                  onChange={(e) => setMParentName(e.target.value)}
                  className="w-full bg-slate-950 border border-zinc-850 text-zinc-200 px-3.5 py-2.5 rounded-lg text-xs focus:outline-none focus:border-yellow-500 transition-all placeholder:text-zinc-700"
                />
              </div>

              {/* Phone Line */}
              <div>
                <label className="text-zinc-400 uppercase tracking-widest text-[9px] block font-bold mb-1.5">Contact Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="Phone Line"
                  value={mPhone}
                  onChange={(e) => setMPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-zinc-850 text-zinc-200 px-3.5 py-2.5 rounded-lg text-xs focus:outline-none focus:border-yellow-500 transition-all placeholder:text-zinc-700"
                />
              </div>

              {/* WhatsApp Line */}
              <div>
                <label className="text-zinc-400 uppercase tracking-widest text-[9px] block font-bold mb-1.5">WhatsApp Contact (if different)</label>
                <input
                  type="tel"
                  placeholder="WhatsApp Line"
                  value={mWhatsApp}
                  onChange={(e) => setMWhatsApp(e.target.value)}
                  className="w-full bg-slate-950 border border-zinc-850 text-zinc-200 px-3.5 py-2.5 rounded-lg text-xs focus:outline-none focus:border-yellow-500 transition-all placeholder:text-zinc-700"
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-zinc-400 uppercase tracking-widest text-[9px] block font-bold mb-1.5">Student Email Address</label>
                <input
                  type="email"
                  placeholder="student@dojo.com"
                  value={mEmail}
                  onChange={(e) => setMEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-zinc-850 text-zinc-200 px-3.5 py-2.5 rounded-lg text-xs focus:outline-none focus:border-yellow-500 transition-all placeholder:text-zinc-755"
                />
              </div>

              {/* Physical Address (Col Span 2) */}
              <div className="md:col-span-2">
                <label className="text-zinc-400 uppercase tracking-widest text-[9px] block font-bold mb-1.5">Student Residential Address</label>
                <textarea
                  rows={2}
                  placeholder="Pune, Maharashtra"
                  value={mAddress}
                  onChange={(e) => setMAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-zinc-850 text-zinc-200 px-3.5 py-2.5 rounded-lg text-xs focus:outline-none focus:border-yellow-500 transition-all placeholder:text-zinc-750"
                />
              </div>

              {/* Form Actions Footer within scroll container */}
              <div className="md:col-span-2 pt-4 border-t border-zinc-850 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEnrollModalOpen(false)}
                  className="px-4 py-2.5 text-[10px] font-heading font-black uppercase tracking-wider text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={manualSaving}
                  className="bg-yellow-500 hover:bg-yellow-450 text-slate-950 px-6 py-2.5 text-[10px] font-heading font-black uppercase tracking-widest rounded-lg transition-all flex items-center space-x-2 shadow cursor-pointer text-slate-950 font-extrabold"
                >
                  {manualSaving ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  ) : (
                    <>
                      <Check className="w-4 h-4 text-slate-950" />
                      <span>Instate Approved Student</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: EXAM ASSESSMENT AND GRADING MODEL OVERLAY */}
      {gradingExam && (
        <div className="fixed inset-0 z-55 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-zinc-850 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative">
            <div className={`absolute top-0 left-0 right-0 h-1.5 ${gradingExam.statusAction === 'passed' ? 'bg-emerald-500' : 'bg-red-500'}`} />
            
            <form onSubmit={handleGradeExamSubmit} className="p-6 space-y-5">
              <div className="text-left">
                <h4 className="font-title text-base font-extrabold text-white uppercase tracking-wider">
                  Grade Examination Review
                </h4>
                <p className="text-[11px] text-zinc-450 mt-1 leading-normal">
                  Rate the physical performance of scholar <strong className="text-white select-all">{gradingExam.studentName}</strong> (LKCP ID: {gradingExam.studentId}) testing for their <span className="text-yellow-500 font-bold">{gradingExam.targetBelt.split(' (')[0]}</span> kyu standard.
                </p>
                {gradingExam.statusAction === 'passed' ? (
                  <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 text-[10px] font-mono p-2 py-1.5 rounded mt-3 text-center uppercase tracking-wider font-extrabold">
                    👉 On success, student will graduate to: {gradingExam.targetBelt.split(' (')[0]} Belt!
                  </div>
                ) : (
                  <div className="bg-red-500/10 text-red-400 border border-red-500/15 text-[10px] font-mono p-2 py-1.5 rounded mt-3 text-center uppercase tracking-wider font-extrabold">
                    ⚠️ Set exam result slot to: Requires Review / Restudy.
                  </div>
                )}
              </div>

              {gradingError && (
                <div className="bg-red-500/5 border border-red-500/15 p-3 rounded-lg text-red-400 text-xs text-left">
                  {gradingError}
                </div>
              )}

              <div className="space-y-4 text-left">
                <div>
                  <label className="text-zinc-400 text-[9px] uppercase tracking-wider font-bold mb-1.5 block">Kyu Performance Grade *</label>
                  <select
                    required
                    value={enteredGrade}
                    onChange={(e) => setEnteredGrade(e.target.value)}
                    className="w-full bg-slate-950 border border-zinc-800 text-zinc-305 text-xs px-3 py-2.5 rounded-lg focus:outline-none focus:border-yellow-500"
                  >
                    <option value="">Choose grade (e.g. A, B+, C)</option>
                    <option value="A+ (Outstanding Pass)">A+ (Outstanding Pass)</option>
                    <option value="A (Excellent Pass)">A (Excellent Pass)</option>
                    <option value="B+ (Very Good Pass)">B+ (Very Good Pass)</option>
                    <option value="B (Good Pass)">B (Good Pass)</option>
                    <option value="C (Pass with Review)">C (Pass with Review)</option>
                    <option value="Fail (Requires Re-try)">Fail (Requires Re-try)</option>
                  </select>
                </div>

                <div>
                  <label className="text-zinc-400 text-[9px] uppercase tracking-wider font-bold mb-1.5 block">Sensei Remarks & feedback comments *</label>
                  <textarea
                    required
                    rows={4}
                    value={enteredRemarks}
                    onChange={(e) => setEnteredRemarks(e.target.value)}
                    placeholder="e.g. Magnificent execution of Heian Shodan kata, crisp blocks but core needs minor focus..."
                    className="w-full bg-slate-950 border border-zinc-800 text-zinc-305 text-xs px-3 py-2.5 rounded-lg focus:outline-none focus:border-yellow-500 h-24 placeholder:text-zinc-700"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-850 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setGradingExam(null);
                    setEnteredGrade('');
                    setEnteredRemarks('');
                  }}
                  className="px-4 py-2 text-[10px] font-heading font-black uppercase tracking-wider text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={gradingSaving}
                  className="bg-yellow-500 hover:bg-yellow-455 text-slate-950 px-5 py-2.5 text-[10px] font-heading font-black uppercase tracking-wider rounded-lg transition-all flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer text-slate-950"
                >
                  {gradingSaving ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Confirm Assessment Grade</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOM CONFIRMATION DIALOG OVERLAY */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-55 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-zinc-850 w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl p-6 space-y-5 text-left relative">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h4 className="font-title text-base font-extrabold text-white uppercase tracking-wider">
                  {confirmDialog.title}
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed mt-1.5 font-sans">
                  {confirmDialog.message}
                </p>
              </div>
            </div>
            
            <div className="pt-3 border-t border-zinc-850 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 text-[10.5px] font-heading font-black uppercase tracking-wider text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                {confirmDialog.cancelText}
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await confirmDialog.onConfirm();
                  } catch (e) {
                    console.error("Action error during delete: ", e);
                  } finally {
                    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                  }
                }}
                className="bg-red-500 hover:bg-red-650 text-white px-5 py-2.5 text-[10.5px] font-heading font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer"
              >
                {confirmDialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
