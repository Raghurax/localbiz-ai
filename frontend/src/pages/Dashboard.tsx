import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';
import { Campaign, BusinessAsset } from '../types';
import {
  Wand2, Image as ImageIcon, Film, Send, Database,
  ArrowRight, Calendar, FileText, LayoutDashboard, TrendingUp, Plus
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

const QUICK_ACTIONS = [
  { title: 'Create Campaign', icon: Wand2, desc: 'Instagram · WhatsApp · Reel', tab: 'assistant', primary: true },
  { title: 'AI Assistant', icon: FileText, desc: 'Chat or speak your idea', tab: 'assistant', primary: false },
  { title: 'Asset Library', icon: ImageIcon, desc: 'Images, logos, products', tab: 'assets', primary: false },
  { title: 'Publish Center', icon: Send, desc: 'Schedule & publish', tab: 'publish', primary: false },
];

function SkeletonCard() {
  return (
    <div className="card p-5 space-y-3">
      <div className="skeleton h-3 w-20 rounded" />
      <div className="skeleton h-5 w-32 rounded" />
      <div className="skeleton h-3 w-full rounded" />
      <div className="skeleton h-3 w-3/4 rounded" />
    </div>
  );
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { business } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [assets, setAssets] = useState<BusinessAsset[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [camps, asts, st] = await Promise.all([
          apiFetch('/campaigns'),
          apiFetch('/business/assets'),
          apiFetch('/synthetic/stats'),
        ]);
        setCampaigns(camps || []);
        setAssets(asts || []);
        setStats(st || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="page-content max-w-6xl mx-auto px-6 py-8 space-y-8">

      {/* ── Welcome ── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{greeting}</p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {business?.business_name || 'Your Business'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {business?.business_category}{business?.location ? ` · ${business.location}` : ''}
          </p>
        </div>
        <button
          onClick={() => onNavigate('assistant')}
          className="btn-primary btn-md shrink-0 font-semibold"
        >
          <Plus className="w-4 h-4" />
          Create Campaign
        </button>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Campaigns', value: campaigns.length, sub: 'Total created', color: 'text-primary-600 dark:text-primary-400' },
          { label: 'Assets', value: assets.length, sub: 'Images & logos', color: 'text-slate-900 dark:text-slate-100' },
          { label: 'Quality Score', value: stats?.average_quality_score ? Math.round(stats.average_quality_score * 100) + '%' : '—', sub: 'AI content quality', color: 'text-green-600 dark:text-green-400' },
          { label: 'Data Samples', value: stats?.total_generated || 0, sub: 'Synthetic generated', color: 'text-slate-900 dark:text-slate-100' },
        ].map((s, i) => (
          <div key={i} className="card p-5">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Quick Actions ── */}
      <div>
        <p className="section-label mb-4">Quick actions</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map((act, i) => {
            const Icon = act.icon;
            return (
              <button
                key={i}
                onClick={() => onNavigate(act.tab)}
                className={`card-hover p-5 text-left group transition-all ${act.primary ? 'ring-1 ring-primary-200 dark:ring-primary-900/40' : ''}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${act.primary ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{act.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{act.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Recent Campaigns ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="section-label">Recent campaigns</p>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SkeletonCard /><SkeletonCard /><SkeletonCard />
          </div>
        ) : campaigns.length === 0 ? (
          <div className="card border-dashed p-12 text-center">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <Wand2 className="w-5 h-5 text-slate-400" />
            </div>
            <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">No campaigns yet</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5 max-w-xs mx-auto">
              Create your first marketing campaign and it will appear here.
            </p>
            <button
              onClick={() => onNavigate('assistant')}
              className="btn-primary btn-sm font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              Create your first campaign
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {campaigns.slice(0, 3).map((camp) => (
              <div key={camp.id} className="card-hover p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="badge-primary">{camp.language}</span>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Calendar className="w-3 h-3" />
                      {new Date(camp.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 leading-snug mb-1.5">
                    {camp.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {camp.raw_user_prompt}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-[--color-border]">
                  <span className="badge-success">{camp.offer || 'Special Offer'}</span>
                  <button
                    onClick={() => onNavigate('assistant')}
                    className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    Open →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};