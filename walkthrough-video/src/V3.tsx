import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import beats from './beats3.json';
import overlay from './overlay3.json';

export const FPS = 30;
const INK = '#111111';
const MINT = '#4FC2B4';
const MINT_D = '#1F6E62';
const CANVAS = '#F2F1ED';
const S = 4 / 3; // CSS px (recorded layout) to video px

type Beat = {id: string; text: string; dur: number};
const B = (id: string) => (beats as Beat[]).find((b) => b.id === id)!;
const ph = (id: string, frag: string) => {
  const b = B(id);
  const i = b.text.indexOf(frag);
  return i < 0 ? 0 : b.dur * (i / b.text.length);
};
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const eio = Easing.bezier(0.45, 0, 0.2, 1);

/* ------------------------------------------------------------------ overlays */
type Rect = [number, number, number, number];
type SpotEv = {t: number; rect: Rect | null};

const spotState = (events: SpotEv[], t: number) => {
  let k = -1;
  for (let i = 0; i < events.length; i++) if (events[i].t <= t) k = i;
  if (k < 0) return null;
  const cur = events[k];
  const prev = k > 0 ? events[k - 1] : null;
  const u = clamp((t - cur.t) / 0.45);
  const e = 1 - Math.pow(1 - u, 3);
  if (!cur.rect) return prev?.rect ? {rect: prev.rect, o: 1 - e} : null;
  if (!prev?.rect) return {rect: cur.rect, o: e};
  const r = cur.rect.map((v, i) => prev.rect![i] + (v - prev.rect![i]) * e) as Rect;
  return {rect: r, o: 1};
};

const Spot = ({events, t, scale}: {events: SpotEv[]; t: number; scale: number}) => {
  const s = spotState(events, t);
  if (!s || s.o <= 0.01) return null;
  const [x, y, w, h] = s.rect.map((v) => v * scale);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 20, border: `4px solid ${MINT}`, boxShadow: `0 0 0 4000px rgba(17,17,17,${0.34 * s.o})`, opacity: s.o, pointerEvents: 'none'}} />
  );
};

type Pt = [number, number, number]; // t, x, y
const posAt = (pts: Pt[], t: number, smooth: boolean): [number, number] => {
  if (!pts.length) return [960, 540];
  if (t <= pts[0][0]) return [pts[0][1], pts[0][2]];
  if (t >= pts[pts.length - 1][0]) return [pts[pts.length - 1][1], pts[pts.length - 1][2]];
  let lo = 0, hi = pts.length - 1;
  while (hi - lo > 1) {
    const m = (lo + hi) >> 1;
    if (pts[m][0] <= t) lo = m; else hi = m;
  }
  let u = (t - pts[lo][0]) / (pts[hi][0] - pts[lo][0]);
  if (smooth) u = eio(u);
  return [pts[lo][1] + (pts[hi][1] - pts[lo][1]) * u, pts[lo][2] + (pts[hi][2] - pts[lo][2]) * u];
};

const Cursor = ({pts, clicks, t, scale, smooth}: {pts: Pt[]; clicks: number[]; t: number; scale: number; smooth: boolean}) => {
  const [x, y] = posAt(pts, t, smooth);
  const X = x * scale, Y = y * scale;
  return (
    <>
      {clicks.map((c, i) => {
        const u = (t - c) / 0.6;
        if (u < 0 || u > 1) return null;
        const pp = posAt(pts, c, smooth);
        return <div key={i} style={{position: 'absolute', left: pp[0] * scale - 30, top: pp[1] * scale - 30, width: 60, height: 60, borderRadius: '50%', border: `4px solid ${MINT}`, transform: `scale(${0.3 + u * 1.2})`, opacity: 1 - u}} />;
      })}
      <svg width={44} height={44} viewBox="0 0 24 24" style={{position: 'absolute', left: X - 2, top: Y - 2, filter: 'drop-shadow(0 3px 4px rgba(0,0,0,.35))'}}>
        <path d="M4 2l15 9-6.5 1.6L9 19z" fill="#111" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    </>
  );
};

/* ------------------------------------------------------------------ captions */
const chunks = (text: string) => {
  const sentences = text.match(/[^.!?:]+[.!?:]?\s*/g) ?? [text];
  const out: string[] = [];
  for (const s of sentences) {
    const t = s.trim();
    if (!t) continue;
    if (t.length > 62) {
      const mid = t.length / 2;
      const cands = [...t.matchAll(/[,;] /g)].map((m) => (m.index as number) + 1);
      const spaces = [...t.matchAll(/ /g)].map((m) => m.index as number);
      const pick = (arr: number[]) => arr.sort((x, y) => Math.abs(x - mid) - Math.abs(y - mid))[0];
      const idx = cands.length && Math.abs(pick([...cands]) - mid) < t.length * 0.3 ? pick([...cands]) : pick([...spaces]);
      out.push(t.slice(0, idx).trim());
      out.push(t.slice(idx).trim());
    } else out.push(t);
  }
  return out;
};

const Caption = ({text, dur}: {text: string; dur: number}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const parts = chunks(text);
  const total = parts.reduce((a, p) => a + p.length, 0);
  let acc = 0;
  const spans = parts.map((p) => {
    const a = (acc / total) * dur, b = ((acc + p.length) / total) * dur;
    acc += p.length;
    return {p, a, b};
  });
  let idx = spans.findIndex((s) => t < s.b);
  if (idx < 0) idx = spans.length - 1;
  const cur = spans[idx];
  const words = cur.p.split(' ');
  const wc = cur.p.length;
  const local = clamp((t - cur.a) / Math.max(0.2, cur.b - cur.a));
  const enter = clamp((t - cur.a) / 0.18);
  const exit = idx === spans.length - 1 ? clamp((dur + 0.5 - t) / 0.25) : 1;
  let pos = 0;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 46, display: 'flex', justifyContent: 'center', opacity: Math.min(enter, exit), transform: `translateY(${(1 - Math.min(enter, exit)) * 10}px)`}}>
      <div style={{maxWidth: 1260, padding: '16px 34px', borderRadius: 22, background: 'rgba(255,255,255,0.94)', border: '1px solid rgba(17,17,17,0.08)', boxShadow: '0 14px 40px -16px rgba(17,17,17,.35)', fontSize: 33, lineHeight: 1.3, fontWeight: 500, letterSpacing: -0.2, textAlign: 'center', textWrap: 'balance' as const}}>
        {words.map((w, i) => {
          const start = pos / wc;
          pos += w.length + 1;
          const spoken = local >= start + (w.length / wc) * 0.35;
          return <span key={i} style={{color: spoken ? INK : '#9A9A95', transition: 'none'}}>{w}{i < words.length - 1 ? ' ' : ''}</span>;
        })}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ cards */
const Card = ({title, sub, total}: {title: string; sub?: string; total: number}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = spring({frame, fps, config: {damping: 200}, durationInFrames: 24});
  const o = interpolate(frame, [total - 9, total], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: CANVAS, justifyContent: 'center', alignItems: 'center', opacity: o}}>
      <div style={{textAlign: 'center', opacity: t, transform: `translateY(${(1 - t) * 14}px)`}}>
        <div style={{fontSize: 92, fontWeight: 600, color: MINT_D, letterSpacing: -3, lineHeight: 1}}>Tringg</div>
        <div style={{fontSize: 40, fontWeight: 500, color: INK, marginTop: 22, letterSpacing: -0.5}}>{title}</div>
        {sub ? <div style={{fontSize: 26, color: '#5E5E5B', marginTop: 10}}>{sub}</div> : null}
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ still beats (pending request) */
type StillBeat = {id: string; img: string; spots: {at?: number; frag?: string; lead?: number; rect: Rect | null}[]; path: {frag?: string; at?: number; lead?: number; x: number; y: number}[]; clicks?: {frag?: string; at?: number; lead?: number}[]};
const OV = 'v3/still-overview.png';
const IB = 'v3/still-inbox.png';
const PAD = 12;
const R = (r: Rect, p = PAD): Rect => [r[0] - p, r[1] - p, r[2] + p * 2, r[3] + p * 2];
const STILLS: StillBeat[] = [
  {id: 'ov1', img: OV, spots: [{at: 0.15, rect: R([352, 173, 1536, 123])}],
   path: [{at: 0, x: 960, y: 640}, {frag: 'today’s bookings', lead: 0.5, x: 537, y: 236}, {frag: 'pending requests', lead: 0.5, x: 925, y: 236}, {frag: 'calls handled', lead: 0.5, x: 1313, y: 236}, {frag: 'no-show', lead: 0.5, x: 1701, y: 236}]},
  {id: 'ov2', img: OV, spots: [{at: 0.15, rect: R([880, 5, 473, 70], 8)}],
   path: [{at: 0, x: 1701, y: 236}, {frag: 'Call this number', lead: 0.6, x: 1130, y: 42}]},
  {id: 'ov3', img: OV, spots: [{at: 0.15, rect: R([1287, 520, 601, 478], 6)}],
   path: [{at: 0, x: 1130, y: 42}, {at: 0.5, x: 1600, y: 780}]},
  {id: 'ovp', img: OV, spots: [{at: 0.15, rect: R([352, 323, 903, 675], 6)}],
   path: [{at: 0, x: 1600, y: 780}, {frag: 'This one is from Neenasha', lead: 0.6, x: 600, y: 440}]},
  {id: 'ovp2', img: OV, spots: [{at: 0.1, rect: R([955, 425, 250, 59], 10)}, {frag: 'open the full', lead: 0.1, rect: null}],
   path: [{at: 0, x: 600, y: 440}, {frag: 'Confirm or decline', lead: 0.2, x: 1144, y: 456}, {frag: 'decline it', lead: 0.1, x: 1013, y: 456}, {frag: 'open the full', lead: 0.4, x: 1182, y: 366}],
   clicks: [{frag: 'open the full', lead: -0.05}]},
  {id: 'rp1', img: IB, spots: [{at: 0.15, rect: R([375, 334, 860, 183], 8)}, {frag: 'date, time', lead: 0.2, rect: R([1284, 236, 604, 812], 6)}],
   path: [{at: 0, x: 1182, y: 366}, {at: 0.7, x: 760, y: 420}, {frag: 'date, time', lead: 0.2, x: 1580, y: 640}], clicks: [{at: 0.75}]},
  {id: 'rp2', img: IB, spots: [{at: 0.1, rect: R([1311, 353, 444, 59], 10)}, {frag: 'Respond before', lead: 0.5, rect: R([375, 334, 860, 183], 8)}],
   path: [{at: 0, x: 1580, y: 640}, {frag: 'Confirm to book', lead: 0.55, x: 1388, y: 382}, {frag: 'hold it', lead: 0.5, x: 1537, y: 382}, {frag: 'decline it', lead: 0.5, x: 1682, y: 382}, {frag: 'Respond before', lead: 0.5, x: 520, y: 486}]},
];
const stillPts = (s: StillBeat): Pt[] => s.path.map((p) => [p.at != null ? p.at : Math.max(0, ph(s.id, p.frag!) - (p.lead ?? 0.5)), p.x, p.y] as Pt);
const stillClicks = (s: StillBeat): number[] => (s.clicks ?? []).map((c) => (c.at != null ? c.at : ph(s.id, c.frag!) + (c.lead ?? 0)));
const stillSpots = (s: StillBeat): SpotEv[] => s.spots.map((p) => ({t: p.at != null ? p.at : Math.max(0, ph(s.id, p.frag!) - (p.lead ?? 0)), rect: p.rect}));

const StillSeg = ({s, frames}: {s: StillBeat; frames: number}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const o = interpolate(frame, [0, 5, frames - 5, frames], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const b = B(s.id);
  return (
    <AbsoluteFill style={{background: CANVAS}}>
      <AbsoluteFill style={{opacity: o}}>
        <Img src={staticFile(s.img)} style={{width: 1920, height: 1080}} />
        <Spot events={stillSpots(s)} t={t} scale={1} />
        <Cursor pts={stillPts(s)} clicks={stillClicks(s)} t={t} scale={1} smooth />
      </AbsoluteFill>
      <Caption text={b.text} dur={b.dur} />
      <Audio src={staticFile(`v3/audio/${s.id}.mp3`)} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ live recording, with dead time sped up */
const LIVE_IDS = ['rs1', 'rs2', 'ca1', 'ca2', 'ca3', 'ca4', 'ag1', 'st1', 'st2', 'st3', 'st4', 'st5', 'st6'];
const offs = overlay.offs as Record<string, number>;
const HOLD = 0.5; // seconds shown after narration ends
type Piece = {kind: 'beat' | 'gap'; id?: string; from: number; to: number; rate: number};
const buildPieces = (): Piece[] => {
  const pcs: Piece[] = [];
  let cursor = Math.max(0, offs[LIVE_IDS[0]] - 0.7);
  for (let i = 0; i < LIVE_IDS.length; i++) {
    const id = LIVE_IDS[i];
    const start = offs[id];
    if (start > cursor + 0.2) pcs.push({kind: 'gap', from: cursor, to: start, rate: 3});
    const end = start + B(id).dur + HOLD;
    pcs.push({kind: 'beat', id, from: start, to: end, rate: 1});
    cursor = end;
  }
  const lastEnd = overlay.rec - 0.1;
  if (lastEnd > cursor + 0.2) pcs.push({kind: 'gap', from: cursor, to: lastEnd, rate: 3});
  return pcs;
};
const PIECES = buildPieces();
const pieceFrames = (p: Piece) => Math.max(1, Math.round(((p.to - p.from) / p.rate) * FPS));

const LiveSeg = ({p, frames}: {p: Piece; frames: number}) => {
  const frame = useCurrentFrame();
  const t = p.from + (frame / FPS) * p.rate;
  const pts: Pt[] = (overlay.mouse as number[][]).map((m) => [m[0], m[1] * S, m[2] * S] as Pt);
  const clicks = overlay.clicks as number[];
  const spots = (overlay.spots as {t: number; rect: Rect | null}[]).map((s) => ({t: s.t, rect: s.rect ? (s.rect.map((v) => v * S) as Rect) : null}));
  return (
    <AbsoluteFill>
      <OffthreadVideo src={staticFile('v3/rec.mp4')} startFrom={Math.round(p.from * FPS)} playbackRate={p.rate} style={{width: 1920, height: 1080}} />
      <Spot events={spots} t={t} scale={1} />
      <Cursor pts={pts} clicks={clicks} t={t} scale={1} smooth={false} />
      {p.kind === 'beat' ? (
        <>
          <Caption text={B(p.id!).text} dur={B(p.id!).dur} />
          <Audio src={staticFile(`v3/audio/${p.id}.mp3`)} />
        </>
      ) : null}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ timeline */
const intro = B('intro');
const outro = B('outro');
const INTRO_F = Math.ceil((intro.dur + 0.5) * FPS);
const OUTRO_F = Math.ceil((outro.dur + 0.6) * FPS);
const STILL_IDS = STILLS.map((s) => s.id);
const stillFrames = (id: string) => Math.ceil((B(id).dur + 0.45) * FPS);
const STILLS_F = STILL_IDS.reduce((a, id) => a + stillFrames(id), 0);
const LIVE_F = PIECES.reduce((a, p) => a + pieceFrames(p), 0);
export const V3_TOTAL = INTRO_F + STILLS_F + LIVE_F + OUTRO_F;

const fontCss = `
@font-face{font-family:Poppins;font-weight:400;src:url(${staticFile('fonts/poppins-400.woff2')}) format('woff2')}
@font-face{font-family:Poppins;font-weight:500;src:url(${staticFile('fonts/poppins-500.woff2')}) format('woff2')}
@font-face{font-family:Poppins;font-weight:600;src:url(${staticFile('fonts/poppins-600.woff2')}) format('woff2')}
`;

export const V3 = () => {
  let from = 0;
  const seq = (f: number) => { const x = from; from += f; return x; };
  return (
    <AbsoluteFill style={{fontFamily: 'Poppins, system-ui, sans-serif', background: CANVAS}}>
      <style>{fontCss}</style>
      <Sequence from={seq(INTRO_F)} durationInFrames={INTRO_F}>
        <Card title="Dashboard walkthrough" total={INTRO_F} />
        <Sequence from={4}><Audio src={staticFile('v3/audio/intro.mp3')} /></Sequence>
      </Sequence>
      {STILLS.map((s) => {
        const f = stillFrames(s.id);
        return (
          <Sequence key={s.id} from={seq(f)} durationInFrames={f}>
            <StillSeg s={s} frames={f} />
          </Sequence>
        );
      })}
      {PIECES.map((p, i) => {
        const f = pieceFrames(p);
        return (
          <Sequence key={i} from={seq(f)} durationInFrames={f}>
            <LiveSeg p={p} frames={f} />
          </Sequence>
        );
      })}
      <Sequence from={seq(OUTRO_F)} durationInFrames={OUTRO_F}>
        <Card title={'That’s your dashboard'} sub="app.tringg.ai" total={OUTRO_F} />
        <Sequence from={6}><Audio src={staticFile('v3/audio/outro.mp3')} /></Sequence>
      </Sequence>
    </AbsoluteFill>
  );
};
