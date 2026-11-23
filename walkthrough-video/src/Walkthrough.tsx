import {AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {BEATS, Beat, SECTIONS, framesFor} from './data';

const INK = '#111111';
const MINT = '#4FC2B4';
const MINT_D = '#1F6E62';
const CANVAS = '#F2F1ED';

const fontCss = `
@font-face{font-family:Poppins;font-weight:400;src:url(${staticFile('fonts/poppins-400.woff2')}) format('woff2')}
@font-face{font-family:Poppins;font-weight:500;src:url(${staticFile('fonts/poppins-500.woff2')}) format('woff2')}
@font-face{font-family:Poppins;font-weight:600;src:url(${staticFile('fonts/poppins-600.woff2')}) format('woff2')}
`;

const Waveform = ({active}: {active: boolean}) => {
  const f = useCurrentFrame();
  return (
    <div style={{display: 'flex', gap: 4, alignItems: 'center', height: 28}}>
      {Array.from({length: 5}).map((_, i) => {
        const h = active ? 8 + 18 * Math.abs(Math.sin(f / 5 + i * 1.3)) : 6;
        return <i key={i} style={{width: 5, height: h, borderRadius: 3, background: MINT}} />;
      })}
    </div>
  );
};

const Caption = ({beat, pos, side, children}: {beat: Beat; pos: 'top' | 'bottom'; side: 'left' | 'right'; children: string}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = spring({frame: frame - 6, fps, config: {damping: 200}});
  const speaking = frame < Math.floor(beat.dur * fps);
  return (
    <div style={{position: 'absolute', left: 56, right: 56, [pos]: 48, display: 'flex', justifyContent: side === 'left' ? 'flex-start' : 'flex-end', opacity: t, transform: `translateY(${(1 - t) * (pos === 'bottom' ? 24 : -24)}px)`}}>
      <div style={{maxWidth: 1020, display: 'flex', alignItems: 'center', gap: 22, padding: '22px 34px 22px 26px', borderRadius: 26, background: INK, color: '#fff', boxShadow: '0 24px 60px -18px rgba(0,0,0,.55)'}}>
        <div style={{flex: 'none', width: 64, height: 64, borderRadius: '50%', background: '#1d2b29', border: `2px solid ${MINT}`, display: 'grid', placeItems: 'center'}}>
          <Waveform active={speaking} />
        </div>
        <div>
          <div style={{fontSize: 20, fontWeight: 600, color: MINT, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6}}>Katie</div>
          <div style={{fontSize: 31, lineHeight: 1.34, fontWeight: 500}}>{children}</div>
        </div>
      </div>
    </div>
  );
};

const Progress = ({section}: {section: string}) => (
  <div style={{position: 'absolute', top: 22, right: 28, display: 'flex', gap: 10, zIndex: 5}}>
    {SECTIONS.map((s) => (
      <div key={s} style={{padding: '8px 18px', borderRadius: 999, fontSize: 20, fontWeight: 600, background: s === section ? INK : 'rgba(255,255,255,.92)', color: s === section ? '#fff' : '#4a4a4a', border: `1.5px solid ${s === section ? INK : '#d6d4cd'}`}}>{s}</div>
    ))}
  </div>
);

const ShotBeat = ({beat}: {beat: Beat}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const [x, y, w, h] = beat.rect!;
  const pad = 14;
  const cx = x + w / 2;
  const cy = y + h / 2;
  const target = Math.max(1, Math.min(1.32, 1640 / (w + pad * 2), 860 / (h + pad * 2)));
  const z = spring({frame, fps, config: {damping: 200}, durationInFrames: 30});
  const scale = 1 + (target - 1) * z;
  const tx = Math.min(0, Math.max(1920 - 1920 * scale, (960 - cx * scale) * z));
  const ty = Math.min(0, Math.max(1080 - 1080 * scale, (540 - cy * scale) * z));
  const drift = interpolate(frame, [0, framesFor(beat)], [0, 8]);
  const ring = spring({frame: frame - 8, fps, config: {damping: 200}, durationInFrames: 24});
  const dim = interpolate(ring, [0, 1], [0, 0.42]);
  const pulse = 1 + 0.012 * Math.sin(frame / 8);
  const rx = x - pad, ry = y - pad, rw = w + pad * 2, rh = h + pad * 2;
  const fade = interpolate(frame, [0, 8, framesFor(beat) - 8, framesFor(beat)], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: CANVAS, opacity: fade}}>
      <AbsoluteFill style={{transformOrigin: '0 0', transform: `translate(${tx}px, ${ty - drift}px) scale(${scale})`}}>
        <Img src={staticFile(beat.shot!)} style={{width: 1920, height: 1080}} />
        <div style={{position: 'absolute', left: rx, top: ry, width: rw, height: rh, borderRadius: 22, boxShadow: `0 0 0 3000px rgba(17,17,17,${dim})`, border: `4px solid ${MINT}`, transform: `scale(${pulse})`, opacity: ring}} />
      </AbsoluteFill>
      <Progress section={beat.section!} />
      <Caption beat={beat} pos={beat.cap ?? 'bottom'} side={cx > 960 ? 'left' : 'right'}>{beat.text}</Caption>
    </AbsoluteFill>
  );
};

const CardBeat = ({beat}: {beat: Beat}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = spring({frame, fps, config: {damping: 200}, durationInFrames: 30});
  const fade = interpolate(frame, [framesFor(beat) - 10, framesFor(beat)], [1, 0], {extrapolateLeft: 'clamp'});
  const speaking = frame < Math.floor(beat.dur * fps);
  return (
    <AbsoluteFill style={{background: CANVAS, justifyContent: 'center', alignItems: 'center', opacity: fade}}>
      <div style={{textAlign: 'center', opacity: t, transform: `translateY(${(1 - t) * 30}px)`}}>
        <div style={{fontSize: 150, fontWeight: 600, color: MINT_D, letterSpacing: -5, lineHeight: 1}}>Tringg</div>
        <div style={{fontSize: 74, fontWeight: 600, color: INK, marginTop: 36, letterSpacing: -1.5}}>{beat.title}</div>
        <div style={{fontSize: 34, color: '#5E5E5B', marginTop: 20, fontWeight: 400}}>{beat.sub}</div>
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 64, color: INK, fontSize: 26, fontWeight: 500}}>
          <div style={{width: 56, height: 56, borderRadius: '50%', background: INK, display: 'grid', placeItems: 'center'}}><Waveform active={speaking} /></div>
          Voiced by Katie
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Walkthrough = () => {
  let from = 0;
  return (
    <AbsoluteFill style={{fontFamily: 'Poppins, system-ui, sans-serif', background: CANVAS}}>
      <style>{fontCss}</style>
      {BEATS.map((b) => {
        const d = framesFor(b);
        const el = (
          <Sequence key={b.id} from={from} durationInFrames={d}>
            {b.kind === 'card' ? <CardBeat beat={b} /> : <ShotBeat beat={b} />}
            <Sequence from={3}><Audio src={staticFile(`audio/${b.id}.mp3`)} /></Sequence>
          </Sequence>
        );
        from += d;
        return el;
      })}
    </AbsoluteFill>
  );
};
