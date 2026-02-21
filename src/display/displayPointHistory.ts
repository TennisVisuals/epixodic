import { env, getEpisodes } from '../state/env';
import { WINNER_RESULTS } from '../utils/constants';

export function displayPointHistory() {
  const games = groupGames();
  const players = env.metadata.players;
  let html = '';
  if (!games.length) return false;
  games.forEach((game: any) => {
    if (game.points && game.points.length) html += gameEntry(game, players);
  });
  // Always show match duration (will show 00:00:00 if no timestamps yet)
  html += `
    <div class="flexrows ph_game">
      <div class='ph_margin' style='width: 100%'>
          <div class='flexcenter' style='width: 100%'>Duration ${matchDuration()}</div>
      </div>
    </div>
  `;

  const phFrame = document.getElementById('ph_frame');
  if (phFrame) phFrame.innerHTML = html;
}

function groupGames() {
  const pointEpisodes = getEpisodes();
  const games: any = [{ points: [] }];
  let gameCounter = 0;
  let currentGame = 0;
  pointEpisodes.forEach((episode: any) => {
    const point = episode.point;
    if (point.game != currentGame) {
      gameCounter += 1;
      currentGame = point.game;
      games[gameCounter] = { points: [] };
    }
    games[gameCounter].points.push(point);
    games[gameCounter].index = gameCounter;
    games[gameCounter].set = episode.set.index;
    games[gameCounter].score = episode.game.games;
    games[gameCounter].complete = episode.game.complete;
    if (episode.game.complete) games[gameCounter].winner = point.winner;
    if (episode.set.complete) games[gameCounter].lastGame = true;
  });
  return games;
  // if (set != undefined) games = games.filter(function(game) { return game.set == set });
}

function gameEntry(game: any, players: any[]) {
  const last_point = game.points[game.points.length - 1];
  const game_score = game.complete ? game.score.join('-') : undefined;
  const tiebreak = last_point.tiebreak;
  const server = tiebreak ? 'Tiebreak' : players[last_point.server].participantName;
  const service = tiebreak ? '' : last_point.server ? 'playertwo' : 'playerone';
  const servergame = tiebreak ? '' : last_point.server == last_point.winner ? 'won' : 'lost';
  let html = `
         <div class="flexrows ph_game">
            <div class='ph_margin flexrows'>
               <div class="ph_server ${service}">${server}</div>
               <div class="ph_action flexcenter"> 
                  <div class='viewGameFish ph_fish iconfish' gameIndex='${game.index}'></div>
               </div>
               <div class='viewGameFish ph_rally ph_${servergame}' gameIndex="${game.index}"'>
                  <b class="viewGameFish" gameIndex="${game.index}">${game_score || ''}</b>
               </div>
            </div>
         </div>
      `;
  game.points.forEach((point: any) => {
    html += pointEntry(
      point,
      players,
      // game.complete && index == game.points.length - 1 ? game.score.join('-') : undefined
    );
  });
  return html;
}

function pointEntry(point: any, players: any[]) {
  const evenodd = point.index % 2 ? 'even' : 'odd';
  let point_score = !point.tiebreak && point.server ? point.score.split('-').reverse().join('-') : point.score;
  let player_initials;
  if (point.result) {
    let shot_by;
    if (WINNER_RESULTS.includes(point.result)) {
      shot_by = players[point.winner].participantName;
    } else {
      shot_by = players[1 - point.winner].participantName;
    }
    player_initials = shot_by
      .split(' ')
      .map((name: string) => name[0])
      .join('');
  }
  const point_hand = point.hand ? point.hand + ' ' : '';
  const point_result = point.result || '';
  const point_description = !point_result ? '' : `${player_initials}: ${point_hand}${point_result}`;
  point_score = point_score == '0-0' ? 'GAME' : point_score;
  if (point.tiebreak) {
    if (point.server) point_score = `&nbsp;${point_score}*`;
    if (!point.server) point_score = `*${point_score}&nbsp;`;
  }
  const rally = point.rallyLength ? point.rallyLength : '';
  return `
    <div class='flexrows ph_episode' pointIndex="${point.index}">
        <div class='ph_point_${evenodd} flexrows'>
          <div class='viewEditPoint ph_result'>${point_description}</div>
          <div class='viewEditPoint ph_score'>${point_score} </div>
          <div class='viewEditPoint ph_score'>${rally}</div>
        </div>
    </div>
    `;
}

function matchDuration() {
  const points = env.engine.getState().history?.points || [];
  
  // Filter out points without valid timestamps
  const timestamps = points
    .map((p: any) => p.uts)
    .filter((t: any) => t !== undefined && t !== null && !isNaN(t));
  
  // If no valid timestamps, return 00:00:00
  if (timestamps.length < 2) {
    return '00:00:00';
  }
  
  const start = Math.min(...timestamps);
  const end = Math.max(...timestamps);
  const seconds = (end - start) / 1000.0;
  
  // Return 00:00:00 if calculation results in invalid number
  if (isNaN(seconds) || seconds < 0) {
    return '00:00:00';
  }
  
  return HHMMSS(seconds);
}

function HHMMSS(s: any) {
  const sec_num = parseInt(s, 10); // don't forget the second param
  let hours: any = Math.floor(sec_num / 3600);
  let minutes: any = Math.floor((sec_num - hours * 3600) / 60);
  let seconds: any = sec_num - hours * 3600 - minutes * 60;

  if (hours < 10) {
    hours = '0' + hours;
  }
  if (minutes < 10) {
    minutes = '0' + minutes;
  }
  if (seconds < 10) {
    seconds = '0' + seconds;
  }
  return hours + ':' + minutes + ':' + seconds;
}
