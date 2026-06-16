import { useState, useEffect, useRef, DragEvent, ChangeEvent } from 'react';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { BELT_LEVELS, BATCH_TIMINGS, BatchInfo, DOJO_BRANCHES } from '../types';
import { Upload, Camera, FileText, CheckCircle2, ShieldAlert, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';

interface AdmissionFormProps {
  preselectedBatch?: string;
  onSuccess: (studentDocumentId: string) => void;
}

export default function AdmissionForm({ preselectedBatch = "", onSuccess }: AdmissionFormProps) {
  // Core form states
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | ''>('');
  const [parentName, setParentName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsApp, setWhatsApp] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [batches, setBatches] = useState<BatchInfo[]>(BATCH_TIMINGS);
  const [batch, setBatch] = useState(preselectedBatch || BATCH_TIMINGS[0].name);
  const [beltLevel, setBeltLevel] = useState(BELT_LEVELS[0].name);
  const [photoUrl, setPhotoUrl] = useState(''); // Base64 data-url representing the compressed image
  const [termsAccepted, setTermsAccepted] = useState(false);

  // New states for branch and fees tracking
  const [selectedBranchId, setSelectedBranchId] = useState(DOJO_BRANCHES[0].id);
  const [feesStatus, setFeesStatus] = useState<'Paid' | 'Unpaid'>('Unpaid');

  // Dynamically load batches from Firestore
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const snap = await getDocs(collection(db, 'batches'));
        if (!snap.empty) {
          const list: BatchInfo[] = [];
          snap.forEach((docSnap) => {
            list.push({
              id: docSnap.id,
              ...docSnap.data()
            } as BatchInfo);
          });
          setBatches(list);
          if (!preselectedBatch) {
            setBatch(list[0].name);
          }
        }
      } catch (err) {
        console.error("Failed to fetch batches in admission form:", err);
        handleFirestoreError(err, OperationType.GET, 'batches');
      }
    };
    fetchBatches();
  }, [preselectedBatch]);

  // UX states
  const [isDragOver, setIsDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMess, setErrorMess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hook to calculate age based on Date of Birth
  const handleDobChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDob(val);
    if (!val) {
      setAge('');
      return;
    }
    const birthDate = new Date(val);
    const today = new Date();
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }
    setAge(calculatedAge >= 0 ? calculatedAge : 0);
  };

  // Safe Image Compressor (Canvas Offscreen)
  const compressAndProcessImage = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMess('Please provide a valid image file (.png, .jpg, .webp).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Create an offscreen canvas
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 250;
        const MAX_HEIGHT = 250;
        let width = img.width;
        let height = img.height;

        // Force cropping or perfect bounding square to keep ID cards beautiful
        const size = Math.min(width, height);
        const offsetX = (width - size) / 2;
        const offsetY = (height - size) / 2;

        canvas.width = MAX_WIDTH;
        canvas.height = MAX_HEIGHT;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          // Draw standard centered square
          ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, MAX_WIDTH, MAX_HEIGHT);
          
          // Yield compressed JPEG representation
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          setPhotoUrl(compressedDataUrl);
          setErrorMess('');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Handle manual files input trigger
  const handlePhotoSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      compressAndProcessImage(files[0]);
    }
  };

  // Drag and drop events
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      compressAndProcessImage(files[0]);
    }
  };

  // Generate customized Year Sequence ID: LKCP-YYYY-XXX
  const generateStudentId = async (): Promise<string> => {
    const currentYear = new Date().getFullYear();
    try {
      // Query admissions from this year to calculate next serial
      const admissionsRef = collection(db, 'admissions');
      const q = query(admissionsRef, where('createdAt', '>=', new Date(`${currentYear}-01-01`).getTime()));
      const snap = await getDocs(q);
      
      const count = snap.size + 1;
      // Pad to 3 digits
      const paddedSerial = String(count).padStart(3, '0');
      return `LKCP-${currentYear}-${paddedSerial}`;
    } catch {
      // Simple random serial if connection fails or rule blocks read during submission
      const randomId = Math.floor(100+ Math.random() * 899);
      return `LKCP-${currentYear}-${randomId}`;
    }
  };

  // Form submit operations
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setErrorMess('');

    // Field Validations
    if (!fullName.trim()) return setErrorMess('Full name is required.');
    if (!dob) return setErrorMess('Date of birth is required.');
    if (!gender) return setErrorMess('Gender is required.');
    if (!phone.trim()) return setErrorMess('Contact phone is required.');
    if (!email.trim()) return setErrorMess('Email is required.');
    if (!address.trim()) return setErrorMess('Physical address is required.');
    if (!photoUrl) return setErrorMess('Student photo upload is required.');
    if (!termsAccepted) return setErrorMess('You must accept the terms and conditions.');

    setLoading(true);

    try {
      const studentId = await generateStudentId();
      const currentTimestamp = Date.now();

      const selectedBranch = DOJO_BRANCHES.find(b => b.id === selectedBranchId) || DOJO_BRANCHES[0];

      const admissionPayload = {
        fullName: fullName.trim(),
        dob,
        age: Number(age),
        gender,
        parentName: parentName.trim() || 'Self / Legal Guardian',
        phone: phone.trim(),
        whatsApp: whatsApp.trim() || phone.trim(),
        email: email.trim(),
        address: address.trim(),
        batch,
        beltLevel,
        photoUrl,
        studentId,
        status: 'pending',
        createdAt: currentTimestamp,
        updatedAt: currentTimestamp,
        branch: selectedBranch.name,
        coachName: selectedBranch.coach,
        feesStatus: feesStatus
      };

      // Add to firestore collection 'admissions'
      const docRef = await addDoc(collection(db, 'admissions'), admissionPayload);
      onSuccess(docRef.id);
    } catch (err: any) {
      console.error(err);
      setErrorMess('Submission failed. Please check internet connection or database setup.');
      handleFirestoreError(err, OperationType.CREATE, 'admissions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-slate-900/40 border border-zinc-900 rounded-2xl p-6 sm:p-10 shadow-2xl relative">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 via-amber-600 to-yellow-500 rounded-t-2xl" />

      {/* Form header */}
      <div className="flex items-center space-x-3 text-yellow-500 mb-6 border-b border-zinc-900/80 pb-6">
        <FileText className="w-8 h-8 shrink-0" />
        <div>
          <h3 className="font-title text-xl font-bold text-white uppercase tracking-wider">Online Dojo Admission Portal</h3>
          <p className="text-zinc-500 text-xs mt-0.5">Please submit authentic profile and health details to enroll in LIONS KARATE CLUB PUNE.</p>
        </div>
      </div>

      {/* Venue Information and Map Preview */}
      <div className="mb-8 bg-slate-950/60 border border-zinc-900 p-5 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="space-y-3">
          <div className="inline-flex items-center space-x-2 bg-yellow-500/10 text-yellow-500 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider font-mono">
            Official Training Venue
          </div>
          <h4 className="text-white font-title text-sm font-bold uppercase tracking-wide">VASUNDHARA PRE-PRIMARY SCHOOL</h4>
          <p className="text-zinc-400 text-xs leading-relaxed">
            Narhe Ambegaon Road, Near Bhumkar Chowk,<br />
            Beside Silver Birch Hospital, Narhe, Pune,<br />
            Maharashtra 411041, India
          </p>
          <div className="pt-1.5 text-zinc-500 text-[10px] font-mono">
            Contact Number: 9049688172
          </div>
        </div>

        <div className="h-[140px] rounded-lg overflow-hidden border border-zinc-900">
          <iframe 
            src="https://maps.google.com/maps?q=VASUNDHARA%20PRE-PRIMARY%20SCHOOL,%20Narhe%20Ambegaon%20Road,%20Near%20Bhumkar%20Chowk,%20Beside%20Silver%20Birch%20Hospital,%20Narhe,%20Pune&t=&z=15&ie=UTF8&iwloc=&output=embed"
            width="100%" 
            height="100%" 
            style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(85%) contrast(110%)' }}
            allowFullScreen={true} 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="LIONS KARATE CLUB PUNE Training Venue Map Preview"
          />
        </div>
      </div>

      {errorMess && (
        <div className="mb-6 bg-red-950/40 border border-red-500/20 text-red-400 p-4 rounded-lg flex items-start space-x-2.5 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMess}</span>
        </div>
      )}

      {/* Actual Form structure */}
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Step 1: Drag & Drop Photo parameter */}
        <div>
          <span className="font-heading font-bold text-zinc-300 uppercase text-xs tracking-wider block mb-3">1. Student Photo Passport (Instant ID Rendering)</span>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Visual drag-and-drop boundary */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`md:col-span-2 h-[160px] border-2 border-dashed rounded-xl flex flex-col justify-center items-center px-4 text-center cursor-pointer transition-all ${
                isDragOver ? 'border-yellow-500 bg-yellow-500/5' : 'border-zinc-800 bg-slate-950/20 hover:border-zinc-700'
              }`}
            >
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoSelect}
                accept="image/*"
                className="hidden"
              />
              <Upload className="w-8 h-8 text-zinc-500 group-hover:text-zinc-300 mb-2" />
              <span className="text-zinc-400 text-xs font-heading font-medium">Drag & Drop passport image here or <span className="text-yellow-500 font-semibold cursor-pointer">Browse</span></span>
              <span className="text-zinc-600 text-[10px] mt-1 block">Supports PNG, JPG, WEBP. Auto-cropped to square badge.</span>
            </div>

            {/* Photo preview segment */}
            <div className="flex flex-col items-center justify-center p-4 bg-slate-950/40 border border-zinc-900 rounded-xl h-[160px]">
              {photoUrl ? (
                <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-yellow-500/30">
                  <img src={photoUrl} alt="Passport preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotoUrl('')}
                    className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center text-red-500 text-[10px] uppercase font-bold tracking-wide transition-opacity"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center text-zinc-600">
                  <div className="bg-zinc-900 p-3 rounded-full mb-1">
                    <Camera className="w-5 h-5 text-zinc-500" />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider">Live Preview</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step 2: Student identity details */}
        <div>
          <span className="font-heading font-bold text-zinc-300 uppercase text-xs tracking-wider block mb-4">2. Core Student Credentials</span>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-zinc-500 text-[11px] uppercase tracking-wider block mb-1">Full Student Name *</label>
              <input 
                type="text" 
                placeholder="e.g. Kenji Bradley"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-950 border border-zinc-800 focus:border-yellow-500 text-zinc-100 text-xs px-4 py-3 rounded-lg focus:outline-none transition-all placeholder:text-zinc-650"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-zinc-500 text-[11px] uppercase tracking-wider block mb-1">Date of Birth *</label>
                <input 
                  type="date" 
                  required
                  value={dob}
                  onChange={handleDobChange}
                  className="w-full bg-slate-950 border border-zinc-800 focus:border-yellow-500 text-zinc-100 text-xs px-3 py-3 rounded-lg focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="text-zinc-500 text-[11px] uppercase tracking-wider block mb-1">Auto Calculated Age</label>
                <input 
                  type="text" 
                  disabled
                  value={age !== '' ? `${age} yrs` : 'Select DOB'}
                  className="w-full bg-slate-950/60 border border-zinc-90s text-zinc-500 text-xs px-3 py-3 rounded-lg font-mono focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-zinc-500 text-[11px] uppercase tracking-wider block mb-1">Gender *</label>
              <select
                required
                value={gender}
                onChange={(e: any) => setGender(e.target.value)}
                className="w-full bg-slate-950 border border-zinc-800 focus:border-yellow-500 text-zinc-150 text-xs px-4 py-3 rounded-lg focus:outline-none transition-all cursor-pointer"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="text-zinc-500 text-[11px] uppercase tracking-wider block mb-1">Parent or Legal Guardian Name (Leave blank if adult)</label>
              <input 
                type="text" 
                placeholder="e.g. Richard Bradley"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                className="w-full bg-slate-950 border border-zinc-800 focus:border-yellow-500 text-zinc-100 text-xs px-4 py-3 rounded-lg focus:outline-none transition-all placeholder:text-zinc-650"
              />
            </div>
          </div>
        </div>

        {/* Step 3: Contact details */}
        <div>
          <span className="font-heading font-bold text-zinc-300 uppercase text-xs tracking-wider block mb-4">3. Contact parameters</span>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-zinc-500 text-[11px] uppercase tracking-wider block mb-1">Student Phone *</label>
              <input 
                type="tel" 
                placeholder="e.g. 9049688172"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-zinc-800 focus:border-yellow-500 text-zinc-100 text-xs px-4 py-3 rounded-lg focus:outline-none transition-all placeholder:text-zinc-650"
              />
            </div>

            <div>
              <label className="text-zinc-500 text-[11px] uppercase tracking-wider block mb-1">WhatsApp number (If different)</label>
              <input 
                type="tel" 
                placeholder="e.g. 9049688172"
                value={whatsApp}
                onChange={(e) => setWhatsApp(e.target.value)}
                className="w-full bg-slate-950 border border-zinc-800 focus:border-yellow-500 text-zinc-100 text-xs px-4 py-3 rounded-lg focus:outline-none transition-all placeholder:text-zinc-650"
              />
            </div>

            <div>
              <label className="text-zinc-500 text-[11px] uppercase tracking-wider block mb-1">Active Email Address *</label>
              <input 
                type="email" 
                placeholder="kenji@yahoo.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-zinc-800 focus:border-yellow-500 text-zinc-100 text-xs px-4 py-3 rounded-lg focus:outline-none transition-all placeholder:text-zinc-650"
              />
            </div>

            <div className="md:col-span-3">
              <label className="text-zinc-500 text-[11px] uppercase tracking-wider block mb-1">Physical Address *</label>
              <input 
                type="text" 
                placeholder="e.g. Flat No, Society Name, Narhe, Pune, MH 411041"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-950 border border-zinc-800 focus:border-yellow-500 text-zinc-100 text-xs px-4 py-3 rounded-lg focus:outline-none transition-all placeholder:text-zinc-650"
              />
            </div>
          </div>
        </div>

        {/* Step 4: Program selection */}
        <div>
          <span className="font-heading font-bold text-zinc-300 uppercase text-xs tracking-wider block mb-4">4. Karate Branch, Batch, Belt & Fees parameters</span>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-zinc-500 text-[11px] uppercase tracking-wider block mb-1">Dojo Branch *</label>
              <select
                required
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="w-full bg-slate-950 border border-zinc-800 focus:border-yellow-500 text-zinc-150 text-xs px-4 py-3 rounded-lg focus:outline-none transition-all cursor-pointer"
              >
                {DOJO_BRANCHES.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
              <div className="mt-2 bg-slate-950/60 border border-zinc-900/50 px-3.5 py-2 rounded-lg flex flex-col space-y-1">
                <span className="text-zinc-500 text-[9px] uppercase tracking-wide font-mono">Assigned Instructor Coach:</span>
                <span className="text-yellow-500 font-sans text-xs font-bold leading-tight">
                  {DOJO_BRANCHES.find(b => b.id === selectedBranchId)?.coach}
                </span>
              </div>
            </div>

            <div>
              <label className="text-zinc-500 text-[11px] uppercase tracking-wider block mb-1">Class timing batch *</label>
              <select
                required
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                className="w-full bg-slate-950 border border-zinc-800 focus:border-yellow-500 text-zinc-150 text-xs px-4 py-3 rounded-lg focus:outline-none transition-all cursor-pointer"
              >
                {batches.map((b) => (
                  <option key={b.id} value={b.name}>{b.name} {b.ageGroup ? `(${b.ageGroup})` : ''}</option>
                ))}
              </select>
              <div className="mt-2 text-[10px] text-zinc-500 text-left font-sans italic">
                Schedules vary per cohort program.
              </div>
            </div>

            <div>
              <label className="text-zinc-500 text-[11px] uppercase tracking-wider block mb-1">Starting Belt Level *</label>
              <select
                required
                value={beltLevel}
                onChange={(e) => setBeltLevel(e.target.value)}
                className="w-full bg-slate-950 border border-zinc-800 focus:border-yellow-500 text-zinc-150 text-xs px-4 py-3 rounded-lg focus:outline-none transition-all cursor-pointer"
              >
                {BELT_LEVELS.map((bl) => (
                  <option key={bl.name} value={bl.name}>{bl.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-zinc-500 text-[11px] uppercase tracking-wider block mb-1">Dojo Induction Fees Status *</label>
              <select
                required
                value={feesStatus}
                onChange={(e: any) => setFeesStatus(e.target.value)}
                className="w-full bg-slate-950 border border-zinc-800 focus:border-yellow-500 text-zinc-150 text-xs px-4 py-3 rounded-lg focus:outline-none transition-all cursor-pointer"
              >
                <option value="Unpaid">Unpaid (Will settle during first lesson)</option>
                <option value="Paid">Paid (Induction fee already cleared)</option>
              </select>
              <div className="mt-2 text-[10px] text-zinc-500 text-left">
                Fees can also be toggled anytime from the registry panel by Shihan.
              </div>
            </div>
          </div>
        </div>

        {/* Step 5: Terms & Conditions */}
        <div>
          <span className="font-heading font-bold text-zinc-300 uppercase text-xs tracking-wider block mb-3">5. Parent/Guardian Declaration</span>
          <div className="bg-slate-950/60 border border-zinc-900 rounded-xl p-5 space-y-4">
            <div className="text-zinc-400 text-xs leading-relaxed max-h-48 overflow-y-auto pr-2 space-y-3 font-sans">
              <p className="font-semibold text-yellow-500 uppercase tracking-widest text-[10px]">LIONS KARATE CLUB PUNE — Parent/Guardian Declaration</p>
              <p>
                I hereby declare that the information provided in this form is true and accurate to the best of my knowledge.
              </p>
              <p>
                I voluntarily enroll myself/my child in the training programs conducted by LIONS KARATE CLUB PUNE and understand that martial arts training involves physical activity and inherent risks.
              </p>
              <p>
                I confirm that I/my child is medically fit to participate in training activities. Any medical condition, injury, or health concern has been disclosed to the club.
              </p>
              <p>
                I consent to the use of photographs, videos, and personal details for student identification, certificates, competitions, club records, website content, and promotional activities.
              </p>
              <p>
                I agree to abide by all rules, regulations, safety guidelines, and fee policies of LIONS KARATE CLUB PUNE.
              </p>
            </div>
            
            <div className="pt-3.5 border-t border-zinc-900/80 flex items-start space-x-3">
              <input 
                type="checkbox" 
                id="accept-dojo-terms"
                required
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 text-yellow-500 accent-yellow-500 cursor-pointer h-4 w-4 bg-slate-950 border-zinc-850 rounded"
              />
              <label htmlFor="accept-dojo-terms" className="text-zinc-300 text-xs leading-relaxed select-none cursor-pointer font-medium hover:text-white transition-colors">
                I have read and agree to all the Terms, Conditions and Declarations stated above.
              </label>
            </div>
          </div>
        </div>

        {/* Bottom CTA trigger */}
        <div className="pt-4 border-t border-zinc-950 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 font-heading font-extrabold text-xs uppercase tracking-widest bg-yellow-500 hover:bg-yellow-400 disabled:bg-zinc-850 text-slate-950 px-8 py-4 rounded shadow-xl hover:shadow-yellow-500/25 transition-all duration-300 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>PROCESSING SUBMISSION...</span>
              </>
            ) : (
              <>
                <span>SUBMIT SECURE ADMISSION</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
