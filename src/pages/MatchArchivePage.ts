/**
 * Match Archive Page
 * 
 * Displays list of saved matches from localStorage.
 * Allows loading, viewing, and deleting archived matches.
 */

import { BasePage, PageOptions } from './BasePage';
import { displayMatchArchive } from '../match/displayMatchArchive';

export class MatchArchivePage extends BasePage {
  private archiveContainer: HTMLElement | null = null;

  constructor(container: HTMLElement, options: PageOptions = {}) {
    super(container, options);
  }

  protected async onBeforeMount(): Promise<void> {
    console.log('MatchArchivePage: Mounting...');
  }

  protected render(): void {
    this.container.innerHTML = '';
    this.container.className = 'match-archive-page';

    // Create header
    const header = this.createElement('div', {
      className: 'archive-header',
    });

    const title = this.createElement('h2', {
      className: 'archive-title',
    });
    title.textContent = 'Match Archive';

    header.appendChild(title);

    // Create archive list container
    const archiveContent = this.createElement('div', {
      className: 'archive-content',
      id: 'archive-list-container',
    });

    this.container.appendChild(header);
    this.container.appendChild(archiveContent);

    this.archiveContainer = archiveContent;
  }

  protected async onMounted(): Promise<void> {
    console.log('MatchArchivePage: Mounted, rendering match archive...');
    this.renderArchive();
  }

  private renderArchive(): void {
    if (!this.archiveContainer) return;

    // Use existing displayMatchArchive function
    displayMatchArchive();

    console.log('MatchArchivePage: Rendered match archive');
  }

  protected async onBeforeUnmount(): Promise<void> {
    console.log('MatchArchivePage: Unmounting...');
  }

  /**
   * Refresh archive list
   */
  refresh(): void {
    if (!this.mounted) return;
    this.renderArchive();
  }
}
