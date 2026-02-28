<script lang="ts">
  let { message }: { message: string } = $props();
</script>

<div class="error-message">
  <span class="error-icon">!</span>
  <span>{message}</span>
</div>

<style>
  .error-message {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    margin: 0.5rem;
    background: rgba(221, 56, 48, 0.15);
    border: 1px solid rgba(221, 56, 48, 0.4);
    border-radius: 6px;
    color: #ff6b6b;
    font-size: 0.875rem;
  }
  .error-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: rgba(221, 56, 48, 0.3);
    font-size: 0.75rem;
    font-weight: bold;
    flex-shrink: 0;
  }
</style>
