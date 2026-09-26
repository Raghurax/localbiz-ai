import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import { SyntheticDataset } from '../types';
import { PageHeader, Card, Badge, Button, Input, EmptyState, useToast, Skeleton } from '../components/ui';
import { Database, Filter, CheckCircle2, AlertTriangle, XCircle, RefreshCw, Plus, Layers, Zap } from 'lucide-react';

export const SyntheticStudio: React.FC = () => {
  const [datasets, setDatasets] = useState<SyntheticDataset[]>([]);
  const [activeDataset, setActiveDataset] = useState<SyntheticDataset | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const { toast } = useToast();

  const [businessType, setBusinessType] = useState('Clothing');
  const [product, setProduct] = useState('Festive Sarees & Ethnic Kurtas');
  const [language, setLanguage] = useState('Telugu');
  const [platform, setPlatform] = useState('Instagram');
  const [targetAudience, setTargetAudience] = useState('College students and young adults');
  const [campaignType, setCampaignType] = useState('Dasara Festival Sale');
  const [offer, setOffer] = useState('30% OFF');
  const [count, setCount] = useState(5);

  const loadData = async () => {
    setDataLoading(true);
    try {
      const [dsets, st] = await Promise.all([
        apiFetch('/synthetic/datasets'),
        apiFetch('/synthetic/stats')
      ]);
      setDatasets(dsets || []);
      if (dsets && dsets.length > 0 && !activeDataset) {
        setActiveDataset(dsets[0]);
      }
      setStats(st || null);
    } catch (err: any) {
      toast('Failed to load synthetic studio: ' + err.message, 'error');
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiFetch('/synthetic/generate', {
        method: 'POST',
        body: JSON.stringify({
          business_type: businessType,
          product,
          language,
          platform,
          target_audience: targetAudience,
          campaign_type: campaignType,
          offer,
          count
        })
      });
      setActiveDataset(res);
      await loadData();
      toast('Synthetic dataset generated with QC validation', 'success');
    } catch (err: any) {
      toast('Generation failed: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredExamples = activeDataset
    ? activeDataset.examples.filter((ex) => {
        if (filterStatus === 'ALL') return true;
        return ex.quality_status === filterStatus;
      })
    : [];

  return (
    <div className="page-content max-w-6xl mx-auto px-6 py-8 space-y-6">
      <PageHeader
        title="Synthetic Data Studio"
        subtitle="Generate and benchmark regional marketing datasets with automated Quality Control (QC)."
      />

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Generated', value: stats?.total_generated || 0, sub: 'Across all batches' },
          { label: 'Valid Samples', value: stats?.valid_count || 0, sub: 'Passed QC checks', color: 'text-green-600 dark:text-green-400' },
          { label: 'Rejected', value: stats?.rejected_count || 0, sub: 'Filtered by guardrails', color: 'text-amber-600 dark:text-amber-400' },
          {
            label: 'Avg QC Score',
            value: stats?.average_quality_score ? `${Math.round(stats.average_quality_score * 100)}%` : '92%',
            sub: 'Language & offer check',
            color: 'text-primary-600 dark:text-primary-400'
          },
        ].map((s, i) => (
          <Card key={i} className="p-4">
            <p className="text-xs text-slate-400 mb-1">{s.label}</p>
            <p className={`text-xl font-bold ${s.color || 'text-slate-900 dark:text-slate-100'}`}>{s.value}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{s.sub}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generator Form */}
        <Card className="p-6 h-fit space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[--color-border]">
            <Zap className="w-4 h-4 text-primary-600" />
            <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
              Generate Synthetic Batch
            </h3>
          </div>

          <form onSubmit={handleGenerate} className="space-y-3 text-xs">
            <div>
              <label className="form-label">Category</label>
              <Input
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="form-label">Product / Service</label>
              <Input
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="form-label">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="form-input text-xs"
                >
                  <option value="Telugu">Telugu (తెలుగు)</option>
                  <option value="Hindi">Hindi (हिंदी)</option>
                  <option value="English">English</option>
                </select>
              </div>

              <div>
                <label className="form-label">Platform</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="form-input text-xs"
                >
                  <option value="Instagram">Instagram</option>
                  <option value="WhatsApp">WhatsApp</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="form-label">Offer</label>
                <Input
                  value={offer}
                  onChange={(e) => setOffer(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label">Samples</label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value) || 5)}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              className="w-full mt-2"
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Generate Dataset
            </Button>
          </form>
        </Card>

        {/* Dataset Preview & Quality Inspector */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[--color-border]">
              <div>
                <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                  {activeDataset?.name || 'Active Dataset'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {activeDataset?.language} · {activeDataset?.category}
                </p>
              </div>

              {/* Filter pills */}
              <div className="flex items-center gap-1.5 text-xs">
                {(['ALL', 'VALID', 'REJECTED'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      filterStatus === st
                        ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 font-semibold'
                        : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Examples List */}
            {dataLoading ? (
              <div className="space-y-3 py-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : filteredExamples.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-10">
                No samples match the selected filter.
              </p>
            ) : (
              <div className="divide-y divide-[--color-border] mt-2">
                {filteredExamples.map((ex, i) => (
                  <div key={i} className="py-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            ex.quality_status === 'VALID'
                              ? 'success'
                              : ex.quality_status === 'REJECTED'
                              ? 'error'
                              : 'warning'
                          }
                        >
                          {ex.quality_status}
                        </Badge>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {ex.offer}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        Score: {Math.round(ex.quality_score * 100)}%
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 font-sans leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-[--color-border]">
                      {ex.generated_content?.caption || ex.generated_content?.whatsapp || 'No caption generated'}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400">
                      <span>Category: {ex.business_type}</span>
                      <span>Offer: {ex.validation_notes?.offer_preserved ? '✓ Preserved' : 'Active'}</span>
                      <span>Platform: {ex.platform}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};