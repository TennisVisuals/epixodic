import { updateTournamentDetails } from '../match/updateTournamentDetails';
import { updateMatchDetails } from '../match/updateMatchDetails';
import { editMatchDetails } from '../display/displayUpdate';
import { newMatch } from '../match/displayMatchArchive';
import { updateDetails } from '../match/updateDetails';
import { eventManager } from './eventManager';
import { strokeAction } from './strokeAction';
import { updatePlayer } from '../player/updatePlayer';
import { classAction } from './classAction';
import { exportMatch } from '../match/exportMatch';
import { toggleChart } from '../display/toggleChart';
import { updateStats } from '../match/updateStats';
import { updatePoint } from '../match/editPoint';
import { editPlayer } from '../player/editPlayer';
import { closeModal } from '../modals/modals';
import {
  outcomeEntry,
  matchArchive,
  settings,
  mainMenu,
  swapAction,
  undoAction,
  redoAction,
  changeServer,
  viewStats,
  viewPointHistory,
  viewMomentum,
  viewGameTree,
  viewMatchFormat,
  viewGameFish,
  viewEditPoint,
} from './clickActions';

export function registerEvents() {
  eventManager
    .register('toggleChart', 'tap', toggleChart)
    .register('closeModal', 'tap', closeModal)
    .register('newMatch', 'tap', newMatch)
    .register('exportMatch', 'tap', exportMatch)
    .register('settings', 'tap', settings)
    .register('outcomeEntry', 'tap', outcomeEntry)
    .register('matchArchive', 'tap', matchArchive)
    .register('mainMenu', 'tap', mainMenu)
    .register('updateStats', 'tap', updateStats)
    .register('strokeAction', 'tap', strokeAction)
    .register('swapAction', 'tap', swapAction)
    .register('undoAction', 'tap', undoAction)
    .register('redoAction', 'tap', redoAction)
    .register('changeServer', 'tap', changeServer)
    .register('updatePoint', 'tap', updatePoint)
    .register('editPlayer', 'tap', editPlayer)
    .register('updatePlayer', 'tap', updatePlayer)
    .register('updateTournamentDetails', 'tap', updateTournamentDetails)
    .register('updateMatchDetails', 'tap', updateMatchDetails)
    .register('updateDetails', 'tap', updateDetails)
    .register('viewGameFish', 'tap', viewGameFish)
    .register('viewStats', 'tap', viewStats)
    .register('viewGameTree', 'tap', viewGameTree)
    .register('viewMomentum', 'tap', viewMomentum)
    .register('viewEditPoint', 'tap', viewEditPoint)
    .register('viewMatchFormat', 'tap', viewMatchFormat)
    .register('viewPointHistory', 'tap', viewPointHistory)
    .register('editMatchDetails', 'tap', editMatchDetails)
    .register('classAction', 'tap', classAction);
}
