export interface StrikeData {
  ceOI: number;
  ceCOI: number;
  peOI: number;
  peCOI: number;
  ceLTP: number;
  peLTP: number;
  ceVol: number;
  peVol: number;
  _pain?: number;
}

export interface OptionMap {
  [strike: string]: StrikeData;
}

export interface AlgoInput {
  spot: number;
  atmSP: number;
  vis: number[];
  map: OptionMap;
  pcrOI: number | string;
  pcrCOI: number | string;
}

export interface GlimpseData {
  clex: ReturnType<typeof computeClex>;
  ca: ReturnType<typeof computeCA>;
  ua: ReturnType<typeof computeUA>;
  final: { isBull: boolean; conv: number };
  /** Pre-computed analytics from the backend (UA, CA, Clex, 7-Factor, Max Pain) */
  backendAnalytics?: {
    ua?: number | null;
    ca?: number | null;
    clex?: number | null;
    max_pain?: number | null;
    pcr?: number;
    trend_strength?: number | null;
    market_bias?: string;
    seven_factor?: {
      score: number;
      label: string;
      factors: Record<string, number>;
    } | null;
  } | null;
  /** True when analytics came from Supabase fallback (backend warming up) */
  _isFallback?: boolean;
}

export function fmtK(n: number) {
  const a = Math.abs(n);
  const s = n < 0 ? '-' : '';
  if (a >= 10000000) return s + (a / 10000000).toFixed(2) + 'Cr';
  if (a >= 100000) return s + (a / 100000).toFixed(2) + 'L';
  if (a >= 1000) return s + (a / 1000).toFixed(1) + 'K';
  return String(n);
}

export function fmtCr(n: number) {
  return (n / 10000000).toFixed(2);
}

export function rSig(r: number) {
  return r > 1.2 ? 'Bullish' : r < 0.8 ? 'Bearish' : 'Balanced';
}

export function calcPF(poi: number, pcoi: number) {
  if (!poi || poi === 0) return null;
  return parseFloat((pcoi / poi).toFixed(2));
}

export function classify(ceOI: number, ceCOI: number, peOI: number, peCOI: number) {
  const oir = ceOI ? peOI / ceOI : 0;
  const coir = ceCOI ? peCOI / ceCOI : 0;
  const xv = oir ? coir / oir : 0;
  
  const sBull = ceCOI < 0 && peCOI > 0;
  const sBear = peCOI < 0 && ceCOI > 0;
  const bPres = oir > 1 && coir > 1 && xv > 1;
  const sPres = oir > 0 && oir < 1 && coir > 0 && coir < 1 && xv > 0 && xv < 1;
  
  let label = 'Neutral';
  let cls = 'b-neu';
  let bc = '#94A3B8';
  
  if (sBull) { label = 'Super bullish'; cls = 'b-sbull'; bc = '#1e3a8a'; }
  else if (sBear) { label = 'Super bearish'; cls = 'b-sbear'; bc = '#854d0e'; }
  else if (bPres) { label = 'Buyers present'; cls = 'b-buy'; bc = '#15803D'; }
  else if (sPres) { label = 'Sellers present'; cls = 'b-sell'; bc = '#b91c1c'; }
  else if (xv > 1) { label = 'Bullish X'; cls = 'b-bull'; bc = '#86efac'; }
  else if (xv < 1 && xv !== 0) { label = 'Bearish X'; cls = 'b-bear'; bc = '#fca5a5'; }
  
  return { label, cls, bc, oir: +oir.toFixed(2), coir: +coir.toFixed(2), xv: +xv.toFixed(2), sBull, sBear };
}

export function computeMaxPain(strikes: number[], map: OptionMap) {
  let minPain = Infinity;
  let mpStrike = strikes[0];
  
  strikes.forEach((K) => {
    let pain = 0;
    strikes.forEach((i) => {
      const r = map[i];
      pain += r.ceOI * Math.max(0, i - K);
      pain += r.peOI * Math.max(0, K - i);
    });
    map[K]._pain = pain;
    if (pain < minPain) { minPain = pain; mpStrike = K; }
  });
  return { mpStrike, minPain };
}

export function computeUA(d: AlgoInput) {
  const spot = d.spot, atmSP = d.atmSP, vis = d.vis, map = d.map, pcrOI = d.pcrOI;
  const ss = [...vis].sort((a, b) => a - b);
  let mCE = { v: 0, sp: 0 }, mPE = { v: 0, sp: 0 };
  
  ss.forEach((sp) => {
    if (map[sp].ceOI > mCE.v) mCE = { v: map[sp].ceOI, sp: sp };
    if (map[sp].peOI > mPE.v) mPE = { v: map[sp].peOI, sp: sp };
  });
  
  const po = +pcrOI;
  let bs = 0;
  if (po > 1.2) bs += 30; else if (po > 1) bs += 15; else if (po < 0.8) bs -= 30;
  if (mPE.v > mCE.v) bs += 20; else bs -= 20;
  if (spot > atmSP) bs += 15; else bs -= 15;
  
  const cl = Math.min(100, Math.max(0, 50 + bs));
  const isBull = cl >= 50;
  const conf = isBull ? Math.round(cl) : Math.round(100 - cl);
  const ai = ss.indexOf(atmSP);
  const type = isBull ? 'CE' : 'PE';
  const entry = isBull ? (ai + 1 < ss.length ? ss[ai + 1] : atmSP) : (ai - 1 >= 0 ? ss[ai - 1] : atmSP);
  
  return { isBull, conf, mCE, mPE, po, ai, ss, atmSP, type, entry, sl: atmSP };
}

export function computeCA(d: AlgoInput) {
  const vis = d.vis, map = d.map, pcrOI = d.pcrOI, pcrCOI = d.pcrCOI, atmSP = d.atmSP;
  const ss = [...vis].sort((a, b) => a - b);
  const po = +pcrOI, pc = +pcrCOI, ai = ss.indexOf(atmSP);
  
  const near = [ai - 1, ai, ai + 1].filter(i => i >= 0 && i < ss.length).map(i => ss[i]);
  const xAvg = near.reduce((s, sp) => s + classify(map[sp].ceOI, map[sp].ceCOI, map[sp].peOI, map[sp].peCOI).xv, 0) / near.length;
  const nPe = vis.reduce((s: number, sp: number) => s + map[sp].peCOI, 0);
  const nCe = vis.reduce((s: number, sp: number) => s + map[sp].ceCOI, 0);
  
  const sc = [
    Math.min(Math.max((po - 0.7) / 0.8, 0), 1),
    Math.min(Math.max((pc - 0.7) / 0.8, 0), 1),
    Math.min(Math.max((xAvg - 0.5) / 2, 0), 1),
    Math.min(Math.max((nCe ? nPe / nCe - 0.5 : 0) / 2, 0), 1),
    0.5, 0
  ];
  
  let ss2 = 0.5;
  near.forEach(sp => {
    const c = classify(map[sp].ceOI, map[sp].ceCOI, map[sp].peOI, map[sp].peCOI);
    if (c.sBull) ss2 += 0.2;
    if (c.sBear) ss2 -= 0.2;
  });
  sc[4] = Math.min(Math.max(ss2, 0), 1);
  
  const tPEcb = vis.reduce((s: number, sp: number) => s + map[sp].peOI + map[sp].peCOI, 0);
  const tCEcb = vis.reduce((s: number, sp: number) => s + map[sp].ceOI + map[sp].ceCOI, 0);
  sc[5] = Math.min(Math.max((tCEcb ? tPEcb / tCEcb - 0.7 : 0.3) / 0.8, 0), 1);
  
  const W = [1, 1, 1.5, 1.5, 1.2, 1];
  const wS = W.reduce((a, b) => a + b, 0);
  const fs = sc.reduce((s, v, i) => s + v * W[i], 0) / wS;
  
  const pct = Math.round(fs * 100);
  const isBull = fs >= 0.5;
  const conf = Math.min(95, Math.max(30, isBull ? Math.round((fs - 0.5) * 200 + 50) : Math.round((0.5 - fs) * 200 + 50)));
  
  let mPesp = ss[0], mPev = 0, mCesp = ss[0], mCev = 0;
  ss.forEach(sp => {
    if (map[sp].peCOI > mPev) { mPev = map[sp].peCOI; mPesp = sp; }
    if (map[sp].ceCOI > mCev) { mCev = map[sp].ceCOI; mCesp = sp; }
  });
  
  const type = isBull ? 'CE' : 'PE';
  const entry = isBull ? (ai + 1 < ss.length ? ss[ai + 1] : atmSP) : (ai - 1 >= 0 ? ss[ai - 1] : atmSP);
  
  return { isBull, conf, pct, fs, sc, xAvg, ai, ss, atmSP, map, type, entry, sl: atmSP, mCesp, mPesp };
}

export function computeClex(d: AlgoInput) {
  const spot = d.spot, atmSP = d.atmSP, vis = d.vis, map = d.map, pcrOI = d.pcrOI, pcrCOI = d.pcrCOI;
  const ss = [...vis].sort((a, b) => a - b);
  const po = +pcrOI, pc = +pcrCOI, ai = ss.indexOf(atmSP);
  
  const near = [ai - 1, ai, ai + 1].filter(i => i >= 0 && i < ss.length).map(i => ss[i]);
  const xAvg = near.reduce((s, sp) => s + classify(map[sp].ceOI, map[sp].ceCOI, map[sp].peOI, map[sp].peCOI).xv, 0) / near.length;
  
  const f_xATM = Math.min(Math.max((xAvg - 0.3) / 2.5, 0), 1);
  const tPeCOI = vis.reduce((s: number, sp: number) => s + map[sp].peCOI, 0);
  const tCeCOI = vis.reduce((s: number, sp: number) => s + map[sp].ceCOI, 0);
  const coiMom = tCeCOI ? tPeCOI / tCeCOI : 1;
  const f_coiMom = Math.min(Math.max((coiMom - 0.3) / 2.5, 0), 1);
  
  let supScore = 0.5;
  near.forEach(sp => {
    const c = classify(map[sp].ceOI, map[sp].ceCOI, map[sp].peOI, map[sp].peCOI);
    if (c.sBull) supScore += 0.25;
    if (c.sBear) supScore -= 0.25;
  });
  const f_super = Math.min(Math.max(supScore, 0), 1);
  const f_pcrOI = Math.min(Math.max((po - 0.5) / 1.5, 0), 1);
  const f_pcrCOI = Math.min(Math.max((pc - 0.5) / 1.5, 0), 1);
  
  const tCEcb = vis.reduce((s: number, sp: number) => s + map[sp].ceOI + map[sp].ceCOI, 0);
  const tPEcb = vis.reduce((s: number, sp: number) => s + map[sp].peOI + map[sp].peCOI, 0);
  const cbR = tCEcb ? tPEcb / tCEcb : 1;
  const f_combo = Math.min(Math.max((cbR - 0.5) / 1.5, 0), 1);
  
  let mCEoi = { v: 0, sp: atmSP }, mPEoi = { v: 0, sp: atmSP };
  ss.forEach(sp => {
    if (map[sp].ceOI > mCEoi.v) mCEoi = { v: map[sp].ceOI, sp: sp };
    if (map[sp].peOI > mPEoi.v) mPEoi = { v: map[sp].peOI, sp: sp };
  });
  
  const dR = Math.abs(spot - mCEoi.sp), dS = Math.abs(spot - mPEoi.sp);
  const f_wall = dR > dS ? Math.min(0.5 + (dR - dS) / (dR + dS + 1) * 0.5, 1) : Math.max(0.5 - (dS - dR) / (dR + dS + 1) * 0.5, 0);
  
  const factors = [
    { n: 'X-factor ATM', v: f_xATM },
    { n: 'COI Momentum', v: f_coiMom },
    { n: 'Super Signals', v: f_super },
    { n: 'PCR (OI)', v: f_pcrOI },
    { n: 'PCR (COI)', v: f_pcrCOI },
    { n: 'Combo Ratio', v: f_combo },
    { n: 'Wall Asymmetry', v: f_wall }
  ];
  
  const W = [2.0, 1.8, 1.5, 1.5, 1.2, 1.2, 0.8];
  const wS = W.reduce((a, b) => a + b, 0);
  const fs = factors.reduce((s, f, i) => s + f.v * W[i], 0) / wS;
  
  const isBull = fs > 0.52, isBear = fs < 0.48;
  const conv = isBull ? Math.min(95, Math.round((fs - 0.5) * 200 + 50)) : isBear ? Math.min(95, Math.round((0.5 - fs) * 200 + 50)) : 30;
  const prob = Math.min(75, 40 + conv * 0.35);
  
  const supLvl = [...ss].sort((a, b) => map[b].peOI - map[a].peOI).slice(0, 3);
  const resLvl = [...ss].sort((a, b) => map[b].ceOI - map[a].ceOI).slice(0, 3);
  
  const ceEntry = ai + 1 < ss.length ? ss[ai + 1] : atmSP;
  const peSP2 = ai - 1 >= 0 ? ss[ai - 1] : atmSP;
  
  const bS: number[] = [], rS: number[] = [];
  ss.forEach(sp => {
    const r = map[sp];
    if (r.peCOI > 0 && r.ceCOI < 0) bS.push(sp);
    else if (r.ceCOI > 0 && r.peCOI < 0) rS.push(sp);
  });
  
  const type = isBull ? 'CE' : 'PE';
  const entry = isBull ? ceEntry : peSP2;
  
  return { factors, W, fs, isBull, isBear, conv, prob, mCEoi, mPEoi, supLvl, resLvl, ceEntry, peSP2, bS, rS, xAvg, po, pc, coiMom, cbR, spot, atmSP, map, type, entry, sl: atmSP };
}
