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
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.925rem;
    text-align: center;
  }
</style>
