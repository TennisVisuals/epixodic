<script lang="ts">
  import { renderMatchUp } from 'courthive-components';
  import type { HydratedMatchUp } from '../../types';

  let { matchUp, onclick, oncontextmenu }: {
    matchUp: HydratedMatchUp;
    onclick?: () => void;
    oncontextmenu?: (e: MouseEvent) => void;
  } = $props();

  const archiveComposition = {
    theme: '',
    configuration: {
      scheduleInfo: true,
    },
  };

  function mountRenderMatchUp(node: HTMLElement) {
    const element = renderMatchUp({
      matchUp: {
        ...matchUp,
        structureId: matchUp.structureId || '',
      },
      composition: archiveComposition,
      isAdHoc: true,
      eventHandlers: {
        matchUpClick: () => onclick?.(),
        scheduleClick: ({ pointerEvent }: { pointerEvent: MouseEvent }) => {
          pointerEvent.stopPropagation();
          oncontextmenu?.(pointerEvent);
        },
      },
    });
    node.appendChild(element);

    return {
      destroy() {
        node.innerHTML = '';
      },
    };
  }
</script>

<div class="matchup-card" use:mountRenderMatchUp></div>

<style>
  .matchup-card {
    width: 100%;
  }
  .matchup-card :global(.matchUp) {
    cursor: pointer;
  }
</style>
