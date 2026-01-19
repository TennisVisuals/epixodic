import { stateChangeEvent } from './displayUpdate';
import { checkMatchEnd } from './checkMatchEnd';
import { strokeSlider } from './strokeSlider';
import { env } from './env';

export function strokeAction(element: any) {
  const hand: string = element.getAttribute('hand');
  const stroke: string = element.getAttribute('stroke');
  if (hand && stroke) {
    const last_point = env.match.history.lastPoint();
    env.match.decoratePoint(last_point, { hand, stroke });
    stateChangeEvent(); // make sure to save the decoration in case of exit!!
  }
  strokeSlider();
  const point_episodes = env.match.history.action('addPoint');
  const last_action = point_episodes[point_episodes.length - 1];
  checkMatchEnd(last_action);
  // Broadcasting removed
}
