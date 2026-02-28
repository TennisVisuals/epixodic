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
    background: #1a1a2e;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    flex-shrink: 0;
  }
</style>
