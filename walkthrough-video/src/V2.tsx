import {AbsoluteFill, Audio, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import beats from './beats2.json';

export const FPS = 30;
const INK = '#111111';
const MINT = '#4FC2B4';
const MINT_D = '#1F6E62';
const CANVAS = '#F2F1ED';
export const REC_SECONDS = 92.93;

const intro = beats.find((b) => b.id === 'intro')!;
const outro = beats.find((b) => b.id === 'outro')!;
const shots = beats.filter((b) => b.at != null);
const INTRO_F = Math.ceil((intro.dur + 0.5) * FPS);
const REC_F = Math.ceil(REC_SECONDS * FPS);
const OUTRO_F = Math.ceil((outro.dur + 0.6) * FPS);
export const V2_TOTAL = INTRO_F + REC_F + OUTRO_F;

const fontCss = `
@font-face{font-family:Poppins;font-weight:400;src:url(${staticFile('fonts/poppins-400.woff2')}) format('woff2')}
@font-face{font-family:Poppins;font-weight:500;src:url(${staticFile('fonts/poppins-500.woff2')}) format('woff2')}
@font-face{font-family:Poppins;font-weight:600;src:url(${staticFile('fonts/poppins-600.woff2')}) format('woff2')}
`;

const Bars = ({on}: {on: boolean}) => {
  const f = useCurrentFrame();
  return (
    <div style={{display: 'flex', gap: 3, alignItems: 'center', height: 18, width: 22}}>
      {[0, 1, 2].map((i) => (
        <i key={i} style={{width: 4, height: on ? 6 + 11 * Math.abs(Math.sin(f / 4 + i * 1.4)) : 5, borderRadius: 2, background: MINT_D}} />
      ))}
    </div>
  );
};

const Caption = ({text, dur}: {text: string; dur: number}) => {
  const frame = useCurrentFrame();
  const end = Math.ceil((dur + 0.25) * FPS);
  const o = interpolate(frame, [0, 6, end - 6, end], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', left: 352, bottom: 34, opacity: o, transform: `translateY(${(1 - o) * 8}px)`}}>
      <div style={{maxWidth: 860, display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px 12px 16px', borderRadius: 16, background: 'rgba(255,255,255,0.95)', border: '1px solid #E6E4DE', boxShadow: '0 12px 32px -14px rgba(17,17,17,.28)', color: INK}}>
        <Bars on={frame < Math.floor(dur * FPS)} />
        <div style={{fontSize: 25, lineHeight: 1.34, fontWeight: 500}}>{text}</div>
      </div>
    </div>
  );
};

const Card = ({title, sub, dur}: {title: string; sub?: string; dur: number}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = spring({frame, fps, config: {damping: 200}, durationInFrames: 24});
  const total = Math.ceil(dur * FPS);
  const o = interpolate(frame, [total - 10, total], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: CANVAS, justifyContent: 'center', alignItems: 'center', opacity: o}}>
      <div style={{textAlign: 'center', opacity: t, transform: `translateY(${(1 - t) * 14}px)`}}>
        <div style={{fontSize: 88, fontWeight: 600, color: MINT_D, letterSpacing: -3, lineHeight: 1}}>Tringg</div>
        <div style={{fontSize: 38, fontWeight: 500, color: INK, marginTop: 22, letterSpacing: -0.5}}>{title}</div>
        {sub ? <div style={{fontSize: 24, color: '#5E5E5B', marginTop: 10}}>{sub}</div> : null}
      </div>
    </AbsoluteFill>
  );
};

export const V2 = () => (
  <AbsoluteFill style={{fontFamily: 'Poppins, system-ui, sans-serif', background: CANVAS}}>
    <style>{fontCss}</style>
    <Sequence from={0} durationInFrames={INTRO_F}>
      <Card title="Dashboard walkthrough" dur={intro.dur + 0.5} />
      <Sequence from={4}><Audio src={staticFile('v2/audio/intro.mp3')} /></Sequence>
    </Sequence>
    <Sequence from={INTRO_F} durationInFrames={REC_F}>
      <OffthreadVideo src={staticFile('v2/rec.mp4')} style={{width: 1920, height: 1080}} />
      {shots.map((b) => {
        const from = Math.round((b.at as number) * FPS);
        return (
          <Sequence key={b.id} from={from} durationInFrames={Math.ceil((b.dur + 0.4) * FPS)}>
            <Caption text={b.text} dur={b.dur} />
            <Audio src={staticFile(`v2/audio/${b.id}.mp3`)} />
          </Sequence>
        );
      })}
    </Sequence>
    <Sequence from={INTRO_F + REC_F} durationInFrames={OUTRO_F}>
      <Card title="That’s your dashboard" sub="app.tringg.ai" dur={outro.dur + 0.6} />
      <Sequence from={6}><Audio src={staticFile('v2/audio/outro.mp3')} /></Sequence>
    </Sequence>
  </AbsoluteFill>
);
