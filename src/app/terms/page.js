import Link from "next/link";
import { ArrowLeft, Shield, AlertTriangle, FileText, Lock, Ban, Heart } from "lucide-react";

export const metadata = {
  title: "Terms of Service & Acceptable Use Policy | LoveLink",
  description: "Terms of Service, Acceptable Use Policy, and Refund Policy for LoveLink digital gifts.",
};

export default function TermsPage() {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" /> Legal & Trust
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white tracking-tight">
            Terms of Service & Acceptable Use Policy
          </h1>
          <p className="text-slate-400 text-sm">
            Last Updated: October 2026 • Effective Immediately
          </p>
        </div>

        {/* Section 1: Agreement to Terms */}
        <section className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-slate-800 text-rose-400 text-xs flex items-center justify-center font-mono">01</span>
            Acceptance of Terms
          </h2>
          <p className="text-slate-300 leading-relaxed text-sm">
            By creating, previewing, purchasing, opening, or interacting with a LoveLink digital keepsake (&quot;Service&quot;), you agree to be bound by these Terms of Service and all incorporated policies. If you do not agree to these terms, you must not access or use the Service.
          </p>
        </section>

        {/* Section 2: Pricing & Strict No-Refund Policy */}
        <section className="space-y-4 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 text-xs flex items-center justify-center font-mono">02</span>
            Pricing &amp; Strict No-Refund Policy
          </h2>
          <div className="space-y-3 text-slate-300 text-sm leading-relaxed">
            <p>
              LoveLink charges a single, one-time fee of <strong>$9.99 USD</strong> (or local currency equivalent, e.g. 99 GHS) per unlocked digital keepsake. There are <strong>no recurring monthly subscriptions</strong>, renewal fees, or hidden charges.
            </p>
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2">
              <div className="font-bold uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                All Sales Are Strictly Final (No Refunds)
              </div>
              <p className="leading-relaxed">
                Because LoveLink provisions immediate persistent cloud infrastructure, dedicated multimedia asset hosting, custom URL slug registration, and un-gated digital access upon completed checkout, <strong>all purchases are strictly non-refundable</strong> once payment has processed.
              </p>
            </div>
            <p className="text-slate-400 text-xs">
              We provide a full, unrestricted interactive builder and preview environment before checkout so creators can verify every photo, message, trivia question, and sound design prior to completing payment.
            </p>
          </div>
        </section>

        {/* Section 3: Acceptable Use & Anti-Harassment Policy */}
        <section className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-slate-800 text-rose-400 text-xs flex items-center justify-center font-mono">03</span>
            Zero-Tolerance Acceptable Use Policy
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            LoveLink was created to express genuine affection, family appreciation, and heartwarming moments. We maintain a strict zero-tolerance policy against malicious or harmful use. You agree NOT to use LoveLink to create or distribute:
          </p>
          <ul className="grid sm:grid-cols-2 gap-3 text-xs text-slate-300">
            <li className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-2.5">
              <Ban className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span><strong>Cyberbullying &amp; Harassment:</strong> Insults, stalking, humiliation, psychological torment, or unwanted persistent messaging.</span>
            </li>
            <li className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-2.5">
              <Ban className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span><strong>Non-Consensual Imagery:</strong> Sexually explicit photos, intimate media shared without consent (revenge porn), or nudity.</span>
            </li>
            <li className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-2.5">
              <Ban className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span><strong>Doxxing &amp; Privacy Invasion:</strong> Publishing private contact details, home addresses, passwords, financial records, or government IDs.</span>
            </li>
            <li className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-2.5">
              <Ban className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span><strong>Extortion &amp; Threats:</strong> Coercion, blackmail, physical threats, or extortion disguised as gifts or countdown puzzles.</span>
            </li>
          </ul>
        </section>

        {/* Section 4: Enforcement & Immediate Link Termination */}
        <section className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-slate-800 text-rose-400 text-xs flex items-center justify-center font-mono">04</span>
            Moderation, Reporting &amp; Link Deactivation
          </h2>
          <div className="space-y-3 text-slate-300 text-sm leading-relaxed">
            <p>
              Every LoveLink features a discrete, persistent <strong>&quot;Report Content&quot;</strong> mechanism accessible to any recipient. When content is flagged:
            </p>
            <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-400 pl-2">
              <li>Our trust and safety team reviews the reported material within 24 hours.</li>
              <li>Links found in breach of this policy are immediately disabled from public access.</li>
              <li>Severe violations (including child exploitation, credible violence threats, or criminal extortion) result in immediate permanent deletion and will be reported to appropriate law enforcement authorities.</li>
            </ol>
            <p className="text-xs text-slate-400">
              Users whose links are terminated due to policy breaches forfeit all fees paid and will not be granted refunds under any circumstances.
            </p>
          </div>
        </section>

        {/* Section 5: Intellectual Property & Content Rights */}
        <section className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-slate-800 text-rose-400 text-xs flex items-center justify-center font-mono">05</span>
            Content Ownership &amp; User Warranty
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            You retain full intellectual ownership of all personal photographs, written letters, and audio recordings you upload. You warrant that you hold all necessary rights and permissions to share any media uploaded to LoveLink. You grant LoveLink a limited, non-exclusive license solely to host, process, and display the keepsake to recipients holding your private link.
          </p>
        </section>

        {/* Section 6: Lifetime Hosting Commitment */}
        <section className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-slate-800 text-rose-400 text-xs flex items-center justify-center font-mono">06</span>
            Permanent Cloud Preservation
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            LoveLink commits to maintaining paid digital keepsakes online for the operational lifespan of the service. In the unlikely event of planned platform discontinuation, registered creators will be notified at least 60 days in advance with the ability to export their full keepsake data.
          </p>
        </section>

        {/* Section 7: Contact */}
        <section className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-2">
          <h3 className="text-base font-bold text-white">Questions or Safety Concerns?</h3>
          <p className="text-xs text-slate-400">
            For legal inquiries, copyright claims (DMCA), or safety reports, contact our Trust &amp; Safety team at{" "}
            <a href="mailto:support@lovelink.app" className="text-rose-400 underline font-medium">support@lovelink.app</a>.
          </p>
        </section>
      </main>
    </div>
  );
}
