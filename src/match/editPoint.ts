import { getProfile, resultToContext } from '../decorations';
import { stateChangeEvent } from '../display/displayUpdate';
import { browserStorage } from '../state/browserStorage';
import { rallyCount } from '../functions/legacyRally';
import { cModal } from 'courthive-components';
import { matchPath } from '../router/routes';
import { loadMatch } from './loadMatch';
import { env, getEpisodes, settings } from '../state/env';

const NO_DECORATION_RESULTS = ['Penalty', 'Ace', 'Double Fault'];

function isWinnerResult(result: string): boolean {
  return result === 'Winner' || result === 'Ace';
}

export function editPoint(index: number) {
  const episodes = getEpisodes();
  const episodePoint = episodes[index].point;
  const players = env.metadata.players;

  // Get the engine's actual point (episodes contain copies, not references)
  const enginePoints = env.engine.getState().history?.points || [];
  const pointIndex = episodePoint.index ?? index;
  const enginePoint = enginePoints[pointIndex];
  if (!enginePoint) return;

  let score = episodePoint.server ? episodePoint.score.split('-').reverse().join('-') : episodePoint.score;
  if (score === '0-0') score = 'Gamepoint';
  const title = `Set ${episodePoint.set + 1}, Game ${episodePoint.game + 1} — ${score}`;

  // Local state for the form (read from engine point which has all fields)
  let currentResult: string = enginePoint.result || '';
  let currentWinner: number = enginePoint.winner ?? 0;
  let currentPlayer: number = isWinnerResult(currentResult) ? currentWinner : 1 - currentWinner;
  let currentHand: string = enginePoint.hand || '';
  let currentStroke: string = enginePoint.stroke || '';
  let currentRally: number = enginePoint.rally ? rallyCount(enginePoint.rally) : 0;

  // If no result, default player to winner
  if (!currentResult) currentPlayer = currentWinner;

  // DOM references (set during content render)
  let resultSelect: HTMLSelectElement;
  let winnerSelect: HTMLSelectElement;
  let playerSelect: HTMLSelectElement;
  let handSelect: HTMLSelectElement;
  let strokeSelect: HTMLSelectElement;
  let rallyInput: HTMLInputElement;
  let decorationSection: HTMLElement;

  function buildResultOptions() {
    const prev = resultSelect.value;
    resultSelect.innerHTML = '';
    resultSelect.appendChild(new Option('- select -', ''));

    const results: string[] = ['Winner', 'Unforced Error', 'Forced Error'];
    if (String(playerSelect.value) === String(enginePoint.server)) {
      results.push('Ace', 'Double Fault');
    }
    for (const r of results) {
      resultSelect.appendChild(new Option(r, r));
    }
    resultSelect.value = results.includes(prev) ? prev : '';
  }

  function buildStrokeOptions() {
    strokeSelect.innerHTML = '';
    strokeSelect.appendChild(new Option('- select -', ''));
    const profileId = settings.decoration_profile || 'standard';
    const profile = getProfile(profileId);
    if (!profile) return;

    const context = currentResult ? resultToContext(currentResult) : undefined;
    const visible = profile.strokes.filter((s) => !s.context || !context || s.context === context);
    for (const s of visible) {
      strokeSelect.appendChild(new Option(s.name, s.name));
    }
    strokeSelect.value = currentStroke;
  }

  function updateDecorationVisibility() {
    const hide = NO_DECORATION_RESULTS.includes(currentResult);
    decorationSection.style.display = hide ? 'none' : '';
  }

  function syncFromResult() {
    currentResult = resultSelect.value;
    if (isWinnerResult(currentResult)) {
      // Winner/Ace → player made the shot = winner
      playerSelect.value = String(winnerSelect.value);
      currentPlayer = Number(winnerSelect.value);
    } else if (currentResult === 'Double Fault' || currentResult === 'Unforced Error' || currentResult === 'Forced Error') {
      // Error/DF → player made the shot = loser
      playerSelect.value = String(1 - Number(winnerSelect.value));
      currentPlayer = 1 - Number(winnerSelect.value);
    }
    buildResultOptions();
    resultSelect.value = currentResult;
    buildStrokeOptions();
    updateDecorationVisibility();
  }

  function syncFromWinner() {
    currentWinner = Number(winnerSelect.value);
    if (isWinnerResult(currentResult)) {
      playerSelect.value = String(currentWinner);
      currentPlayer = currentWinner;
    } else if (currentResult) {
      playerSelect.value = String(1 - currentWinner);
      currentPlayer = 1 - currentWinner;
    }
  }

  function syncFromPlayer() {
    currentPlayer = Number(playerSelect.value);
    if (isWinnerResult(currentResult)) {
      winnerSelect.value = String(currentPlayer);
      currentWinner = currentPlayer;
    } else if (currentResult) {
      winnerSelect.value = String(1 - currentPlayer);
      currentWinner = 1 - currentPlayer;
    }
    buildResultOptions();
    resultSelect.value = currentResult;
  }

  const selectStyle = 'width: 100%; padding: 0.4rem; font-size: 1rem; border: 1px solid #ccc; border-radius: 4px;';
  const inputStyle = 'width: 5rem; padding: 0.4rem; font-size: 1rem; border: 1px solid #ccc; border-radius: 4px;';
  const rowStyle = 'display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;';
  const labelStyle = 'min-width: 4.5rem; font-weight: bold; color: #333;';

  function makeRow(label: string, el: HTMLElement): HTMLElement {
    const row = document.createElement('div');
    row.style.cssText = rowStyle;
    const lbl = document.createElement('div');
    lbl.style.cssText = labelStyle;
    lbl.textContent = label;
    const val = document.createElement('div');
    val.style.cssText = 'flex: 1;';
    val.appendChild(el);
    row.appendChild(lbl);
    row.appendChild(val);
    return row;
  }

  const content = (elem: HTMLElement) => {
    // Result
    resultSelect = document.createElement('select');
    resultSelect.style.cssText = selectStyle;
    elem.appendChild(makeRow('Result', resultSelect));

    // Winner
    winnerSelect = document.createElement('select');
    winnerSelect.style.cssText = selectStyle;
    for (let i = 0; i < players.length; i++) {
      winnerSelect.appendChild(new Option(players[i].participantName, String(i)));
    }
    winnerSelect.value = String(currentWinner);
    elem.appendChild(makeRow('Winner', winnerSelect));

    // Player (who made the shot)
    playerSelect = document.createElement('select');
    playerSelect.style.cssText = selectStyle;
    for (let i = 0; i < players.length; i++) {
      playerSelect.appendChild(new Option(players[i].participantName, String(i)));
    }
    playerSelect.value = String(currentPlayer);
    elem.appendChild(makeRow('Player', playerSelect));

    // Decoration section (hand, stroke, rally)
    decorationSection = document.createElement('div');

    // Hand
    handSelect = document.createElement('select');
    handSelect.style.cssText = selectStyle;
    handSelect.appendChild(new Option('- select -', ''));
    handSelect.appendChild(new Option('Forehand', 'Forehand'));
    handSelect.appendChild(new Option('Backhand', 'Backhand'));
    handSelect.value = currentHand;
    decorationSection.appendChild(makeRow('Hand', handSelect));

    // Stroke
    strokeSelect = document.createElement('select');
    strokeSelect.style.cssText = selectStyle;
    decorationSection.appendChild(makeRow('Stroke', strokeSelect));

    elem.appendChild(decorationSection);

    // Rally
    rallyInput = document.createElement('input');
    rallyInput.type = 'number';
    rallyInput.min = '0';
    rallyInput.style.cssText = inputStyle;
    rallyInput.value = currentRally ? String(currentRally) : '';
    elem.appendChild(makeRow('Rally', rallyInput));

    // Build initial options
    buildResultOptions();
    resultSelect.value = currentResult;
    buildStrokeOptions();
    updateDecorationVisibility();

    // Event listeners
    resultSelect.addEventListener('change', syncFromResult);
    winnerSelect.addEventListener('change', syncFromWinner);
    playerSelect.addEventListener('change', syncFromPlayer);
    handSelect.addEventListener('change', () => {
      currentHand = handSelect.value;
    });
    strokeSelect.addEventListener('change', () => {
      currentStroke = strokeSelect.value;
    });
  };

  const submit = () => {
    enginePoint.winner = Number(winnerSelect.value);
    enginePoint.result = resultSelect.value || undefined;
    enginePoint.hand = handSelect.value || undefined;
    enginePoint.stroke = strokeSelect.value || undefined;
    const rally = parseInt(rallyInput.value, 10);
    enginePoint.rally = rally > 0 ? rally : undefined;
    enginePoint.code = undefined;

    stateChangeEvent();
    const current_match_id = browserStorage.get('current_match');
    if (current_match_id) {
      loadMatch(current_match_id);
      const router = (window as any).appRouter;
      router?.navigate(matchPath(current_match_id, 'history'));
    }
  };

  cModal.open({
    title,
    content,
    buttons: [
      { label: 'Submit', intent: 'is-info', onClick: submit, close: true },
      { label: 'Cancel', close: true },
    ],
  });
}
