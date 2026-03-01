<script lang="ts">
  let { message }: { message: string } = $props();
</script>

<div class="empty-state">
  <p>{message}</p>
</div>

<style>
  .empty-state {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 3rem 1rem;
    color: var(--ep-page-text-muted);
    font-size: 0.925rem;
    text-align: center;
  }
</style>
