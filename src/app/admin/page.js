"use client";
import { useEffect, useState, useRef } from "react";
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Search, 
  Filter, 
  DollarSign, 
  Heart, 
  Sparkles, 
  MessageSquare, 
  Music, 
  Play, 
  Pause, 
  Eye, 
  Copy, 
  Check, 
  ExternalLink, 
  Trash2, 
  RefreshCw, 
  Users, 
  Calendar, 
  Clock, 
  AlertCircle,
  TrendingUp,
  X,
  BookOpen,
  Flag,
  ShieldAlert,
  Ban,
  CheckCircle2,
  Sliders,
  Volume2,
  Mic,
  Activity,
  Coffee,
  Layers,
  ChevronDown,
  ChevronRight,
  Zap,
  ArrowRight,
  Radio
} from "lucide-react";
import Link from "next/link";
import { db, auth } from "../../lib/firebase";
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

// Allowed admin emails list
const DEFAULT_ADMIN_EMAILS = [
  "admin@lovelink.app",
  "emmanuel@lovelink.app",
  "ndigname@gmail.com"
];

export default function AdminDashboard() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState("");

  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [occasionFilter, setOccasionFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("cockpit"); // 'cockpit' | 'gifts' | 'reactions' | 'strategy'
  const [selectedGiftId, setSelectedGiftId] = useState(null);
  
  // Modals
  const [activeLetterModal, setActiveLetterModal] = useState(null);
  const [activeReactionModal, setActiveReactionModal] = useState(null);
  const [activeReportModal, setActiveReportModal] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Audio player for reactions & ambience
  const audioRef = useRef(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentAudioUrl, setCurrentAudioUrl] = useState(null);
  const [audioVolume, setAudioVolume] = useState(80);
  const [rainAmbience, setRainAmbience] = useState(65);
  const [noiseAmbience, setNoiseAmbience] = useState(40);
  const [lofiActive, setLofiActive] = useState(false);

  // Verify Admin Access
  useEffect(() => {
    const sessionAuth = sessionStorage.getItem("lovelink_admin_auth");
    if (sessionAuth) {
      setIsAdminAuthenticated(true);
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user?.email) {
        setCurrentUserEmail(user.email);
        const envAdmins = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
          .split(",")
          .map(e => e.trim().toLowerCase())
          .filter(Boolean);
        const allAdmins = [...DEFAULT_ADMIN_EMAILS, ...envAdmins];

        if (allAdmins.includes(user.email.toLowerCase())) {
          setIsAdminAuthenticated(true);
          sessionStorage.setItem("lovelink_admin_auth", "true");
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handlePasscodeLogin = async (e) => {
    e.preventDefault();
    setAuthError("");
    setIsVerifying(true);

    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode: passcodeInput.trim() })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Incorrect admin credentials.");
      }

      setIsAdminAuthenticated(true);
      sessionStorage.setItem("lovelink_admin_auth", data.token || "true");
      setAuthError("");
    } catch (err) {
      setAuthError(err.message || "Authentication error.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("lovelink_admin_auth");
    setIsAdminAuthenticated(false);
  };

  // Fetch all gifts
  const fetchAllGifts = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "gifts"));
      const snapshot = await getDocs(q);
      const list = [];
      snapshot.forEach(d => {
        list.push({ id: d.id, ...d.data() });
      });

      // Sort newest first
      list.sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() || (a.createdAt ? new Date(a.createdAt).getTime() : 0);
        const timeB = b.createdAt?.toMillis?.() || (b.createdAt ? new Date(b.createdAt).getTime() : 0);
        return timeB - timeA;
      });

      setGifts(list);
      if (list.length > 0 && !selectedGiftId) {
        setSelectedGiftId(list[0].id);
      }
    } catch (err) {
      console.error("Error loading gifts for admin:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdminAuthenticated) {
      fetchAllGifts();
    }
  }, [isAdminAuthenticated]);

  // Actions
  const togglePaidStatus = async (giftId, currentStatus) => {
    setIsUpdating(true);
    try {
      const docRef = doc(db, "gifts", giftId);
      await updateDoc(docRef, { paid: !currentStatus });
      setGifts(prev => prev.map(g => g.id === giftId ? { ...g, paid: !currentStatus } : g));
    } catch (e) {
      alert("Failed to update status: " + e.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleDisabledStatus = async (giftId, currentStatus) => {
    setIsUpdating(true);
    try {
      const docRef = doc(db, "gifts", giftId);
      await updateDoc(docRef, { disabled: !currentStatus });
      setGifts(prev => prev.map(g => g.id === giftId ? { ...g, disabled: !currentStatus } : g));
    } catch (e) {
      alert("Failed to update disabled status: " + e.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const dismissReport = async (giftId) => {
    setIsUpdating(true);
    try {
      const docRef = doc(db, "gifts", giftId);
      await updateDoc(docRef, { reported: false });
      setGifts(prev => prev.map(g => g.id === giftId ? { ...g, reported: false } : g));
      setActiveReportModal(null);
    } catch (e) {
      alert("Failed to dismiss report: " + e.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteGift = async (giftId, recipientName) => {
    if (!confirm(`Are you sure you want to permanently delete the gift for "${recipientName}"? This cannot be undone.`)) {
      return;
    }
    setIsUpdating(true);
    try {
      await deleteDoc(doc(db, "gifts", giftId));
      setGifts(prev => prev.filter(g => g.id !== giftId));
    } catch (e) {
      alert("Failed to delete gift: " + e.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCopy = (gift) => {
    const url = `${window.location.origin}${gift.slug ? `/for/${gift.slug}` : `/gift/${gift.id}`}`;
    navigator.clipboard.writeText(url);
    setCopiedId(gift.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const playVoiceNote = (base64Audio) => {
    if (audioRef.current) {
      if (isPlayingAudio && currentAudioUrl === base64Audio) {
        audioRef.current.pause();
        setIsPlayingAudio(false);
      } else {
        audioRef.current.src = base64Audio;
        setCurrentAudioUrl(base64Audio);
        audioRef.current.volume = audioVolume / 100;
        audioRef.current.play();
        setIsPlayingAudio(true);
      }
    }
  };

  // Metrics
  const totalGifts = gifts.length;
  const paidGifts = gifts.filter(g => g.paid).length;
  const unpaidGifts = totalGifts - paidGifts;
  const totalReactions = gifts.filter(g => g.response).length;
  const totalOpened = gifts.filter(g => g.lastOpened).length;
  const reportedGifts = gifts.filter(g => g.reported).length;
  const disabledGifts = gifts.filter(g => g.disabled).length;
  const totalRevenueGHS = paidGifts * 99;
  const totalRevenueUSD = (paidGifts * 9.99).toFixed(2);
  const conversionRate = totalGifts > 0 ? ((paidGifts / totalGifts) * 100).toFixed(1) : 0;

  // Selected Gift
  const selectedGift = gifts.find(g => g.id === selectedGiftId) || gifts[0] || null;

  // Occasion counts
  const romanticCount = gifts.filter(g => (g.occasion || "standard") === "standard").length;
  const familyCount = gifts.filter(g => g.occasion === "family").length;
  const proposalCount = gifts.filter(g => g.occasion === "proposal").length;
  const birthdayCount = gifts.filter(g => g.occasion === "birthday").length;

  // Filtered Gifts
  const filteredGifts = gifts.filter(gift => {
    const matchesQuery = 
      (gift.recipientName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (gift.creatorName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (gift.creatorEmail || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (gift.slug || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = 
      statusFilter === "all" ? true :
      statusFilter === "reported" ? gift.reported === true :
      statusFilter === "disabled" ? gift.disabled === true :
      statusFilter === "paid" ? gift.paid === true :
      gift.paid !== true;

    const matchesOccasion = 
      occasionFilter === "all" ? true :
      gift.occasion === occasionFilter;

    return matchesQuery && matchesStatus && matchesOccasion;
  });

  // Reactions List
  const reactionsList = gifts
    .filter(g => g.response)
    .map(g => ({
      giftId: g.id,
      recipientName: g.recipientName,
      creatorName: g.creatorName,
      creatorEmail: g.creatorEmail,
      slug: g.slug,
      response: g.response
    }));

  // Render Gate if not authenticated
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-[#070b13] flex items-center justify-center p-6 text-white selection:bg-blue-500/30">
        <div className="w-full max-w-md bg-[#0d131f] border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center mx-auto mb-6 text-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.25)]">
            <Radio className="w-8 h-8" />
          </div>

          <h1 className="text-2xl font-bold text-center mb-1">LoveLink Cockpit</h1>
          <p className="text-xs text-slate-400 text-center mb-6">Sequence-Grade Founder Command Workspace</p>

          <form onSubmit={handlePasscodeLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">Master Founder Passcode</label>
              <input 
                type="password" 
                value={passcodeInput} 
                onChange={e => setPasscodeInput(e.target.value)} 
                placeholder="Enter admin passcode..." 
                className="w-full bg-[#070b13] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {authError && (
              <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg text-center font-medium">
                {authError}
              </p>
            )}

            <button 
              type="submit" 
              disabled={isVerifying}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/25 active:scale-95 transition-all disabled:opacity-50"
            >
              {isVerifying ? "Verifying..." : "Access Studio"}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center text-[11px] text-slate-500">
            {currentUserEmail ? `Signed in as: ${currentUserEmail}` : "Restricted to authorized founders"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 flex flex-col font-sans selection:bg-blue-500/30 overflow-x-hidden">
      {/* Hidden audio element for voice note review */}
      <audio ref={audioRef} onEnded={() => setIsPlayingAudio(false)} className="hidden" />

      {/* TOP HEADER: Sequence Style */}
      <header className="h-14 border-b border-slate-800/80 bg-[#070b13]/90 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          {/* Brand Waveform Icon */}
          <div className="flex items-center gap-1.5 text-blue-500">
            <span className="w-1 h-4 bg-blue-500 rounded-full animate-pulse"></span>
            <span className="w-1 h-6 bg-blue-400 rounded-full"></span>
            <span className="w-1 h-3 bg-blue-500 rounded-full"></span>
          </div>
          <span className="font-bold text-sm tracking-tight text-white">LoveLink</span>

          <div className="h-4 w-[1px] bg-slate-800 mx-1"></div>

          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Workspace</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-white font-medium">Focus room</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 ml-3 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            All systems live
          </div>
        </div>

        {/* Right Top Actions */}
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              placeholder="Quick find ⌘ K" 
              className="w-full bg-[#0d131f] border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <button 
            onClick={fetchAllGifts} 
            disabled={loading} 
            className="p-1.5 text-slate-400 hover:text-white bg-[#0d131f] hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors"
            title="Refresh database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-400' : ''}`} />
          </button>

          <Link 
            href="/dashboard" 
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-600/20 transition-all"
          >
            <span>+ New keepsake</span>
          </Link>
        </div>
      </header>

      {/* 3-COLUMN WORKSPACE: SEQUENCE COCKPIT */}
      <div className="flex-1 flex flex-col lg:flex-row">

        {/* COLUMN 1: LEFT SIDEBAR (Sequence Style) */}
        <aside className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-slate-800/80 bg-[#090d16] p-4 flex flex-col justify-between shrink-0">
          <div className="space-y-6">
            
            {/* Workspace Selector */}
            <div className="p-2.5 rounded-xl bg-[#0f172a]/60 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-slate-700 transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center text-xs font-bold">
                  LL
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Emmanuel's studio</div>
                  <div className="text-[10px] text-slate-400">Founder workspace</div>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </div>

            {/* Main Navigation Items */}
            <nav className="space-y-1">
              <button 
                onClick={() => { setActiveTab("cockpit"); setStatusFilter("all"); setOccasionFilter("all"); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === "cockpit" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30" : "text-slate-400 hover:text-white hover:bg-[#0f172a]"}`}
              >
                <div className="flex items-center gap-2.5">
                  <Radio className="w-4 h-4" />
                  <span>Focus room</span>
                </div>
              </button>

              <button 
                onClick={() => { setActiveTab("gifts"); setStatusFilter("all"); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === "gifts" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30" : "text-slate-400 hover:text-white hover:bg-[#0f172a]"}`}
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4" />
                  <span>All keepsakes</span>
                </div>
                <span className="text-[10px] font-mono opacity-60 bg-black/30 px-1.5 py-0.5 rounded">
                  {totalGifts < 10 ? `0${totalGifts}` : totalGifts}
                </span>
              </button>

              <button 
                onClick={() => setActiveTab("reactions")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === "reactions" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30" : "text-slate-400 hover:text-white hover:bg-[#0f172a]"}`}
              >
                <div className="flex items-center gap-2.5">
                  <Mic className="w-4 h-4 text-pink-400" />
                  <span>Voice reactions</span>
                </div>
                <span className="text-[10px] font-mono opacity-60 bg-black/30 px-1.5 py-0.5 rounded">
                  {totalReactions < 10 ? `0${totalReactions}` : totalReactions}
                </span>
              </button>

              <button 
                onClick={() => { setActiveTab("gifts"); setStatusFilter("reported"); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${statusFilter === "reported" ? "bg-red-600 text-white" : "text-slate-400 hover:text-white hover:bg-[#0f172a]"}`}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className={`w-4 h-4 ${reportedGifts > 0 ? 'text-red-400 animate-pulse' : 'text-slate-400'}`} />
                  <span>Trust & Safety</span>
                </div>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${reportedGifts > 0 ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'bg-black/30 opacity-60'}`}>
                  {reportedGifts < 10 ? `0${reportedGifts}` : reportedGifts}
                </span>
              </button>

              <button 
                onClick={() => setActiveTab("strategy")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === "strategy" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white hover:bg-[#0f172a]"}`}
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span>Psychology Matrix</span>
                </div>
                <span className="text-[10px] font-mono opacity-60 bg-black/30 px-1.5 py-0.5 rounded">
                  $9.99
                </span>
              </button>
            </nav>

            {/* Projects / Occasions Group (Sequence Style) */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3">
                <span>OCCASIONS</span>
                <span className="text-slate-600">04</span>
              </div>

              <div className="space-y-1">
                <button 
                  onClick={() => { setOccasionFilter("standard"); setActiveTab("cockpit"); }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors ${occasionFilter === "standard" ? "text-blue-400 font-bold bg-[#0f172a]" : "text-slate-400 hover:text-white"}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    <span>Romantic Keepsake</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">{romanticCount < 10 ? `0${romanticCount}` : romanticCount}</span>
                </button>

                <button 
                  onClick={() => { setOccasionFilter("family"); setActiveTab("cockpit"); }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors ${occasionFilter === "family" ? "text-cyan-400 font-bold bg-[#0f172a]" : "text-slate-400 hover:text-white"}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                    <span>Family Time Capsule</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">{familyCount < 10 ? `0${familyCount}` : familyCount}</span>
                </button>

                <button 
                  onClick={() => { setOccasionFilter("proposal"); setActiveTab("cockpit"); }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors ${occasionFilter === "proposal" ? "text-purple-400 font-bold bg-[#0f172a]" : "text-slate-400 hover:text-white"}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                    <span>Proposals (💍)</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">{proposalCount < 10 ? `0${proposalCount}` : proposalCount}</span>
                </button>

                <button 
                  onClick={() => { setOccasionFilter("birthday"); setActiveTab("cockpit"); }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors ${occasionFilter === "birthday" ? "text-rose-400 font-bold bg-[#0f172a]" : "text-slate-400 hover:text-white"}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                    <span>Birthdays</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">{birthdayCount < 10 ? `0${birthdayCount}` : birthdayCount}</span>
                </button>
              </div>
            </div>

          </div>

          {/* Bottom Card & Profile */}
          <div className="space-y-4 pt-4 border-t border-slate-800/80 mt-6">
            {/* Sequence Style Quote Box */}
            <div className="p-3 rounded-2xl bg-[#0d131f] border border-slate-800/80 text-[11px] space-y-1.5">
              <div className="flex items-center gap-1.5 text-blue-400 font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>LoveLink Vault</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[10px]">
                Less switching. More permanent memories. 99 GHS single ownership forever.
              </p>
            </div>

            {/* User Profile */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">
                  EM
                </div>
                <div>
                  <div className="font-bold text-white text-xs">Emmanuel</div>
                  <div className="text-[10px] text-slate-500 truncate max-w-[110px]">emmanuel@lovelink</div>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="text-slate-500 hover:text-rose-400 p-1.5 transition-colors"
                title="Sign out"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </aside>

        {/* COLUMN 2: CENTER COMMAND CANVAS (Sequence Style) */}
        <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto">

          {/* Greeting & Date Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-800/60 pb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                Find your flow.
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                One keepsake at a time. You're delivering space for what truly matters.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 px-3 py-1 rounded-lg bg-[#0d131f] border border-slate-800 self-start sm:self-auto">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase()}</span>
            </div>
          </div>

          {/* ACTIVE SAFETY ALERT IF PRESENT */}
          {reportedGifts > 0 && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-between text-red-200">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-red-400 animate-pulse" />
                <div>
                  <div className="text-xs font-bold">{reportedGifts} Content Report Pending Review</div>
                  <div className="text-[11px] text-red-400/80">Recipients have flagged content under acceptable use policy.</div>
                </div>
              </div>
              <button 
                onClick={() => { setActiveTab("gifts"); setStatusFilter("reported"); }}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition-all"
              >
                Review Flagged
              </button>
            </div>
          )}

          {/* HERO CARD: SEQUENCE STYLE "IN THE MOMENT" HERO CARD */}
          <div className="relative rounded-3xl bg-[#0c121e] border border-slate-800 p-6 md:p-8 overflow-hidden shadow-2xl">
            {/* Subtle glow background */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
              
              {/* Left Side: Active Session Meta */}
              <div className="space-y-4 max-w-xl">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                    Focus Keepsake
                  </div>
                  <span className="text-xs font-mono text-slate-500">
                    KEEPSAKE {selectedGift ? `#${selectedGift.id.slice(0, 6)}` : "01 / 01"}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400">IN THE MOMENT</div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                    {selectedGift ? `For ${selectedGift.recipientName}` : "Create your first digital keepsake"}
                  </h2>
                  <p className="text-xs text-slate-400 flex items-center gap-2">
                    <span className="capitalize">{selectedGift?.occasion || "romantic"} keepsake</span>
                    <span>•</span>
                    <span className="font-mono text-blue-400">/for/{selectedGift?.slug || selectedGift?.id || "demo"}</span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  {selectedGift && (
                    <button 
                      onClick={() => togglePaidStatus(selectedGift.id, selectedGift.paid)}
                      disabled={isUpdating}
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all ${selectedGift.paid ? 'bg-slate-800 text-slate-300 hover:text-amber-400' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/25'}`}
                    >
                      {selectedGift.paid ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Unlock className="w-3.5 h-3.5" />}
                      <span>{selectedGift.paid ? "Mark Unpaid" : "Unlock Keepsake"}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/30 font-mono ml-1">SPACE</span>
                    </button>
                  )}

                  {selectedGift && (
                    <Link 
                      href={selectedGift.slug ? `/for/${selectedGift.slug}` : `/gift/${selectedGift.id}`} 
                      target="_blank"
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#111927] hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-2 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-400" />
                      <span>Live Reveal Experience</span>
                    </Link>
                  )}

                  {selectedGift && (
                    <button 
                      onClick={() => handleCopy(selectedGift)}
                      className="p-2.5 rounded-xl bg-[#111927] hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
                      title="Copy link"
                    >
                      {copiedId === selectedGift.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>

              {/* Right Side: Circular Countdown Graphic (Sequence Style) */}
              <div className="flex flex-col items-center justify-center shrink-0">
                <div className="relative w-44 h-44 rounded-full border-4 border-slate-800/80 flex flex-col items-center justify-center bg-[#070b13]/80 shadow-[0_0_50px_rgba(59,130,246,0.15)]">
                  {/* Subtle active circle overlay */}
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle 
                      cx="88" cy="88" r="82" 
                      className="text-blue-500 stroke-current" 
                      strokeWidth="4" 
                      fill="transparent" 
                      strokeDasharray="515" 
                      strokeDashoffset={selectedGift?.paid ? "0" : "250"}
                      strokeLinecap="round"
                    />
                  </svg>

                  <div className="text-2xl font-black text-white font-mono tracking-tight">
                    {selectedGift?.paid ? "PAID" : "99 GHS"}
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">
                    {selectedGift?.paid ? "HOSTED FOREVER" : "$9.99 USD"}
                  </div>

                  {/* 4 dots under timer like in Sequence screenshot */}
                  <div className="flex items-center gap-1.5 mt-3">
                    <span className="w-3 h-1 rounded-full bg-blue-500"></span>
                    <span className="w-3 h-1 rounded-full bg-blue-500"></span>
                    <span className="w-3 h-1 rounded-full bg-blue-500"></span>
                    <span className={`w-3 h-1 rounded-full ${selectedGift?.paid ? 'bg-blue-500' : 'bg-slate-700'}`}></span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* "YOUR ATMOSPHERE" LIVE AUDIO BOOTH (Sequence Style) */}
          <div className="p-5 rounded-2xl bg-[#0c121e] border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Your atmosphere</span>
                  <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                    {reactionsList.length} Voice Notes Ready
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  {selectedGift?.response?.type === "voice" 
                    ? `Voice note recorded by ${selectedGift.recipientName}` 
                    : "Ambient Keepsake audio vault & voice booth"}
                </div>
              </div>
            </div>

            {/* Audio Sliders & Toggles matching Sequence */}
            <div className="flex flex-wrap items-center gap-4 text-xs w-full md:w-auto">
              {/* Voice Note Player if selected gift has voice note */}
              {selectedGift?.response?.type === "voice" && (
                <button 
                  onClick={() => playVoiceNote(selectedGift.response.content)}
                  className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-bold flex items-center gap-2 transition-colors shadow-lg shadow-pink-500/20"
                >
                  {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  <span>{isPlayingAudio ? "Pause Voice Note" : "Play Voice Note"}</span>
                </button>
              )}

              {/* Rain Ambience Slider */}
              <div className="flex items-center gap-2 bg-[#070b13] px-3 py-1.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[11px]">Rain</span>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={rainAmbience} 
                  onChange={e => setRainAmbience(e.target.value)}
                  className="w-16 accent-blue-500" 
                />
                <span className="font-mono text-[10px] text-slate-400">{rainAmbience}%</span>
              </div>

              {/* Brown Noise Slider */}
              <div className="flex items-center gap-2 bg-[#070b13] px-3 py-1.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[11px]">Noise</span>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={noiseAmbience} 
                  onChange={e => setNoiseAmbience(e.target.value)}
                  className="w-16 accent-blue-500" 
                />
                <span className="font-mono text-[10px] text-slate-400">{noiseAmbience}%</span>
              </div>

              {/* Lo-fi Toggle */}
              <button 
                onClick={() => setLofiActive(!lofiActive)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-semibold transition-colors ${lofiActive ? 'bg-blue-600 text-white border-blue-500' : 'bg-[#070b13] text-slate-400 border-slate-800 hover:text-white'}`}
              >
                <Music className="w-3.5 h-3.5" />
                <span>Lo-fi {lofiActive ? "ON" : "OFF"}</span>
              </button>
            </div>
          </div>

          {/* "YOUR SEQUENCE" TABLE (Sequence Style) */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Your sequence</h3>
                <span className="text-[10px] font-mono text-slate-400 bg-[#0d131f] border border-slate-800 px-2 py-0.5 rounded-full">
                  {filteredGifts.length < 10 ? `0${filteredGifts.length}` : filteredGifts.length}
                </span>
              </div>

              {/* Filter controls */}
              <div className="flex items-center gap-2">
                <select 
                  value={statusFilter} 
                  onChange={e => setStatusFilter(e.target.value)}
                  className="bg-[#0c121e] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 outline-none focus:border-blue-500"
                >
                  <option value="all">Status: All</option>
                  <option value="paid">Paid (Live)</option>
                  <option value="unpaid">Unpaid Drafts</option>
                  <option value="reported">Reported ⚠️ ({reportedGifts})</option>
                  <option value="disabled">Disabled 🚫 ({disabledGifts})</option>
                </select>

                <select 
                  value={occasionFilter} 
                  onChange={e => setOccasionFilter(e.target.value)}
                  className="bg-[#0c121e] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 outline-none focus:border-blue-500"
                >
                  <option value="all">Occasion: All</option>
                  <option value="standard">Romantic</option>
                  <option value="family">Family Capsule</option>
                  <option value="proposal">Proposal</option>
                  <option value="birthday">Birthday</option>
                </select>
              </div>
            </div>

            {/* Sequence Rows */}
            <div className="rounded-2xl bg-[#0c121e] border border-slate-800 overflow-hidden divide-y divide-slate-850">
              {filteredGifts.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-500">
                  No keepsakes match the current filters.
                </div>
              ) : (
                filteredGifts.map((gift, index) => (
                  <div 
                    key={gift.id}
                    onClick={() => setSelectedGiftId(gift.id)}
                    className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition-colors ${selectedGiftId === gift.id ? 'bg-blue-950/20 border-l-2 border-l-blue-500' : 'hover:bg-slate-800/30'}`}
                  >
                    {/* Left: Row Indicator & Title */}
                    <div className="flex items-center gap-3">
                      {/* Drag / Index handle */}
                      <span className="text-[10px] font-mono text-slate-600 w-4">
                        {index < 9 ? `0${index + 1}` : index + 1}
                      </span>

                      {/* Icon */}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${gift.paid ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                        {gift.paid ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      </div>

                      {/* Title & Details */}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{gift.recipientName || "Untitled"}</span>
                          <span className="text-[10px] font-mono text-blue-400">/for/{gift.slug || gift.id}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>By {gift.creatorName || "Anonymous"}</span>
                          <span>•</span>
                          <span className="capitalize">{gift.occasion || "standard"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Status Pill & Row Actions */}
                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      {/* Status Badges */}
                      <div className="flex items-center gap-1.5">
                        {gift.paid ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Live
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Unpaid
                          </span>
                        )}

                        {gift.disabled && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/15 text-red-400 border border-red-500/30">
                            Disabled
                          </span>
                        )}

                        {gift.reported && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setActiveReportModal(gift); }}
                            className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-red-500/25 text-red-300 border border-red-500/40 hover:bg-red-500/35 transition-colors animate-pulse flex items-center gap-1"
                          >
                            <Flag className="w-3 h-3 text-red-400" /> Flagged
                          </button>
                        )}
                      </div>

                      {/* Response Indicator */}
                      {gift.response ? (
                        <button 
                          onClick={(e) => { e.stopPropagation(); setActiveReactionModal(gift); }}
                          className="px-2 py-1 rounded-lg bg-pink-500/15 text-pink-400 border border-pink-500/20 text-[10px] font-bold flex items-center gap-1 hover:bg-pink-500/25"
                        >
                          <Mic className="w-3 h-3" /> Reaction
                        </button>
                      ) : null}

                      {/* Row Quick Actions */}
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setActiveLetterModal(gift); }}
                          className="p-1.5 rounded-lg bg-[#070b13] hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                          title="Read letter transcript"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleCopy(gift); }}
                          className="p-1.5 rounded-lg bg-[#070b13] hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                          title="Copy link"
                        >
                          {copiedId === gift.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); toggleDisabledStatus(gift.id, gift.disabled); }}
                          className={`p-1.5 rounded-lg transition-colors ${gift.disabled ? 'bg-red-500 text-white' : 'bg-[#070b13] hover:bg-slate-700 text-slate-400 hover:text-red-400'}`}
                          title={gift.disabled ? "Enable Public Access" : "Disable / Ban Link"}
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteGift(gift.id, gift.recipientName); }}
                          className="p-1.5 rounded-lg bg-[#070b13] hover:bg-rose-950 text-slate-500 hover:text-rose-400 transition-colors"
                          title="Delete keepsake"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </main>

        {/* COLUMN 3: RIGHT INTELLIGENCE RAIL (Sequence Style) */}
        <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-800/80 bg-[#090d16] p-6 space-y-6 shrink-0">
          
          {/* Header: TODAY'S MOMENTUM */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>TODAY'S MOMENTUM</span>
              <Activity className="w-4 h-4 text-blue-400" />
            </div>

            <div>
              <div className="text-2xl font-black text-white font-mono">
                {totalRevenueGHS} GHS <span className="text-xs text-slate-500 font-sans font-normal">/ ~$9.99 per gift</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                ${totalRevenueUSD} USD estimated revenue
              </div>
            </div>

            {/* Segmented Progress Bar (Sequence style) */}
            <div className="flex items-center gap-1.5">
              {[...Array(12)].map((_, i) => (
                <div 
                  key={i} 
                  className={`h-2 flex-1 rounded-sm ${i < Math.min(paidGifts, 12) ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-slate-800'}`}
                />
              ))}
            </div>

            {/* 3 Metric Counters matching Sequence */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/60 text-center">
              <div>
                <div className="text-lg font-bold text-white font-mono">
                  {paidGifts < 10 ? `0${paidGifts}` : paidGifts}
                </div>
                <div className="text-[9px] text-slate-500 uppercase tracking-wider">Unlocked</div>
              </div>
              <div>
                <div className="text-lg font-bold text-white font-mono">
                  {totalReactions < 10 ? `0${totalReactions}` : totalReactions}
                </div>
                <div className="text-[9px] text-slate-500 uppercase tracking-wider">Reactions</div>
              </div>
              <div>
                <div className="text-lg font-bold text-emerald-400 font-mono">
                  100%
                </div>
                <div className="text-[9px] text-slate-500 uppercase tracking-wider">Hosted</div>
              </div>
            </div>
          </div>

          {/* "Your sprints" Card (Sequence Style) */}
          <div className="p-4 rounded-2xl bg-[#0c121e] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-400">Conversion Sprint</span>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                ACTIVE
              </span>
            </div>

            <div>
              <div className="text-xs font-bold text-white">Emotional Paywall Performance</div>
              <div className="text-[10px] text-slate-400">Dead Flowers comparison vs $9.99</div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>{paidGifts} OF {totalGifts} CONVERTED</span>
                <span>{conversionRate}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500" 
                  style={{ width: `${Math.min(conversionRate, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* "AFTER THIS FOCUS" Break Card (Sequence Style) */}
          <div className="p-4 rounded-2xl bg-[#0c121e] border border-slate-800 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Coffee className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">A little room to breathe</div>
              <div className="text-[10px] text-slate-400 leading-relaxed mt-0.5">
                Every LoveLink is hosted permanently. No servers to maintain or recurring bills to chase.
              </div>
            </div>
          </div>

          {/* Bottom Security / Distractions Card (Sequence Style) */}
          <div className="p-3.5 rounded-2xl bg-[#070b13] border border-slate-800 flex items-center gap-2.5 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
            <div className="text-[11px] leading-tight">
              Distractions, on hold. Safety filters active.
            </div>
            <span className="w-2 h-2 rounded-full bg-blue-500 ml-auto shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
          </div>

        </aside>

      </div>

      {/* MODAL 1: LETTER TRANSCRIPT PREVIEW */}
      {activeLetterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setActiveLetterModal(null)} />
          <div className="relative bg-[#0d131f] border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl max-h-[85vh] flex flex-col">
            <button 
              onClick={() => setActiveLetterModal(null)} 
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-pink-500 fill-pink-500/20" />
              <h3 className="text-lg font-bold text-white">Letter for {activeLetterModal.recipientName}</h3>
            </div>

            <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar bg-[#070b13] p-5 rounded-2xl border border-slate-800 text-sm leading-relaxed whitespace-pre-wrap font-serif italic text-slate-200">
              {activeLetterModal.letter || "No letter content written."}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Sign-off: {activeLetterModal.creatorName || "Anonymous"}</span>
              <Link 
                href={activeLetterModal.slug ? `/for/${activeLetterModal.slug}` : `/gift/${activeLetterModal.id}`} 
                target="_blank" 
                className="text-blue-400 font-bold hover:underline flex items-center gap-1"
              >
                Open Recipient Experience <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: REACTION MODAL */}
      {activeReactionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setActiveReactionModal(null)} />
          <div className="relative bg-[#0d131f] border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <button 
              onClick={() => setActiveReactionModal(null)} 
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-2">Reaction from {activeReactionModal.recipientName}</h3>
            <p className="text-xs text-slate-400 mb-6">Sent to {activeReactionModal.creatorName} ({activeReactionModal.creatorEmail})</p>

            {activeReactionModal.response?.type === "voice" ? (
              <div className="bg-[#070b13] p-6 rounded-2xl border border-slate-800 flex flex-col items-center gap-4">
                <span className="text-sm font-semibold text-white">Voice Note from {activeReactionModal.recipientName}</span>
                <button 
                  onClick={() => playVoiceNote(activeReactionModal.response.content)} 
                  className="w-14 h-14 rounded-full bg-pink-500 hover:bg-pink-600 text-white flex items-center justify-center shadow-lg shadow-pink-500/30 transition-all"
                >
                  <Play className="w-6 h-6 fill-current ml-0.5" />
                </button>
              </div>
            ) : (
              <div className="bg-[#070b13] p-4 rounded-2xl border border-slate-800 text-sm text-slate-200 italic leading-relaxed whitespace-pre-wrap">
                "{activeReactionModal.response?.content || "No message content."}"
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 3: ABUSE REPORT DETAILS MODAL */}
      {activeReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setActiveReportModal(null)} />
          <div className="relative bg-[#0d131f] border border-red-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl">
            <button 
              onClick={() => setActiveReportModal(null)} 
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 text-red-400 mb-2">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="text-lg font-bold text-white">Abuse Report Details</h3>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              Flagged gift: <span className="text-white font-mono font-semibold">/for/{activeReportModal.slug || activeReportModal.id}</span>
            </p>

            <div className="space-y-4 bg-[#070b13] border border-slate-800 rounded-2xl p-4 text-xs">
              <div>
                <span className="text-slate-500 block uppercase font-bold text-[10px] tracking-wider mb-1">Reason</span>
                <span className="text-red-300 font-semibold text-sm">{activeReportModal.reportReason || "Policy Violation"}</span>
              </div>

              <div>
                <span className="text-slate-500 block uppercase font-bold text-[10px] tracking-wider mb-1">Details Provided</span>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {activeReportModal.reportDetails || "No additional comments provided."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Creator</span>
                  <span className="text-slate-300">{activeReportModal.creatorName} ({activeReportModal.creatorEmail || "No email"})</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Recipient</span>
                  <span className="text-slate-300">{activeReportModal.recipientName}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-800">
              <button
                onClick={() => dismissReport(activeReportModal.id)}
                disabled={isUpdating}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold"
              >
                Dismiss Report
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    toggleDisabledStatus(activeReportModal.id, activeReportModal.disabled);
                    setActiveReportModal(null);
                  }}
                  disabled={isUpdating}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${activeReportModal.disabled ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}
                >
                  {activeReportModal.disabled ? "Re-enable Link" : "Disable Link Now"}
                </button>
                <button
                  onClick={() => {
                    handleDeleteGift(activeReportModal.id, activeReportModal.recipientName);
                    setActiveReportModal(null);
                  }}
                  disabled={isUpdating}
                  className="px-4 py-2 rounded-xl bg-red-950 text-red-400 hover:bg-red-900 border border-red-800/50 text-xs font-bold"
                >
                  Delete Gift
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
