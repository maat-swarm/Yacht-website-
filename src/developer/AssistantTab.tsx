import React, { useState, useEffect } from 'react';
import { supabase, AssistantConfigRow } from '../lib/supabaseClient';
import { Bot, Save, RotateCcw, Copy, Check, Sparkles, AlertCircle } from 'lucide-react';

interface AssistantTabProps {
  onNotify: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const DEFAULT_SYSTEM_PROMPT = `You are the official AI Technical Agent & Operations Officer for "Yacht Properties (Pty) Ltd", a distinguished South African property development and construction company.
Company Details:
- Legal Name: Yacht Properties (Pty) Ltd
- Head Office: Falcon Haven, Terenure, 1619 (Kempton Park, Gauteng, South Africa)
- Executive Desk: Sam Maripane (Phone: 063 759 0216, Email: sam@yachtmaripane.co.za)
- Company Slogan: "We are You"
- Stewardship Mandate: "Stewardship for God's provision to the people less blessed than me."
- Core Disciplines:
  1. Construction: Turnkey civil works, structural building, commercial fit-outs, residential housing, general contracting.
  2. Property Management: Facilities maintenance, lease administration, rent collections, asset preservation.
  3. Real Estate Services: Acquisitions, sales advisory, commercial & residential leasing, portfolio placements.
- Statutory Registrations:
  - CIDB (Construction Industry Development Board): General Building (GB), Civil Engineering (CE).
  - NHBRC (National Home Builders Registration Council): Structural home warranties & technical standards.
  - PPRA (Property Practitioners Regulatory Authority): Real estate & property management compliance.

Tone & Persona:
- Trustworthy, dignified, rooted, respectful, and authoritative yet warm.
- Plain words, clear sentences. No marketing buzzwords like "seamless", "robust", "leverage".
- Always grounded in South African property regulations, SANS building standards, and local context.`;

const DEFAULT_FACT_SHEET = `Headquarters: Falcon Haven, Terenure, 1619, Kempton Park, Gauteng.
Direct Line: 063 759 0216 | Email: sam@yachtmaripane.co.za
Operating Hours: Monday to Friday 08:00 - 17:00
Registrations: CIDB (GB/CE classes), NHBRC registered home builder, PPRA licensed property practitioner firm.
Core Values: Stewardship, dignity, uncompromised structural integrity, community development.`;

export const AssistantTab: React.FC<AssistantTabProps> = ({ onNotify }) => {
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT);
  const [factSheet, setFactSheet] = useState(DEFAULT_FACT_SHEET);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  useEffect(() => {
    async function loadConfig() {
      if (!supabase) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('assistant_config')
          .select('*')
          .eq('id', 'default')
          .single();

        if (error) {
          // May not be created yet, fallback to default
          console.warn('Notice loading assistant config:', error.message);
        } else if (data) {
          const cfg = data as AssistantConfigRow;
          if (cfg.system_prompt) setSystemPrompt(cfg.system_prompt);
          if (cfg.fact_sheet) setFactSheet(cfg.fact_sheet);
        }
      } catch (err: any) {
        console.warn('Error loading assistant config:', err);
      } finally {
        setLoading(false);
      }
    }

    loadConfig();
  }, []);

  const handleSave = async () => {
    if (!supabase) {
      onNotify('Supabase is not connected. Update stored locally in session.', 'info');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from('assistant_config').upsert({
        id: 'default',
        system_prompt: systemPrompt,
        fact_sheet: factSheet,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      onNotify('AI Assistant configuration updated successfully.', 'success');
    } catch (err: any) {
      onNotify(`Error saving configuration: ${err.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefault = () => {
    setSystemPrompt(DEFAULT_SYSTEM_PROMPT);
    setFactSheet(DEFAULT_FACT_SHEET);
    onNotify('Restored default prompt and fact sheet templates.', 'info');
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(systemPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
    onNotify('System prompt copied to clipboard.', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-brand-purple/20">
        <div>
          <h3 className="font-serif text-lg font-bold text-brand-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-brand-gold" />
            <span>AI Operations Desk & Knowledge Base</span>
          </h3>
          <p className="text-xs text-brand-white/60">
            Control the conversational instructions, statutory knowledge parameters, and tone for the Gemini 3.8 Flash technical agent.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="px-3 py-1.5 rounded bg-brand-white/10 hover:bg-brand-white/20 text-brand-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            type="button"
            onClick={handleCopyPrompt}
            className="px-3 py-1.5 rounded bg-brand-white/10 hover:bg-brand-white/20 text-brand-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedPrompt ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      <div className="bg-[#121226] border border-brand-purple/20 rounded-xl p-4 text-xs text-brand-white/80 space-y-2">
        <div className="flex items-center gap-2 font-semibold text-brand-gold">
          <Sparkles className="w-4 h-4" />
          <span>Active Model: Google Gemini 3.8 Flash</span>
        </div>
        <p className="text-brand-white/60 leading-relaxed">
          The Assistant is connected to backend endpoints at <code className="text-brand-gold bg-brand-white/10 px-1 py-0.5 rounded">/api/chat</code>, <code className="text-brand-gold bg-brand-white/10 px-1 py-0.5 rounded">/api/agent/triage</code>, and <code className="text-brand-gold bg-brand-white/10 px-1 py-0.5 rounded">/api/agent/estimate</code>. When configured, the values below are synced with your Supabase database table <code className="text-brand-gold bg-brand-white/10 px-1 py-0.5 rounded">assistant_config</code>.
        </p>
      </div>

      <div className="space-y-5">
        <div className="bg-[#15152F] border border-brand-purple/20 rounded-xl p-5 space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-brand-gold">
            System Instruction & Persona Rules
          </label>
          <p className="text-[11px] text-brand-white/60">
            Defines the role, strict South African construction domain constraints, anti-hype tone, and guidance rules.
          </p>
          <textarea
            rows={10}
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            className="w-full bg-[#0D0D1E] border border-brand-purple/30 rounded-lg p-3 text-xs text-brand-white font-mono leading-relaxed focus:border-brand-gold outline-none transition-colors"
          />
        </div>

        <div className="bg-[#15152F] border border-brand-purple/20 rounded-xl p-5 space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-brand-gold">
            Operations Fact Sheet & Knowledge Base
          </label>
          <p className="text-[11px] text-brand-white/60">
            Direct office contact details, licensing credentials, and key operating policies referenced during calculations and triage.
          </p>
          <textarea
            rows={5}
            value={factSheet}
            onChange={(e) => setFactSheet(e.target.value)}
            className="w-full bg-[#0D0D1E] border border-brand-purple/30 rounded-lg p-3 text-xs text-brand-white font-mono leading-relaxed focus:border-brand-gold outline-none transition-colors"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="px-6 py-2.5 rounded-lg bg-brand-purple hover:bg-brand-purple/90 text-brand-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-md disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <span>Saving...</span>
            ) : (
              <>
                <Save className="w-4 h-4 text-brand-gold" />
                <span>Save Assistant Configuration</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
