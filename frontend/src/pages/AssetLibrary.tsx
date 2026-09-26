import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import { BusinessAsset } from '../types';
import { PageHeader, Card, Badge, Button, EmptyState, useToast, Skeleton } from '../components/ui';
import { Upload, Image as ImageIcon, Film, Trash2, Tag, Calendar, Download } from 'lucide-react';

export const AssetLibrary: React.FC = () => {
  const [assets, setAssets] = useState<BusinessAsset[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('product');
  const [filterType, setFilterType] = useState<string>('all');
  const { toast } = useToast();

  const loadAssets = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/business/assets');
      setAssets(data || []);
    } catch (err: any) {
      toast('Failed to load assets: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('file_type', selectedType);

      await apiFetch('/business/assets/upload', {
        method: 'POST',
        body: formData
      });
      await loadAssets();
      toast('Asset uploaded successfully', 'success');
    } catch (err: any) {
      toast('Upload failed: ' + err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;
    try {
      await apiFetch('/business/assets/' + id, { method: 'DELETE' });
      setAssets((prev) => prev.filter((a) => a.id !== id));
      toast('Asset deleted', 'success');
    } catch (err: any) {
      toast('Delete failed: ' + err.message, 'error');
    }
  };

  const filteredAssets = filterType === 'all'
    ? assets
    : assets.filter((a) => a.file_type === filterType);

  return (
    <div className="page-content max-w-6xl mx-auto px-6 py-8 space-y-6">
      <PageHeader
        title="Asset Library"
        subtitle="Manage product photos, store logos, and media references for your marketing campaigns."
        actions={
          <div className="flex items-center gap-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="text-xs rounded-lg border border-[--color-border] bg-[--color-surface] px-3 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="product">Product Photo</option>
              <option value="logo">Store Logo</option>
              <option value="shop">Storefront</option>
              <option value="video">Video Clip</option>
            </select>

            <label className="btn-primary btn-sm cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>{uploading ? 'Uploading...' : 'Upload Asset'}</span>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 border-b border-[--color-border] pb-3 text-xs">
        {['all', 'product', 'logo', 'shop', 'video'].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1 rounded-md font-medium capitalize transition-colors ${
              filterType === type
                ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 font-semibold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            {type === 'all' ? `All (${assets.length})` : type}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="overflow-hidden space-y-2 p-0">
              <Skeleton className="aspect-square w-full" />
              <div className="p-3 space-y-1.5">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      ) : filteredAssets.length === 0 ? (
        <EmptyState
          icon={<ImageIcon className="w-6 h-6" />}
          title="No assets found"
          description={
            filterType === 'all'
              ? 'Upload logos, saree/dress photos, or store photos to use in campaigns.'
              : `No assets in the "${filterType}" category.`
          }
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredAssets.map((asset) => (
            <Card
              key={asset.id}
              hover
              className="overflow-hidden flex flex-col justify-between group p-0"
            >
              <div className="relative aspect-square bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                {asset.file_type === 'video' ? (
                  <Film className="w-10 h-10 text-slate-400" />
                ) : (
                  <img
                    src={asset.file_path}
                    alt={asset.file_name}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-200"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                )}
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-slate-900/70 text-white backdrop-blur-xs">
                  {asset.file_type}
                </span>
              </div>

              <div className="p-3 flex items-center justify-between text-xs border-t border-[--color-border]">
                <div className="truncate pr-2">
                  <p className="font-semibold text-slate-800 dark:text-slate-200 truncate leading-tight">
                    {asset.file_name}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {new Date(asset.created_at).toLocaleDateString()}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-7 w-7 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                  onClick={() => handleDelete(asset.id)}
                  title="Delete asset"
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