// Pure arcade flow reward for skillful low-altitude forest flying.
// Not a sensor, simulator controller or real-world flight recommendation.
const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number.isFinite(v)?v:0));
export function makeSkimState(){
  return {seconds:0,meters:0,awards:0};
}
export function stepSkim(state,{height=0,speed=0,dx=0,dz=0,gesture=0}={},dt=0){
  const time=clamp(dt,0,.1);
  const valid=Number.isFinite(height)&&height>=8&&height<=32 &&
    Number.isFinite(speed)&&speed>=39 &&
    Number.isFinite(gesture)&&Math.abs(gesture)>=.23;
  if(!valid){
    state.seconds=0;state.meters=0;
    return null;
  }
  state.seconds+=time;
  state.meters+=Math.min(15,Math.hypot(dx||0,dz||0));
  if(state.seconds<.9||state.meters<85||state.awards>=5)return null;
  state.meters-=85;state.awards++;
  return {
    points:state.awards>=3?20:15,
    label:state.awards>=3?'FOREST FLOW':'TREELINE SKIM',
    count:state.awards
  };
}
