import { simpleChart } from '../visualizations/simpleChart';
import { viewManager } from './viewManager';
import { env, options } from './env';

export function updateStats(element?: Element) {
  const setNumber = element ? element.getAttribute('setNumber') : undefined;
  const set_filter = setNumber ? parseInt(setNumber) : undefined;
  let html = '';
  const charts: any[] = [];
  const sets = env.match.sets().length;
  let statselectors = `<div class='updateStats s_set'>Match</div>`;
  
  // Use V4 stats (fixes handed stats that were broken in V3)
  const stats = env.matchUp.stats.calculated(set_filter);
  
  console.log('\n========== [HVE] V4 STATISTICS COMPARISON ==========');
  console.log('[HVE] V4 stats.calculated returned', stats?.length, 'statistics:');
  stats?.forEach((stat: any) => {
    console.log(`  - ${stat.category}: ${stat.teams[0].display} - ${stat.teams[1].display}`);
  });
  
  // V3 stats.calculated - parallel for comparison
  try {
    const v3Stats = env.match.stats.calculated(set_filter);
    console.log('\n[HVE] V3 stats.calculated returned', v3Stats?.length, 'statistics:');
    v3Stats?.forEach((stat: any) => {
      console.log(`  - ${stat.category}: ${stat.teams[0].display} - ${stat.teams[1].display}`);
    });
    console.log('========== END STATISTICS COMPARISON ==========\n');
  } catch (e) {
    console.error('[HVE] V3 stats.calculated FAILED:', e);
  }
  
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

    // Use V4 counters (includes proper Forehand/Backhand grouping)
    const countersObj = env.matchUp.stats.counters(set_filter);
    const counters = countersObj.teams;
    
    console.log('[HVE] V4 Counters analysis:');
    console.log('  Team 0 categories:', Object.keys(counters[0] || {}));
    console.log('  Team 1 categories:', Object.keys(counters[1] || {}));
    
    // Check for serve-related counters
    console.log('  Team 0 serves1stIn:', counters[0]?.serves1stIn?.length || 0);
    console.log('  Team 0 serves1stWon:', counters[0]?.serves1stWon?.length || 0);
    console.log('  Team 0 pointsServed:', counters[0]?.pointsServed?.length || 0);
    console.log('  Team 0 winners:', counters[0]?.winners?.length || 0);
    console.log('  Team 0 forcedErrors:', counters[0]?.forcedErrors?.length || 0);
    
    // Sample point to see metadata
    if (counters[0]?.pointsWon?.length > 0) {
      console.log('  Sample point from Team 0:', counters[0].pointsWon[0]);
    }
    
    // V3 stats.counters - parallel for comparison
    try {
      const v3Counters = env.match.stats.counters(set_filter);
      console.log('\n[HVE] V3 Counters analysis:');
      console.log('  Team 0 categories:', Object.keys(v3Counters.teams[0] || {}));
      console.log('[HVE] V3 stats.counters parallel call');
    } catch (e) {
      console.error('[HVE] V3 stats.counters FAILED:', e);
    }
    
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
  // Use V4 counters for chart rendering
  const counters = env.matchUp.stats.counters();
  
  // V3 stats.counters - parallel for comparison
  try {
    // const v3Counters = env.match.stats.counters();
    env.match.stats.counters();
    console.log('[HVE] V3 stats.counters (addCharts) parallel call');
  } catch (e) {
    console.error('[HVE] V3 stats.counters (addCharts) FAILED:', e);
  }
  
  const stripModifiers = (text: string) => text.match(/[A-Za-z0-9]/g)?.join('');
  if (!counters) return;
  charts.forEach((chart) => {
    const player_points: any = [];
    Object.keys(counters.teams).forEach((key) => {
      const team = counters.teams[key];
      const numerators = chart.numerators.split(',').map((numerator: any) => stripModifiers(numerator));
      const episodes = [].concat(...numerators.map((numerator: any) => team[numerator]));
      
      // V4 returns points directly, V3 wraps them in episodes
      const points = episodes
        .map((episode: any) => {
          if (!episode) return undefined;
          // If it has a 'point' property, it's V3 episode structure
          // Otherwise it's V4 direct point structure
          return episode.point ? episode.point : episode;
        })
        .filter((f) => f)
        .sort((a, b) => a.index - b.index);
      player_points.push(points.map((point) => point.index));
    });
    simpleChart(chart.target, player_points);
  });
}
