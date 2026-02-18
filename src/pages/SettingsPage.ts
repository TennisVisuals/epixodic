/**
 * Settings Page
 * 
 * Application settings and preferences.
 * Allows configuring app behavior, display options, etc.
 */

import { BasePage, PageOptions } from './BasePage';
import { settings, options } from '../state/env';
import { browserStorage } from '../state/browserStorage';

export class SettingsPage extends BasePage {
  private settingsContainer: HTMLElement | null = null;

  constructor(container: HTMLElement, options: PageOptions = {}) {
    super(container, options);
  }

  protected async onBeforeMount(): Promise<void> {
    console.log('SettingsPage: Mounting...');
  }

  protected render(): void {
    this.container.innerHTML = '';
    this.container.className = 'settings-page';

    // Create header
    const header = this.createElement('div', {
      className: 'settings-header',
    });

    const title = this.createElement('h2', {
      className: 'settings-title',
    });
    title.textContent = 'Settings';

    header.appendChild(title);

    // Create settings container
    const settingsContent = this.createElement('div', {
      className: 'settings-content',
      id: 'settings-container',
    });

    this.container.appendChild(header);
    this.container.appendChild(settingsContent);

    this.settingsContainer = settingsContent;
  }

  protected async onMounted(): Promise<void> {
    console.log('SettingsPage: Mounted, rendering settings...');
    this.renderSettings();
  }

  private renderSettings(): void {
    if (!this.settingsContainer) return;

    // Create settings sections
    const sections = [
      {
        title: 'Display Options',
        settings: [
          {
            key: 'display_gamefish',
            label: 'Display Game Fish',
            type: 'toggle',
            value: settings.track_shot_types,
          },
          {
            key: 'auto_swap_sides',
            label: 'Auto Swap Sides',
            type: 'toggle',
            value: settings.auto_swap_sides,
          },
        ],
      },
      {
        title: 'Input Options',
        settings: [
          {
            key: 'audible_clicks',
            label: 'Audible Clicks',
            type: 'toggle',
            value: settings.audible_clicks,
          },
          {
            key: 'point_buttons',
            label: 'Point Entry Buttons',
            type: 'toggle',
            value: settings.point_buttons,
          },
        ],
      },
      {
        title: 'Data Options',
        settings: [
          {
            key: 'track_shot_types',
            label: 'Track Shot Types',
            type: 'toggle',
            value: settings.track_shot_types,
          },
        ],
      },
    ];

    sections.forEach(section => {
      const sectionDiv = this.createSettingsSection(section);
      this.settingsContainer!.appendChild(sectionDiv);
    });
  }

  private createSettingsSection(section: any): HTMLElement {
    const sectionDiv = this.createElement('div', {
      className: 'settings-section',
    });

    const sectionTitle = this.createElement('h3', {
      className: 'settings-section-title',
    });
    sectionTitle.textContent = section.title;

    sectionDiv.appendChild(sectionTitle);

    section.settings.forEach((setting: any) => {
      const settingItem = this.createSettingItem(setting);
      sectionDiv.appendChild(settingItem);
    });

    return sectionDiv;
  }

  private createSettingItem(setting: any): HTMLElement {
    const itemDiv = this.createElement('div', {
      className: 'settings-item',
    });

    const label = this.createElement('label', {
      className: 'settings-label',
    });
    label.textContent = setting.label;

    const control = this.createSettingControl(setting);

    itemDiv.appendChild(label);
    itemDiv.appendChild(control);

    return itemDiv;
  }

  private createSettingControl(setting: any): HTMLElement {
    if (setting.type === 'toggle') {
      const toggle = this.createElement('label', {
        className: 'settings-toggle',
      });

      const checkbox = this.createElement('input', {
        type: 'checkbox',
        checked: setting.value ? 'checked' : '',
        'data-key': setting.key,
      }) as HTMLInputElement;

      checkbox.addEventListener('change', (e) => {
        this.handleSettingChange(setting.key, checkbox.checked);
      });

      const slider = this.createElement('span', {
        className: 'settings-toggle-slider',
      });

      toggle.appendChild(checkbox);
      toggle.appendChild(slider);

      return toggle;
    }

    // Default: text input
    const input = this.createElement('input', {
      type: 'text',
      className: 'settings-input',
      value: setting.value || '',
      'data-key': setting.key,
    });

    input.addEventListener('change', (e) => {
      this.handleSettingChange(setting.key, (e.target as HTMLInputElement).value);
    });

    return input;
  }

  private handleSettingChange(key: string, value: any): void {
    // Update settings object
    if (key in settings) {
      (settings as any)[key] = value;
    }

    if (key in options) {
      (options as any)[key] = value;
    }

    // Save to localStorage
    browserStorage.set(`setting_${key}`, value);

    console.log(`Setting changed: ${key} = ${value}`);
  }

  protected async onBeforeUnmount(): Promise<void> {
    console.log('SettingsPage: Unmounting...');
  }
}
