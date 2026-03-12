<script lang="ts">
  import NavAction from './NavAction.svelte';
  import type { NavAction as NavActionType } from '../../types';

  let { actions = [] }: { actions?: NavActionType[] } = $props();
</script>

{#if actions.length > 0}
  <nav class="bottom-nav">
    {#each actions as action}
      <NavAction label={action.label} icon={action.icon} onclick={action.action} />
    {/each}
  </nav>
{/if}

<style>
  .bottom-nav {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    height: 56px;
    padding: 0 1rem;
    background: var(--ep-page-secondary-bg);
    border-top: 1px solid var(--ep-page-border);
    flex-shrink: 0;
  }
</style>
