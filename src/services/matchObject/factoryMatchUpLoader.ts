// Factory MatchUp Loader
// Loads TODS MatchUp objects into UMO for live scoring

import umo from '@tennisvisuals/universal-match-object';
import { updatePositions, env } from '../../transition/env';
import { updateScore, loadDetails } from '../../transition/displayUpdate';
import { matchUpTypes, matchUpStatusConstants, participantTypes, participantRoles } from 'tods-competition-factory';

const { SINGLES, DOUBLES } = matchUpTypes;
const { TO_BE_PLAYED } = matchUpStatusConstants;
const { INDIVIDUAL } = participantTypes;
const { COMPETITOR } = participantRoles;

// Extract fromMatchUp from UMO
const fromMatchUp = (umo as any).fromMatchUp;

// Type definition for MatchUp
type MatchUp = any; // Will be replaced with proper TODS type

export interface LoadFactoryMatchUpOptions {
  matchUp: MatchUp;
  startLiveScoring?: boolean;
  loadScore?: boolean;
}

/**
 * FactoryMatchUpLoader
 *
 * Loads TODS MatchUp objects into the mobile app's UMO for live scoring.
 * Uses UMO's fromMatchUp() adapter for automatic conversion.
 */
export class FactoryMatchUpLoader {
  /**
   * Load a TODS MatchUp and prepare for live scoring
   *
   * @param options - Load options
   */
  static load(options: LoadFactoryMatchUpOptions): void {
    const { matchUp, startLiveScoring = true, loadScore = false } = options;

    console.log('~━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━~');
    console.log('🏭 Loading TODS MatchUp');
    console.log('matchUpId:', matchUp.matchUpId);
    console.log('matchUpType:', matchUp.matchUpType);
    console.log('matchUpFormat:', matchUp.matchUpFormat);
    console.log('~━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━~');

    // Use UMO's fromMatchUp adapter to convert TODS → UMO internal format
    const matchConfig = fromMatchUp(matchUp);

    console.log('Match config from adapter:', {
      id: matchConfig.id,
      type: matchConfig.type,
      participants: matchConfig.participants?.length,
      isDoubles: matchConfig.isDoubles,
    });

    // Reset and create match with converted config
    env.match.reset();

    // Apply configuration (format, participants, doubles mode)
    if (matchConfig.type) {
      env.match.format.settings({ code: matchConfig.type });
    }

    if (matchConfig.participants && Array.isArray(matchConfig.participants)) {
      (matchConfig.participants as any[]).forEach((participant: any, index: number) => {
        env.match.metadata.definePlayer({ ...participant, index });
      });
    }

    if (matchConfig.isDoubles) {
      env.match.doubles(true);
    }

    if (matchConfig.id) {
      env.match.metadata.defineMatch({ id: matchConfig.id });
    }

    // Service order is handled automatically by fromMatchUp adapter
    // For doubles, it extracts from TODS sides structure
    // For singles, it uses default [0, 1]

    // 5. Set first server if specified
    const firstServerSide = matchUp.sides?.find((s) => s.servingFirst);
    if (firstServerSide) {
      const firstServer = firstServerSide.sideNumber === 1 ? 0 : 1;
      console.log('First server:', firstServer);
      env.match.set.firstService(firstServer);
    } else {
      // Default to player 0
      env.match.set.firstService(0);
    }

    // 6. Store Factory matchUp ID and metadata
    env.match.metadata.defineMatch({
      muid: matchUp.matchUpId,
      // Map additional Factory fields to UMO metadata
      status: matchUp.matchUpStatus,
    });

    // 7. Load existing score if present and requested
    if (loadScore && matchUp.score) {
      console.log('Loading existing score...');
      this.loadScore(matchUp.score);
    }

    // 8. Enable live scoring features
    if (startLiveScoring) {
      console.log('Enabling live scoring');
      env.match.set.liveStats(true);
      env.match.metadata.timestamps(true);
    }

    // 9. Update UI
    console.log('Updating UI...');
    updatePositions();
    updateScore();
    loadDetails();

    console.log('✅ Factory matchUp loaded successfully');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  /**
   * Load score from Factory score object
   *
   * Factory score structure varies, so this is a placeholder
   * for future implementation when we have actual Factory score objects.
   *
   * @param score - Factory score object
   */
  private static loadScore(score: any): void {
    console.log('Score loading not yet implemented');
    console.log('Score object:', score);

    // TODO: Parse Factory score object
    // Factory scores typically have:
    // - sets: array of set scores
    // - scoreStringSide1, scoreStringSide2: human-readable scores
    // - For live scoring, we'd need to replay points or set the score directly

    // For now, this is a placeholder for future enhancement
  }

  /**
   * Create a mock TODS MatchUp for testing
   *
   * @param type - 'SINGLES' or 'DOUBLES'
   * @returns Mock TODS MatchUp object
   */
  static createMockMatchUp(type: 'SINGLES' | 'DOUBLES' = SINGLES): MatchUp {
    if (type === SINGLES) {
      return {
        matchUpId: 'mock_singles_001',
        matchUpType: SINGLES,
        matchUpFormat: 'SET3-S:6/TB7',
        matchUpStatus: TO_BE_PLAYED,
        sides: [
          {
            sideNumber: 1,
            servingFirst: true,
            participant: {
              participantId: 'p1',
              participantType: INDIVIDUAL,
              participantName: 'Federer',
              participantRole: COMPETITOR,
              person: {
                personId: 'person1',
                standardFamilyName: 'Federer',
                standardGivenName: 'Roger',
                nationalityCode: 'SUI',
                sex: 'MALE',
              },
            },
          },
          {
            sideNumber: 2,
            participant: {
              participantId: 'p2',
              participantType: INDIVIDUAL,
              participantName: 'Nadal',
              participantRole: COMPETITOR,
              person: {
                personId: 'person2',
                standardFamilyName: 'Nadal',
                standardGivenName: 'Rafael',
                nationalityCode: 'ESP',
                sex: 'MALE',
              },
            },
          },
        ],
      };
    } else {
      // DOUBLES
      return {
        matchUpId: 'mock_doubles_001',
        matchUpType: DOUBLES,
        matchUpFormat: 'SET3-S:6/TB7-F:TB10',
        matchUpStatus: TO_BE_PLAYED,
        sides: [
          {
            sideNumber: 1,
            servingFirst: true,
            participant: {
              participantId: 'pair1',
              participantType: participantTypes.PAIR,
              participantName: 'Federer/Nadal',
              participantRole: COMPETITOR,
              individualParticipantIds: ['p1', 'p2'],
              individualParticipants: [
                {
                  participantId: 'p1',
                  participantType: INDIVIDUAL,
                  participantName: 'Federer',
                  participantRole: COMPETITOR,
                  person: {
                    personId: 'person1',
                    standardFamilyName: 'Federer',
                    standardGivenName: 'Roger',
                    nationalityCode: 'SUI',
                    sex: 'MALE',
                  },
                },
                {
                  participantId: 'p2',
                  participantType: INDIVIDUAL,
                  participantName: 'Nadal',
                  participantRole: COMPETITOR,
                  person: {
                    personId: 'person2',
                    standardFamilyName: 'Nadal',
                    standardGivenName: 'Rafael',
                    nationalityCode: 'ESP',
                    sex: 'MALE',
                  },
                },
              ],
            },
          },
          {
            sideNumber: 2,
            participant: {
              participantId: 'pair2',
              participantType: participantTypes.PAIR,
              participantName: 'Djokovic/Murray',
              participantRole: COMPETITOR,
              individualParticipantIds: ['p3', 'p4'],
              individualParticipants: [
                {
                  participantId: 'p3',
                  participantType: INDIVIDUAL,
                  participantName: 'Djokovic',
                  participantRole: COMPETITOR,
                  person: {
                    personId: 'person3',
                    standardFamilyName: 'Djokovic',
                    standardGivenName: 'Novak',
                    nationalityCode: 'SRB',
                    sex: 'MALE',
                  },
                },
                {
                  participantId: 'p4',
                  participantType: INDIVIDUAL,
                  participantName: 'Murray',
                  participantRole: COMPETITOR,
                  person: {
                    personId: 'person4',
                    standardFamilyName: 'Murray',
                    standardGivenName: 'Andy',
                    nationalityCode: 'GBR',
                    sex: 'MALE',
                  },
                },
              ],
            },
          },
        ],
      };
    }
  }
}
