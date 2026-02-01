import { stateChangeEvent } from './displayUpdate';
import { checkMatchEnd } from './checkMatchEnd';
import { strokeSlider } from './strokeSlider';
import { env } from './env';

export function strokeAction(element: any) {
  const hand: string = element.getAttribute('hand');
  const stroke: string = element.getAttribute('stroke');

  if (hand && stroke) {
    const last_point = env.match.history.lastPoint();

    // V3 decoratePoint - drives UI
    env.match.decoratePoint(last_point, { hand, stroke });

    // V4 decoratePoint - parallel testing (no UI interaction)
    try {
      env.matchUp.decoratePoint(last_point, { hand, stroke });
    } catch (e) {
      console.error('[HVE] V4 decoratePoint shadow call FAILED:', e);
    }

    stateChangeEvent(); // make sure to save the decoration in case of exit!!
  } else {
    console.warn('strokeAction: missing hand or stroke attribute');
  }
  strokeSlider();
  const point_episodes = env.match.history.action('addPoint');
  const last_action = point_episodes[point_episodes.length - 1];
  checkMatchEnd(last_action);
  // Broadcasting removed
}
