import React, { useState, useEffect, useRef } from 'react';
import { TemplateConfig, TemplateZone, ZoneId } from '../types/template';
import { renderPosterToCanvas } from '../utils/templateRenderer';
import { Card, Button, Badge } from './ui';
import { X, Copy, Check, RefreshCw, Eye, Move, Sliders, Code } from 'lucide-react';

interface TemplateZoneEditorProps {
  isOpen: boolean;
  onClose: () => void;
  templates: TemplateConfig[];
  currentTemplateIndex: number;
  onSelectTemplate: (index: number) => void;
  onUpdateTemplateConfig: (updated: TemplateConfig) => void;
  onResetTemplates: () => void;
}

export const TemplateZoneEditor: React.FC<TemplateZoneEditorProps> = ({
  isOpen,
  onClose,
  templates,
  currentTemplateIndex,
  onSelectTemplate,
  onUpdateTemplateConfig,
  onResetTemplates,
}) => {
  const [selectedZoneId, setSelectedZoneId] = useState<string>('headline');
  const [copiedJson, setCopiedJson] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [showJsonModal, setShowJsonModal] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const activeTemplate = templates[currentTemplateIndex] || templates[0];
  const selectedZone = activeTemplate.zones.find((z) => z.id === selectedZoneId) || activeTemplate.zones[0];

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    const sampleContent = {
      business_name: 'SRI LAKSHMI TEXTILES',
      headline: 'FESTIVE MEGA CELEBRATION',
      subtitle: 'Exclusive discounts & brand new collection available',
      offer: 'FLAT 30% OFF',
      cta: 'VISIT OUR STORE TODAY',
      contact: '📞 98765 43210 • MAIN ROAD, BESIDE CLOCK TOWER',
      language: 'en',
    };

    renderPosterToCanvas(canvasRef.current, activeTemplate, sampleContent).catch((e) =>
      console.warn('Canvas render error in zone editor:', e)
    );
  }, [isOpen, activeTemplate]);

  if (!isOpen) return null;

  const handleZoneChange = (field: keyof TemplateZone, val: any) => {
    if (!selectedZone) return;
    const updatedZones = activeTemplate.zones.map((zone) => {
      if (zone.id === selectedZone.id) {
        return { ...zone, [field]: val };
      }
      return zone;
    });

    const updatedTemplate: TemplateConfig = {
      ...activeTemplate,
      zones: updatedZones,
    };
    onUpdateTemplateConfig(updatedTemplate);
  };

  const handleCopyJson = () => {
    const jsonStr = JSON.stringify(activeTemplate, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Interactive Template Zone Editor
                <Badge variant="primary">Developer & Designer Tool</Badge>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Precision zone adjustment overlaying original template background
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowJsonModal(!showJsonModal)}
              icon={<Code className="w-3.5 h-3.5" />}
            >
              JSON
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopyJson}
              icon={copiedJson ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            >
              {copiedJson ? 'Copied!' : 'Copy Config'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetTemplates}
              title="Reset all templates to defaults"
              icon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Reset
            </Button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Template Selector Bar */}
        <div className="px-6 py-2.5 bg-slate-100/60 dark:bg-slate-800/20 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 overflow-x-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider shrink-0">
              Active Template:
            </span>
            <div className="flex items-center gap-1.5">
              {templates.map((tpl, idx) => (
                <button
                  key={tpl.id}
                  onClick={() => onSelectTemplate(idx)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                    currentTemplateIndex === idx
                      ? 'bg-primary-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {idx + 1}. {tpl.name.split(' ')[0]} {tpl.name.split(' ')[1] || ''}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowOverlay(!showOverlay)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border transition ${
              showOverlay
                ? 'bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-800'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{showOverlay ? 'Zone Overlays ON' : 'Zone Overlays OFF'}</span>
          </button>
        </div>

        {/* Main Content: Left Canvas Preview + Right Zone Controls */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto">
          {/* Canvas Preview Area */}
          <div className="lg:col-span-7 p-6 bg-slate-950/10 dark:bg-slate-950/40 flex items-center justify-center border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800">
            <div className="relative w-full max-w-[460px] aspect-square rounded-xl overflow-hidden shadow-xl border border-slate-300 dark:border-slate-800 bg-slate-900 select-none">
              <canvas
                ref={canvasRef}
                className="w-full h-full object-contain block"
              />

              {/* Interactive Zone Overlays */}
              {showOverlay && (
                <div className="absolute inset-0 pointer-events-none">
                  {activeTemplate.zones.map((zone) => {
                    const isSelected = selectedZone?.id === zone.id;
                    const leftPct = (zone.x / activeTemplate.width) * 100;
                    const topPct = (zone.y / activeTemplate.height) * 100;
                    const widthPct = (zone.width / activeTemplate.width) * 100;
                    const heightPct = (zone.height / activeTemplate.height) * 100;

                    return (
                      <div
                        key={zone.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedZoneId(zone.id);
                        }}
                        style={{
                          left: `${leftPct}%`,
                          top: `${topPct}%`,
                          width: `${widthPct}%`,
                          height: `${heightPct}%`,
                        }}
                        className={`absolute pointer-events-auto cursor-pointer transition-all duration-150 flex flex-col justify-between p-1 rounded ${
                          isSelected
                            ? 'border-2 border-yellow-400 bg-yellow-400/25 ring-2 ring-yellow-400/40 z-20'
                            : 'border border-sky-400/70 bg-sky-500/10 hover:bg-sky-500/20 z-10'
                        }`}
                        title={`Zone: ${zone.id}`}
                      >
                        <div className="flex items-center justify-between leading-none">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                              isSelected
                                ? 'bg-yellow-400 text-slate-950 font-black'
                                : 'bg-slate-900/80 text-sky-300'
                            }`}
                          >
                            {zone.id}
                          </span>
                          <span className="text-[8px] text-slate-200/80 font-mono bg-slate-900/60 px-1 rounded">
                            {zone.width}×{zone.height}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Inspector & Parameter Controls */}
          <div className="lg:col-span-5 p-6 flex flex-col space-y-5 overflow-y-auto">
            {/* Zone Selector Chips */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Select Layout Zone:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {activeTemplate.zones.map((zone) => (
                  <button
                    key={zone.id}
                    onClick={() => setSelectedZoneId(zone.id)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold capitalize transition ${
                      selectedZone?.id === zone.id
                        ? 'bg-yellow-400 text-slate-950 shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {zone.id.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {selectedZone && (
              <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Move className="w-4 h-4 text-primary-500" />
                    Coordinates & Size (px)
                  </span>
                  <Badge variant="neutral">Canvas 1080×1080</Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 block mb-1">X Pos</label>
                    <input
                      type="number"
                      value={selectedZone.x}
                      onChange={(e) => handleZoneChange('x', parseInt(e.target.value) || 0)}
                      className="form-input text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 block mb-1">Y Pos</label>
                    <input
                      type="number"
                      value={selectedZone.y}
                      onChange={(e) => handleZoneChange('y', parseInt(e.target.value) || 0)}
                      className="form-input text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 block mb-1">Width</label>
                    <input
                      type="number"
                      value={selectedZone.width}
                      onChange={(e) => handleZoneChange('width', parseInt(e.target.value) || 0)}
                      className="form-input text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 block mb-1">Height</label>
                    <input
                      type="number"
                      value={selectedZone.height}
                      onChange={(e) => handleZoneChange('height', parseInt(e.target.value) || 0)}
                      className="form-input text-xs"
                    />
                  </div>
                </div>

                {/* Typography Controls for Text Zones */}
                {selectedZone.type === 'text' && (
                  <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                      Typography & Styling
                    </span>

                    <div className="grid grid-cols-3 gap-2.5">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-500 block mb-1">Font Size</label>
                        <input
                          type="number"
                          value={selectedZone.fontSize || 32}
                          onChange={(e) => handleZoneChange('fontSize', parseInt(e.target.value) || 20)}
                          className="form-input text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-500 block mb-1">Font Weight</label>
                        <select
                          value={selectedZone.fontWeight || 600}
                          onChange={(e) => handleZoneChange('fontWeight', parseInt(e.target.value) || 600)}
                          className="form-input text-xs"
                        >
                          <option value="400">Regular (400)</option>
                          <option value="500">Medium (500)</option>
                          <option value="600">Semibold (600)</option>
                          <option value="700">Bold (700)</option>
                          <option value="800">ExtraBold (800)</option>
                          <option value="900">Black (900)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-500 block mb-1">Align</label>
                        <select
                          value={selectedZone.align || 'center'}
                          onChange={(e) => handleZoneChange('align', e.target.value as any)}
                          className="form-input text-xs"
                        >
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-500 block mb-1">Text Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={selectedZone.color || '#FFFFFF'}
                            onChange={(e) => handleZoneChange('color', e.target.value)}
                            className="w-7 h-7 rounded border border-slate-300 dark:border-slate-700 cursor-pointer p-0 bg-transparent"
                          />
                          <input
                            type="text"
                            value={selectedZone.color || '#FFFFFF'}
                            onChange={(e) => handleZoneChange('color', e.target.value)}
                            className="form-input text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-500 block mb-1">Badge Style</label>
                        <select
                          value={selectedZone.badgeStyle || 'none'}
                          onChange={(e) => handleZoneChange('badgeStyle', e.target.value as any)}
                          className="form-input text-xs"
                        >
                          <option value="none">None (Plain Text)</option>
                          <option value="pill">Pill Badge</option>
                          <option value="card">Card Panel</option>
                          <option value="rosette">Circular Rosette</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-500 block mb-1">Outline / Halo Color</label>
                        <input
                          type="text"
                          value={selectedZone.strokeColor || ''}
                          placeholder="#0A193C or rgba(255,255,255,0.9)"
                          onChange={(e) => handleZoneChange('strokeColor', e.target.value)}
                          className="form-input text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-500 block mb-1">Outline Width (px)</label>
                        <input
                          type="number"
                          value={selectedZone.strokeWidth || 0}
                          onChange={(e) => handleZoneChange('strokeWidth', parseInt(e.target.value) || 0)}
                          className="form-input text-xs"
                        />
                      </div>
                    </div>

                    {selectedZone.badgeStyle && selectedZone.badgeStyle !== 'none' && (
                      <div className="grid grid-cols-2 gap-2.5 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                        <div>
                          <label className="text-[11px] font-semibold text-slate-500 block mb-1">Badge Background</label>
                          <input
                            type="text"
                            value={selectedZone.badgeBg || ''}
                            placeholder="rgba(0,0,0,0.5) or #HEX"
                            onChange={(e) => handleZoneChange('badgeBg', e.target.value)}
                            className="form-input text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-slate-500 block mb-1">Badge Border</label>
                          <input
                            type="text"
                            value={selectedZone.badgeBorder || ''}
                            placeholder="#FACC15"
                            onChange={(e) => handleZoneChange('badgeBorder', e.target.value)}
                            className="form-input text-xs font-mono"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Image Specific Controls */}
                {selectedZone.type === 'image' && (
                  <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                      Product Frame Settings
                    </span>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-500 block mb-1">Image Fit</label>
                        <select
                          value={selectedZone.fit || 'contain'}
                          onChange={(e) => handleZoneChange('fit', e.target.value as any)}
                          className="form-input text-xs"
                        >
                          <option value="contain">Contain (Preserve Aspect)</option>
                          <option value="cover">Cover (Fill Frame)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-500 block mb-1">Corner Radius</label>
                        <input
                          type="number"
                          value={selectedZone.badgeRadius || 20}
                          onChange={(e) => handleZoneChange('badgeRadius', parseInt(e.target.value) || 0)}
                          className="form-input text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Live JSON Inspector Modal */}
        {showJsonModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80">
            <Card className="w-full max-w-2xl max-h-[80vh] flex flex-col p-5 space-y-3 shadow-2xl">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Code className="w-4 h-4 text-primary-500" />
                  Template Zones JSON Configuration
                </h3>
                <button
                  onClick={() => setShowJsonModal(false)}
                  className="p-1 rounded text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <textarea
                readOnly
                rows={16}
                value={JSON.stringify(activeTemplate, null, 2)}
                className="w-full font-mono text-xs p-3 rounded-lg bg-slate-900 text-slate-100 border border-slate-700 resize-none overflow-y-auto"
              />
              <div className="flex justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={() => setShowJsonModal(false)}>
                  Close
                </Button>
                <Button variant="primary" size="sm" onClick={handleCopyJson}>
                  {copiedJson ? 'Copied!' : 'Copy to Clipboard'}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
