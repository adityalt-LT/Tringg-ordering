import {Composition} from 'remotion';
import {Walkthrough} from './Walkthrough';
import {V2, V2_TOTAL} from './V2';
import {V3, V3_TOTAL} from './V3';
import {TOTAL, FPS} from './data';

export const Root = () => (
  <>
    <Composition id="WalkthroughV3" component={V3} durationInFrames={V3_TOTAL} fps={FPS} width={1920} height={1080} />
    <Composition id="WalkthroughV2" component={V2} durationInFrames={V2_TOTAL} fps={FPS} width={1920} height={1080} />
    <Composition id="Walkthrough" component={Walkthrough} durationInFrames={TOTAL} fps={FPS} width={1920} height={1080} />
  </>
);
