import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';
import { PageHeader, Card, Button, Input, Textarea, useToast } from '../components/ui';
import { Store, MapPin, Users, Phone, CheckCircle2, Save } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const { business, refreshProfile } = useAuth();
  const { toast } = useToast();

  const [form, setForm] = useState({
    business_name: business?.business_name || 'Sri Lakshmi Fashion Store',
    business_category: business?.business_category || 'Clothing & Ethnic Wear',
    business_description:
      business?.business_description ||
      'Exclusive boutique offering authentic Kanjeevaram sarees, designer lehengas, trendy kurtis, and festive wear.',
    location: business?.location || 'KPHB Colony, Hyderabad & Benz Circle, Vijayawada',
    target_audience:
      business?.target_audience || 'College students, modern brides, festive shoppers and young families',
    products_services:
      business?.products_services || 'Kanchi Pattu Sarees, Designer Kurtas, Ethnic Lehengas, Handloom Cotton Wear',
    preferred_language: business?.preferred_language || 'Telugu',
    secondary_language: business?.secondary_language || 'English',
    brand_tone: business?.brand_tone || 'Warm, Festive & Energetic',
    contact_details: business?.contact_details || '+91 98765 43210',
    logo_url: business?.logo_url || '/uploads/sri_lakshmi_logo.png'
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiFetch('/business/onboarding', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      await refreshProfile();
      toast('Store profile saved successfully', 'success');
      setTimeout(() => {
        onComplete();
      }, 600);
    } catch (err: any) {
      toast('Failed to save profile: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content max-w-3xl mx-auto px-6 py-8 space-y-6">
      <PageHeader
        title="Store Profile & Settings"
        subtitle="The AI Assistant uses this information to personalize tone, languages, and store branding."
      />

      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                label="Business Name *"
                required
                value={form.business_name}
                onChange={(e) => setForm({ ...form, business_name: e.target.value })}
              />
            </div>

            <div>
              <Input
                label="Business Category *"
                required
                value={form.business_category}
                onChange={(e) => setForm({ ...form, business_category: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Textarea
              label="Store Description"
              rows={2}
              value={form.business_description}
              onChange={(e) => setForm({ ...form, business_description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                label="Store Location / City"
                icon={<MapPin className="w-4 h-4 text-slate-400" />}
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>

            <div>
              <Input
                label="Target Audience"
                icon={<Users className="w-4 h-4 text-slate-400" />}
                value={form.target_audience}
                onChange={(e) => setForm({ ...form, target_audience: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Input
              label="Products & Services"
              value={form.products_services}
              onChange={(e) => setForm({ ...form, products_services: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="form-label">Primary Language</label>
              <select
                value={form.preferred_language}
                onChange={(e) => setForm({ ...form, preferred_language: e.target.value })}
                className="form-input text-xs"
              >
                <option value="Telugu">Telugu (తెలుగు)</option>
                <option value="English">English</option>
                <option value="Hindi">Hindi (हिन्दी)</option>
              </select>
            </div>

            <div>
              <Input
                label="Brand Tone"
                value={form.brand_tone}
                onChange={(e) => setForm({ ...form, brand_tone: e.target.value })}
              />
            </div>

            <div>
              <Input
                label="WhatsApp / Contact Phone"
                icon={<Phone className="w-4 h-4 text-slate-400" />}
                value={form.contact_details}
                onChange={(e) => setForm({ ...form, contact_details: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[--color-border] flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              icon={<Save className="w-3.5 h-3.5" />}
            >
              Save Profile
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};