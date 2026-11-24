import {Composition} from 'remotion';
import {Walkthrough} from './Walkthrough';
import {V2, V2_TOTAL} from './V2';
import {TOTAL, FPS} from './data';

export const Root = () => (
  <>
    <Composition id="WalkthroughV2" component={V2} durationInFrames={V2_TOTAL} fps={FPS} width={1920} height={1080} />
    <Composition id="Walkthrough" component={Walkthrough} durationInFrames={TOTAL} fps={FPS} width={1920} height={1080} />
  </>
);
