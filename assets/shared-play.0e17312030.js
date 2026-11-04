// ══════════════════════════════════════════════════════════════
// GOOGLE PLAY APP (4 Nov 2026)
//   The Play Store app (package com.thehealsol.nqasfast) is this website inside a Trusted Web Activity, opened at
//   /?src=play (nfIsPlay() in promos.js). In it:
//   · no prices and no way to pay: the "Day 8 onwards" unlock cards (Sub-Centre and UPHC / PHC / CHC), bank transfer
//     and Razorpay are replaced by a plain note — access is arranged with HealSol / the district outside the app
//     (Google Play payments policy). "Website only" promotions are already hidden (promos.js).
//   · everyone (website too) can ask to delete their account from Me → "Delete my account"; the request reaches
//     HealSol as an enquiry (source 'delete', ref DEL-…) and the person is told what is deleted and what is kept.
//     The same request can be made without the app at delete-account.html (Google Play needs both).
// ══════════════════════════════════════════════════════════════
var NF_PLAY_PKG = 'com.thehealsol.nqasfast';
function plHi() { return typeof _appLang !== 'undefined' && _appLang === 'hi'; }
function plT(en, hi) { return plHi() && hi ? hi : en; }
function plE(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function plOn() { return typeof nfIsPlay === 'function' && nfIsPlay(); }

// ── the note shown instead of a price / pay button ──
function plAccessHTML() {
  return '<div class="upgrade-card pl-note"><div class="upgrade-hd"><div style="font-size:30px;margin-bottom:6px;">🔒</div>'
    + '<div style="font-size:16px;font-weight:800;">' + plE(plT('Day 8 onwards is part of the full programme', 'दिन 8 से आगे पूरा कार्यक्रम है')) + '</div></div>'
    + '<div class="upgrade-body"><p class="pl-p">' + plE(plT('Your facility\'s access to the full programme is arranged by HealSol Academy with your facility in-charge or district. Once it is active, the next days open here automatically.',
      'पूरे कार्यक्रम की सुविधा HealSol Academy आपके केंद्र प्रभारी या ज़िले के साथ तय करती है। सक्रिय होते ही अगले दिन यहाँ अपने-आप खुल जाएँगे।')) + '</p>'
    + '<p class="pl-p pl-sm">' + plE(plT('Your baseline work is saved.', 'आपका बेसलाइन काम सहेजा हुआ है।')) + '</p></div></div>';
}
function plNoPay() { if (typeof showToast === 'function') showToast(plT('Payments are not available in this app. Your access is arranged with HealSol Academy.', 'इस ऐप में भुगतान उपलब्ध नहीं है। आपकी सुविधा HealSol Academy के साथ तय होती है।'), 'info'); }

(function () {
  var hook = function () {
    if (!plOn()) return;
    try { document.documentElement.classList.add('nf-play'); } catch (e) {}
    // Sub-Centre: the upgrade card on Day 8+
    if (typeof renderUpgradeCard === 'function' && !renderUpgradeCard._pl) { renderUpgradeCard = function (container) { if (container) container.innerHTML = plAccessHTML(); }; renderUpgradeCard._pl = 1; }
    // UPHC / PHC / CHC: the unlock card
    if (typeof nduCardShell === 'function' && !nduCardShell._pl) { nduCardShell = function () { return '<div id="ndu-card">' + plAccessHTML() + '</div>'; }; nduCardShell._pl = 1; }
    if (typeof nduFill === 'function' && !nduFill._pl) { nduFill = async function () {}; nduFill._pl = 1; }
    if (typeof nduPay === 'function' && !nduPay._pl) { nduPay = async function () { plNoPay(); }; nduPay._pl = 1; }
    // bank transfer and Razorpay, wherever they are opened from
    if (typeof bpOpen === 'function' && !bpOpen._pl) { bpOpen = async function () { plNoPay(); }; bpOpen._pl = 1; }
    if (typeof phcStartCheckout === 'function' && !phcStartCheckout._pl) { phcStartCheckout = async function () { plNoPay(); }; phcStartCheckout._pl = 1; }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', hook); else setTimeout(hook, 0);
})();

// ── Delete my account (Me page, all staff; website and Play app) ──
function plWho() {
  var mob = (typeof _nfAuth !== 'undefined' && _nfAuth && _nfAuth.claims && _nfAuth.claims.mob) || '', name = '', fac = '';
  try { if (typeof choState !== 'undefined' && choState) { name = choState.staffName || ''; fac = (choState.facility && choState.facility.name) || choState.facilityCode || ''; } } catch (e) {}
  try { var dv = document.getElementById('nf-dept-app'); if (dv && dv.offsetParent !== null && typeof _nd !== 'undefined' && _nd && _nd.fac) { fac = _nd.fac.name || _nd.code || fac; var r = ((_nd.fac.staff || {})[mob]) || {}; name = r.name || name; } } catch (e) {}
  return { mob: mob, name: name, fac: fac };
}
function plDelHTML() {
  return '<div class="pl-del" id="pl-del"><button type="button" class="pl-del-b" onclick="plDelete()"><i class="ti ti-user-x"></i> ' + plE(plT('Delete my account', 'मेरा खाता हटाएँ')) + '</button>'
    + '<a class="pl-del-l" href="legal.html#privacy" target="_blank" rel="noopener">' + plE(plT('Privacy policy', 'गोपनीयता नीति')) + '</a></div>';
}
async function plDelete() {
  var W = plWho(); if (!W.mob) { if (typeof showToast === 'function') showToast(plT('Please sign in again first.', 'पहले फिर से लॉग इन करें।'), 'err'); return; }
  var v = await scDialog({ title: plT('Delete my account', 'मेरा खाता हटाएँ'), icon: '🗑', okLabel: plT('Send request', 'अनुरोध भेजें'), wide: true,
    message: plT('HealSol Academy will close your login and delete your personal details (name, mobile number, email) within 30 days, and confirm to you on this mobile number. '
      + 'The facility\'s programme records (checklists, scores, actions) stay with the facility, without your name, because they belong to the facility\'s NQAS work. Payment records are kept as the law requires.',
      'HealSol Academy 30 दिनों में आपका लॉग इन बंद करके आपकी निजी जानकारी (नाम, मोबाइल नंबर, ईमेल) हटा देगी और इसी मोबाइल नंबर पर पुष्टि करेगी। '
      + 'केंद्र के कार्यक्रम रिकॉर्ड (चेकलिस्ट, स्कोर, कार्य) आपके नाम के बिना केंद्र के पास रहेंगे, क्योंकि वे केंद्र के NQAS काम का हिस्सा हैं। भुगतान रिकॉर्ड क़ानून के अनुसार रखे जाते हैं।'),
    fields: [{ key: 'reason', label: plT('Reason (optional)', 'कारण (वैकल्पिक)'), type: 'textarea', value: '', maxLength: 300 },
      { key: 'ok', type: 'checklist', value: [], options: [{ value: 'y', label: plT('I understand and want my account deleted', 'मैं समझता/समझती हूँ और अपना खाता हटवाना चाहता/चाहती हूँ') }] }],
    validate: function (x) { return (x.ok || []).length ? null : plT('Tick the box to confirm.', 'पुष्टि के लिए बॉक्स पर टिक करें।'); } });
  if (!v || !(v.ok || []).length) return;
  try {
    var r = await nfCall('submitEnquiry', { source: 'delete', orgName: W.fac || 'NQAS | FAST user', contactName: W.name || W.mob, mobile: W.mob, message: String(v.reason || '').slice(0, 300) });
    await scDialog({ title: plT('Request sent', 'अनुरोध भेजा गया'), icon: '✅', okLabel: 'OK', message: plT('Reference ' + (r && r.ref || '') + '. HealSol Academy will confirm on ' + W.mob + ' within 30 days.', 'संदर्भ ' + (r && r.ref || '') + '। HealSol Academy 30 दिनों में ' + W.mob + ' पर पुष्टि करेगी।') });
  } catch (e) { if (typeof showToast === 'function') showToast((e && e.message) || plT('Could not send. Check the internet and try again.', 'भेजा नहीं जा सका। इंटरनेट जाँचकर फिर कोशिश करें।'), 'err'); }
}
(function () {
  var hook = function () {
    if (typeof nfRenderMe === 'function' && !nfRenderMe._pl) { var m = nfRenderMe; nfRenderMe = function () { var x = m.apply(this, arguments);
      try { var p = document.getElementById('nf-me'); if (p && !p.querySelector('.pl-del')) p.insertAdjacentHTML('beforeend', plDelHTML()); } catch (e) {} return x; }; nfRenderMe._pl = 1; }
    if (typeof ndRender === 'function' && !ndRender._pl) { var d = ndRender; ndRender = function () { var x = d.apply(this, arguments);
      try { if (_nd && _nd.tab === 'me' && !_nd.view && !_nd.card && !_nd.screen) { var top = document.querySelector('.nx'); if (top && !top.querySelector('.pl-del')) top.insertAdjacentHTML('beforeend', plDelHTML()); } } catch (e) {} return x; }; ndRender._pl = 1; }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', hook); else setTimeout(hook, 0);
})();
