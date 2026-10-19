import React, { useState, useEffect } from 'react';
import { supabase, LeadRow } from '../lib/supabaseClient';
import { Users, Trash2, Save, RefreshCw, Mail, Phone, Calendar } from 'lucide-react';

interface LeadsTabProps {
  onNotify: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const LeadsTab: React.FC<LeadsTabProps> = ({ onNotify }) => {
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [savingNoteId, setSavingNoteId] = useState<string | null>(null);

  const fetchLeads = async () => {
    if (!supabase) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        onNotify(`Error loading leads: ${error.message}`, 'error');
      } else if (data) {
        setLeads(data as LeadRow[]);
      }
    } catch (err: any) {
      onNotify(`Error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleStatusChange = async (lead: LeadRow, newStatus: 'new' | 'contacted' | 'closed') => {
    if (!supabase) return;

    setLeads((prev) =>
      prev.map((l) => (l.id === lead.id ? { ...l, status: newStatus } : l))
    );

    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus })
        .eq('id', lead.id);

      if (error) throw error;
      onNotify(`Lead status updated to ${newStatus}.`, 'success');
    } catch (err: any) {
      fetchLeads();
      onNotify(`Status update error: ${err.message}`, 'error');
    }
  };

  const handleNotesChange = (leadId: string, notes: string) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, notes } : l))
    );
  };

  const handleSaveNotes = async (lead: LeadRow) => {
    if (!supabase) return;
    setSavingNoteId(lead.id);

    try {
      const { error } = await supabase
        .from('leads')
        .update({ notes: lead.notes })
        .eq('id', lead.id);

      if (error) throw error;
      onNotify('Lead notes saved.', 'success');
    } catch (err: any) {
      onNotify(`Save notes failed: ${err.message}`, 'error');
    } finally {
      setSavingNoteId(null);
    }
  };

  const handleDeleteLead = async (lead: LeadRow) => {
    if (!supabase) return;
    if (!window.confirm(`Delete lead "${lead.name}"?`)) return;

    setLeads((prev) => prev.filter((l) => l.id !== lead.id));

    try {
      const { error } = await supabase.from('leads').delete().eq('id', lead.id);
      if (error) throw error;
      onNotify('Lead deleted.', 'success');
    } catch (err: any) {
      fetchLeads();
      onNotify(`Delete error: ${err.message}`, 'error');
    }
  };

  const filteredLeads =
    statusFilter === 'all'
      ? leads
      : leads.filter((l) => l.status === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#14142B] p-5 rounded-xl border border-brand-purple/20">
        <div>
          <h2 className="text-lg font-bold text-brand-white flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-gold" />
            <span>Inbound Project Leads</span>
          </h2>
          <p className="text-xs text-brand-white/60 mt-0.5">
            Client inquiries, tenders, and commercial partnership leads managed via Supabase.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#1A1A38] border border-brand-purple/30 text-brand-white rounded px-2.5 py-1.5 text-xs outline-none focus:border-brand-gold"
          >
            <option value="all">All Statuses ({leads.length})</option>
            <option value="new">New ({leads.filter((l) => l.status === 'new').length})</option>
            <option value="contacted">Contacted ({leads.filter((l) => l.status === 'contacted').length})</option>
            <option value="closed">Closed ({leads.filter((l) => l.status === 'closed').length})</option>
          </select>

          <button
            type="button"
            onClick={fetchLeads}
            className="p-1.5 rounded bg-[#1A1A38] text-brand-white/70 hover:text-brand-white border border-brand-purple/20"
            title="Refresh leads"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {filteredLeads.length === 0 ? (
        <div className="bg-[#14142B] p-12 rounded-xl text-center border border-brand-purple/20 text-brand-white/50 text-xs">
          No leads yet. When leads are recorded by administrative workflows, they will appear here.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLeads.map((lead) => (
            <div
              key={lead.id}
              className="bg-[#14142B] rounded-xl p-5 border border-brand-purple/20 space-y-4 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-brand-purple/15 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-brand-white text-sm">{lead.name}</h4>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider ${
                        lead.status === 'new'
                          ? 'bg-amber-950 text-amber-300 border border-amber-700/50'
                          : lead.status === 'contacted'
                          ? 'bg-blue-950 text-blue-300 border border-blue-700/50'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                      }`}
                    >
                      {lead.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-brand-white/60 text-[11px] mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-brand-gold" />
                      {new Date(lead.created_at).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span>Source: {lead.source}</span>
                  </div>
                </div>

                {/* Status Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-brand-white/50 text-[11px]">Status:</span>
                  <select
                    value={lead.status}
                    onChange={(e) =>
                      handleStatusChange(lead, e.target.value as 'new' | 'contacted' | 'closed')
                    }
                    className="bg-[#1A1A38] border border-brand-purple/30 text-brand-white rounded px-2.5 py-1 text-xs outline-none focus:border-brand-gold"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="closed">Closed</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => handleDeleteLead(lead)}
                    className="p-1.5 rounded text-brand-white/40 hover:text-brand-scarlet transition-colors ml-2"
                    title="Delete lead"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Lead Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-[#1A1A38] p-3 rounded-lg border border-brand-purple/10">
                  <span className="text-[10px] uppercase text-brand-gold font-mono block mb-1">
                    Contact Information
                  </span>
                  <p className="text-brand-white/90 font-medium">{lead.contact}</p>
                </div>

                <div className="bg-[#1A1A38] p-3 rounded-lg border border-brand-purple/10">
                  <span className="text-[10px] uppercase text-brand-gold font-mono block mb-1">
                    Project Need & Scope
                  </span>
                  <p className="text-brand-white/90">{lead.need}</p>
                </div>
              </div>

              {/* Notes Field */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-brand-white/70">Internal Notes</span>
                  <button
                    type="button"
                    disabled={savingNoteId === lead.id}
                    onClick={() => handleSaveNotes(lead)}
                    className="px-3 py-1 rounded bg-brand-purple hover:bg-brand-purple/90 text-brand-white text-[11px] font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-3 h-3" />
                    <span>{savingNoteId === lead.id ? 'Saving...' : 'Save Notes'}</span>
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={lead.notes || ''}
                  onChange={(e) => handleNotesChange(lead.id, e.target.value)}
                  placeholder="Record call logs, client requirements, or scheduled site inspection dates..."
                  className="w-full bg-[#1A1A38] border border-brand-purple/20 rounded p-2.5 text-xs text-brand-white outline-none focus:border-brand-gold transition-colors"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
