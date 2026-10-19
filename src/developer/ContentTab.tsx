import React, { useState, useEffect } from 'react';
import { supabase, SiteContentRow } from '../lib/supabaseClient';
import { siteContent as defaultSiteContent } from '../data/content';
import { FileEdit, RotateCcw, Save, Check } from 'lucide-react';

interface ContentTabProps {
  onNotify: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

interface EditableKeyConfig {
  key: string;
  label: string;
  defaultValue: string;
  type: 'text' | 'textarea';
}

const DEFAULT_KEYS: EditableKeyConfig[] = [
  {
    key: 'hero_tagline',
    label: 'Hero Tagline (Slogan)',
    defaultValue: defaultSiteContent.company.slogan,
    type: 'text',
  },
  {
    key: 'hero_subline',
    label: 'Hero Subline (Summary Description)',
    defaultValue: defaultSiteContent.company.summary,
    type: 'textarea',
  },
  {
    key: 'services_intro',
    label: 'Services Section Intro',
    defaultValue:
      'Grounded in rigorous South African standards, ethical craftsmanship, and dependable stewardship across all asset lifecycles.',
    type: 'textarea',
  },
  {
    key: 'contact_phone',
    label: 'Contact Direct Phone',
    defaultValue: defaultSiteContent.company.phone,
    type: 'text',
  },
  {
    key: 'contact_email',
    label: 'Contact Executive Email',
    defaultValue: defaultSiteContent.company.email,
    type: 'text',
  },
  {
    key: 'contact_address',
    label: 'Headquarters Address',
    defaultValue: defaultSiteContent.company.address,
    type: 'text',
  },
];

export const ContentTab: React.FC<ContentTabProps> = ({ onNotify }) => {
  const [contentMap, setContentMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const fetchContent = async () => {
    if (!supabase) return;
    setLoading(true);

    try {
      const { data, error } = await supabase.from('site_content').select('*');
      if (error) {
        onNotify(`Error loading content: ${error.message}`, 'error');
      } else if (data) {
        const map: Record<string, string> = {};
        (data as SiteContentRow[]).forEach((row) => {
          map[row.key] = row.value;
        });
        setContentMap(map);
      }
    } catch (err: any) {
      onNotify(`Error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleSave = async (key: string, value: string) => {
    if (!supabase) return;
    setSavingKey(key);

    try {
      const { error } = await supabase
        .from('site_content')
        .upsert({ key, value, updated_at: new Date().toISOString() });

      if (error) throw error;
      setContentMap((prev) => ({ ...prev, [key]: value }));
      onNotify(`Updated "${key}" successfully.`, 'success');
    } catch (err: any) {
      onNotify(`Save error: ${err.message}`, 'error');
    } finally {
      setSavingKey(null);
    }
  };

  const handleResetToDefault = async (cfg: EditableKeyConfig) => {
    if (!supabase) return;
    if (!window.confirm(`Reset "${cfg.label}" to the default text?`)) return;

    handleSave(cfg.key, cfg.defaultValue);
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#14142B] p-5 rounded-xl border border-brand-purple/20">
        <h2 className="text-lg font-bold text-brand-white flex items-center gap-2">
          <FileEdit className="w-5 h-5 text-brand-gold" />
          <span>Site Content Management</span>
        </h2>
        <p className="text-xs text-brand-white/60 mt-0.5">
          Overrides public website headlines, contact numbers, and summaries. Falls back automatically to default copy if unconfigured.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {DEFAULT_KEYS.map((cfg) => {
          const currentValue = contentMap[cfg.key] ?? cfg.defaultValue;
          const isModified = currentValue !== cfg.defaultValue;

          return (
            <div
              key={cfg.key}
              className="bg-[#14142B] p-5 rounded-xl border border-brand-purple/20 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-brand-white flex items-center gap-2">
                    <span>{cfg.label}</span>
                    {isModified && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-purple/40 text-brand-gold border border-brand-gold/30">
                        Custom Value
                      </span>
                    )}
                  </label>
                  <span className="text-[10px] text-brand-white/40 font-mono">Key: {cfg.key}</span>
                </div>

                {isModified && (
                  <button
                    type="button"
                    onClick={() => handleResetToDefault(cfg)}
                    className="text-xs text-brand-white/60 hover:text-brand-gold flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset to default</span>
                  </button>
                )}
              </div>

              {cfg.type === 'textarea' ? (
                <textarea
                  rows={3}
                  value={currentValue}
                  onChange={(e) =>
                    setContentMap((prev) => ({ ...prev, [cfg.key]: e.target.value }))
                  }
                  className="w-full bg-[#1A1A38] border border-brand-purple/30 rounded-lg p-3 text-xs text-brand-white focus:border-brand-gold outline-none transition-colors"
                />
              ) : (
                <input
                  type="text"
                  value={currentValue}
                  onChange={(e) =>
                    setContentMap((prev) => ({ ...prev, [cfg.key]: e.target.value }))
                  }
                  className="w-full bg-[#1A1A38] border border-brand-purple/30 rounded-lg px-3 py-2 text-xs text-brand-white focus:border-brand-gold outline-none transition-colors"
                />
              )}

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  disabled={savingKey === cfg.key}
                  onClick={() => handleSave(cfg.key, currentValue)}
                  className="px-4 py-2 rounded bg-brand-purple hover:bg-brand-purple/90 text-brand-white text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
                >
                  {savingKey === cfg.key ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Field</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
