import { ViewPage } from './ViewPage';
import { formatChangePossible } from '../engine/formatChangePossible';
import { browserStorage } from '../state/browserStorage';
import { touchManager } from '../events/touchManager';
import { env } from '../state/env';

export class MainMenuPage extends ViewPage {
  protected activate(): void {
    touchManager.prevent_touch = false;

    const matchArchive = JSON.parse(browserStorage.get('match_archive') || '[]');
    const menuMatchArchive = document.getElementById('menu_match_archive');
    if (menuMatchArchive) menuMatchArchive.style.display = matchArchive.length ? 'flex' : 'none';

    const menuMatchFormat = document.getElementById('menu_match_format');
    if (menuMatchFormat) menuMatchFormat.style.display = formatChangePossible() ? 'flex' : 'none';

    const points = env.engine.getState().history?.points || [];
    const menuChangeServer = document.getElementById('menu_change_server');
    if (menuChangeServer) menuChangeServer.style.display = points.length === 0 ? 'flex' : 'none';

    this.show('mainmenu');
  }

  protected deactivate(): void {
    this.hide('mainmenu');
  }
}
