import { updateTournamentDetails } from '../match/updateTournamentDetails';
import { updateMatchDetails } from '../match/updateMatchDetails';
import { editMatchDetails } from '../display/displayUpdate';
import { newMatch } from './displayMatchArchive';
import { updateDetails } from '../match/updateDetails';
import { eventManager } from '../events/eventManager';
import { closeGameFish } from '../display/configureViz';
import { strokeAction } from './strokeAction';
import { updatePlayer } from '../player/updatePlayer';
import { changeFormat } from '../match/changeFormat';
import { classAction } from './classAction';
import { exportMatch } from '../match/exportMatch';
import { toggleChart } from '../display/toggleChart';
import { updateStats } from '../match/updateStats';
import { updatePoint } from '../match/editPoint';
import { editPlayer } from '../player/editPlayer';
import { modalHelp } from '../modals/modalHelp';
import { modalInfo } from '../modals/modalInfo';
import { updateAppState } from '../state/env';
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
    .register('modalInfo', 'tap', modalInfo)
    .register('toggleChart', 'tap', toggleChart)
    .register('changeFormat', 'tap', changeFormat)
    .register('closeModal', 'tap', closeModal)
    .register('newMatch', 'tap', newMatch)
    .register('exportMatch', 'tap', exportMatch)
    .register('settings', 'tap', settings)
    .register('outcomeEntry', 'tap', outcomeEntry)
    .register('matchArchive', 'tap', matchArchive)
    .register('mainMenu', 'tap', mainMenu)
    .register('modalHelp', 'tap', modalHelp)
    .register('updateAppState', 'change', updateAppState)
    .register('updateStats', 'tap', updateStats)
    .register('closeGameFish', 'tap', closeGameFish)
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
