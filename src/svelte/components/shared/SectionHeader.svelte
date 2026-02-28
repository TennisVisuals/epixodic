<script lang="ts">
  import type { Snippet } from 'svelte';

  let { title, count = 0, collapsed = false, children }: {
    title: string;
    count?: number;
    collapsed?: boolean;
    children?: Snippet;
  } = $props();

  let isCollapsed = $state(collapsed);

  function toggle() {
    isCollapsed = !isCollapsed;
  }
</script>

<button class="section-header" onclick={toggle}>
  <span class="section-title">{title}</span>
  {#if count > 0}
    <span class="section-count">{count}</span>
  {/if}
  <span class="section-chevron" class:rotated={!isCollapsed}>&#9660;</span>
</button>

{#if !isCollapsed && children}
  <div class="section-content">
    {@render children()}
  </div>
{/if}

<style>
  .section-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.625rem 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.85);
    font-size: 0.8125rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    cursor: pointer;
    text-align: left;
  }
  .section-count {
    background: rgba(74, 158, 255, 0.2);
    color: #4a9eff;
    padding: 0.1rem 0.45rem;
    border-radius: 10px;
    font-size: 0.75rem;
    font-weight: 600;
  }
  .section-chevron {
    margin-left: auto;
    font-size: 0.625rem;
    transition: transform 0.2s;
    transform: rotate(-90deg);
  }
  .section-chevron.rotated {
    transform: rotate(0deg);
  }
  .section-content {
    display: flex;
    flex-direction: column;
  }
</style>
