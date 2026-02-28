<script lang="ts">
  import TopNav from '../nav/TopNav.svelte';
  import EventList from './EventList.svelte';
  import MatchUpList from './MatchUpList.svelte';
  import LoadingSpinner from '../shared/LoadingSpinner.svelte';
  import ErrorMessage from '../shared/ErrorMessage.svelte';
  import { setTournamentContext, setEventContext } from '../../stores/navigation.svelte';
  import { fetchTournamentInfo, getTournamentsState } from '../../stores/tournaments.svelte';
  import { fetchEventMatchUps, getEventDataState, clearEventData } from '../../stores/eventData.svelte';
  import { onMount } from 'svelte';
  import type { TournamentInfo } from '../../types';

  let { tournamentId, eventId }: {
    tournamentId: string;
    eventId?: string;
  } = $props();

  const tournaments = getTournamentsState();
  const eventData = getEventDataState();

  let tournamentInfo = $state<TournamentInfo | undefined>(undefined);
  let loadError = $state<string | undefined>(undefined);

  onMount(async () => {
    const info = await fetchTournamentInfo(tournamentId);
    if (info) {
      tournamentInfo = info;

      if (eventId) {
        const eventInfo = info.eventInfo?.find((e) => e.eventId === eventId);
        setEventContext(
          tournamentId,
          eventId,
          info.tournamentName,
          eventInfo?.eventName || 'Event',
        );
        await fetchEventMatchUps(tournamentId, eventId);
      } else {
        setTournamentContext(tournamentId, info.tournamentName);
        clearEventData();
      }
    } else {
      loadError = tournaments.error || 'Failed to load tournament';
    }
  });
</script>

<div class="tournament-page">
  <TopNav />

  <div class="content">
    {#if loadError}
      <ErrorMessage message={loadError} />
    {:else if !tournamentInfo}
      <LoadingSpinner />
    {:else if eventId}
      <!-- Event detail view with matchUps grouped by status -->
      {#if eventData.loading}
        <LoadingSpinner />
      {:else if eventData.error}
        <ErrorMessage message={eventData.error} />
      {:else}
        <MatchUpList title="Ready to Score" matchUps={eventData.readyToScoreMatchUps} />
        <MatchUpList title="In Progress" matchUps={eventData.inProgressMatchUps} />
        <MatchUpList title="Completed" matchUps={eventData.completedMatchUps} collapsed={true} />
      {/if}
    {:else}
      <!-- Tournament overview with event list -->
      <EventList
        events={tournamentInfo.eventInfo || []}
        {tournamentId}
      />
    {/if}
  </div>
</div>

<style>
  .tournament-page {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #0f0f23;
    color: #fff;
  }
  .content {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
  }
</style>
