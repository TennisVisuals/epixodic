<script lang="ts">
  import MatchUpCard from './MatchUpCard.svelte';
  import EmptyState from '../shared/EmptyState.svelte';
  import { getLocalMatchUpsState, deleteLocalMatchUp } from '../../stores/localMatchUps.svelte';
  import { matchPath } from '../../../router/routes';

  const local = getLocalMatchUpsState();

  let activePopup: HTMLElement | null = null;
  let dismissListener: ((e: MouseEvent) => void) | null = null;

  function dismissPopup() {
    if (activePopup) {
      activePopup.remove();
      activePopup = null;
    }
    if (dismissListener) {
      document.removeEventListener('click', dismissListener, true);
      dismissListener = null;
    }
  }

  function showPopupMenu(event: MouseEvent, matchUpId: string) {
    dismissPopup();

    const menu = document.createElement('div');
    menu.className = 'archive-popup';

    const editBtn = document.createElement('div');
    editBtn.className = 'archive-popup-item';
    editBtn.textContent = 'Edit Details';
    editBtn.onclick = (e) => {
      e.stopPropagation();
      dismissPopup();
      const router = (window as any).appRouter;
      router?.navigate(matchPath(matchUpId, 'details'));
    };

    const deleteBtn = document.createElement('div');
    deleteBtn.className = 'archive-popup-item archive-popup-delete';
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      dismissPopup();
      deleteLocalMatchUp(matchUpId);
    };

    menu.appendChild(editBtn);
    menu.appendChild(deleteBtn);

    menu.style.position = 'fixed';
    menu.style.left = `${event.clientX}px`;
    menu.style.top = `${event.clientY}px`;
    document.body.appendChild(menu);

    const rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      menu.style.left = `${window.innerWidth - rect.width - 8}px`;
    }
    if (rect.bottom > window.innerHeight) {
      menu.style.top = `${event.clientY - rect.height}px`;
    }

    activePopup = menu;
    dismissListener = (e: MouseEvent) => {
      if (!menu.contains(e.target as Node)) {
        dismissPopup();
      }
    };
    setTimeout(() => {
      if (dismissListener) {
        document.addEventListener('click', dismissListener, true);
      }
    }, 0);
  }

  function navigateToScoring(matchUpId: string) {
    dismissPopup();
    const router = (window as any).appRouter;
    router?.navigate(matchPath(matchUpId, 'scoring'));
  }
</script>

{#if local.myMatchUps.length === 0}
  <EmptyState message="No matchUps yet. Tap + to create one." />
{:else}
  <div class="matchup-list">
    {#each local.myMatchUps as matchUp (matchUp.matchUpId)}
      <MatchUpCard
        {matchUp}
        onclick={() => navigateToScoring(matchUp.matchUpId)}
        oncontextmenu={(e) => showPopupMenu(e, matchUp.matchUpId)}
      />
    {/each}
  </div>
{/if}

<style>
  .matchup-list {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }
</style>
