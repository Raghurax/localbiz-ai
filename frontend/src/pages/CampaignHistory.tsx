import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import { Campaign } from '../types';
import { PageHeader, Card, Badge, Button, EmptyState, useToast, Skeleton } from '../components/ui';
import { History, Copy, Trash2, Download, Share2, Calendar, Plus, ExternalLink } from 'lucide-react';

interface CampaignHistoryProps {
  onOpenCampaign: (camp: Campaign) => void;
  onNavigateToPublish: (campId: string) => void;
}

export const CampaignHistory: React.FC<CampaignHistoryProps> = ({
  onOpenCampaign,
  onNavigateToPublish
}) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/campaigns');
      setCampaigns(data || []);
    } catch (err: any) {
      toast('Failed to load campaigns: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    try {
      await apiFetch('/campaigns/' + id, { method: 'DELETE' });
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
      toast('Campaign deleted successfully', 'success');
    } catch (err: any) {
      toast('Delete failed: ' + err.message, 'error');
    }
  };

  const handleDuplicate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const dup = await apiFetch('/campaigns/' + id + '/duplicate', { method: 'POST' });
      setCampaigns((prev) => [dup, ...prev]);
      toast('Campaign duplicated', 'success');
    } catch (err: any) {
      toast('Duplicate failed: ' + err.message, 'error');
    }
  };

  const handleDownloadZip = async (camp: Campaign, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const blob = await apiFetch('/campaigns/' + camp.id + '/export-zip');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'campaign_' + camp.name.replace(/\s+/g, '_') + '.zip';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast('Campaign package ZIP downloaded', 'success');
    } catch (err: any) {
      toast('Failed to download ZIP: ' + err.message, 'error');
    }
  };

  return (
    <div className="page-content max-w-6xl mx-auto px-6 py-8 space-y-6">
      <PageHeader
        title="Campaigns"
        subtitle="Manage saved campaigns, export ZIP packages, or push to social channels."
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => onOpenCampaign({} as Campaign)}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            New Campaign
          </Button>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-5 space-y-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-8 w-full" />
            </Card>
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <EmptyState
          icon={<History className="w-6 h-6" />}
          title="No campaigns yet"
          description="Create your first localized marketing campaign in the AI Studio."
          action={
            <Button
              variant="primary"
              size="md"
              onClick={() => onOpenCampaign({} as Campaign)}
              icon={<Plus className="w-4 h-4" />}
            >
              Create Campaign
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((camp) => (
            <Card
              key={camp.id}
              hover
              className="p-5 flex flex-col justify-between cursor-pointer"
              onClick={() => onOpenCampaign(camp)}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="primary">{camp.language}</Badge>
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Calendar className="w-3 h-3" />
                    {new Date(camp.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>

                <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 line-clamp-1 mb-1">
                  {camp.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
                  {camp.raw_user_prompt}
                </p>

                <div className="flex items-center gap-2">
                  <Badge variant="success">{camp.offer || 'Offer Active'}</Badge>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500">{camp.platform}</span>
                </div>
              </div>

              <div
                className="mt-4 pt-3 border-t border-[--color-border] flex items-center justify-between"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1.5 h-7 w-7"
                    onClick={(e) => handleDownloadZip(camp, e)}
                    title="Download ZIP package"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1.5 h-7 w-7"
                    onClick={(e) => handleDuplicate(camp.id, e)}
                    title="Duplicate campaign"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1.5 h-7 w-7"
                    onClick={() => onNavigateToPublish(camp.id)}
                    title="Publish Center"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1.5 h-7 w-7 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                  onClick={(e) => handleDelete(camp.id, e)}
                  title="Delete campaign"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};