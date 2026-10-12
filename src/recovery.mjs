// A deliberate restart choice in the pause menu. No backend or new flight mode.
import {nextDrone} from './encounter.mjs';
import {registerResult} from './arcadeflow.mjs';
export function redeployWithPenalty(encounter,scorecard) {
  if(!encounter.vehicles.some(vehicle=>!vehicle.destroyed))
    return {ok:false,reason:'complete'};
  registerResult(scorecard,false);
  nextDrone(encounter);
  return {ok:true,drones:encounter.drones,hits:encounter.hits,points:scorecard.points};
}
