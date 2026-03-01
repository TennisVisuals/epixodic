<script lang="ts">
  import type { BreadcrumbItem } from '../../types';

  let { item, onclick }: { item: BreadcrumbItem; onclick?: () => void } = $props();
</script>

{#if item.active}
  <span class="breadcrumb active">{item.label}</span>
{:else}
  <button class="breadcrumb clickable" onclick={onclick}>
    {item.label}
  </button>
  <span class="separator">/</span>
{/if}

<style>
  .breadcrumb {
    font-size: 0.875rem;
    background: none;
    border: none;
    padding: 0;
    color: var(--ep-page-text-soft);
  }
  .breadcrumb.clickable {
    cursor: pointer;
    text-decoration: none;
  }
  .breadcrumb.clickable:hover {
    color: var(--ep-page-text-bright);
  }
  .breadcrumb.active {
    color: var(--ep-page-text);
    font-weight: 600;
  }
  .separator {
    color: var(--ep-page-text-subtle);
    margin: 0 0.35rem;
    font-size: 0.8rem;
  }
</style>
