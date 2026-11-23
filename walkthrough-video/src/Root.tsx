import {Composition} from 'remotion';
import {Walkthrough} from './Walkthrough';
import {TOTAL, FPS} from './data';

export const Root = () => (
  <Composition id="Walkthrough" component={Walkthrough} durationInFrames={TOTAL} fps={FPS} width={1920} height={1080} />
);
