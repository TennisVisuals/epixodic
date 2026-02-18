import { changeDisplay } from './viewManager';
import { charts, env, setOrientation, getEpisodes } from '../state/env';
import { gameTree, gameFish, momentumChart, ptsMatch } from '@tennisvisuals/scoring-visualizations';
import { groupGames } from '../engine/groupGames';

import * as d3 from 'd3';

export function configureViz() {
  console.log('[HVE] Configuring visualizations...');
  // set up momentum
  let pcolors: any = ['#a55194', '#6b6ecf'];
  charts.mc = momentumChart();
  charts.mc.options({
    display: {
      sizeToFit: false,
      continuous: false,
      orientation: 'vertical',
      transition_time: 0,
      service: false,
      rally: true,
      player: false,
      grid: false,
      score: true,
    },
    colors: pcolors,
  });
  charts.mc.events({ score: { click: showGame } });
  d3.select('#momentumChart').call(charts.mc);

  // set up gameFish
  pcolors = { players: ['#a55194', '#6b6ecf'] };
  charts.gamefish = gameFish();
  charts.gamefish.options({
    display: { sizeToFit: true },
    colors: pcolors,
  });
  d3.select('#gameFishChart').call(charts.gamefish);

  // set up gametree
  charts.gametree = gameTree();
  const options = {
    display: { sizeToFit: true },
    lines: {
      points: { winners: 'green', errors: '#BA1212', unknown: '#2ed2db' },
      colors: { underlines: 'black' },
    },
    nodes: {
      colors: {
        0: pcolors.players[0],
        1: pcolors.players[1],
        neutral: '#ecf0f1',
      },
    },
    selectors: {
      enabled: true,
      selected: { 0: false, 1: false },
    },
  };
  charts.gametree.options(options);
  // Don't bind to DOM here — #gametree is hidden during init, causing negative dimensions.
  // Binding is deferred to first activation via ensureGameTreeChart().

  charts.pts_match = ptsMatch();
  charts.pts_match.options({
    margins: { top: 40, bottom: 20 },
    display: { sizeToFit: true },
  });
  const episodes = getEpisodes();
  charts.pts_match.data(episodes);
  d3.select('#PTSChart').call(charts.pts_match);
}

function showGame(d: any) {
  showGameFish(d.index);
}
export function closeGameFish() {
  const gFish = document.getElementById('gamefish');
  if (gFish) gFish.style.display = 'none';
}
export function showGameFish(index?: number) {
  const gFish = document.getElementById('gamefish');
  if (gFish) gFish.style.display = 'flex';
  const games = groupGames();
  const game = index != undefined ? games[index] : games[games.length - 1];
  const gridcells = game.points[0].tiebreak ? ['0', '1', '2', '3', '4', '5', '6', '7'] : ['0', '15', '30', '40', 'G'];
  charts.gamefish.options({
    display: { reverse: env.swap_sides },
    fish: {
      gridcells: gridcells,
      cell_size: 20,
    },
    score: game.score,
  });
  charts.gamefish.data(game.points).update();
  window.scrollTo(0, 0);
}

let gametreeBound = false;

export function ensureGameTreeChart() {
  if (!gametreeBound && charts.gametree) {
    d3.select('#gameTreeChart').call(charts.gametree);
    gametreeBound = true;
  }
}

function isVisible(id: string): boolean {
  const el = document.getElementById(id);
  return !!el && el.offsetHeight > 0;
}

export function updateChartData() {
  if (env.loading_match) return;

  const episodes = getEpisodes();
  if (!episodes || episodes.length === 0) return;

  if (charts.gametree && gametreeBound && isVisible('gameTreeChart')) {
    charts.gametree.data(episodes);
    charts.gametree.update({});
  }

  if (charts.mc && isVisible('momentumChart')) {
    charts.mc.data(episodes);
    charts.mc.update({});
  }

  if (charts.pts_match && isVisible('PTSChart')) {
    charts.pts_match.data(episodes);
    charts.pts_match.update({});
  }
}

export function vizUpdate() {
  const direction = env.orientation == 'landscape' ? 'horizontal' : 'vertical';

  if (env.view == 'pts' && direction == 'vertical') {
    changeDisplay('none', 'pts');
    changeDisplay('inline', 'momentum');
    charts.mc.width(window.innerWidth).height(820);
    charts.mc.update();
    env.view = 'momentum';
  } else if (env.view == 'momentum' && direction == 'horizontal') {
    changeDisplay('none', 'momentum');
    changeDisplay('flex', 'pts');
    const ptsEpisodes = getEpisodes();
    charts.pts_match.data(ptsEpisodes);
    charts.pts_match.update({ sizeToFit: true });
    env.view = 'pts';
  }

  if (charts.gamefish) charts.gamefish.update();

  const players = env.metadata.players;

  if (charts.gametree && gametreeBound) {
    charts.gametree.options({
      labels: {
        Player: players[0].participantName,
        Opponent: players[1].participantName,
      },
    });
    charts.gametree.update({ sizeToFit: true });
  }
}

export function orientationEvent() {
  setOrientation();
  vizUpdate();
  const router = (window as any).appRouter;
  if (router) router.refreshCurrentView();
}
