import { baseApi } from '../../services/messaging/baseApi';
import type { TournamentInfo, HydratedMatchUp } from '../types';

interface ApiResult<T> {
  data?: T;
  error?: string;
}

export interface ScheduledMatchUpsResponse {
  dateMatchUps?: Record<string, HydratedMatchUp[]>;
  completedMatchUps?: HydratedMatchUp[];
  groupInfo?: Record<string, any>;
  mappedParticipants?: Record<string, any>;
  courtsData?: any[];
}

export async function getTournamentInfo(tournamentId: string): Promise<ApiResult<TournamentInfo>> {
  try {
    const response = await baseApi.get(`/factory/tournamentinfo/${tournamentId}`);
    return { data: response.data };
  } catch (e: any) {
    return { error: e.message || 'Failed to fetch tournament info' };
  }
}

export async function getEventData(
  tournamentId: string,
  eventId: string,
): Promise<ApiResult<any>> {
  try {
    const response = await baseApi.post('/factory/eventdata', { tournamentId, eventId });
    return { data: response.data };
  } catch (e: any) {
    return { error: e.message || 'Failed to fetch event data' };
  }
}

export async function getScheduledMatchUps(
  tournamentId: string,
  options?: Record<string, any>,
): Promise<ApiResult<ScheduledMatchUpsResponse>> {
  try {
    const response = await baseApi.post('/factory/scheduledmatchups', {
      params: {
        tournamentId,
        usePublishState: true,
        hydrateParticipants: true,
        ...options,
      },
    });
    return { data: response.data };
  } catch (e: any) {
    return { error: e.message || 'Failed to fetch scheduled matchUps' };
  }
}

export async function getParticipants(
  tournamentId: string,
  options?: Record<string, any>,
): Promise<ApiResult<any>> {
  try {
    const response = await baseApi.post('/factory/participants', {
      tournamentId,
      ...options,
    });
    return { data: response.data };
  } catch (e: any) {
    return { error: e.message || 'Failed to fetch participants' };
  }
}
