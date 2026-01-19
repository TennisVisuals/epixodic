/**
 * Format Page
 * 
 * Match format selection page.
 * Allows users to choose scoring format before match starts.
 */

import { BasePage, PageOptions } from './BasePage';
import { displayFormats } from '../transition/displayFormats';

export class FormatPage extends BasePage {
  private formatContainer: HTMLElement | null = null;

  constructor(container: HTMLElement, options: PageOptions = {}) {
    super(container, options);
  }

  protected async onBeforeMount(): Promise<void> {
    console.log('FormatPage: Mounting...');
  }

  protected render(): void {
    this.container.innerHTML = '';
    this.container.className = 'format-page';

    // Create header
    const header = this.createElement('div', {
      className: 'format-header',
    });

    const title = this.createElement('h2', {
      className: 'format-title',
    });
    title.textContent = 'Match Format';

    const subtitle = this.createElement('div', {
      className: 'format-subtitle',
    });
    subtitle.textContent = 'Select the scoring format for this match';

    header.appendChild(title);
    header.appendChild(subtitle);

    // Create format container
    const formatContent = this.createElement('div', {
      className: 'format-content',
      id: 'format-list-container',
    });

    this.container.appendChild(header);
    this.container.appendChild(formatContent);

    this.formatContainer = formatContent;
  }

  protected async onMounted(): Promise<void> {
    console.log('FormatPage: Mounted, rendering formats...');
    this.renderFormats();
  }

  private renderFormats(): void {
    if (!this.formatContainer) return;

    // Use existing displayFormats function to populate the container
    displayFormats();

    console.log('FormatPage: Rendered match formats');
  }

  protected async onBeforeUnmount(): Promise<void> {
    console.log('FormatPage: Unmounting...');
  }
}
