<script lang="ts">
  let { label, icon = '', onclick }: { label: string; icon?: string; onclick: () => void } = $props();
</script>

<button class="nav-action" {onclick}>
  {#if icon}
    <span class="nav-action-icon">{icon}</span>
  {/if}
  <span class="nav-action-label">{label}</span>
</button>

<style>
  .nav-action {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.5rem 1rem;
    background: rgba(74, 158, 255, 0.15);
    border: 1px solid rgba(74, 158, 255, 0.3);
    border-radius: 8px;
    color: var(--ep-accent);
    font-size: 0.8125rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s;
  }
  .nav-action:hover {
    background: rgba(74, 158, 255, 0.25);
  }
  .nav-action:active {
    background: rgba(74, 158, 255, 0.35);
  }
  .nav-action-icon {
    font-size: 1rem;
  }
</style>
