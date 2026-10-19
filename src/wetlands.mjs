// Connected fictional stream ribbon, deliberately far off the main asphalt.
// No maps, hydrology or real-world geography, just an exploratory landmark.
import {roadCenter} from './flight3d.mjs';
export const STREAM_START=508;
export const STREAM_END=970;
export function inMistyWetland(z){return z>=STREAM_START&&z<=STREAM_END;}
export function channelPoint(z){
  return {z,x:roadCenter(z)+123+14*Math.sin(z*.016)+6*Math.sin(z*.039)};
}
export function channelWidth(z){
  return 4.8+1.9*(.5+.5*Math.sin(z*.011+1.8));
}
export function channelClearance(x,z){
  if(!inMistyWetland(z))return false;
  return Math.abs(x-channelPoint(z).x)<11;
}
export function tileHasWetland(cz,tile){
  const begin=cz*tile,end=begin+tile;
  return end>=STREAM_START&&begin<=STREAM_END;
}
