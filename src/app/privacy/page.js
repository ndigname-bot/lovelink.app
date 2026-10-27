import Link from "next/link";
import { ArrowLeft, Lock, ShieldCheck, Eye, Trash2, Heart, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | LoveLink",
  description: "Privacy Policy, Data Protection, and GDPR/CCPA Compliance for LoveLink digital keepsakes.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-rose-500/30">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to LoveLink
          </Link>
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <span className="font-serif italic font-bold text-white text-sm">LoveLink</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 md:py-16 space-y-12">
        {/* Title Header */}
        <div className="space-y-4 border-b border-slate-800 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" /> Privacy &amp; Data Security
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-slate-400 text-sm">
            Last Updated: October 2026 • Your personal moments belong to you
          </p>
        </div>

        {/* Introduction */}
        <section className="space-y-4">
          <p className="text-slate-300 leading-relaxed text-sm">
            At LoveLink (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;), we believe personal letters, relationship photos, and intimate voice recordings deserve the highest standard of digital privacy and security. This Privacy Policy details how we collect, store, protect, and handle your data.
          </p>
        </section>

        {/* Section 1: What Information We Collect */}
        <section className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-slate-800 text-emerald-400 text-xs flex items-center justify-center font-mono">01</span>
            Information We Collect
          </h2>
          <div className="grid md:grid-cols-2 gap-4 text-xs text-slate-300">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Content Data You Provide
              </h3>
              <p className="leading-relaxed text-slate-400">
                Uploaded photos, YouTube/multimedia links, personalized trivia questions, custom reasons, heartfelt letters, and audio voice-note reactions.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Account &amp; Billing Data
              </h3>
              <p className="leading-relaxed text-slate-400">
                Your email address (for order confirmation, gift dashboard access, and reaction alerts) and recipient name. We never store credit card or bank credentials on our servers.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: How We Use Your Information */}
        <section className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-slate-800 text-emerald-400 text-xs flex items-center justify-center font-mono">02</span>
            How We Use Your Data
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            We use your data solely to:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-300 pl-2">
            <li>Generate, host, and render your interactive digital keepsake experience.</li>
            <li>Deliver reaction notifications (such as voice notes or written responses) back to the creator.</li>
            <li>Facilitate secure payment processing via certified third-party gateways (Stripe &amp; Paystack).</li>
            <li>Protect platform integrity, investigate abuse reports, and enforce our Acceptable Use Policy.</li>
          </ul>
          <p className="text-xs text-rose-300 font-semibold bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">
            We will NEVER sell your data, use your personal letters or photos to train public AI models, or display your private keepsakes in public search engine directories.
          </p>
        </section>

        {/* Section 3: Link Confidentiality & Security */}
        <section className="space-y-4 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2.5">
            <Lock className="w-5 h-5 text-emerald-400" />
            Link Confidentiality &amp; Infrastructure Security
          </h2>
          <div className="space-y-3 text-slate-300 text-sm leading-relaxed">
            <p>
              Your LoveLink is accessible exclusively to individuals holding the direct, unguessable URL or custom slug. Keepsakes are not listed on search engines (enforced with <code className="text-emerald-400 font-mono text-xs">noindex, nofollow</code> headers).
            </p>
            <p>
              All traffic is encrypted in transit using industry-standard TLS 1.3 encryption. Media assets are stored on enterprise-grade cloud providers with automated redundancy and uptime guarantees.
            </p>
          </div>
        </section>

        {/* Section 4: Third-Party Processors */}
        <section className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-slate-800 text-emerald-400 text-xs flex items-center justify-center font-mono">03</span>
            Third-Party Service Providers
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            We partner with trusted, SOC2/PCI-compliant industry infrastructure to operate LoveLink:
          </p>
          <ul className="grid sm:grid-cols-2 gap-3 text-xs text-slate-300">
            <li className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
              <strong>Stripe &amp; Paystack:</strong> PCI-DSS Level 1 certified payment processing.
            </li>
            <li className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
              <strong>Google Firebase / Cloud:</strong> Secure database hosting, document storage, and security rules.
            </li>
            <li className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
              <strong>Resend:</strong> Transactional receipt and reaction alert emails.
            </li>
            <li className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
              <strong>Vercel:</strong> Global CDN hosting and serverless edge compute.
            </li>
          </ul>
        </section>

        {/* Section 5: Data Deletion & Your Rights (GDPR & CCPA) */}
        <section className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2.5">
            <Trash2 className="w-5 h-5 text-rose-400" />
            Your Right to Erasure (GDPR / CCPA)
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            You maintain full sovereignty over your data. At any time, creators or recipients may request complete deletion of a LoveLink, including all photos, audio files, and letter transcripts.
          </p>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 space-y-2">
            <p>
              To request immediate data deletion, email{" "}
              <a href="mailto:privacy@lovelink.app" className="text-emerald-400 underline font-semibold">
                privacy@lovelink.app
              </a>{" "}
              with your gift link or order email. Deletion requests are processed and verified within 48 business hours.
            </p>
          </div>
        </section>

        {/* Contact */}
        <section className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-2">
          <h3 className="text-base font-bold text-white">Privacy Officer Contact</h3>
          <p className="text-xs text-slate-400">
            If you have questions regarding data privacy or security compliance, email us at{" "}
            <a href="mailto:privacy@lovelink.app" className="text-emerald-400 underline font-medium">privacy@lovelink.app</a>.
          </p>
        </section>
      </main>
    </div>
  );
}
