import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

const rowStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr 1fr 2fr 1fr', gap: 12, alignItems: 'center' };

const startOfQuarter = (d: Date) => {
  const quarter = Math.floor(d.getMonth() / 3);
  return new Date(d.getFullYear(), quarter * 3, 1).toISOString();
};

const FluidTopUpAdmin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [engineOilL, setEngineOilL] = useState('');
  const [coolantL, setCoolantL] = useState('');
  const [screenwashL, setScreenwashL] = useState('');
  const [steeringFluidL, setSteeringFluidL] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<any[]>([]);

  // membership/allowance state
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const [usedThisMonth, setUsedThisMonth] = useState(0);
  const [checking, setChecking] = useState(false);

  // Per-fluid used/remaining for the current quarter
  const totalOil = list.reduce((s, u) => s + (Number(u.engineOilL || u.engineOil) || 0), 0);
  const totalCoolant = list.reduce((s, u) => s + (Number(u.coolantL || u.coolant) || 0), 0);
  const totalScreen = list.reduce((s, u) => s + (Number(u.screenwashL || u.screenwash) || 0), 0);
  const totalSteer = list.reduce((s, u) => s + (Number(u.steeringFluidL || u.steeringFluid) || 0), 0);
  const capPerFluid = 0.5;
  const remOil = isPremium ? Math.max(0, capPerFluid - totalOil) : 0;
  const remCoolant = isPremium ? Math.max(0, capPerFluid - totalCoolant) : 0;
  const remScreen = isPremium ? Math.max(0, capPerFluid - totalScreen) : 0;
  const remSteer = isPremium ? Math.max(0, capPerFluid - totalSteer) : 0;

  const fetchList = async (forEmail?: string) => {
    const target = forEmail ?? email;
    if (!target) { setList([]); return; }
    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE_URL}/api/fluid-topups?email=${encodeURIComponent(target)}&from=${encodeURIComponent(startOfQuarter(new Date()))}`);
      if (resp.ok) setList(await resp.json()); else setList([]);
    } catch { setList([]); }
    setLoading(false);
  };

  const checkEmail = async () => {
    if (!email) return;
    setChecking(true);
    try {
      // membership
      const m = await fetch(`${API_BASE_URL}/api/membership/${encodeURIComponent(email)}`);
      if (m.ok) {
        const mem = await m.json();
        setIsPremium(mem?.membershipType === 'premium' && mem?.status === 'active');
      } else {
        setIsPremium(false);
      }
      await fetchList(email);
      setUsedThisMonth(0);
    } catch {
      setIsPremium(false);
      setList([]);
      setUsedThisMonth(0);
    }
    setChecking(false);
  };

  useEffect(() => {
    const count = Array.isArray(list) ? list.length : 0;
    setUsedThisMonth(count);
  }, [list]);

  const save = async () => {
    if (!email) return;
    setSaving(true);
    try {
      const payload = {
        userEmail: email,
        date,
        engineOil: Number(engineOilL || 0),
        coolant: Number(coolantL || 0),
        screenwash: Number(screenwashL || 0),
        steeringFluid: Number(steeringFluidL || 0),
        notes
      };
      console.log('payloads   ', payload)
      const resp = await fetch(`${API_BASE_URL}/api/fluid-topups`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!resp.ok) {
        const err = await resp.json();
        alert(err.error || 'Failed to save');
      } else {
        setEngineOilL(''); setCoolantL(''); setScreenwashL(''); setSteeringFluidL(''); setNotes('');
        await checkEmail();
      }
    } catch (e: any) { alert('Failed to save'); }
    setSaving(false);
  };

  // Enable save if premium and any fluid has remaining > 0
  const canAdd = !!(isPremium && (remOil > 0 || remCoolant > 0 || remScreen > 0 || remSteer > 0));

  return (
    <div style={{ background: '#111', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '120px 24px 48px 24px' }}>
        <div style={{ fontWeight: 700, fontSize: '2rem', color: '#fff', marginBottom: 16 }}>Fluid Top-up Usage</div>

        {/* Email check */}
        <div style={{ background: '#181818', borderRadius: 12, padding: 16, border: '1px solid #232323', marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <input type="email" placeholder="Customer email" value={email} onChange={e => setEmail(e.target.value)} style={{ flex: 1, minWidth: 240, background: '#111', color: '#fff', border: '1px solid #333', borderRadius: 8, padding: '10px 14px' }} />
            <button onClick={checkEmail} disabled={!email || checking} style={{ background: '#ffd600', color: '#111', border: 'none', borderRadius: 8, padding: '10px 22px', fontWeight: 700, cursor: 'pointer' }}>{checking ? 'Checking...' : 'Check User'}</button>
            {isPremium !== null && (
              <div style={{ color: isPremium ? '#28a745' : '#ff6b6b', fontWeight: 700 }}>
                {isPremium ? 'Premium user' : 'Not premium'}
              </div>
            )}
          </div>

          {isPremium !== null && (
            <div style={{ marginTop: 12, background: '#232323', borderRadius: 8, padding: 12, border: '1px solid #333' }}>
              <div style={{ color: '#bdbdbd', marginBottom: 8, fontWeight: 600 }}>Quarterly allowance per fluid (max 0.5L each)</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
                <div style={{ color: '#eaeaea' }}>Engine oil: <span style={{ color: '#ffd600', fontWeight: 700 }}>{remOil.toFixed(2)}L</span> left of 0.50L</div>
                <div style={{ color: '#eaeaea' }}>Coolant: <span style={{ color: '#ffd600', fontWeight: 700 }}>{remCoolant.toFixed(2)}L</span> left of 0.50L</div>
                <div style={{ color: '#eaeaea' }}>Screenwash: <span style={{ color: '#ffd600', fontWeight: 700 }}>{remScreen.toFixed(2)}L</span> left of 0.50L</div>
                <div style={{ color: '#eaeaea' }}>Steering fluid: <span style={{ color: '#ffd600', fontWeight: 700 }}>{remSteer.toFixed(2)}L</span> left of 0.50L</div>
              </div>
            </div>
          )}
        </div>

        {/* Entry form - disabled until premium and some remaining */}
        <div style={{ background: '#181818', borderRadius: 12, padding: 16, border: '1px solid #232323', marginBottom: 16, opacity: canAdd ? 1 : 0.6 }}>
          <div style={{ color: '#bdbdbd', marginBottom: 8 }}>Record top-up (max 0.5L each). {canAdd ? '' : 'Enable by selecting a premium user with remaining allowance.'}</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} disabled={!canAdd} style={{ background: '#111', color: '#fff', border: '1px solid #333', borderRadius: 8, padding: '10px 14px' }} />
            <input type="number" step="0.1" placeholder={`Engine oil (≤ ${remOil.toFixed(2)} L)`} value={engineOilL} onChange={e => setEngineOilL(e.target.value)} disabled={!canAdd || remOil <= 0} style={{ background: '#111', color: '#fff', border: '1px solid #333', borderRadius: 8, padding: '10px 14px', width: 200 }} />
            <input type="number" step="0.1" placeholder={`Coolant (≤ ${remCoolant.toFixed(2)} L)`} value={coolantL} onChange={e => setCoolantL(e.target.value)} disabled={!canAdd || remCoolant <= 0} style={{ background: '#111', color: '#fff', border: '1px solid #333', borderRadius: 8, padding: '10px 14px', width: 200 }} />
            <input type="number" step="0.1" placeholder={`Screenwash (≤ ${remScreen.toFixed(2)} L)`} value={screenwashL} onChange={e => setScreenwashL(e.target.value)} disabled={!canAdd || remScreen <= 0} style={{ background: '#111', color: '#fff', border: '1px solid #333', borderRadius: 8, padding: '10px 14px', width: 220 }} />
            <input type="number" step="0.1" placeholder={`Steering fluid (≤ ${remSteer.toFixed(2)} L)`} value={steeringFluidL} onChange={e => setSteeringFluidL(e.target.value)} disabled={!canAdd || remSteer <= 0} style={{ background: '#111', color: '#fff', border: '1px solid #333', borderRadius: 8, padding: '10px 14px', width: 240 }} />
            <input type="text" placeholder="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} disabled={!canAdd} style={{ flex: 1, minWidth: 240, background: '#111', color: '#fff', border: '1px solid #333', borderRadius: 8, padding: '10px 14px' }} />
            <button onClick={save} disabled={!canAdd || saving} style={{ background: '#ffd600', color: '#111', border: 'none', borderRadius: 8, padding: '10px 22px', fontWeight: 700, cursor: canAdd ? 'pointer' : 'not-allowed' }}>{saving ? 'Saving...' : 'Save Usage'}</button>
            <button onClick={() => fetchList(email)} disabled={!email} style={{ background: '#232323', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 22px', cursor: 'pointer' }}>Refresh</button>
          </div>
        </div>

        <div style={{ background: '#181818', borderRadius: 12, padding: 16, border: '1px solid #232323' }}>
          <div style={{ color: '#bdbdbd', marginBottom: 8 }}>Records this quarter ({email || 'no email'})</div>
          <div style={{ ...rowStyle, color: '#bdbdbd', fontWeight: 600, padding: '8px 0', borderBottom: '1px solid #232323' }}>
            <div>Email</div><div>Engine oil (L)</div><div>Coolant (L)</div><div>Screenwash (L)</div><div>Steering (L)</div><div>Notes</div><div>Date</div>
          </div>
          {loading ? (
            <div style={{ color: '#bdbdbd', padding: 12 }}>Loading...</div>
          ) : (
            list.map((u, i) => (
              <div key={i} style={{ ...rowStyle, color: '#eaeaea', padding: '10px 0', borderBottom: '1px solid #232323' }}>
                <div>{u.userEmail}</div>
                <div>{Number(u.engineOil || 0).toFixed(2)}</div>
                <div>{Number(u.coolant || 0).toFixed(2)}</div>
                <div>{Number(u.screenwash || 0).toFixed(2)}</div>
                <div>{Number(u.steeringFluid || 0).toFixed(2)}</div>
                <div style={{ color: '#bdbdbd' }}>{u.notes}</div>
                <div>{new Date(u.date).toLocaleString()}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FluidTopUpAdmin; 