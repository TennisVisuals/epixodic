<script lang="ts">
  import type { EventInfo } from '../../types';

  let { event, onclick }: {
    event: EventInfo;
    onclick?: () => void;
  } = $props();
</script>

<button class="event-card" {onclick}>
  <div class="event-info">
    <span class="event-name">{event.eventName}</span>
    {#if event.category?.categoryName}
      <span class="event-category">{event.category.categoryName}</span>
    {/if}
  </div>
  <div class="event-meta">
    {#if event.eventType}
      <span class="event-type-badge">{event.eventType}</span>
    {/if}
    <span class="chevron">&#8250;</span>
  </div>
</button>

<style>
  .event-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0.875rem 1rem;
    background: rgba(255, 255, 255, 0.03);
    border: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    color: #fff;
    cursor: pointer;
    text-align: left;
    transition: background 0.15s;
  }
  .event-card:hover {
    background: rgba(255, 255, 255, 0.06);
  }
  .event-info {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }
  .event-name {
    font-size: 0.925rem;
    font-weight: 500;
  }
  .event-category {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.5);
  }
  .event-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .event-type-badge {
    font-size: 0.7rem;
    font-weight: 600;
    padding: 0.15rem 0.5rem;
    border-radius: 4px;
    background: rgba(74, 158, 255, 0.15);
    color: #4a9eff;
    text-transform: uppercase;
  }
  .chevron {
    font-size: 1.25rem;
    color: rgba(255, 255, 255, 0.3);
  }
</style>
