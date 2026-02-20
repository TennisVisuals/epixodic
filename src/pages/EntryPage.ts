import { ViewPage } from './ViewPage';
import { touchManager } from '../events/touchManager';
import { stateChangeEvent, swapServer } from '../display/displayUpdate';
import { getSkin } from '../scoring';
import { env, options } from '../state/env';

export class EntryPage extends ViewPage {
  protected activate(): void {
    touchManager.prevent_touch = true;

    const container = document.getElementById('scoring-container');
    if (!container) return;

    // Always render both skins so all DOM elements exist for
    // document-level querySelectorAll used by displayUpdate/classAction
    const vSkin = getSkin(options.vertical_view);
    const hSkin = getSkin(options.horizontal_view);

    if (vSkin && !vSkin.rendered) vSkin.render(container);
    if (hSkin && !hSkin.rendered) hSkin.render(container);

    if (env.orientation === 'landscape') {
      if (hSkin) hSkin.show();
      if (vSkin) vSkin.hide();
    } else {
      if (vSkin) vSkin.show();
      if (hSkin) hSkin.hide();
    }

    // Initialize display state on the freshly rendered DOM.
    // The router calls these before mounting, but at that point
    // the skin DOM doesn't exist yet, so we must call again here.
    // stateChangeEvent() covers score, positions, buttons, server, and charts.
    swapServer();
    stateChangeEvent();
  }

  protected deactivate(): void {
    const vSkin = getSkin(options.vertical_view);
    if (vSkin) vSkin.hide();
    const hSkin = getSkin(options.horizontal_view);
    if (hSkin) hSkin.hide();
  }
}
