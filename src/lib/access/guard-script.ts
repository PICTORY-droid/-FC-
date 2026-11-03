/**
 * Inline <head> script that runs before the page paints — including pages the
 * service worker serves offline, which never reach the middleware.
 *
 *  - defines window.__fcqbWipe(): removes this app's local data (pqb:* storage),
 *    its caches (fcqb-*) and its service worker, so an expired install is empty
 *  - on protected pages, locks the app once the 30-day end time has passed:
 *    hides the page, wipes, then moves to /expired
 *
 * Kept dependency-free ES5 so it runs on every phone before any bundle loads.
 */
import { ACCESS_UNTIL_COOKIE } from "@/lib/auth/cookie-names";

export const STORAGE_PREFIX = "pqb:";
export const CACHE_PREFIX = "fcqb-";
export const PUBLIC_PATHS = ["login", "join", "expired", "admin"] as const;

export const ACCESS_GUARD_SCRIPT = `(function(){
var w=window;
w.__fcqbWipe=function(){
  try{[w.localStorage,w.sessionStorage].forEach(function(s){for(var i=s.length-1;i>=0;i--){var k=s.key(i);if(k&&k.indexOf(${JSON.stringify(STORAGE_PREFIX)})===0)s.removeItem(k);}});}catch(e){}
  var jobs=[];
  try{if(w.caches)jobs.push(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k.indexOf(${JSON.stringify(CACHE_PREFIX)})===0;}).map(function(k){return caches.delete(k);}));}));}catch(e){}
  try{if(navigator.serviceWorker)jobs.push(navigator.serviceWorker.getRegistrations().then(function(rs){return Promise.all(rs.map(function(r){return r.unregister();}));}));}catch(e){}
  return Promise.all(jobs).catch(function(){});
};
if(/^\\/(${PUBLIC_PATHS.join("|")})(\\/|$)/.test(location.pathname))return;
var locked=false;
function check(){
  if(locked)return;
  var m=document.cookie.match(/(?:^|;\\s*)${ACCESS_UNTIL_COOKIE}=(\\d+)/);
  if(m&&Date.now()<Number(m[1]))return;
  locked=true;
  document.documentElement.style.visibility="hidden";
  var go=function(){location.replace("/expired");};
  Promise.race([w.__fcqbWipe(),new Promise(function(r){setTimeout(r,1500);})]).then(go,go);
}
check();
document.addEventListener("visibilitychange",function(){if(!document.hidden)check();});
setInterval(check,60000);
})();`;

declare global {
  interface Window {
    __fcqbWipe?: () => Promise<unknown>;
  }
}
