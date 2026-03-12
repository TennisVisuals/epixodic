<script lang="ts">
  import SectionHeader from '../shared/SectionHeader.svelte';
  import MatchUpCard from '../archive/MatchUpCard.svelte';
  import type { HydratedMatchUp } from '../../types';

  let { title, matchUps, collapsed = false }: {
    title: string;
    matchUps: HydratedMatchUp[];
    collapsed?: boolean;
  } = $props();
</script>

{#if matchUps.length > 0}
  <SectionHeader {title} count={matchUps.length} {collapsed}>
    {#each matchUps as matchUp (matchUp.matchUpId)}
      <MatchUpCard {matchUp} />
    {/each}
  </SectionHeader>
{/if}
