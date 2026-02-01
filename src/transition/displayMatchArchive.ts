import { loadDetails, stateChangeEvent, updateScore } from './displayUpdate';
import exportImage from '../assets/icons/exportwhite.png';
import recycleImage from '../assets/icons/recycle.png';
import { findUpClass, firstAndLast } from './utilities';
import { browserStorage } from './browserStorage';
import { modalExport } from './modalExport';
import { viewManager } from './viewManager';
import { SwipeList } from './swipeList';
import { loadMatch } from './loadMatch';
import { UUID } from './UUID';
import { env } from './env';
// Use v3 UMO - v4 testing done via env.matchUp shadow
import matchObject from '@tennisvisuals/universal-match-object';

export function displayMatchArchive(params?: any) {
  const active = params?.active;
  let html = `<div class='swipe-panel no-top'>`;
  // archive used to sort by match.date when match_id was timestamp...
  // need a fix for this...
  const match_archive: string[] = JSON.parse(browserStorage.get('match_archive') || '[]')
    .filter((item: any, i: number, s: any) => s.lastIndexOf(item) == i)
    .reverse();
  if (!match_archive.length) {
    newMatch();
    return;
  }
  if (active) return;

  match_archive.forEach((match_id: string) => {
    const match_data = match_id && JSON.parse(browserStorage.get(match_id) ?? '[]');
    if (match_data) {
      html += archiveEntry(match_id, match_data);
    } else {
      browserStorage.remove(match_id);
    }
  });
  html += '</div>';
  const ma_elem = document.getElementById('matcharchiveList');
  if (ma_elem) ma_elem.innerHTML = html;

  SwipeList.init({
    container: '.swipe-item',
    buttons: [
      {
        class: 'img_export swipe_img',
        image_class: 'export_icon',
        image: exportImage,
        side: 'right',
        width: 60,
      },
      {
        class: 'img_recycle swipe_img',
        image_class: 'recycle_icon',
        image: recycleImage,
        side: 'right',
        width: 60,
      },
    ],
  });

  if (ma_elem) {
    ma_elem.addEventListener('click', function (e: any) {
      const p = findUpClass(e.target, 'swipe-item');
      const matchId = p?.dataset.matchId;
      const selected_match = findUpClass(e.target, 'mh_match');
      if (selected_match) {
        return loadMatch(matchId);
      }

      if (e?.target?.className?.indexOf('img_export') >= 0 || e.target.className == 'export_icon') {
        p.classList.remove('move-out-click');
        p.style.webkitTransitionDuration = '125ms';
        p.style.transitionDuration = '125ms';
        p.style.webkitTransform = 'translateX(0px)';
        p.style.transform = 'translateX(0px)';
        modalExport(matchId);
      }
      if (e.target.className.includes('img_recycle') || e.target.className == 'recycle_icon') {
        deleteMatch(matchId);
        p.remove();
      }
    });
  }

  return match_archive;
}

function deleteMatch(match_id: string) {
  // Broadcasting functionality removed

  browserStorage.remove(match_id);
  const current_match_id = browserStorage.get('current_match');
  let match_archive = JSON.parse(browserStorage.get('match_archive') || '[]');
  match_archive = match_archive.filter((archive_id: string) => match_id != archive_id);
  browserStorage.set('match_archive', JSON.stringify(match_archive));
  if (match_id == current_match_id) {
    resetMatch();
  }
  displayMatchArchive({ active: true });
}

export function resetMatch(matchUpId?: string) {
  console.log('[HVE] resetMatch called - creating fresh V3 and V4 matches');
  
  // Create fresh V3 match (drives UI)
  env.match = matchObject.Match({ matchUpFormat: 'SET3-S:6/TB7' });
  env.match.metadata.definePlayer({ index: 0, firstName: 'Player', lastName: 'One' });
  env.match.metadata.definePlayer({ index: 1, firstName: 'Player', lastName: 'Two' });
  
  // Create fresh V4 match (shadow for testing)
  // TODO: Import MatchV4 if we want to reset v4 too
  // For now, leave env.matchUp as-is since we're not using it yet

  loadDetails();
  updateScore();
  const date = Date.now();
  matchUpId = matchUpId || UUID();
  env.match.metadata.defineMatch({ matchUpId, date });
  browserStorage.set('current_match', matchUpId);
  stateChangeEvent();
}

export function newMatch(force_format?: boolean | Element) {
  resetMatch();

  // If called as event handler, force_format will be an Element
  // Only use 'entry' view if explicitly passed boolean true
  const shouldSkipFormatSelection = typeof force_format === 'boolean' && force_format === true;
  const view = shouldSkipFormatSelection ? 'entry' : 'matchformat';

  console.log('[HVE] View to show:', view);
  console.log('[HVE] Will skip format selection?', shouldSkipFormatSelection);
  console.log('[HVE] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  viewManager(view);
}

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function archiveEntry(match_id: string, match_data: any) {
  const date = new Date(match_data.match?.date || Date.now());
  const display_date = [date.getDate(), months[date.getMonth()], date.getFullYear()].join('-');

  // Detect format: TODS (has matchUpId) vs Legacy (has muid)
  const isTODSFormat = match_data.matchUpId && !match_data.muid;

  // Get players based on format
  let player1Name: string;
  let player2Name: string;

  if (isTODSFormat) {
    // TODS format: get from sides
    const side1 = match_data.sides?.find((s: any) => s.sideNumber === 1);
    const side2 = match_data.sides?.find((s: any) => s.sideNumber === 2);
    player1Name = side1?.participant?.participantName || 'Player 1';
    player2Name = side2?.participant?.participantName || 'Player 2';
  } else {
    // Legacy format: get from players array
    player1Name = match_data.players?.[0]?.participantName || match_data.players?.[0]?.name || 'Player 1';
    player2Name = match_data.players?.[1]?.participantName || match_data.players?.[1]?.name || 'Player 2';
  }

  const display_players = `
         <span class='nowrap'>${firstAndLast(player1Name)}</span>
         <span> v. </span>
         <span class='nowrap'>${firstAndLast(player2Name)}</span>
         `;

  // Get score based on format
  let match_score = '';
  if (isTODSFormat) {
    // TODS format: use scoreStringSide1
    match_score = match_data.score?.scoreStringSide1 || '';
  } else {
    // Legacy format: use scoreboard
    match_score = match_data._appData?.scoreboard || match_data.scoreboard || '';
  }

  const match_format = match_data.matchUpFormat || '';

  return `
      <div id='match_${match_id}' data-match-id='${match_id}' class='flexcenter mh_swipe swipe-item'>
         <div class='flexcols mh_match'>
            <div class='mh_players'>${display_players}</div>
            <div class='mh_details'>
               <div>${display_date}</div>
               <div class='mh_format'>${match_format}</div>
            </div>
            <div class='mh_score'>${match_score}</div>
         </div>
      </div>`;
}
