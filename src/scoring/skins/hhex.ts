import { BaseSkin } from '../BaseSkin';

// Pointy-top hexagon (flat left/right sides)
// viewBox="0 0 87 100", vertices clockwise from top
const HEX_VB = '0 0 87 100';
const HEX_PTS = '43.5,0 87,25 87,75 43.5,100 0,75 0,25';

export class HHexSkin extends BaseSkin {
  readonly id = 'hhex';
  readonly label = 'HiveEye';
  readonly orientation = 'horizontal' as const;

  private scoreObserver: MutationObserver | null = null;
  private serveObserver: MutationObserver | null = null;
  private resizeHandler: (() => void) | null = null;

  protected buildDOM(root: HTMLElement): void {
    root.innerHTML = `
      <div id="hx_header">
        <div class="hx_score_bound hx_score_bound_left">
          <svg class="hx_bound_svg" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M 100,0 L 88,100 L 0,100" fill="none" stroke="var(--hx-bound-stroke)" stroke-width="1.5"/>
          </svg>
          <div class="hx_score_content">
            <div class="hx_score_row">
              <div class="hx_sets_cluster hx_hex_cluster" data-player="0">
                ${this.makeScoreHexes(3, 'set')}
              </div>
              <div class="hx_games_cluster hx_hex_cluster" data-player="0">
                ${this.makeScoreHexes(5, 'game')}
              </div>
              <div class="hx_point_hex_wrap">
                <svg viewBox="${HEX_VB}" class="hx_hex_svg hx_point_hex_svg">
                  <polygon points="${HEX_PTS}" fill="none" stroke="var(--hx-point-stroke)" stroke-width="3"/>
                </svg>
                <div class="hx_point_text display_points_0">0</div>
              </div>
            </div>
            <div class="hx_name_row">
              <span class="hx_serve_dot hx_serve_dot_0">&#9679;</span>
              <div class="editPlayer hx_player_name indicate_serve display_player_0" playerIndex="0">Player One</div>
            </div>
          </div>
        </div>

        <div class="hx_header_center">
          <div class="hx_status_text status_message">&nbsp;</div>
        </div>

        <div class="hx_score_bound hx_score_bound_right">
          <svg class="hx_bound_svg" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M 0,0 L 12,100 L 100,100" fill="none" stroke="var(--hx-bound-stroke)" stroke-width="1.5"/>
          </svg>
          <div class="hx_score_content hx_score_content_right">
            <div class="hx_score_row hx_score_row_right">
              <div class="hx_point_hex_wrap">
                <svg viewBox="${HEX_VB}" class="hx_hex_svg hx_point_hex_svg">
                  <polygon points="${HEX_PTS}" fill="none" stroke="var(--hx-point-stroke)" stroke-width="3"/>
                </svg>
                <div class="hx_point_text display_points_1">0</div>
              </div>
              <div class="hx_games_cluster hx_hex_cluster" data-player="1">
                ${this.makeScoreHexes(5, 'game')}
              </div>
              <div class="hx_sets_cluster hx_hex_cluster" data-player="1">
                ${this.makeScoreHexes(3, 'set')}
              </div>
            </div>
            <div class="hx_name_row hx_name_row_right">
              <div class="editPlayer hx_player_name indicate_serve display_player_1" playerIndex="1">Player Two</div>
              <span class="hx_serve_dot hx_serve_dot_1">&#9679;</span>
            </div>
          </div>
        </div>
      </div>

      <div id="hx_entry">
        <div id="hx_left" class="hx_thumb_area">
          ${this.makeActionHex('Point', 'point', '0', 'hx_point_wrap', '')}
          ${this.makeActionHex('Ace', 'ace', '0', 'hx_ace_wrap', 'hx_serve_action')}
          ${this.makeActionHex('Let', 'let', '0', 'hx_let_wrap', 'hx_serve_action')}
          ${this.makeActionHex('Fault', 'fault', '0', 'hx_fault_wrap', 'hx_serve_action')}
        </div>

        <div id="hx_center">
          <div class="hx_center_content">
            <div class="hx_center_icons">
              <div class="change_server changeServer iconchange action_icon_large"></div>
              <div class="view_archive matchArchive iconarchive action_icon_large"></div>
            </div>
          </div>
          <div class="hx_serve_sentinels" style="display:none">
            <span class="display_0_serving hx_serve_sentinel" data-side="0"></span>
            <span class="display_1_serving hx_serve_sentinel" data-side="1"></span>
          </div>
          <div class="hx_hidden_scores" style="display:none">
            <span class="display_sets_0">0</span>
            <span class="display_sets_1">0</span>
            <span class="display_games_0">0</span>
            <span class="display_games_1">0</span>
            <span class="display_set_0_games_0">0</span>
            <span class="display_set_0_games_1">0</span>
            <span class="display_set_1_games_0">-</span>
            <span class="display_set_1_games_1">-</span>
            <span class="display_set_2_games_0">-</span>
            <span class="display_set_2_games_1">-</span>
            <span class="display_set_3_games_0"></span>
            <span class="display_set_3_games_1"></span>
            <span class="display_set_4_games_0"></span>
            <span class="display_set_4_games_1"></span>
          </div>
        </div>

        <div id="hx_right" class="hx_thumb_area">
          ${this.makeActionHex('Ace', 'ace', '1', 'hx_ace_wrap', 'hx_serve_action')}
          ${this.makeActionHex('Let', 'let', '1', 'hx_let_wrap', 'hx_serve_action')}
          ${this.makeActionHex('Point', 'point', '1', 'hx_point_wrap', '')}
          ${this.makeActionHex('Fault', 'fault', '1', 'hx_fault_wrap', 'hx_serve_action')}
        </div>
      </div>

      <div id="hx_menu">
        <div class="mainMenu hx_menuitem flexcenter">
          <div class="mainMenu iconmenu action_icon_large"></div>
        </div>
        <div class="hx_menuitem settings flexcenter">
          <div class="iconsettings settings action_icon_large"></div>
        </div>
        <div class="hx_menuitem flexcenter">
          <div class="undo undoAction iconundo action_icon_large"></div>
          <div class="redo redoAction iconredo action_icon_large"></div>
        </div>
      </div>
    `;
  }

  private makeScoreHexes(count: number, type: string): string {
    return Array.from(
      { length: count },
      (_, i) =>
        `<svg viewBox="${HEX_VB}" class="hx_hex_svg hx_score_hex hx_${type}_hex">
          <polygon points="${HEX_PTS}" fill="none" stroke="var(--hx-${type}-stroke)" stroke-width="3"/>
          <text x="43.5" y="54" text-anchor="middle" dominant-baseline="middle"
            font-size="42" font-weight="bold" fill="var(--hx-${type}-num)">${i + 1}</text>
        </svg>`,
    ).join('');
  }

  private makeActionHex(
    label: string,
    action: string,
    side: string,
    wrapClass: string,
    serveClass: string,
  ): string {
    const fontSize = label === 'Point' ? 20 : 18;
    const colorClass = `hx_color_${action}`;
    const classes = ['classAction', 'hx_action_hex_wrap', wrapClass, colorClass, serveClass]
      .filter(Boolean)
      .join(' ');
    return `
      <div class="${classes}" action="${action}" side="${side}">
        <svg viewBox="${HEX_VB}" class="hx_hex_svg hx_action_svg">
          <polygon points="${HEX_PTS}"/>
          <text x="43.5" y="54" text-anchor="middle" dominant-baseline="middle" font-size="${fontSize}" font-weight="bold">${label}</text>
        </svg>
      </div>
    `;
  }

  render(container: HTMLElement): void {
    super.render(container);
    this.setupScoreObservers();
    this.setupServeObserver();
    this.resizeHandler = () => this.layoutButtons();
    window.addEventListener('resize', this.resizeHandler);
  }

  show(): void {
    super.show();
    this.layoutButtons();
  }

  /**
   * Compute button sizes and positions using Math.hypot-based geometry
   * from the original NEW_TRACKER_IDEA/src/pointCluster.js.
   *
   * Positions are viewport-absolute pixels, converted to container-relative
   * offsets for each thumb area.
   */
  private layoutButtons(): void {
    const root = document.getElementById(this.id);
    if (!root) return;

    const iw = window.innerWidth;
    const ih = window.innerHeight;
    const hypot = Math.hypot(iw, ih) * 0.65;

    const hex_1 = hypot * 0.2; // Point hex size
    const hex_2 = hypot * 0.14; // Satellite hex size (Ace, Let, Fault)

    // Y positions (absolute pixels from viewport top)
    const pt_y = ih - hex_2 * 3.2;
    const lt_y = ih - hex_2 * 3.0;
    const at_y = ih - hex_2 * 4.2;
    const ft_y = ih - hex_2 * 1.7;

    // X fractions of viewport width (from original pointCluster.js)
    const xf = {
      left: { point: 0.03, ace: 0.14, let: 0.21, fault: 0.14 },
      right: { point: 0.81, ace: 0.75, let: 0.68, fault: 0.75 },
    };

    for (const side of ['left', 'right'] as const) {
      const area = root.querySelector(side === 'left' ? '#hx_left' : '#hx_right') as HTMLElement;
      if (!area) continue;

      const rect = area.getBoundingClientRect();

      const place = (cls: string, size: number, vx: number, vy: number) => {
        const el = area.querySelector(`.${cls}`) as HTMLElement;
        if (!el) return;
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
        el.style.left = `${vx - rect.left}px`;
        el.style.top = `${vy - rect.top}px`;
        el.style.transform = 'none';
      };

      const f = xf[side];
      place('hx_point_wrap', hex_1, iw * f.point, pt_y);
      place('hx_ace_wrap', hex_2, iw * f.ace, at_y);
      place('hx_let_wrap', hex_2, iw * f.let, lt_y);
      place('hx_fault_wrap', hex_2, iw * f.fault, ft_y);
    }
  }

  private setupScoreObservers(): void {
    const root = document.getElementById(this.id);
    if (!root) return;

    const hiddenScores = root.querySelector('.hx_hidden_scores');
    if (!hiddenScores) return;

    this.scoreObserver = new MutationObserver(() => this.updateHexScores());
    this.scoreObserver.observe(hiddenScores, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  private setupServeObserver(): void {
    const root = document.getElementById(this.id);
    if (!root) return;

    const sentinels = root.querySelectorAll('.hx_serve_sentinel');
    if (!sentinels.length) return;

    this.serveObserver = new MutationObserver(() => this.updateServeGreyOut());
    sentinels.forEach((el) => {
      this.serveObserver!.observe(el, { attributes: true, attributeFilter: ['style'] });
    });
  }

  private updateServeGreyOut(): void {
    const root = document.getElementById(this.id);
    if (!root) return;

    const sentinel0 = root.querySelector('.hx_serve_sentinel[data-side="0"]') as HTMLElement;
    const p0serving = sentinel0 && sentinel0.style.display === 'flex';

    const left = root.querySelector('#hx_left');
    const right = root.querySelector('#hx_right');
    if (left) left.classList.toggle('hx_greyed', !p0serving);
    if (right) right.classList.toggle('hx_greyed', p0serving);

    // Update serve dot visibility based on serve state
    const dot0 = root.querySelector<HTMLElement>('.hx_serve_dot_0');
    const dot1 = root.querySelector<HTMLElement>('.hx_serve_dot_1');
    if (dot0) dot0.style.color = p0serving ? 'var(--hx-serve-dot)' : 'transparent';
    if (dot1) dot1.style.color = p0serving ? 'transparent' : 'var(--hx-serve-dot)';
  }

  private updateHexScores(): void {
    const root = document.getElementById(this.id);
    if (!root) return;

    for (const player of [0, 1]) {
      const setsEl = root.querySelector(`.display_sets_${player}`);
      const setsWon = parseInt(setsEl?.textContent || '0') || 0;
      const setsCluster = root.querySelector(`.hx_sets_cluster[data-player="${player}"]`);
      if (setsCluster) {
        setsCluster.querySelectorAll('.hx_score_hex').forEach((svg, i) => {
          const poly = svg.querySelector('polygon');
          const txt = svg.querySelector('text');
          const won = i < setsWon;
          if (poly) {
            poly.setAttribute('fill', won ? 'var(--hx-set-fill-won)' : 'none');
            poly.setAttribute('stroke', won ? 'var(--hx-set-stroke-won)' : 'var(--hx-set-stroke)');
          }
          if (txt) txt.setAttribute('fill', won ? '#fff' : 'var(--hx-set-num)');
        });
      }

      const gamesEl = root.querySelector(`.display_games_${player}`);
      const gamesWon = parseInt(gamesEl?.textContent || '0') || 0;
      const gamesCluster = root.querySelector(`.hx_games_cluster[data-player="${player}"]`);
      if (gamesCluster) {
        gamesCluster.querySelectorAll('.hx_score_hex').forEach((svg, i) => {
          const poly = svg.querySelector('polygon');
          const txt = svg.querySelector('text');
          const won = i < gamesWon;
          if (poly) {
            poly.setAttribute('fill', won ? 'var(--hx-game-fill-won)' : 'none');
            poly.setAttribute('stroke', won ? 'var(--hx-game-stroke-won)' : 'var(--hx-game-stroke)');
          }
          if (txt) txt.setAttribute('fill', won ? '#fff' : 'var(--hx-game-num)');
        });
      }
    }
  }

  destroy(): void {
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      this.resizeHandler = null;
    }
    if (this.scoreObserver) {
      this.scoreObserver.disconnect();
      this.scoreObserver = null;
    }
    if (this.serveObserver) {
      this.serveObserver.disconnect();
      this.serveObserver = null;
    }
    super.destroy();
  }
}
