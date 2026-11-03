import { Composition } from 'remotion';
import { Promo } from './Promo';
import { TOTAL } from './timeline';
import { W, H, FPS } from './tokens';

export const Root = () => (
  <Composition id="YaraHook" component={Promo} durationInFrames={TOTAL} fps={FPS} width={W} height={H} defaultProps={{ bgm: true }} />
);
