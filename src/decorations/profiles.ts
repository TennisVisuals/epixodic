import type { DecorationProfile } from './types';

export const STANDARD_PROFILE: DecorationProfile = {
  id: 'standard',
  label: 'Standard',
  strokes: [
    { name: 'Lob' },
    { name: 'Overhead' },
    { name: 'Volley' },
    { name: 'Drive Volley' },
    { name: 'Drive' },
    { name: 'Slice' },
    { name: 'Half Volley' },
    { name: 'Drop Shot' },
  ],
};

export const INTENNSE_PROFILE: DecorationProfile = {
  id: 'intennse',
  label: 'INTENNSE',
  strokes: [
    { name: 'Lob' },
    { name: 'Overhead' },
    { name: 'Volley' },
    { name: 'Drive Volley' },
    { name: 'Drive' },
    { name: 'Slice' },
    { name: 'Half Volley' },
    { name: 'Drop Shot' },
    { name: 'Touch', context: 'error' },
  ],
};
