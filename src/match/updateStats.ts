import { simpleChart, computeMatchStatsFromMatchUp } from '@tennisvisuals/scoring-visualizations';
import { viewManager } from '../display/viewManager';
import { env, options, getEpisodes } from '../state/env';

// Convert StatObject[] from computeMatchStatsFromMatchUp to the legacy display format
function convertStatsToLegacyFormat(statObjects: any[]): any[] {
  return statObjects.map((stat: any) => {
    const [n0, n1] = stat.numerator;
    const hasDenom = stat.denominator && (stat.denominator[0] > 0 || stat.denominator[1] > 0);
    const hasPct = stat.pct && (stat.pct[0] > 0 || stat.pct[1] > 0);

    let display0: string, display1: string;
    let value0: number, value1: number;

    if (hasPct) {
      display0 = `${stat.pct[0]}% (${n0}/${stat.denominator[0]})`;
      display1 = `${stat.pct[1]}% (${n1}/${stat.denominator[1]})`;
      value0 = stat.pct[0];
      value1 = stat.pct[1];
    } else if (hasDenom) {
      display0 = `${n0}/${stat.denominator[0]}`;
      display1 = `${n1}/${stat.denominator[1]}`;
      value0 = n0;
      value1 = n1;
    } else {
      display0 = String(n0);
      display1 = String(n1);
      value0 = n0;
      value1 = n1;
    }

    return {
      category: stat.name,
      teams: [
        { display: display0, value: value0, numerators: hasDenom ? [stat.name] : undefined },
        { display: display1, value: value1, numerators: hasDenom ? [stat.name] : undefined },
      ],
    };
  });
}

// Derive hand/stroke counters from engine history points
function deriveCounters(setFilter?: number): { teams: any[] } {
  const episodes = getEpisodes();
  const teams: any[] = [{}, {}];

  episodes.forEach((episode: any) => {
    const point = episode.point;
    if (setFilter !== undefined && point.set !== setFilter) return;
    if (!point.hand) return;

    const hand = point.hand; // 'Forehand' or 'Backhand'
    // Determine which team this finishing shot belongs to
    // For winners/aces, it's the winner; for errors, it's the loser (1 - winner)
    const isWinnerShot = ['Winner', 'Ace'].includes(point.result);
    const shotBy = isWinnerShot ? point.winner : 1 - point.winner;

    if (!teams[shotBy][hand]) teams[shotBy][hand] = [];
    teams[shotBy][hand].push({ point });
  });

  return { teams };
}

export function updateStats(element?: Element) {
  const setNumber = element ? element.getAttribute('setNumber') : undefined;
  const set_filter = setNumber ? parseInt(setNumber) : undefined;
  let html = '';
  const charts: any[] = [];
  const sets = (env.engine.getState().score?.sets || []).length;
  let statselectors = `<div class='updateStats s_set'>Match</div>`;

  // Compute stats from engine state using scoring-visualizations
  const rawStats = computeMatchStatsFromMatchUp(env.engine.getState());
  const stats = convertStatsToLegacyFormat(rawStats);

  const stripModifiers = (text: string) => text.match(/[A-Za-z0-9_]/g)?.join('');
  if (stats?.length && Array.isArray(stats)) {
    // generate & display match/set view selectors
    if (sets > 1) {
      for (let s = 0; s < sets; s++) {
        statselectors += `<div class='updateStats s_set' setNumber="${s}">Set ${s + 1}</div>`;
      }
    }
    const statView = document.querySelector('#statview');
    if (statView) statView.innerHTML = statselectors;

    // generate & display stats html
    let left: any, right: any;
    stats.forEach((stat: any) => {
      // UMO uses 'teams' array for stat data
      const team_stats = stat.teams || stat.team_stats;
      if (!team_stats || team_stats.length < 2) return;
      if (env.swap_sides) {
        [right, left] = team_stats;
      } else {
        [left, right] = team_stats;
      }
      const value: number = [0]
        .concat(...[left, right].map((side: any) => (side.value ? side.value : [])))
        .reduce((a: number, b: number) => a + b, 0);
      // UMO uses 'category' for stat names
      const statName = stat.category || stat.name;
      const id = stripModifiers(statName.toLowerCase().split(' ').join('_'));
      let left_display = left.display;
      let right_display = right.display;

      const numerators = []
        .concat(...[left, right].map((value: any) => (value.numerators ? value.numerators : [])))
        .filter((item, i, s) => s.lastIndexOf(item) == i)
        .join(',');
      const statclass = numerators && value && statName != 'Aggressive Margin' ? 'statname_chart' : 'statname';

      // Ensure values are numbers for comparison
      if (isNaN(left.value) || left.value === null || left.value === undefined) {
        left.value = 0;
        left_display = '0';
      }
      if (isNaN(right.value) || right.value === null || right.value === undefined) {
        right.value = 0;
        right_display = '0';
      }
      
      // Convert to numbers if they're strings
      if (typeof left.value === 'string') {
        left.value = parseFloat(left.value) || 0;
      }
      if (typeof right.value === 'string') {
        right.value = parseFloat(right.value) || 0;
      }

      if (options.highlight_better_stats) {
        // Debug logging for key stats (only show first time)
        if (['Aces', 'Winners', 'First Serve %', 'Double Faults'].includes(statName)) {
          console.log(`[HVE] Stat "${statName}": left=${left.value}, right=${right.value}`);
        }
        
        // Skip highlighting if values are equal (tie)
        if (left.value !== right.value) {
          // For error stats, lower is better
          if (['Double Faults', 'Unforced Errors', 'Forced Errors'].indexOf(statName) >= 0) {
            if (left.value < right.value) {
              left_display = `<b class="toggleChart">${left_display}</b>`;
            } else if (right.value < left.value) {
              right_display = `<b class="toggleChart">${right_display}</b>`;
            }
          } else {
            // For other stats, higher is better (including percentages)
            if (left.value > right.value) {
              left_display = `<b class="toggleChart">${left_display}</b>`;
            } else if (right.value > left.value) {
              right_display = `<b class="toggleChart">${right_display}</b>`;
            }
          }
        }
      }
      html +=
        `<div class='statrow' id="${id}">` +
        `<div class='toggleChart statleft'>${left_display}</div>` +
        `<div class='toggleChart ${statclass}'>${statName}</div><div class='toggleChart statright'>${right_display}</div>` +
        `</div>`;
      const table = `<div class='statrow' id="${id}_chart" style='display:none' onclick="showChartSource('${numerators}')"></div>`;

      if (numerators && value && statName != 'Aggressive Margin') {
        charts.push({ target: `${id}_chart`, numerators });
        html += table;
      }
    });

    // Derive hand/stroke counters from engine history points
    const countersObj = deriveCounters(set_filter);
    const counters = countersObj.teams;

    // Check if counters exist and have data before accessing
    if (counters && counters[0] && counters[1] && 
        (counters[0].Backhand || counters[0].Forehand || counters[1].Backhand || counters[1].Forehand)) {
      const left = env.swap_sides ? 1 : 0;
      const right = env.swap_sides ? 0 : 1;
      html += `<div class='statsection flexcenter'>Finishing Shots - Strokes</div>`;
      ['Forehand', 'Backhand'].forEach((hand) => {
        if (counters[0][hand] || counters[1][hand]) {
          const left_display = counters[left][hand] ? counters[left][hand].length : 0;
          const right_display = counters[right][hand] ? counters[right][hand].length : 0;
          html +=
            `<div class='statrow'><div class='statleft'><b>${left_display}</b></div>` +
            `<div class='statname'><b>Total ${hand} Shots</b></div><div class='statright'><b>${right_display}</b></div></div>`;
          // get a list of unique results
          const results = []
            .concat(
              ...Object.keys(counters).map((key) => {
                return counters[key][hand]
                  ? counters[key][hand].map((episode: any) => episode.point.result).filter(Boolean)
                  : [];
              }),
            )
            .filter((item, i, s) => s.lastIndexOf(item) == i);
          results.forEach((result) => {
            const left_results = counters[left][hand]
              ? counters[left][hand].filter((f: any) => f.point.result == result)
              : [];
            const right_results = counters[right][hand]
              ? counters[right][hand].filter((f: any) => f.point.result == result)
              : [];
            if (left_results.length || right_results.length) {
              html +=
                `<div class='statrow'><div class='statleft'>${left_results.length}</div>` +
                `<div class='statname'>${hand} ${result}s</div><div class='statright'>${right_results.length}</div></div>`;
            }
            // get a list of unique strokes
            const strokes = []
              .concat(
                ...Object.keys(counters).map((key) => {
                  return counters[key][hand]
                    ? counters[key][hand].map((episode: any) => episode.point.stroke).filter(Boolean)
                    : [];
                }),
              )
              .filter((item, i, s) => s.lastIndexOf(item) == i);
            strokes.forEach((stroke) => {
              const left_results = counters[left][hand]
                ? counters[left][hand].filter((f: any) => f.point.result == result && f.point.stroke == stroke)
                : [];
              const right_results = counters[right][hand]
                ? counters[right][hand].filter((f: any) => f.point.result == result && f.point.stroke == stroke)
                : [];
              if (left_results.length || right_results.length) {
                html +=
                  `<div class='statrow'><div class='statleft'>${left_results.length}</div>` +
                  `<div class='statname'><i>${hand} ${stroke} ${result}s</i></div><div class='statright'>${right_results.length}</div></div>`;
              }
            });
          });
        }
      });
    }

    const statLines = document.querySelector('#statlines');
    if (statLines) statLines.innerHTML = html;
    addCharts(charts);
  } else {
    viewManager('entry');
  }
}

function addCharts(charts: any[]) {
  const counters = deriveCounters();

  const stripModifiers = (text: string) => text.match(/[A-Za-z0-9]/g)?.join('');
  if (!counters) return;
  charts.forEach((chart) => {
    const player_points: any = [];
    Object.keys(counters.teams).forEach((key) => {
      const team = counters.teams[key];
      const numerators = chart.numerators.split(',').map((numerator: any) => stripModifiers(numerator));
      const episodes = [].concat(...numerators.map((numerator: any) => team[numerator]));

      const points = episodes
        .map((episode: any) => {
          if (!episode) return undefined;
          return episode.point ? episode.point : episode;
        })
        .filter((f) => f)
        .sort((a, b) => a.index - b.index);
      player_points.push(points.map((point) => point.index));
    });
    simpleChart(chart.target, player_points);
  });
}
