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
  CheckCircle2
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

// Allowed admin emails list (Can be extended via NEXT_PUBLIC_ADMIN_EMAILS)
const DEFAULT_ADMIN_EMAILS = [
  "admin@lovelink.app",
  "emmanuel@lovelink.app",
  "ndigname@gmail.com"
];

const MASTER_PASSCODE = process.env.NEXT_PUBLIC_ADMIN_PASSCODE || "lovelink2026!";

export default function AdminDashboard() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [currentUserEmail, setCurrentUserEmail] = useState("");

  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [occasionFilter, setOccasionFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("gifts"); // 'gifts' | 'reactions' | 'strategy'
  
  // Modals
  const [activeLetterModal, setActiveLetterModal] = useState(null);
  const [activeReactionModal, setActiveReactionModal] = useState(null);
  const [activeReportModal, setActiveReportModal] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Audio player for reactions
  const audioRef = useRef(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Verify Admin Access
  useEffect(() => {
    // 1. Check session storage passcode
    const sessionAuth = sessionStorage.getItem("lovelink_admin_auth");
    if (sessionAuth === "true") {
      setIsAdminAuthenticated(true);
    }

    // 2. Check Firebase user email
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

  const handlePasscodeLogin = (e) => {
    e.preventDefault();
    if (passcodeInput.trim() === MASTER_PASSCODE) {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem("lovelink_admin_auth", "true");
      setAuthError("");
    } else {
      setAuthError("Incorrect admin passcode. Please try again.");
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
      if (isPlayingAudio) {
        audioRef.current.pause();
        setIsPlayingAudio(false);
      } else {
        audioRef.current.src = base64Audio;
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white selection:bg-pink-500/30">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mx-auto mb-6 text-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.25)]">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <h1 className="text-2xl font-bold text-center mb-1">LoveLink Admin Portal</h1>
          <p className="text-xs text-slate-400 text-center mb-6">Restricted to authorized team members</p>

          <form onSubmit={handlePasscodeLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">Master Admin Passcode</label>
              <input 
                type="password" 
                value={passcodeInput} 
                onChange={e => setPasscodeInput(e.target.value)} 
                placeholder="Enter admin passcode..." 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-rose-500 transition-colors"
              />
            </div>

            {authError && (
              <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg text-center font-medium">
                {authError}
              </p>
            )}

            <button 
              type="submit" 
              className="w-full py-3 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-rose-500/25 active:scale-95 transition-all"
            >
              Access Dashboard
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center text-[11px] text-slate-500">
            {currentUserEmail ? `Logged in as: ${currentUserEmail}` : "Not signed into Firebase"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-pink-500/30 pb-24">
      {/* Hidden audio element for voice note review */}
      <audio ref={audioRef} onEnded={() => setIsPlayingAudio(false)} className="hidden" />

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-500/30 text-white font-black text-lg">
              ❤️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-white tracking-tight">LoveLink</span>
                <span className="text-[10px] font-bold tracking-widest uppercase bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-full">
                  Admin Panel
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Platform Management & Growth Operations</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={fetchAllGifts} 
              disabled={loading} 
              className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-xl transition-colors border border-slate-700" 
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-rose-400' : ''}`} />
            </button>
            <Link 
              href="/dashboard" 
              className="text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-700 transition-colors"
            >
              Builder
            </Link>
            <button 
              onClick={handleLogout} 
              className="text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-2 rounded-xl border border-rose-500/20 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-8 space-y-8">
        
        {/* KPI Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {/* Total Gifts */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              Total Gifts <Users className="w-4 h-4 text-slate-500" />
            </span>
            <span className="text-3xl font-extrabold text-white mt-2">{totalGifts}</span>
            <span className="text-[11px] text-slate-500 mt-1">All created links</span>
          </div>

          {/* Paid Gifts */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center justify-between">
              Paid Gifts <Check className="w-4 h-4 text-emerald-500" />
            </span>
            <span className="text-3xl font-extrabold text-emerald-400 mt-2">{paidGifts}</span>
            <span className="text-[11px] text-slate-500 mt-1">{conversionRate}% conversion</span>
          </div>

          {/* Unpaid Gifts */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center justify-between">
              Unpaid Drafts <Lock className="w-4 h-4 text-amber-500" />
            </span>
            <span className="text-3xl font-extrabold text-amber-400 mt-2">{unpaidGifts}</span>
            <span className="text-[11px] text-slate-500 mt-1">Ready for re-targeting</span>
          </div>

          {/* Revenue */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center justify-between">
              Est. Revenue <DollarSign className="w-4 h-4 text-rose-500" />
            </span>
            <span className="text-2xl font-extrabold text-white mt-2">${totalRevenueUSD}</span>
            <span className="text-[11px] text-slate-500 mt-1">{totalRevenueGHS} GHS</span>
          </div>

          {/* Opened Count */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center justify-between">
              Recipients Opened <Eye className="w-4 h-4 text-cyan-500" />
            </span>
            <span className="text-3xl font-extrabold text-cyan-400 mt-2">{totalOpened}</span>
            <span className="text-[11px] text-slate-500 mt-1">Link engagement</span>
          </div>

          {/* Reactions */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-pink-400 flex items-center justify-between">
              Reactions <Heart className="w-4 h-4 text-pink-500" />
            </span>
            <span className="text-3xl font-extrabold text-pink-400 mt-2">{totalReactions}</span>
            <span className="text-[11px] text-slate-500 mt-1">Audio & text replies</span>
          </div>
        </div>

        {/* Active Safety Reports Banner */}
        {reportedGifts > 0 && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-red-300 shadow-[0_0_25px_rgba(239,68,68,0.15)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-red-200">
                  {reportedGifts} Content {reportedGifts === 1 ? "Report" : "Reports"} Pending Safety Review
                </h4>
                <p className="text-xs text-red-400/80">
                  Recipients have flagged gifts for harassment, non-consensual media, or acceptable use policy violations.
                </p>
              </div>
            </div>
            <button
              onClick={() => { setActiveTab("gifts"); setStatusFilter("reported"); }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-colors shrink-0 shadow-lg"
            >
              Review {reportedGifts} {reportedGifts === 1 ? "Report" : "Reports"}
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button 
            onClick={() => setActiveTab("gifts")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${activeTab === "gifts" ? "bg-rose-500 text-white shadow-lg shadow-rose-500/25" : "text-slate-400 hover:text-white hover:bg-slate-900"}`}
          >
            <Sparkles className="w-4 h-4" /> All Gifts ({filteredGifts.length})
          </button>
          <button 
            onClick={() => setActiveTab("reactions")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${activeTab === "reactions" ? "bg-rose-500 text-white shadow-lg shadow-rose-500/25" : "text-slate-400 hover:text-white hover:bg-slate-900"}`}
          >
            <MessageSquare className="w-4 h-4" /> Reactions Feed ({reactionsList.length})
          </button>
          <button 
            onClick={() => setActiveTab("strategy")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${activeTab === "strategy" ? "bg-rose-500 text-white shadow-lg shadow-rose-500/25" : "text-slate-400 hover:text-white hover:bg-slate-900"}`}
          >
            <BookOpen className="w-4 h-4" /> 4 Psychological Pricing Tricks
          </button>
        </div>

        {/* TAB 1: ALL GIFTS MANAGEMENT TABLE */}
        {activeTab === "gifts" && (
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
              <div className="relative w-full md:w-96">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  value={searchQuery} 
                  onChange={e => setSearchQuery(e.target.value)} 
                  placeholder="Search recipient, creator, email, slug..." 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white outline-none focus:border-rose-500 transition-colors"
                />
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                {/* Status Filter */}
                <select 
                  value={statusFilter} 
                  onChange={e => setStatusFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-rose-500"
                >
                  <option value="all">Status: All</option>
                  <option value="reported">Reported ⚠️ ({reportedGifts})</option>
                  <option value="disabled">Disabled 🚫 ({disabledGifts})</option>
                  <option value="paid">Paid Only</option>
                  <option value="unpaid">Unpaid Only</option>
                </select>

                {/* Occasion Filter */}
                <select 
                  value={occasionFilter} 
                  onChange={e => setOccasionFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-rose-500"
                >
                  <option value="all">Occasion: All</option>
                  <option value="family">Family (Time Capsule)</option>
                  <option value="standard">Romantic</option>
                  <option value="birthday">Birthday</option>
                  <option value="proposal">Proposal</option>
                </select>
              </div>
            </div>

            {/* Gifts Table */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-5 py-3.5">Recipient & URL</th>
                      <th className="px-5 py-3.5">Creator Details</th>
                      <th className="px-5 py-3.5">Occasion</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5">Response</th>
                      <th className="px-5 py-3.5">Created</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredGifts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-slate-500">
                          No gifts match your search criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredGifts.map(gift => (
                        <tr key={gift.id} className="hover:bg-slate-800/30 transition-colors">
                          {/* Recipient & URL */}
                          <td className="px-5 py-3.5 font-medium">
                            <div className="text-white font-bold text-sm">{gift.recipientName || "Untitled"}</div>
                            <div className="text-[11px] font-mono text-rose-400 mt-0.5">
                              /for/{gift.slug || gift.id}
                            </div>
                          </td>

                          {/* Creator Details */}
                          <td className="px-5 py-3.5">
                            <div className="text-slate-200">{gift.creatorName || "Anonymous"}</div>
                            <div className="text-[11px] text-slate-400 truncate max-w-[160px]">
                              {gift.creatorEmail || "No email"}
                            </div>
                          </td>

                          {/* Occasion */}
                          <td className="px-5 py-3.5">
                            <span className="capitalize px-2 py-0.5 rounded-md text-[10px] font-bold border border-slate-700 bg-slate-800 text-slate-300">
                              {gift.occasion || "standard"}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-5 py-3.5 space-y-1.5">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {gift.paid ? (
                                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1">
                                  <Check className="w-3 h-3" /> Paid
                                </span>
                              ) : (
                                <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1">
                                  <Lock className="w-3 h-3" /> Unpaid
                                </span>
                              )}

                              {gift.disabled && (
                                <span className="bg-red-500/15 text-red-400 border border-red-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1">
                                  <Ban className="w-3 h-3" /> Disabled
                                </span>
                              )}
                            </div>

                            {gift.reported && (
                              <div>
                                <button 
                                  onClick={() => setActiveReportModal(gift)}
                                  className="bg-red-500/25 text-red-300 hover:bg-red-500/35 border border-red-500/40 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 transition-colors animate-pulse"
                                >
                                  <Flag className="w-3 h-3 text-red-400" /> Reported: {gift.reportReason || "Abuse"}
                                </button>
                              </div>
                            )}
                          </td>

                          {/* Response */}
                          <td className="px-5 py-3.5">
                            {gift.response ? (
                              <button 
                                onClick={() => setActiveReactionModal(gift)}
                                className="bg-pink-500/15 text-pink-400 border border-pink-500/30 hover:bg-pink-500/25 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1"
                              >
                                {gift.response.type === "voice" ? "🎤 Voice Note" : "✍️ Message"}
                              </button>
                            ) : (
                              <span className="text-slate-600 text-[11px] italic">None yet</span>
                            )}
                          </td>

                          {/* Created Date */}
                          <td className="px-5 py-3.5 text-slate-400 text-[11px]">
                            {gift.createdAt?.toMillis 
                              ? new Date(gift.createdAt.toMillis()).toLocaleDateString() 
                              : "Recent"}
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Quick Unlock Toggle */}
                              <button 
                                onClick={() => togglePaidStatus(gift.id, gift.paid)} 
                                disabled={isUpdating}
                                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-colors ${gift.paid ? 'bg-slate-800 text-slate-400 hover:text-amber-400' : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30'}`}
                                title={gift.paid ? "Mark as Unpaid" : "Unlock & Mark as Paid"}
                              >
                                {gift.paid ? "Lock" : "Unlock"}
                              </button>

                              {/* Read Letter */}
                              <button 
                                onClick={() => setActiveLetterModal(gift)}
                                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                                title="Read Letter"
                              >
                                <BookOpen className="w-3.5 h-3.5" />
                              </button>

                              {/* Copy Link */}
                              <button 
                                onClick={() => handleCopy(gift)}
                                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                                title="Copy Gift Link"
                              >
                                {copiedId === gift.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>

                              {/* View Live */}
                              <Link 
                                href={gift.slug ? `/for/${gift.slug}` : `/gift/${gift.id}`} 
                                target="_blank"
                                className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-colors"
                                title="View Live Gift"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>

                              {/* Disable / Ban Toggle */}
                              <button 
                                onClick={() => toggleDisabledStatus(gift.id, gift.disabled)} 
                                disabled={isUpdating}
                                className={`p-1.5 rounded-lg transition-colors ${gift.disabled ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-slate-700'}`}
                                title={gift.disabled ? "Enable Public Access" : "Disable / Ban Link"}
                              >
                                <Ban className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Gift */}
                              <button 
                                onClick={() => handleDeleteGift(gift.id, gift.recipientName)}
                                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-700 transition-colors"
                                title="Delete Gift"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GLOBAL REACTIONS FEED */}
        {activeTab === "reactions" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-pink-400" />
              Recipient Emotional Reaction Feed
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              All voice notes and heartfelt messages sent back to creators after opening their gifts.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reactionsList.length === 0 ? (
                <div className="col-span-full py-16 text-center text-slate-500 bg-slate-900/60 border border-slate-800 rounded-2xl">
                  No recipient reactions submitted yet.
                </div>
              ) : (
                reactionsList.map((item, idx) => (
                  <div key={idx} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-white">
                          From: {item.recipientName}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20">
                          {item.response.type === "voice" ? "🎤 Voice Note" : "✍️ Written"}
                        </span>
                      </div>

                      <div className="text-xs text-slate-400 mb-4">
                        To Creator: <strong className="text-slate-200">{item.creatorName}</strong> ({item.creatorEmail || "No email"})
                      </div>

                      {item.response.type === "voice" ? (
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                          <span className="text-xs text-slate-300 font-mono">Voice Recording</span>
                          <button 
                            onClick={() => playVoiceNote(item.response.content)}
                            className="p-2 rounded-full bg-pink-500 text-white hover:bg-pink-600 transition-colors"
                          >
                            <Play className="w-4 h-4 fill-current" />
                          </button>
                        </div>
                      ) : (
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 italic whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
                          "{item.response.content}"
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-mono">
                        {item.response.createdAt ? new Date(item.response.createdAt).toLocaleDateString() : "Recent"}
                      </span>
                      <Link 
                        href={`/for/${item.slug || item.giftId}`} 
                        target="_blank"
                        className="text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold"
                      >
                        Open Gift <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: 4 PSYCHOLOGICAL PRICING TRICKS STRATEGY */}
        {activeTab === "strategy" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-rose-400" />
                4 Psychological Pricing Tricks to Make $9.99 Feel Like a Steal
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                How to eliminate price resistance for high-emotion digital products without compromising value.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* TRICK 1 */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Trick #1</span>
                  <span className="text-[10px] font-bold bg-rose-500/10 text-rose-300 border border-rose-500/20 px-2 py-0.5 rounded-full">Relativity Bias</span>
                </div>
                <h3 className="text-base font-bold text-white">The "Dead Flowers" Anchor Contrast</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  The human brain cannot judge absolute value—it only judges value relative to an anchor. When compared to a free WhatsApp text, $9.99 sounds like a purchase. But when anchored against what people actually buy:
                </p>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1.5 font-mono">
                  <div className="text-slate-400">• Fresh Flowers: <span className="line-through text-slate-500">$75</span> (Dies in 3 days)</div>
                  <div className="text-slate-400">• Paper Greeting Card: <span className="line-through text-slate-500">$9</span> (Gets thrown away)</div>
                  <div className="text-emerald-400 font-bold">• LoveLink: $9.99 (Permanent digital keepsake forever)</div>
                </div>
                <p className="text-[11px] text-slate-400 italic">
                  <strong>Copy to use on Paywall:</strong> "A bouquet of roses costs $75 and withers in 72 hours. LoveLink costs $9.99 and stays in their heart forever."
                </p>
              </div>

              {/* TRICK 2 */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-pink-400">Trick #2</span>
                  <span className="text-[10px] font-bold bg-pink-500/10 text-pink-300 border border-pink-500/20 px-2 py-0.5 rounded-full">Temporal Discounting</span>
                </div>
                <h3 className="text-base font-bold text-white">The "Permanent Ownership" Framing</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Lump sums trigger the "pain of paying". But in a world of annoying $9.99/month recurring subscriptions, people love <strong>permanent single-payment ownership</strong>.
                </p>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1 font-mono">
                  <div className="text-emerald-400">✓ One-time $9.99 fee</div>
                  <div className="text-emerald-400">✓ 0 subscriptions or hidden renewals</div>
                  <div className="text-emerald-400">✓ Guaranteed hosted forever</div>
                </div>
                <p className="text-[11px] text-slate-400 italic">
                  <strong>Copy to use on Paywall:</strong> "No monthly subscription. Pay $9.99 once, and your love letter is hosted permanently forever."
                </p>
              </div>

              {/* TRICK 3 */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Trick #3</span>
                  <span className="text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded-full">The IKEA Effect</span>
                </div>
                <h3 className="text-base font-bold text-white">Build First, Pay Last (Labor Investment)</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  When a customer spends 5 minutes selecting their favorite photos, writing a letter that makes them tear up, and choosing their special song, they feel profound emotional ownership over the creation.
                </p>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  Abandoning checkout now feels like deleting their own heartfelt love letter. Paying $9.99 to send it is an easy emotional decision.
                </div>
                <p className="text-[11px] text-slate-400 italic">
                  <strong>Rule:</strong> Never ask for payment upfront. Always let them complete the entire masterpiece before the unlock step.
                </p>
              </div>

              {/* TRICK 4 */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Trick #4</span>
                  <span className="text-[10px] font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 px-2 py-0.5 rounded-full">Emotional Assurance</span>
                </div>
                <h3 className="text-base font-bold text-white">The "Goosebumps Keepsake" Value</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Remove hesitation by reminding users of the emotional payoff. It's not about software; it's about making someone cry happy tears.
                </p>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans">
                  "Every LoveLink is permanently preserved in our vault so your partner or parent can re-open it whenever they need a reminder of how much they are loved."
                </div>
                <p className="text-[11px] text-slate-400 italic">
                  <strong>Value:</strong> Focus 100% on emotional impact and permanent memories rather than warranties or returns.
                </p>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* LETTER PREVIEW MODAL */}
      {activeLetterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setActiveLetterModal(null)} />
          <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl max-h-[85vh] flex flex-col">
            <button 
              onClick={() => setActiveLetterModal(null)} 
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500/20" />
              <h3 className="text-lg font-bold text-white">Letter for {activeLetterModal.recipientName}</h3>
            </div>

            <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar bg-slate-950 p-5 rounded-2xl border border-slate-800 text-sm leading-relaxed whitespace-pre-wrap font-serif italic text-slate-200">
              {activeLetterModal.letter || "No letter content written."}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Sign-off: {activeLetterModal.creatorName || "Anonymous"}</span>
              <Link 
                href={activeLetterModal.slug ? `/for/${activeLetterModal.slug}` : `/gift/${activeLetterModal.id}`} 
                target="_blank" 
                className="text-rose-400 font-bold hover:underline flex items-center gap-1"
              >
                Open Recipient Experience <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* REACTION PREVIEW MODAL */}
      {activeReactionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setActiveReactionModal(null)} />
          <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <button 
              onClick={() => setActiveReactionModal(null)} 
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-2">Reaction from {activeReactionModal.recipientName}</h3>
            <p className="text-xs text-slate-400 mb-6">Sent to {activeReactionModal.creatorName} ({activeReactionModal.creatorEmail})</p>

            {activeReactionModal.response?.type === "voice" ? (
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col items-center gap-4">
                <span className="text-sm font-semibold text-white">Voice Note from {activeReactionModal.recipientName}</span>
                <button 
                  onClick={() => playVoiceNote(activeReactionModal.response.content)} 
                  className="w-14 h-14 rounded-full bg-pink-500 hover:bg-pink-600 text-white flex items-center justify-center shadow-lg shadow-pink-500/30 transition-all"
                >
                  <Play className="w-6 h-6 fill-current ml-0.5" />
                </button>
              </div>
            ) : (
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-sm text-slate-200 italic leading-relaxed whitespace-pre-wrap">
                "{activeReactionModal.response?.content || "No message content."}"
              </div>
            )}
          </div>
        </div>
      )}

      {/* ABUSE REPORT DETAILS MODAL */}
      {activeReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setActiveReportModal(null)} />
          <div className="relative bg-slate-900 border border-red-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl">
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

            <div className="space-y-4 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs">
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
