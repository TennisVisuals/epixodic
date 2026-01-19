// Storage Adapter - Save/Load matches in TODS MatchUp format
// Maintains backward compatibility with legacy formats (v1.0, v2.0)

import { env } from '../../transition/env';
import { browserStorage } from '../../transition/browserStorage';
import { FactoryMatchUpLoader } from './factoryMatchUpLoader';
import { loadMatch as loadMatchLegacy } from '../../transition/loadMatch';

// Type definition for MatchUp
type MatchUp = any;  // Will be replaced with proper TODS type

/**
 * Stored Match Format - TODS MatchUp (v3.0)
 * 
 * Current format (v3.0): Fully hydrated TODS MatchUp
 * Legacy formats (v1.0, v2.0) converted on load
 */
export interface StoredMatchV3 {
  // Version indicator
  version: '3.0';
  
  // Fully hydrated TODS MatchUp (from match.toMatchUp())
  matchUp: MatchUp;
  
  // Point history
  points: any[];
  
  // Tournament metadata (optional)
  tournament?: any;
}

/**
 * Legacy v2.0 format (partially hydrated)
 */
export interface StoredMatchV2 {
  version: '2.0';
  factoryMatchUp: any;  // Partially hydrated
  points: any[];
  tournament?: any;
}

/**
 * Legacy Stored Match Format (pre-v2.0)
 * Used for detection and migration only
 */
interface LegacyStoredMatch {
  version?: string;
  players?: any[];
  service_order?: number[];
  first_service?: number;
  format?: any;
  tournament?: any;
  match?: any;
  points?: any[];
}

/**
 * StorageAdapter
 * 
 * Handles saving and loading matches with dual format support.
 * Always saves both legacy and Factory formats for maximum compatibility.
 */
export class StorageAdapter {
  
  /**
   * Save current match to browser storage
   * 
   * Saves in fully hydrated TODS format (v3.0) using match.toMatchUp()
   * 
   * @param matchId - Unique identifier for the match
   */
  static saveMatch(matchId: string): void {
    console.log('💾 Saving match (TODS v3.0 format):', matchId);
    
    // Use UMO's toMatchUp() to get fully hydrated TODS MatchUp
    const matchUp = env.match.toMatchUp();
    
    const matchData: StoredMatchV3 = {
      version: '3.0',
      matchUp,  // Fully hydrated TODS MatchUp!
      points: env.match.history.points(),
      tournament: env.match.metadata.tournament,
    };
    
    console.log('  Sides:', matchUp.sides?.length);
    console.log('  Points:', matchData.points.length);
    console.log('  Format:', matchUp.matchUpFormat);
    console.log('  Score sets:', matchUp.score?.sets?.length || 0);
    console.log('  Score strings:', matchUp.score?.scoreStringSide1, matchUp.score?.scoreStringSide2);
    
    browserStorage.set(matchId, JSON.stringify(matchData));
    console.log('✅ Match saved in TODS v3.0 format (fully hydrated)');
  }
  
  /**
   * Load match from browser storage
   * 
   * Supports v3.0 (TODS), v2.0 (partial TODS), and v1.0 (legacy)
   * Auto-converts and re-saves as v3.0
   * 
   * @param matchId - Unique identifier for the match
   * @param view - View to display after loading (default: 'entry')
   */
  static loadMatch(matchId: string, view: string = 'entry'): void {
    console.log('📂 Loading match:', matchId);
    
    const json = browserStorage.get(matchId);
    if (!json) {
      console.warn('Match not found:', matchId);
      return;
    }
    
    const matchData: any = JSON.parse(json);
    
    // v3.0: Fully hydrated TODS MatchUp
    if (matchData.version === '3.0' && matchData.matchUp) {
      console.log('✅ Loading TODS v3.0 format (fully hydrated)');
      this.loadTODSMatch(matchData);
      
    // v2.0: Partially hydrated (convert to v3.0)
    } else if (matchData.version === '2.0' && matchData.factoryMatchUp) {
      console.log('⚠️  v2.0 format detected - converting to v3.0');
      this.loadFactoryMatch(matchData);
      // Re-save as v3.0
      this.saveMatch(matchId);
      console.log('✅ Converted and saved as v3.0');
      
    // v1.0: Legacy format (convert to v3.0)
    } else {
      console.log('⚠️  Legacy v1.0 format detected - converting to v3.0');
      
      const converted = this.convertLegacyToV3(matchData, matchId);
      
      if (converted) {
        this.loadTODSMatch(converted);
        // Re-save as v3.0
        browserStorage.set(matchId, JSON.stringify(converted));
        console.log('✅ Converted and saved as v3.0');
      } else {
        console.error('❌ Failed to convert legacy match');
        loadMatchLegacy(matchId, view);
      }
    }
  }
  
  /**
   * Load a TODS v3.0 format match (fully hydrated)
   * 
   * @param matchData - TODS v3.0 stored match
   */
  private static loadTODSMatch(matchData: StoredMatchV3): void {
    console.log('Loading TODS v3.0 match with fromMatchUp adapter');
    
    // Use FactoryMatchUpLoader which now uses fromMatchUp()
    FactoryMatchUpLoader.load({
      matchUp: matchData.matchUp,
      startLiveScoring: false
    });
    
    // Replay points
    if (matchData.points && matchData.points.length > 0) {
      console.log(`Replaying ${matchData.points.length} points...`);
      matchData.points.forEach((point: any) => {
        env.match.addPoint(point);
      });
    }
    
    // Enable stats
    env.match.set.liveStats(true);
    env.match.metadata.timestamps(true);
  }
  
  /**
   * Load a v2.0 format match (partially hydrated)
   * 
   * @param matchData - v2.0 stored match
   */
  private static loadFactoryMatch(matchData: StoredMatchV2): void {
    console.log('Loading v2.0 match (will convert to v3.0)');
    
    FactoryMatchUpLoader.load({
      matchUp: matchData.factoryMatchUp,
      startLiveScoring: false
    });
    
    // Replay points
    if (matchData.points && matchData.points.length > 0) {
      matchData.points.forEach((point: any) => {
        env.match.addPoint(point);
      });
    }
    
    env.match.set.liveStats(true);
    env.match.metadata.timestamps(true);
  }
  
  /**
   * Convert legacy v1.0 match to TODS v3.0 format
   * 
   * @param legacyData - Legacy stored match
   * @param matchId - Match ID
   * @returns TODS v3.0 match or null
   */
  private static convertLegacyToV3(
    legacyData: LegacyStoredMatch, 
    matchId: string
  ): StoredMatchV3 | null {
    console.log('Converting legacy v1.0 match to TODS v3.0...');
    
    if (!legacyData.players || legacyData.players.length < 2) {
      console.error('Invalid legacy data - no players');
      return null;
    }
    
    // Determine match type
    const isDoubles = legacyData.players.length === 4;
    const matchUpType = isDoubles ? 'DOUBLES' : 'SINGLES';
    
    // Create sides from legacy players
    let sides: any[];
    if (!isDoubles) {
      sides = [
        {
          sideNumber: 1,
          participant: this._playerToParticipant(legacyData.players[0])
        },
        {
          sideNumber: 2,
          participant: this._playerToParticipant(legacyData.players[1])
        }
      ];
    } else {
      // Doubles: Assume service order defines teams
      const serviceOrder = legacyData.service_order || [0, 1, 2, 3];
      const team1 = [
        legacyData.players[serviceOrder[0]], 
        legacyData.players[serviceOrder[2]]
      ];
      const team2 = [
        legacyData.players[serviceOrder[1]], 
        legacyData.players[serviceOrder[3]]
      ];
      
      sides = [
        {
          sideNumber: 1,
          participant: StorageAdapter._createPairParticipant(team1)
        },
        {
          sideNumber: 2,
          participant: StorageAdapter._createPairParticipant(team2)
        }
      ];
    }
    
    // Build a basic v2.0 structure first, then load it
    // The load process will convert it to v3.0 using toMatchUp()
    return {
      version: '3.0',
      matchUp: {
        matchUpId: legacyData.match?.muid || matchId,
        matchUpType,
        matchUpFormat: legacyData.format?.code || 'SET3-S:6/TB7',
        matchUpStatus: 'COMPLETED',
        sides
      },
      points: legacyData.points || [],
      tournament: legacyData.tournament
    };
  }
  
  /**
   * Helper: Convert UMO player to TODS INDIVIDUAL participant
   */
  private static _playerToParticipant(player: any): any {
    return {
      participantId: player.puid || `player_${player.index || 0}`,
      participantType: 'INDIVIDUAL',
      participantName: player.name || 'Unknown',
      participantRole: 'COMPETITOR',
      person: {
        personId: player.puid || `player_${player.index || 0}`,
        standardFamilyName: player.name || 'Unknown',
        nationalityCode: player.ioc,
        birthDate: player.birth,
        sex: player.gender
      }
    };
  }
  
  /**
   * Helper: Create PAIR participant from two players
   */
  private static _createPairParticipant(players: any[]): any {
    const [player1, player2] = players;
    const indiv1 = StorageAdapter._playerToParticipant(player1);
    const indiv2 = StorageAdapter._playerToParticipant(player2);
    
    return {
      participantId: `pair_${indiv1.participantId}_${indiv2.participantId}`,
      participantType: 'PAIR',
      participantName: `${player1.name}/${player2.name}`,
      participantRole: 'COMPETITOR',
      individualParticipantIds: [indiv1.participantId, indiv2.participantId],
      individualParticipants: [indiv1, indiv2]
    };
  }
  
  /**
   * Batch migrate all stored matches to v3.0 format
   * 
   * This is optional - matches are auto-converted on load.
   * Use this for proactive migration or to clean up storage.
   * 
   * @returns Number of matches migrated
   */
  static batchMigrateAllMatches(): number {
    console.log('🔄 Batch migrating all stored matches to Factory format...');
    
    const matchArchive: string[] = JSON.parse(
      browserStorage.get('match_archive') || '[]'
    );
    
    let migrated = 0;
    let alreadyMigrated = 0;
    
    matchArchive.forEach(matchId => {
      const json = browserStorage.get(matchId);
      if (!json) return;
      
      const matchData: any = JSON.parse(json);
      
      // Check if already Factory format
      if (matchData.version === '2.0' && matchData.factoryMatchUp) {
        alreadyMigrated++;
        return;
      }
      
      // Convert to v3.0
      const converted = this.convertLegacyToV3(matchData, matchId);
      if (converted) {
        browserStorage.set(matchId, JSON.stringify(converted));
        migrated++;
        console.log(`  ✅ Migrated: ${matchId}`);
      } else {
        console.error(`  ❌ Failed: ${matchId}`);
      }
    });
    
    console.log(`✅ Migration complete:`);
    console.log(`   Already migrated: ${alreadyMigrated}`);
    console.log(`   Newly migrated: ${migrated}`);
    console.log(`   Total: ${matchArchive.length}`);
    
    return migrated;
  }
}
