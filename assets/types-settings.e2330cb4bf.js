
// ══════════════════════════════════════════════════════════════
// FACILITY TYPES — one app and one Firebase project for SC, UPHC, PHC and CHC.
// NF_APP = app-wide settings (Firebase project, App Check, sign-in domain, home / Verify pages).
// NF_LEVELS = what differs per facility type (wording, roles, in-charge, verifiers, pass marks, which card system).
// NF_CFG = the type in use: Sub-Centre until a facility is opened; nfSetLevel(type) switches it when a staff
// member opens a facility (sc_facilities/{code}/type; none = Sub-Centre). The card system is a "core" that
// registers itself with nfRegisterCore(); NF_CFG.core names the one this type uses. Database paths keep their
// sc_ names for every type (sc_facilities holds UPHCs too).
// ══════════════════════════════════════════════════════════════
var NF_APP={
  firebase:{
    apiKey:"AIzaSyD_GvvKgGM4CZRE2fRKhhrg8kEIEP2kGjQ",
    authDomain:"healsol-nqas.firebaseapp.com",
    databaseURL:"https://healsol-nqas-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId:"healsol-nqas",
    storageBucket:"healsol-nqas.firebasestorage.app",
    messagingSenderId:"282745702969",
    appId:"1:282745702969:web:fa279bfdc881d155229be8"
  },
  appCheckKey:'6Lf7xd8tAAAAACG20kXsbRb0-2dgg9eWvuEhJTjn',   // Fraud Defense (reCAPTCHA Enterprise) site key, registered in Firebase App Check
  emailDomain:'accounts.nqasfast.app',
  // where "open the app" links point: the one-app address when running there (repository nqas-fast), otherwise the
  // SC page on thehealsol.com (repository nqas-app, live SC pilot)
  appHome:(function(){ try{ if(location.hostname==='app.thehealsol.com') return 'https://app.thehealsol.com/'; }catch(e){} return 'https://www.thehealsol.com/nqas-fast-sc'; })(),
  verifyBase:'https://www.thehealsol.com/nqas-fast-sc-certificate'
};
var NF_LEVELS={
  sc:{
    id:'sc', core:'sc', ready:true,
    name:'Sub-Centre', plural:'Sub-Centres', short:'SC', nameHi:'उप-केंद्र',
    tagline:'Get your Sub-Centre NQAS-ready in 60 days',
    inCharge:'CHO', inChargeLabel:'CHO',
    verifierRoles:['CHO','MO'],
    roles:[
      {id:'General',label:'All Staff (General)',       icon:'👥', canVerify:false, requireName:false},
      {id:'CHO',    label:'Community Health Officer', icon:'🏥', canVerify:true,  requireName:false},
      {id:'ANM',    label:'ANM',                      icon:'💉', canVerify:false, requireName:true},
      {id:'ASHA',   label:'ASHA',                     icon:'🌸', canVerify:false, requireName:true},
      {id:'MPW',    label:'MPW',                      icon:'🌿', canVerify:false, requireName:false},
      {id:'MO',     label:'Medical Officer',          icon:'🩺', canVerify:true,  requireName:false}
    ],
    passMark:{overall:70, aoc:70}
  },
  uphc:{
    id:'uphc', core:'uphc', ready:false,     // ready: open for self-registration (when the UPHC core is built)
    name:'UPHC', plural:'UPHCs', short:'UPHC', nameHi:'शहरी प्राथमिक स्वास्थ्य केंद्र',
    tagline:'Get your UPHC NQAS-ready in 60 days',
    inCharge:'Coordinator', inChargeLabel:'UPHC Coordinator',
    clinicalInCharge:'MOIC',
    verifierRoles:[],          // verification is by department leads (UPHC core)
    roles:[
      {id:'Coordinator',  label:'UPHC Coordinator',      icon:'🗂️', requireName:false},
      {id:'MOIC',         label:'Medical Officer In-charge', icon:'🩺', requireName:false},
      {id:'MO',           label:'Medical Officer',       icon:'🩺', requireName:true},
      {id:'StaffNurse',   label:'Staff Nurse',           icon:'🏥', requireName:true},
      {id:'ANM',          label:'ANM',                   icon:'💉', requireName:true},
      {id:'LHV',          label:'LHV',                   icon:'👩‍⚕️', requireName:true},
      {id:'Pharmacist',   label:'Pharmacist',            icon:'💊', requireName:true},
      {id:'LabTech',      label:'Lab Technician',        icon:'🔬', requireName:true},
      {id:'OutreachSup',  label:'Outreach Supervisor',   icon:'🌿', requireName:true},
      {id:'SupportStaff', label:'Support Staff',         icon:'🧹', requireName:true},
      {id:'USHA',         label:'USHA',                  icon:'🌸', requireName:true}
    ],
    passMark:{overall:70, aoc:70, dept:70}
  }
};
var NF_LEVEL_DEFAULT='sc';
function nfTypeOf(fac){ var t=fac&&fac.type; return (typeof t==='string'&&Object.prototype.hasOwnProperty.call(NF_LEVELS,t))?t:NF_LEVEL_DEFAULT; }
// before sign-in, ?type=uphc shows that type's wording (and registers that type, once it is ready)
var NF_LEVEL_ID=(function(){ try{ var t=(new URLSearchParams(location.search).get('type')||'').toLowerCase(); if(Object.prototype.hasOwnProperty.call(NF_LEVELS,t)) return t; }catch(e){} return NF_LEVEL_DEFAULT; })();
var NF_CFG=NF_LEVELS[NF_LEVEL_ID];
// switch the facility type in use; returns the settings. Role lists (SC_ROLES, SC_VERIFIER_ROLES) are refilled in place
// so every screen that already holds them sees the new type.
function nfSetLevel(t){
  var id=Object.prototype.hasOwnProperty.call(NF_LEVELS,t)?t:NF_LEVEL_DEFAULT;
  NF_LEVEL_ID=id; NF_CFG=NF_LEVELS[id];
  try{ if(typeof SC_ROLES!=='undefined'){ SC_ROLES.length=0; Array.prototype.push.apply(SC_ROLES,NF_CFG.roles); } }catch(e){}
  try{ if(typeof SC_VERIFIER_ROLES!=='undefined'){ SC_VERIFIER_ROLES.length=0; Array.prototype.push.apply(SC_VERIFIER_ROLES,NF_CFG.verifierRoles); } }catch(e){}
  try{ nfLvlApply(); }catch(e){}
  return NF_CFG;
}
// ── core registry: the card system plugs in here ──
var NF_CORES={};
function nfRegisterCore(id,impl){ NF_CORES[id]=impl; }
function nfCore(){ return NF_CORES[NF_CFG.core]||null; }
// wording helpers for shared screens
function nfLvl(k){ return NF_CFG[k]; }
// SC wording → this type's wording (no change for Sub-Centres)
function nfLvlText(s){
  if(typeof s!=='string'||NF_CFG.id==='sc') return s;
  var L=NF_CFG;
  return s.replace(/Sub-Centres/g,L.plural).replace(/Sub-Centre/g,L.name).replace(/sub-centres/g,L.plural).replace(/sub-centre/g,L.name)
    .replace(/उप-केंद्रों/g,L.nameHi).replace(/उप-केंद्र/g,L.nameHi)
    .replace(/\(CHO\)/g,'('+L.inChargeLabel+')').replace(/\bthe CHO\b/g,'the '+L.inChargeLabel);
}
// static page text marked data-nf-lvl (and placeholders marked data-nf-lvl-ph) follows the type; the SC text is kept
// on the element so switching back (sign out, another facility) restores it
function nfLvlApply(root){
  // text another screen wrote since our last change (e.g. a portal's own subheading) becomes the new original
  (root||document).querySelectorAll('[data-nf-lvl]').forEach(function(el){ if(el.__nfLvl==null||el.textContent!==el.__nfLvlSet) el.__nfLvl=el.textContent; el.textContent=el.__nfLvlSet=nfLvlText(el.__nfLvl); });
  (root||document).querySelectorAll('[data-nf-lvl-ph]').forEach(function(el){ if(el.__nfLvlPh==null||el.placeholder!==el.__nfLvlPhSet) el.__nfLvlPh=el.placeholder; el.placeholder=el.__nfLvlPhSet=nfLvlText(el.__nfLvlPh); });
}
// HealSol enrolment: one option per facility type (types not ready yet are marked "testing")
function nfFillTypeSelect(sel){
  if(!sel||sel.options.length) return;
  Object.keys(NF_LEVELS).forEach(function(k){ var L=NF_LEVELS[k], o=document.createElement('option'); o.value=k; o.textContent=L.name+(L.ready?'':' (testing — app not ready yet)'); sel.appendChild(o); });
}
document.addEventListener('DOMContentLoaded',function(){ try{ nfLvlApply(); }catch(e){} try{ nfFillTypeSelect(document.getElementById('sc-enroll-type')); }catch(e){} });
