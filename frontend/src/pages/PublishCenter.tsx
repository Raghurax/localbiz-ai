import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';
import { Campaign } from '../types';
import { PageHeader, Card, Badge, Button, Modal, EmptyState, useToast, Skeleton } from '../components/ui';
import { Camera, MessageCircle, ShieldCheck, CheckCircle2, Send, Share2, AlertCircle, Clock, Check } from 'lucide-react';

interface PublishCenterProps {
  initialCampaignId?: string | null;
}

export const PublishCenter: React.FC<PublishCenterProps> = ({ initialCampaignId }) => {
  const { business } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampId, setSelectedCampId] = useState<string>(initialCampaignId || '');
  const [publishLogs, setPublishLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [targetPlatform, setTargetPlatform] = useState<'Instagram' | 'WhatsApp'>('Instagram');
  const [publishLoading, setPublishLoading] = useState(false);
  const { toast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [camps, logs] = await Promise.all([
        apiFetch('/campaigns'),
        apiFetch('/publish/logs')
      ]);
      setCampaigns(camps || []);
      if (!selectedCampId && camps && camps.length > 0) {
        setSelectedCampId(camps[0].id);
      }
      setPublishLogs(logs || []);
    } catch (err: any) {
      toast('Failed to load publish data: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [initialCampaignId]);

  const currentCampaign = campaigns.find((c) => c.id === selectedCampId);
  const igCaption = currentCampaign?.outputs.find((o) => o.output_type === 'instagram_caption')?.content || '';
  const waMessage = currentCampaign?.outputs.find((o) => o.output_type === 'whatsapp_msg')?.content || '';

  const handleOpenSafetyCheck = (platform: 'Instagram' | 'WhatsApp') => {
    setTargetPlatform(platform);
    setShowSafetyModal(true);
  };

  const handleExecutePublish = async () => {
    if (!business || !currentCampaign) return;
    setPublishLoading(true);
    try {
      const content = targetPlatform === 'Instagram' ? igCaption : waMessage;
      const res = await apiFetch('/publish/execute', {
        method: 'POST',
        body: JSON.stringify({
          business_id: business.id,
          campaign_id: currentCampaign.id,
          platform: targetPlatform,
          content_text: content,
          confirmed: true
        })
      });

      setShowSafetyModal(false);
      if (res.publish_result?.status === 'READY_TO_SHARE' && res.publish_result?.share_url) {
        window.open(res.publish_result.share_url, '_blank');
        toast('WhatsApp share window opened', 'success');
      } else {
        toast(res.publish_result?.message || 'Published successfully!', 'success');
      }
      await loadData();
    } catch (err: any) {
      toast('Publish error: ' + err.message, 'error');
    } finally {
      setPublishLoading(false);
    }
  };

  return (
    <div className="page-content max-w-6xl mx-auto px-6 py-8 space-y-6">
      <PageHeader
        title="Publish Center"
        subtitle="Review, approve, and safely distribute campaigns to social media and customer broadcast channels."
        actions={
          campaigns.length > 0 && (
            <select
              value={selectedCampId}
              onChange={(e) => setSelectedCampId(e.target.value)}
              className="text-xs rounded-lg border border-[--color-border] bg-[--color-surface] px-3 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-500 font-medium"
            >
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.language})
                </option>
              ))}
            </select>
          )
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 space-y-4"><Skeleton className="h-6 w-32" /><Skeleton className="h-40 w-full" /></Card>
          <Card className="p-6 space-y-4"><Skeleton className="h-6 w-32" /><Skeleton className="h-40 w-full" /></Card>
        </div>
      ) : !currentCampaign ? (
        <EmptyState
          icon={<Send className="w-6 h-6" />}
          title="No campaigns available"
          description="Create a campaign in the AI Studio first to schedule or publish to social channels."
        />
      ) : (
        <div className="space-y-6">
          {/* Platform Previews */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Instagram Preview Card */}
            <Card className="p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-[--color-border]">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 flex items-center justify-center">
                      <Camera className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">Instagram</h3>
                      <p className="text-[11px] text-slate-400">Post & Stories</p>
                    </div>
                  </div>
                  <Badge variant="neutral">Feed</Badge>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-[--color-border] text-xs text-slate-700 dark:text-slate-300 font-sans leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {igCaption || 'No Instagram caption found in this campaign.'}
                </div>
              </div>

              <div className="pt-3 border-t border-[--color-border] flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Target: Business Account</span>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleOpenSafetyCheck('Instagram')}
                  icon={<Send className="w-3.5 h-3.5" />}
                >
                  Publish to Instagram
                </Button>
              </div>
            </Card>

            {/* WhatsApp Preview Card */}
            <Card className="p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-[--color-border]">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 flex items-center justify-center">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">WhatsApp</h3>
                      <p className="text-[11px] text-slate-400">Broadcast Message</p>
                    </div>
                  </div>
                  <Badge variant="success">1-Click Share</Badge>
                </div>

                <div className="p-4 rounded-lg bg-green-50/50 dark:bg-green-950/20 border border-green-200/50 dark:border-green-800/30 text-xs text-slate-700 dark:text-slate-300 font-sans leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {waMessage || 'No WhatsApp broadcast message found in this campaign.'}
                </div>
              </div>

              <div className="pt-3 border-t border-[--color-border] flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Target: WhatsApp Customers</span>
                <Button
                  variant="primary"
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 focus-visible:ring-green-600"
                  onClick={() => handleOpenSafetyCheck('WhatsApp')}
                  icon={<Share2 className="w-3.5 h-3.5" />}
                >
                  Share to WhatsApp
                </Button>
              </div>
            </Card>
          </div>

          {/* Publishing Activity History */}
          <Card className="p-6">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 mb-4">
              Publication History
            </h3>
            {publishLogs.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                No publication records yet. Trigger your first post above.
              </p>
            ) : (
              <div className="divide-y divide-[--color-border] text-xs">
                {publishLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={log.platform === 'WhatsApp' ? 'success' : 'info'}>
                        {log.platform}
                      </Badge>
                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                        {log.status === 'PUBLISHED' ? 'Broadcast ready' : log.status}
                      </span>
                    </div>
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(log.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Safety Guardrail Pre-flight Modal */}
      <Modal
        isOpen={showSafetyModal}
        onClose={() => setShowSafetyModal(false)}
        title="Pre-Publish Verification"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setShowSafetyModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={publishLoading}
              onClick={handleExecutePublish}
              icon={<Check className="w-3.5 h-3.5" />}
            >
              Confirm & Publish
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Please verify the campaign details before sending to <strong>{targetPlatform}</strong>:
          </p>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-[--color-border] space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Store Name:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{business?.business_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Language:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{currentCampaign?.language}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Offer:</span>
              <span className="font-semibold text-green-600 dark:text-green-400">{currentCampaign?.offer}</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            By proceeding, you confirm that this promotion accurately reflects your store's active deals.
          </p>
        </div>
      </Modal>
    </div>
  );
};