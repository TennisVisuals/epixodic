<script lang="ts">
  import EventCard from './EventCard.svelte';
  import EmptyState from '../shared/EmptyState.svelte';
  import type { EventInfo } from '../../types';

  let { events = [], tournamentId }: {
    events: EventInfo[];
    tournamentId: string;
  } = $props();

  function navigateToEvent(eventId: string) {
    const router = (window as any).appRouter;
    router?.navigate(`/tournament/${tournamentId}/event/${eventId}`);
  }
</script>

{#if events.length === 0}
  <EmptyState message="No events found in this tournament." />
{:else}
  <div class="event-list">
    {#each events as event (event.eventId)}
      <EventCard
        {event}
        onclick={() => navigateToEvent(event.eventId)}
      />
    {/each}
  </div>
{/if}

<style>
  .event-list {
    display: flex;
    flex-direction: column;
  }
</style>
