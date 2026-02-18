/**
 * Details Page
 * 
 * Match and tournament details editor.
 * Allows editing match metadata, player information, etc.
 */

import { BasePage, PageOptions } from './BasePage';
import { env, definePlayer } from '../transition/env';
import { formatToTODS, getTodayTODS } from '../utils/dateUtils';

export class DetailsPage extends BasePage {
  private detailsContainer: HTMLElement | null = null;

  constructor(container: HTMLElement, options: PageOptions = {}) {
    super(container, options);
  }

  protected async onBeforeMount(): Promise<void> {
    console.log('DetailsPage: Mounting...');
  }

  protected render(): void {
    this.container.innerHTML = '';
    this.container.className = 'details-page';

    // Create header
    const header = this.createElement('div', {
      className: 'details-header',
    });

    const title = this.createElement('h2', {
      className: 'details-title',
    });
    title.textContent = 'Match Details';

    header.appendChild(title);

    // Create details form
    const detailsForm = this.createElement('div', {
      className: 'details-form',
      id: 'details-form-container',
    });

    this.container.appendChild(header);
    this.container.appendChild(detailsForm);

    this.detailsContainer = detailsForm;
  }

  protected async onMounted(): Promise<void> {
    console.log('DetailsPage: Mounted, rendering form...');
    this.renderDetailsForm();
  }

  private renderDetailsForm(): void {
    if (!this.detailsContainer) return;

    const players = env.metadata.players;
    const matchInfo = env.metadata.match;
    const tournamentInfo = env.metadata.tournament;

    // Player Details Section
    const playersSection = this.createSection('Players', [
      {
        label: 'Player 1',
        type: 'text',
        id: 'player1-name',
        value: players[0]?.participantName || '',
        onChange: (value: string) => this.updatePlayerName(0, value),
      },
      {
        label: 'Player 2',
        type: 'text',
        id: 'player2-name',
        value: players[1]?.participantName || '',
        onChange: (value: string) => this.updatePlayerName(1, value),
      },
    ]);

    // Match Details Section
    const matchSection = this.createSection('Match Information', [
      {
        label: 'Match Date',
        type: 'date',
        id: 'match-date',
        value: this.getMatchDate(),
        onChange: (value: string) => this.updateMatchDate(value),
      },
      {
        label: 'Round',
        type: 'text',
        id: 'match-round',
        value: matchInfo?.roundName || '',
        placeholder: 'e.g., Final, Semi-Final, R16',
        onChange: (value: string) => this.updateMatchRound(value),
      },
      {
        label: 'Court',
        type: 'text',
        id: 'match-court',
        value: matchInfo?.courtName || '',
        placeholder: 'e.g., Court 1, Center Court',
        onChange: (value: string) => this.updateMatchCourt(value),
      },
    ]);

    // Tournament Details Section
    const tournamentSection = this.createSection('Tournament Information', [
      {
        label: 'Tournament Name',
        type: 'text',
        id: 'tournament-name',
        value: tournamentInfo?.tournamentName || '',
        onChange: (value: string) => this.updateTournamentName(value),
      },
      {
        label: 'Category',
        type: 'text',
        id: 'tournament-category',
        value: tournamentInfo?.category || '',
        placeholder: 'e.g., ATP, WTA, ITF',
        onChange: (value: string) => this.updateTournamentCategory(value),
      },
    ]);

    this.detailsContainer.appendChild(playersSection);
    this.detailsContainer.appendChild(matchSection);
    this.detailsContainer.appendChild(tournamentSection);
  }

  private createSection(title: string, fields: any[]): HTMLElement {
    const section = this.createElement('div', {
      className: 'details-section',
    });

    const sectionTitle = this.createElement('h3', {
      className: 'details-section-title',
    });
    sectionTitle.textContent = title;

    section.appendChild(sectionTitle);

    fields.forEach(field => {
      const fieldGroup = this.createElement('div', {
        className: 'details-field-group',
      });

      const label = this.createElement('label', {
        className: 'details-label',
        for: field.id,
      });
      label.textContent = field.label;

      const input = this.createElement('input', {
        type: field.type || 'text',
        className: 'details-input',
        id: field.id,
        value: field.value || '',
        placeholder: field.placeholder || '',
      }) as HTMLInputElement;

      input.addEventListener('change', (e) => {
        if (field.onChange) {
          field.onChange((e.target as HTMLInputElement).value);
        }
      });

      fieldGroup.appendChild(label);
      fieldGroup.appendChild(input);
      section.appendChild(fieldGroup);
    });

    return section;
  }

  private getMatchDate(): string {
    const matchInfo = env.metadata.match;

    // If date exists and is in TODS format, return it
    if (matchInfo?.matchDate && typeof matchInfo.matchDate === 'string') {
      return matchInfo.matchDate;
    }

    // If it's a timestamp, convert to TODS format
    if (typeof matchInfo?.matchDate === 'number') {
      return formatToTODS(matchInfo.matchDate);
    }

    // Default to today
    return getTodayTODS();
  }

  private updatePlayerName(index: number, name: string): void {
    const [firstName, ...lastNameParts] = name.split(' ');
    const lastName = lastNameParts.join(' ');

    definePlayer({
      index,
      firstName: firstName || '',
      lastName: lastName || '',
    });

    console.log(`Updated player ${index}: ${name}`);
  }

  private updateMatchDate(date: string): void {
    Object.assign(env.metadata.match, { matchDate: date });
    console.log('Updated match date:', date);
  }

  private updateMatchRound(round: string): void {
    Object.assign(env.metadata.match, { roundName: round });
    console.log('Updated match round:', round);
  }

  private updateMatchCourt(court: string): void {
    Object.assign(env.metadata.match, { courtName: court });
    console.log('Updated match court:', court);
  }

  private updateTournamentName(name: string): void {
    Object.assign(env.metadata.tournament, { tournamentName: name });
    console.log('Updated tournament name:', name);
  }

  private updateTournamentCategory(category: string): void {
    Object.assign(env.metadata.tournament, { category });
    console.log('Updated tournament category:', category);
  }

  protected async onBeforeUnmount(): Promise<void> {
    console.log('DetailsPage: Unmounting...');
  }
}
