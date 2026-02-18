/**
 * Main Menu Page
 * 
 * Main navigation menu for the application.
 * Provides links to all major sections.
 */

import { BasePage, PageOptions } from './BasePage';
import { env, options } from '../state/env';
import { browserStorage } from '../state/browserStorage';
import { formatChangePossible } from '../engine/formatChangePossible';

export class MainMenuPage extends BasePage {
  constructor(container: HTMLElement, options: PageOptions = {}) {
    super(container, options);
  }

  protected async onBeforeMount(): Promise<void> {
    console.log('MainMenuPage: Mounting...');
  }

  protected render(): void {
    this.container.innerHTML = '';
    this.container.className = 'main-menu-page';

    // Create menu header
    const header = this.createElement('div', {
      className: 'menu-header',
    });

    const title = this.createElement('h1', {
      className: 'menu-title',
    });
    title.textContent = 'CourtHive Mobile';

    const subtitle = this.createElement('div', {
      className: 'menu-subtitle',
    });
    subtitle.textContent = 'Tennis Match Tracking';

    header.appendChild(title);
    header.appendChild(subtitle);

    // Create menu items
    const menuContainer = this.createElement('div', {
      className: 'menu-container',
    });

    const menuItems = this.getMenuItems();

    menuItems.forEach(item => {
      if (!item.show) return;

      const menuItem = this.createElement('div', {
        className: `menu-item ${item.disabled ? 'disabled' : ''}`,
      });

      const icon = this.createElement('div', {
        className: 'menu-item-icon',
      });
      icon.textContent = item.icon;

      const label = this.createElement('div', {
        className: 'menu-item-label',
      });
      label.textContent = item.label;

      if (item.description) {
        const description = this.createElement('div', {
          className: 'menu-item-description',
        });
        description.textContent = item.description;
        label.appendChild(description);
      }

      menuItem.appendChild(icon);
      menuItem.appendChild(label);

      if (!item.disabled && item.onClick) {
        menuItem.addEventListener('click', item.onClick);
      }

      menuContainer.appendChild(menuItem);
    });

    this.container.appendChild(header);
    this.container.appendChild(menuContainer);
  }

  protected async onMounted(): Promise<void> {
    console.log('MainMenuPage: Mounted');
  }

  private getMenuItems() {
    const router = (window as any).appRouter;
    const points = env.engine.getState().history?.points || [];
    const hasPoints = points.length > 0;
    const match_archive = JSON.parse(browserStorage.get('match_archive') || '[]');
    const hasArchive = match_archive.length > 0;
    const canChangeFormat = formatChangePossible();

    return [
      {
        icon: '▶️',
        label: 'Start Scoring',
        description: 'Begin or resume match',
        show: true,
        disabled: false,
        onClick: () => router?.navigate('/scoring'),
      },
      {
        icon: '📊',
        label: 'View Statistics',
        description: hasPoints ? 'Match statistics and charts' : 'No points recorded yet',
        show: true,
        disabled: !hasPoints,
        onClick: () => router?.navigate('/stats'),
      },
      {
        icon: '🌳',
        label: 'Game Tree',
        description: hasPoints ? 'Visualize game progression' : 'No points recorded yet',
        show: true,
        disabled: !hasPoints,
        onClick: () => router?.navigate('/tree'),
      },
      {
        icon: '📈',
        label: 'Momentum Chart',
        description: hasPoints ? 'Match momentum visualization' : 'No points recorded yet',
        show: true,
        disabled: !hasPoints,
        onClick: () => router?.navigate('/momentum'),
      },
      {
        icon: '📝',
        label: 'Point History',
        description: 'Chronological point list',
        show: true,
        disabled: false,
        onClick: () => router?.navigate('/history'),
      },
      {
        icon: '📁',
        label: 'Match Archive',
        description: hasArchive ? `${match_archive.length} saved matches` : 'No saved matches',
        show: true,
        disabled: false,
        onClick: () => router?.navigate('/archive'),
      },
      {
        icon: '⚙️',
        label: 'Match Format',
        description: canChangeFormat ? 'Select match format' : 'Cannot change after points recorded',
        show: true,
        disabled: !canChangeFormat,
        onClick: () => router?.navigate('/format'),
      },
      {
        icon: '📋',
        label: 'Match Details',
        description: 'Edit match information',
        show: true,
        disabled: false,
        onClick: () => router?.navigate('/details'),
      },
      {
        icon: '⚙️',
        label: 'Settings',
        description: 'App preferences',
        show: true,
        disabled: false,
        onClick: () => router?.navigate('/settings'),
      },
    ];
  }

  protected async onBeforeUnmount(): Promise<void> {
    console.log('MainMenuPage: Unmounting...');
  }

  /**
   * Refresh menu (e.g., when match state changes)
   */
  refresh(): void {
    if (!this.mounted) return;
    this.render();
  }
}
