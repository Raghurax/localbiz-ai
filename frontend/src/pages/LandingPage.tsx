import React from 'react';
import { Hero3DScene } from '../components/3d/Hero3DScene';
import { Floating3DBadges } from '../components/3d/Floating3DBadges';
import {
  Sparkles,
  ArrowRight,
  Wand2,
  Globe,
  Mic,
  Share2,
  TrendingUp,
  Users
} from 'lucide-react';

interface LandingPageProps {
  onStartCreating: () => void;
  onTryAssistant: () => void;
}

const FEATURES = [
  {
    icon: Mic,
    title: 'Voice-First',
    desc: 'Speak in Telugu, Hindi, or English — Gemini AI understands your natural spoken offer.',
    color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/40',
  },
  {
    icon: Wand2,
    title: 'Instant Campaigns',
    desc: 'Complete multi-channel pack — caption, marketing poster, WhatsApp message & reel script.',
    color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
  },
  {
    icon: Globe,
    title: 'Trilingual Output',
    desc: 'Telugu, Hindi, and English. Generated campaigns accurately preserve your offer and brand.',
    color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/40',
  },
  {
    icon: Share2,
    title: 'One-Tap WhatsApp Share',
    desc: 'Share combined poster image + caption text directly to customer WhatsApp in one tap.',
    color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40',
  },
  {
    icon: TrendingUp,
    title: 'Smart Offer NLU',
    desc: 'Understands regional phrasing like "ఒకటి కొంటే ఒకటి ఫ్రీ" or "30% రాయితీ" automatically.',
    color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/40',
  },
  {
    icon: Users,
    title: 'Built for Local Shops',
    desc: 'No marketing expertise required. Designed for authentic local retail store owners.',
    color: 'text-teal-500 bg-teal-50 dark:bg-teal-950/40',
  },
];

const HOW_STEPS = [
  {
    step: '1',
    title: 'Speak or Type Your Offer',
    desc: 'Say anything naturally — "దీపావళి పండక్కి ఒకటి కొంటే ఒకటి ఉచితం" or "Flat 30% discount on festive sarees".',
    badge: 'bg-sky-600 text-white',
  },
  {
    step: '2',
    title: 'AI Crafts Your Entire Campaign',
    desc: 'Gemini creates authentic Instagram caption, WhatsApp blast, timed reel storyboard & renders a high-res poster.',
    badge: 'bg-teal-600 text-white',
  },
  {
    step: '3',
    title: 'Share Poster + Text Together',
    desc: '1-tap WhatsApp sharing attaches the poster visual and caption text together for maximum customer engagement.',
    badge: 'bg-emerald-600 text-white',
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onStartCreating, onTryAssistant }) => {
  return (
    <div className="relative min-h-screen bg-[--color-bg] text-[--color-text-primary] overflow-hidden">
      {/* ── 3D THREE.JS WEBGL INTERACTIVE CANVAS ── */}
      <Hero3DScene />

      {/* ── HERO SECTION ── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        {/* Interactive Trilingual Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/80 text-sky-700 dark:text-sky-300 text-xs font-semibold mb-8 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          <span>3D Interactive AI Marketing Engine for Regional India</span>
        </div>

        {/* Main Headline with Blue & Green Gradient */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-slate-50 leading-[1.14] mb-6">
          Empowering Local Stores with <br />
          <span className="bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 bg-clip-text text-transparent">
            Hyper-Localized AI Marketing
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10">
          Speak in Telugu, Hindi, or English. LocalBiz AI understands small business nuances, extracts your promotional offers accurately, and generates posters, WhatsApp broadcasts, and viral reel scripts in seconds.
        </p>

        {/* Primary CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onStartCreating}
            className="btn-primary btn-lg w-full sm:w-auto text-sm font-semibold bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-700 hover:to-emerald-700 text-white shadow-md shadow-sky-600/25 flex items-center justify-center gap-2"
          >
            <Wand2 className="w-4 h-4" />
            <span>Start Creating Free</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onTryAssistant}
            className="btn-secondary btn-lg w-full sm:w-auto text-sm font-medium border-sky-300 dark:border-sky-700 text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40 flex items-center justify-center gap-2"
          >
            <Mic className="w-4 h-4 text-emerald-500" />
            <span>Try Voice Assistant</span>
          </button>
        </div>

        {/* Regional Language Badges Strip */}
        <p className="mt-8 text-xs text-slate-400 dark:text-slate-500 font-medium">
          Supports <span className="text-sky-600 dark:text-sky-400 font-semibold">తెలుగు</span> · <span className="text-emerald-600 dark:text-emerald-400 font-semibold">हिंदी</span> · <span className="text-cyan-600 dark:text-cyan-400 font-semibold">English</span> &nbsp;·&nbsp; WhatsApp &amp; Instagram &nbsp;·&nbsp; 3D Interactive
        </p>
      </section>

      {/* ── 3D FLOATING INTERACTIVE BADGES ── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-12">
        <Floating3DBadges />
      </section>

      {/* ── 3-STEP HOW IT WORKS ── */}
      <section className="relative z-10 bg-white/80 dark:bg-[#1A1D27]/80 backdrop-blur-md border-y border-slate-200 dark:border-[#1E2235] py-16">
        <div className="max-w-5xl mx-auto px-6">
          <p className="section-label text-center text-sky-600 dark:text-sky-400 mb-2">Simple 3-Step Flow</p>
          <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-slate-100 mb-8">
            How LocalBiz AI Works for Your Store
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_STEPS.map((s) => (
              <div key={s.step} className="card p-6 border-slate-200 dark:border-slate-800">
                <div className={`w-8 h-8 rounded-lg ${s.badge} text-sm font-bold flex items-center justify-center mb-4 shadow-xs`}>
                  {s.step}
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">{s.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6-FEATURE GRID ── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p className="section-label text-emerald-600 dark:text-emerald-400 mb-2">Designed for Retailers</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
            Everything your store needs to grow
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="card-hover p-6 group">
                <div className={`w-9 h-9 rounded-lg ${f.color} flex items-center justify-center mb-4 transition-transform group-hover:scale-105`}>
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 mb-1">{f.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── BLUE & GREEN GRADIENT CALL TO ACTION ── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-20">
        <div className="rounded-2xl bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600 text-white p-10 text-center shadow-lg shadow-sky-600/20">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Ready to launch your festive promotion?</h2>
          <p className="text-sky-100 text-sm mb-8 max-w-md mx-auto">
            Speak or type in Telugu, Hindi or English. Get high-converting WhatsApp &amp; Instagram campaigns in seconds.
          </p>
          <button
            onClick={onStartCreating}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-emerald-700 font-semibold text-sm hover:bg-sky-50 transition-colors shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-sky-600" />
            Get Started Free
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-slate-200 dark:border-[#1E2235] py-8 bg-white/50 dark:bg-slate-950/50 backdrop-blur-xs">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 dark:text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-gradient-to-tr from-sky-500 to-emerald-500 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="font-semibold text-slate-700 dark:text-slate-300">LocalBiz AI</span>
          </div>
          <p>© 2026 LocalBiz AI · Telugu · Hindi · English · Ocean Blue &amp; Emerald Green Theme</p>
        </div>
      </footer>
    </div>
  );
};