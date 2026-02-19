import pointsImage from '../assets/icons/points.jpg';
import { showModal } from '../utils/utilities';

export function modalHelp(quick_start?: boolean) {
  const quick = `
         <div class="helpintro">Quick Start</div>
         <div class="flexhelp"> <div class='iconmenub action_icon_large'></div> <div class="quicktitle">Main Menu</div> </div>
         <div class="quickitem"> <span> Set <b>Match Details</b>, <b>Share</b>, or turn on <b>Broadcasting</b> </span></div>
         <div class="flexhelp"> <div class='iconsettingsb action_icon_large'></div> <div class="quicktitle">Settings</div> </div>
         <div class="quickitem"> <span> Turn on <b>Audible Clicks</b> and <b>Track Shot Types</b></span></div>
         <div class="flexhelp"> <div class='iconchangeb action_icon_large'></div> <div class="quicktitle">Change First Server</div> </div>
         <div class="quickitem"> <span>After Service press <b>Serve</b>, <b>Return</b>, or <b>Rally</b> to switch into Rally Mode </span></div>
         <div class="quickitem"> <span>To simply advance points, tap the <b>Points</b> display </span></div>
         <div class="flexhelp"> <img src='${pointsImage}'> </div>
      `;
  const save = `
         <div class="helpintro">Save To Home Screen</div>
         <div class="helpitem">HiveEye is a Progressive Web App</div>
         <div class="helpitem"><b>For Full Screen View:</b></div>
         <div class="helpitem">On iOS use Safari to Save</div>
         <div class="helpitem">On Android use Chrome</div>
      `;
  const helptext = `
         <div class="helpintro">How to</div>
         <div class="helpitem"><div><b>Add/Change Player Names</b>:</div> &nbsp; <div> Touch the name!</div></div>
         <div class="helpitem"><div><b>Edit a Point</b>:</div><div> &nbsp; Touch the point in History view</div></div>
         <div class="helpitem"><div><b>Delete Match</b>:</div><div> &nbsp; Swipe Left in Match Archive </div></div>
         <div class="helpitem"><div><b>Export Match</b>:</div><div> &nbsp; Swipe Right in Match Archive </div></div>
         <div class="helpitem"><div><b>Points-to-Set</b>:</div><div> &nbsp; Rotate Momentum Chart</div></div>
         <div class="helpitem"><div><b>GameTree</b>:</div><div> &nbsp; Tap Player to filter by server</div></div>
         <div class="flexhelp"> <div class='iconbroadcast icon icon_5'></div> <div class="quicktitle">Enable Broadcast</div> </div>
         <div class="flexhelp"> <div class='iconshare icon icon_3'></div> <div class="quicktitle">Share (Email, Copy/Paste)</div> </div>
      `;
  const modaltext = quick_start ? quick + save + helptext : helptext + save + quick;
  showModal(modaltext);
}
