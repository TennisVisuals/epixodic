<script lang="ts">
  import type { TournamentInfo } from '../../types';

  let { tournament, onclick }: {
    tournament: TournamentInfo;
    onclick?: () => void;
  } = $props();

  function formatDateRange(start?: string, end?: string): string {
    if (!start) return '';
    const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    const s = new Date(start).toLocaleDateString(undefined, opts);
    if (!end || start === end) return s;
    const e = new Date(end).toLocaleDateString(undefined, opts);
    return `${s} - ${e}`;
  }
</script>

<button class="tournament-card" {onclick}>
  <div class="tournament-info">
    <span class="tournament-name">{tournament.tournamentName}</span>
    {#if tournament.startDate}
      <span class="tournament-dates">{formatDateRange(tournament.startDate, tournament.endDate)}</span>
    {/if}
  </div>
  <div class="tournament-meta">
    {#if tournament.eventInfo?.length}
      <span class="event-count">{tournament.eventInfo.length} event{tournament.eventInfo.length !== 1 ? 's' : ''}</span>
    {/if}
    <span class="chevron">&#8250;</span>
  </div>
</button>

<style>
  .tournament-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0.875rem 1rem;
    background: var(--ep-page-surface);
    border: none;
    border-bottom: 1px solid var(--ep-page-surface-border);
    color: var(--ep-page-text);
    cursor: pointer;
    text-align: left;
    transition: background 0.15s;
  }
  .tournament-card:hover {
    background: var(--ep-page-surface-hover);
  }
  .tournament-info {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }
  .tournament-name {
    font-size: 0.925rem;
    font-weight: 500;
  }
  .tournament-dates {
    font-size: 0.8rem;
    color: var(--ep-page-text-muted);
  }
  .tournament-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .event-count {
    font-size: 0.8rem;
    color: var(--ep-page-text-dim);
  }
  .chevron {
    font-size: 1.25rem;
    color: var(--ep-page-text-subtle);
  }
</style>
