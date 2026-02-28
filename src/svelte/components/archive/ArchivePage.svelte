<script lang="ts">
  import TopNav from '../nav/TopNav.svelte';
  import BottomNav from '../nav/BottomNav.svelte';
  import MyMatchUps from './MyMatchUps.svelte';
  import TournamentList from './TournamentList.svelte';
  import { setArchiveContext } from '../../stores/navigation.svelte';
  import { refreshLocalMatchUps } from '../../stores/localMatchUps.svelte';
  import { newMatch } from '../../../match/displayMatchArchive';
  import { onMount } from 'svelte';
  import type { NavAction } from '../../types';

  let activeTab = $state<'my' | 'tournaments'>('my');

  const bottomActions: NavAction[] = [
    { label: '+ New Match', action: () => newMatch() },
  ];

  onMount(() => {
    setArchiveContext();
    refreshLocalMatchUps();
  });
</script>

<div class="archive-page">
  <TopNav />

  <div class="tab-bar">
    <button
      class="tab"
      class:active={activeTab === 'my'}
      onclick={() => (activeTab = 'my')}
    >
      My MatchUps
    </button>
    <button
      class="tab"
      class:active={activeTab === 'tournaments'}
      onclick={() => (activeTab = 'tournaments')}
    >
      Tournaments
    </button>
  </div>

  <div class="content">
    {#if activeTab === 'my'}
      <MyMatchUps />
    {:else}
      <TournamentList />
    {/if}
  </div>

  <BottomNav actions={bottomActions} />
</div>

<style>
  .archive-page {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #0f0f23;
    color: #fff;
  }
  .tab-bar {
    display: flex;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    flex-shrink: 0;
  }
  .tab {
    flex: 1;
    padding: 0.75rem;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: color 0.15s, border-color 0.15s;
  }
  .tab:hover {
    color: rgba(255, 255, 255, 0.7);
  }
  .tab.active {
    color: #4a9eff;
    border-bottom-color: #4a9eff;
  }
  .content {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
  }
</style>
