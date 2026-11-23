import beats from './beats.json';

export type Rect = [number, number, number, number]; // x, y, w, h in 1920x1080 screenshot space
export type Beat = {
  id: string;
  kind: 'card' | 'shot';
  text: string;
  dur: number; // narration seconds
  shot?: string;
  rect?: Rect;
  section?: string;
  cap?: 'top' | 'bottom';
  title?: string;
  sub?: string;
};

const dur = (id: string) => beats.find((b) => b.id === id)!.dur;
const text = (id: string) => beats.find((b) => b.id === id)!.text;

const shot = (id: string, section: string, img: string, rect: Rect, cap: 'top' | 'bottom' = 'bottom'): Beat => ({
  id, kind: 'shot', text: text(id), dur: dur(id), shot: img, rect, section, cap,
});

export const BEATS: Beat[] = [
  {id: 'intro', kind: 'card', text: text('intro'), dur: dur('intro'), title: 'Dashboard walkthrough', sub: 'Overview · Reservations · Calls · Agents'},
  shot('ov1', 'Overview', 'shots/overview.png', [352, 173, 1536, 123]),
  shot('ov2', 'Overview', 'shots/overview.png', [884, 5, 472, 70]),
  shot('ov3', 'Overview', 'shots/overview.png', [1287, 323, 601, 675]),
  shot('rs1', 'Reservations', 'shots/reservations.png', [352, 112, 540, 104]),
  shot('rs2', 'Reservations', 'shots/reservations.png', [1648, 112, 240, 48]),
  shot('ca1', 'Calls', 'shots/calls.png', [352, 147, 1536, 122]),
  shot('ca2', 'Calls', 'shots/calls.png', [375, 350, 860, 130]),
  shot('ca3', 'Calls', 'shots/calls.png', [1285, 292, 603, 755]),
  shot('ca4', 'Calls', 'shots/calls2.png', [1312, 700, 548, 347], 'top'),
  shot('ag1', 'Agents', 'shots/agents.png', [352, 259, 497, 404]),
  shot('ag2', 'Agents', 'shots/agents.png', [375, 588, 452, 59]),
  shot('ag3', 'Agents', 'shots/agents.png', [1708, 168, 180, 59]),
  {id: 'outro', kind: 'card', text: text('outro'), dur: dur('outro'), title: 'That’s the Tringg dashboard', sub: 'app.tringg.ai'},
];

export const FPS = 30;
export const PAD = 0.55; // seconds of breathing room after each line
export const framesFor = (b: Beat) => Math.ceil((b.dur + PAD) * FPS);
export const TOTAL = BEATS.reduce((a, b) => a + framesFor(b), 0);
export const SECTIONS = ['Overview', 'Reservations', 'Calls', 'Agents'];
