import { BaseSkin } from '../BaseSkin';

export class HBlackSkin extends BaseSkin {
  readonly id = 'hblack';
  readonly orientation = 'horizontal' as const;

  protected buildDOM(root: HTMLElement): void {
    root.innerHTML = `
      <div id="h_scoreboard" class="flexrows">
        <div id="h_playernames" class="flexcols">
          <div
            id="h_playerone"
            class="editPlayer h_playername flexcenter indicate_serve display_player_0"
            playerIndex="0"
          >
            Player One
          </div>
          <div
            id="h_playertwo"
            class="editPlayer h_playername flexcenter indicate_serve display_player_1"
            playerIndex="1"
          >
            Player Two
          </div>
        </div>
        <div class="h_swap flexcenter">
          <div class="swapAction swapimage action_image"></div>
        </div>
        <div id="h_scores" class="">
          <div class="h_setscore flexcols">
            <div class="flexcenter h_score">
              <div class="display_set_0_games_0">0</div>
            </div>
            <div class="flexcenter h_score">
              <div class="display_set_0_games_1">0</div>
            </div>
          </div>
          <div class="h_setscore flexcols">
            <div class="flexcenter h_score">
              <div class="display_set_1_games_0">-</div>
            </div>
            <div class="flexcenter h_score">
              <div class="display_set_1_games_1">-</div>
            </div>
          </div>
          <div class="h_setscore flexcols">
            <div class="flexcenter h_score">
              <div class="display_set_2_games_0">-</div>
            </div>
            <div class="flexcenter h_score">
              <div class="display_set_2_games_1">-</div>
            </div>
          </div>
          <div class="h_setscore flexcols">
            <div class="flexcenter h_score">
              <div class="display_set_3_games_0"></div>
            </div>
            <div class="flexcenter h_score">
              <div class="display_set_3_games_1"></div>
            </div>
          </div>
          <div class="h_setscore flexcols">
            <div class="flexcenter h_score">
              <div class="display_set_4_games_0"></div>
            </div>
            <div class="flexcenter h_score">
              <div class="display_set_4_games_1"></div>
            </div>
          </div>
        </div>
      </div>
      <div id="h_timer" class="flexrows">
        <div class="h_playerside flexjustifystart">
          <div id="h_playerleft" class="editPlayer indicate_serve display_player_0" playerIndex="0">Player One</div>
        </div>
        <div class="h_datetime">&nbsp;</div>
        <div class="h_datetime">&nbsp;</div>
        <div class="h_playerside flexjustifyend">
          <div id="h_playerright" class="editPlayer indicate_serve display_player_1" playerIndex="1">Player Two</div>
        </div>
      </div>
      <div id="h_entry" class="flexrows">
        <div id="h_left" class="flexcols h_borderright">
          <div class="h_action">
            <div class="classAction h_button fault display_0_serving" action="fault" side="0">Fault</div>
            <div class="flexcenter display_1_serving" style="height: 100%">
              <div class="view_stats viewStats iconstats action_icon_large"></div>
              <div class="change_server changeServer iconchange action_icon_large"></div>
            </div>
          </div>
          <div class="h_action">
            <div class="classAction h_button winner" action="winner" side="0">Winner</div>
          </div>
          <div class="h_action">
            <div class="classAction h_button unforced" action="unforced" side="0">Unforced Error</div>
          </div>
          <div class="h_action">
            <div class="classAction h_button forced" action="forced" side="0">Forced Error</div>
          </div>
        </div>
        <div id="h_center" class="flexcols">
          <div id="h_extras" class="flexrows">
            <div class="h_serviceaction">
              <div class="classAction h_button winner display_0_serving" action="ace" side="0">Ace</div>
              <div class="flexcenter display_1_serving" style="height: 100%">
                <div class="view_history viewPointHistory iconhistory action_icon_large"></div>
                <div class="view_archive matchArchive iconarchive action_icon_large"></div>
              </div>
            </div>
            <div class="h_message flexcenter">
              <div class="h_messagetext status_message">&nbsp;</div>
            </div>
            <div class="h_serviceaction">
              <div class="classAction h_button winner display_1_serving" action="ace" side="1">Ace</div>
              <div class="flexcenter display_0_serving" style="height: 100%">
                <div class="view_history viewPointHistory iconhistory action_icon_large"></div>
                <div class="view_archive matchArchive iconarchive action_icon_large"></div>
              </div>
            </div>
          </div>
          <div id="h_points" class="flexrows">
            <div class="classAction h_point flexcenter h_borderright" action="point" side="0">
              <div class="classAction display_points_0" action="point" side="0">0</div>
            </div>
            <div class="classAction h_point flexcenter h_borderleft" action="point" side="1">
              <div class="classAction display_points_1" action="point" side="1">0</div>
            </div>
          </div>
        </div>
        <div id="h_right" class="flexcols h_borderleft">
          <div class="h_action">
            <div class="classAction h_button fault display_1_serving" action="fault" side="1">Fault</div>
            <div class="flexcenter display_0_serving" style="height: 100%">
              <div class="view_stats viewStats iconstats action_icon_large"></div>
              <div class="change_server changeServer iconchange action_icon_large"></div>
            </div>
          </div>
          <div class="h_action">
            <div class="classAction h_button winner" action="winner" side="1">Winner</div>
          </div>
          <div class="h_action">
            <div class="classAction h_button unforced" action="unforced" side="1">Unforced Error</div>
          </div>
          <div class="h_action">
            <div class="classAction h_button forced" action="forced" side="1">Forced Error</div>
          </div>
        </div>
      </div>
      <div id="h_menu" class="flexrows">
        <div class="mainMenu h_menuitem flexcenter">
          <div class="mainMenu iconmenu action_icon_large"></div>
        </div>
        <div class="h_menuitem settings flexcenter">
          <div class="iconsettings settings action_icon_large"></div>
        </div>
        <div class="classAction h_menuitem flexcenter" action="penalty" side="0">
          <div class="classAction h_button" action="penalty" side="0">Penalty</div>
        </div>
        <div class="h_menuitem flexcenter">
          <div class="redo redoAction iconredo action_icon_large"></div>
        </div>
        <div class="h_menuitem flexcenter">
          <div class="undo undoAction iconundo action_icon_large"></div>
        </div>
        <div class="classAction h_menuitem flexcenter" action="penalty" side="1">
          <div class="classAction h_button" action="penalty" side="1">Penalty</div>
        </div>
        <div class="classAction rally h_menuwide h_button flexcenter pressAndHold" action="rally">
          Rally</div>
      </div>`;
  }
}
