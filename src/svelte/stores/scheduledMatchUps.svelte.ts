import { getScheduledMatchUps, type ScheduledMatchUpsResponse } from '../services/factoryApi';
import type { HydratedMatchUp } from '../types';

let data = $state<ScheduledMatchUpsResponse | undefined>(undefined);
let loading = $state(false);
let error = $state<string | undefined>(undefined);

export function getScheduledMatchUpsState() {
  return {
    get data() {
      return data;
    },
    get loading() {
      return loading;
    },
    get error() {
      return error;
    },
    get dateMatchUps() {
      return data?.dateMatchUps;
    },
    get completedMatchUps() {
      return data?.completedMatchUps;
    },
  };
}

export async function fetchScheduledMatchUps(
  tournamentId: string,
  options?: Record<string, any>,
): Promise<ScheduledMatchUpsResponse | undefined> {
  loading = true;
  error = undefined;

  const result = await getScheduledMatchUps(tournamentId, options);

  if (result.error) {
    error = result.error;
    loading = false;
    return undefined;
  }

  if (result.data) {
    data = result.data;
    loading = false;
    return result.data;
  }

  loading = false;
  return undefined;
}

export function clearScheduledMatchUps() {
  data = undefined;
  error = undefined;
}

export function getMatchUpsForDate(date: string): HydratedMatchUp[] {
  return data?.dateMatchUps?.[date] ?? [];
}
