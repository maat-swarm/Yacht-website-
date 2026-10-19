import React, { useEffect, useRef, useState } from 'react';

type Msg = { role: 'user' | 'assistant'; content: string };
const GREETING = "Hi Sam. I'm your PA. Do you want a brief on the research I've done?";

export function PaPortal() {
  const [asking, setAsking] = useState(false);
  const [open, setOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [bad, setBad] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([{ role: 'assistant', content: GREETING }]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sessionStorage.getItem('yp_seen')) return;
    sessionStorage.setItem('yp_seen', '1');
    fetch('/api/track', { method: 'POST' }).catch(() => {});
  }, []);
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, busy]);

  const unlock = async () => {
    try {
      const r = await fetch('/api/pa/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pin, messages: [] }) });
      if (r.status === 401) { setBad(true); return; }
      setBad(false); setAsking(false); setOpen(true);
    } catch { setBad(true); }
  };

  const send = async () => {
    const t = input.trim();
    if (!t || busy) return;
    const next: Msg[] = [...msgs, { role: 'user', content: t }];
    setMsgs(next); setInput(''); setBusy(true);
    try {
      const r = await fetch('/api/pa/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pin, messages: next }) });
      const j = await r.json();
      setMsgs([...next, { role: 'assistant', content: j.reply || ('Error: ' + JSON.stringify(j.error || j).slice(0, 200)) }]);
    } catch { setMsgs([...next, { role: 'assistant', content: 'Connection error.' }]); }
    setBusy(false);
  };

  if (open) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: '#0b0f14', color: '#fff', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between' }}>
          <b>Yacht PA</b>
          <button onClick={() => { setOpen(false); setPin(''); setMsgs([{ role: 'assistant', content: GREETING }]); }}>Lock</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          {msgs.map((m, i) => (
            <div key={i} style={{ margin: '8px 0', display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{ maxWidth: '85%', padding: '10px 12px', borderRadius: 14, whiteSpace: 'pre-wrap', fontSize: 14, background: m.role === 'user' ? '#1d4ed8' : '#1a2230' }}>{m.content}</div>
            </div>
          ))}
          {busy && <div style={{ opacity: 0.6, fontSize: 13 }}>Working on it…</div>}
          <div ref={end} />
        </div>
        <div style={{ display: 'flex', gap: 8, padding: 12, borderTop: '1px solid #222' }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Message your PA" style={{ flex: 1, padding: 12, borderRadius: 12, background: '#1a2230', color: '#fff', border: 'none' }} />
          <button onClick={send} style={{ padding: '0 18px', borderRadius: 12, background: '#1d4ed8', color: '#fff' }}>Send</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <button aria-label="." onClick={() => setAsking(true)} style={{ position: 'fixed', left: 8, bottom: 8, width: 14, height: 14, borderRadius: 7, background: '#888', opacity: 0.12, zIndex: 9990, border: 'none' }} />
      {asking && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setAsking(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#111827', padding: 20, borderRadius: 16, width: 260 }}>
            <input type="password" inputMode="numeric" autoFocus value={pin} onChange={e => setPin(e.target.value)} onKeyDown={e => e.key === 'Enter' && unlock()} placeholder="PIN" style={{ width: '100%', padding: 12, borderRadius: 10, background: '#1f2937', color: '#fff', border: 'none', textAlign: 'center', fontSize: 18 }} />
            {bad && <div style={{ color: '#f87171', fontSize: 12, marginTop: 8, textAlign: 'center' }}>Wrong PIN</div>}
            <button onClick={unlock} style={{ width: '100%', marginTop: 12, padding: 10, borderRadius: 10, background: '#1d4ed8', color: '#fff' }}>Open</button>
          </div>
        </div>
      )}
    </>
  );
}
