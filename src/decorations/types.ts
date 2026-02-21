export type StrokeContext = 'winner' | 'error';

export interface StrokeDecoration {
  readonly name: string;
  readonly context?: StrokeContext; // omit = shown for both winners and errors
}

export interface DecorationProfile {
  readonly id: string;
  readonly label: string;
  readonly strokes: StrokeDecoration[];
}

import { WINNER } from '../utils/constants';

export function resultToContext(result: string): StrokeContext {
  return result === WINNER ? 'winner' : 'error';
}
