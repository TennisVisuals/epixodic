import { stateChangeEvent } from './displayUpdate';
import { checkMatchEnd } from './checkMatchEnd';
import { strokeSlider } from '../events/strokeSlider';
import { env, getEpisodes } from './env';

export function strokeAction(element: any) {
  const hand: string = element.getAttribute('hand');
  const stroke: string = element.getAttribute('stroke');

  if (hand && stroke) {
    const points = env.engine.getState().history?.points || [];
    const last_point = points.length > 0 ? points[points.length - 1] : undefined;

    if (last_point) {
      Object.assign(last_point, { hand, stroke });
    }

    stateChangeEvent(); // make sure to save the decoration in case of exit!!
  } else {
    console.warn('strokeAction: missing hand or stroke attribute');
  }
  strokeSlider();
  const point_episodes = getEpisodes();
  const last_action = point_episodes[point_episodes.length - 1];
  checkMatchEnd(last_action);
  // Broadcasting removed
}
