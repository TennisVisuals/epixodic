import { BaseSkin } from '../BaseSkin';

export class VBlackSkin extends BaseSkin {
  readonly id = 'vblack';
  readonly orientation = 'vertical' as const;

  protected buildDOM(root: HTMLElement): void {
    root.innerHTML = `
      <div class="vs_players flexrows">
        <div class="editPlayer vs_player flexcenter indicate_serve display_player_0" playerIndex="0">Player One</div>
        <div class="vs_swap flexcenter">
          <div class="swapAction swapimage action_image"></div>
        </div>
        <div class="editPlayer vs_player flexcenter indicate_serve display_player_1" playerIndex="1">Player Two</div>
      </div>
      <div class="vs_center flexrows">
        <div class="vs_components flexols">
          <div class="vs_label flexcenter">Sets</div>
          <div class="vs_label flexcenter">Games</div>
          <div class="vs_label flexcenter">Points</div>
        </div>
        <div class="vs_player_score flexols">
          <div class="vs_value flexcenter display_sets_0">0</div>
          <div class="vs_value flexcenter display_games_0">0</div>
          <div class="classAction vs_value value_border flexcenter display_points_0" action="point" side="0">0</div>
        </div>
        <div class="vs_player_score flexols">
          <div class="vs_value flexcenter display_sets_1">0</div>
          <div class="vs_value flexcenter display_games_1">0</div>
          <div class="classAction vs_value value_border flexcenter display_points_1" action="point" side="1">0</div>
        </div>
        <div class="vs_filler"></div>
        <div class="vs_menuaction flexcols">
          <div class="vs_mode_action flexcenter">
            <div class="view_stats viewStats iconstats action_icon"></div>
            <div class="change_server changeServer iconchange action_icon"></div>
          </div>
          <div class="vs_mode_action flexcenter">
            <div class="mainMenu iconmenu action_icon"></div>
          </div>
          <div class="vs_mode_action flexcenter">
            <div class="view_history viewPointHistory iconhistory action_icon"></div>
            <div class="view_archive matchArchive iconarchive action_icon"></div>
            <div class="view_settings settings iconsettings action_icon"></div>
          </div>
        </div>
      </div>
      <div class="vs_entry flexrows">
        <div class="vs_player_actions">
          <div class="vs_action_area flexrows">
            <div class="vs_action_buttons flexcenter">
              <div class="classAction vs_action_button winner modewin_player0 flexcenter" action="modewin" side="0">
                Ace
              </div>
              <div class="classAction vs_action_button forced modeforce_player0 flexcenter" action="modeerr" side="0">
                Let
              </div>
              <div class="classAction vs_action_button fault modeerr_player0 flexcenter" action="modeerr" side="0">
                Fault
              </div>
            </div>
            <div class="vs_mode_buttons flexcols flexcenter">
              <div class="vs_mode_action flexcenter">
                <div class="redo redoAction iconredo action_icon"></div>
              </div>
              <div class="classAction vs_mode_button modeaction_player0 flexcenter" action="modeaction" side="0">
                Serve
              </div>
            </div>
          </div>
        </div>
        <div class="vs_player_actions">
          <div class="vs_action_area flexrows">
            <div class="vs_mode_buttons flexcols flexcenter">
              <div class="vs_mode_action flexcenter">
                <div class="undo undoAction iconundo action_icon"></div>
              </div>
              <div class="classAction vs_mode_button modeaction_player1 flexcenter" action="modeaction" side="1">
                Return
              </div>
            </div>
            <div class="vs_action_buttons flexcenter">
              <div class="classAction vs_action_button winner modewin_player1 flexcenter" action="modewin" side="1">
                Winner
              </div>
              <div class="classAction vs_action_button forced modeforce_player1 flexcenter" action="modeerr" side="1">
                Forced
              </div>
              <div class="classAction vs_action_button fault modeerr_player1 flexcenter" action="modeerr" side="1">
                UFE
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="vs_status flexrows">
        <div class="vs_status_message flexcenter">
          <div class="status_message"></div>
        </div>
      </div>
      <div class="ch_footer vs_rally">
        <div class="classAction vs_rallybar rally flexcenter pressAndHold" action="rally">Rally</div>
      </div>`;
  }
}
