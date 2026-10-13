(function () {
  // The celebration: 28 November 2026 at 11:00. Months count from 0, so 10 is November.
  var PARTY = new Date(2026, 10, 28, 11, 0);

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  // Personalised invite: ?g=code looks the guest up in guests.js
  var guest = null;
  try {
    var code = (new URLSearchParams(location.search).get('g') || '').trim().toLowerCase();
    if (code && window.GUESTS && Object.prototype.hasOwnProperty.call(window.GUESTS, code)) guest = window.GUESTS[code];
  } catch (e) {}
  if (guest) {
    if (guest.name) {
      var dear = document.getElementById('dear');
      dear.textContent = 'Dear ' + guest.name;
      dear.hidden = false;
    }
    if (guest.ages) {
      ['cater', 'cater-registry'].forEach(function (id) {
        var el = document.getElementById(id);
        el.textContent = 'Please cater for ages ' + guest.ages;
        el.hidden = false;
      });
    }
  }

  // Gift registry. Ticks are shared through the Firebase database set in config.js.
  var DB = ((window.SITE_CONFIG && window.SITE_CONFIG.databaseUrl) || '').trim().replace(/\/+$/, '');
  var gifts = window.GIFTS || [];
  var list = document.getElementById('gifts');
  var claims = {};      // gift id -> { by, at }
  var loaded = !DB;     // without a database there is nothing to wait for
  var openId = null;    // the gift whose "your name" form is open
  var busy = false;
  var notes = {};       // gift id -> message under that card

  function mine() {
    try { return JSON.parse(localStorage.getItem('myGifts') || '[]'); } catch (e) { return []; }
  }
  function setMine(ids) {
    try { localStorage.setItem('myGifts', JSON.stringify(ids)); } catch (e) {}
  }
  function api(path, options) {
    return fetch(DB + '/claims' + path + '.json', options).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  }

  function actionsHtml(g) {
    var id = esc(g.id);
    var shop = '<a class="btn ghost" href="' + esc(g.url) + '" target="_blank" rel="noopener">View at ' + esc(g.shop) + '</a>';
    var note = notes[g.id] ? '<p class="card-note" role="status">' + esc(notes[g.id]) + '</p>' : '';
    if (claims[g.id]) {
      var undo = mine().indexOf(g.id) > -1
        ? '<button type="button" class="linkbtn" data-undo="' + id + '"' + (busy ? ' disabled' : '') + '>Changed your mind? Undo</button>'
        : '';
      return '<span class="pill">' + (undo ? 'You are getting this' : 'Someone is getting this') + '</span>' + undo + note;
    }
    if (!DB || !loaded) return '<span class="pill">Still needed</span>' + shop + note;
    if (openId === g.id) {
      return '<form class="claim" data-claim="' + id + '">' +
        '<label for="name-' + id + '">Your name, so we know who to thank</label>' +
        '<input id="name-' + id + '" name="by" type="text" maxlength="60" required autocomplete="name" value="' + esc(guest && guest.name ? guest.name : '') + '">' +
        '<div class="claim-row">' +
          '<button type="submit" class="btn"' + (busy ? ' disabled' : '') + '>' + (busy ? 'Saving…' : 'Confirm') + '</button>' +
          '<button type="button" class="linkbtn" data-cancel="1"' + (busy ? ' disabled' : '') + '>Cancel</button>' +
        '</div></form>' + note;
    }
    return '<span class="pill">Still needed</span>' + shop +
      '<button type="button" class="btn tick" data-open="' + id + '">I am getting this</button>' + note;
  }
  function render() {
    // a ticked gift disappears for everyone except the guest who ticked it, who keeps it so they can undo
    var my = mine();
    var shown = gifts.filter(function (g) { return !claims[g.id] || my.indexOf(g.id) > -1 || notes[g.id]; });
    var empty = document.getElementById('gifts-empty');
    empty.hidden = shown.length > 0 || gifts.length === 0;
    list.innerHTML = shown.map(function (g) {
      return '<li class="gift' + (claims[g.id] ? ' bought' : '') + '">' +
        '<div class="pic"><img src="' + esc(g.img) + '" alt="' + esc(g.name) + '" loading="lazy"></div>' +
        '<h3>' + esc(g.name) + '</h3>' +
        '<p>' + esc(g.blurb) + '</p>' +
        '<span class="price">' + esc(g.price) + '</span>' +
        '<div class="actions">' + actionsHtml(g) + '</div></li>';
    }).join('');
  }

  function refresh() {
    if (!DB || busy) return;
    api('').then(function (data) {
      claims = data || {};
      loaded = true;
      if (openId && claims[openId]) {
        notes[openId] = 'Someone has just ticked this one.';
        openId = null;
      }
      if (!openId) render();   // never redraw under someone typing their name
    }).catch(function () {
      if (!loaded) { loaded = true; DB = ''; render(); }
    });
  }

  list.addEventListener('click', function (e) {
    var t = e.target.closest('button');
    if (!t || busy) return;
    if (t.hasAttribute('data-open')) {
      openId = t.getAttribute('data-open');
      notes = {};
      render();
      var input = document.getElementById('name-' + openId);
      if (input) input.focus();
    } else if (t.hasAttribute('data-cancel')) {
      openId = null;
      render();
    } else if (t.hasAttribute('data-undo')) {
      var id = t.getAttribute('data-undo');
      busy = true; notes = {}; render();
      api('/' + encodeURIComponent(id), { method: 'DELETE' }).then(function () {
        delete claims[id];
        setMine(mine().filter(function (x) { return x !== id; }));
      }).catch(function () {
        notes[id] = 'That did not save. Check your connection and try again.';
      }).then(function () { busy = false; render(); });
    }
  });

  list.addEventListener('submit', function (e) {
    var form = e.target.closest('form.claim');
    if (!form) return;
    e.preventDefault();
    if (busy) return;
    var id = form.getAttribute('data-claim');
    var by = form.elements.by.value.trim().slice(0, 60);
    if (!by) return;
    busy = true; notes = {};
    form.querySelector('button[type="submit"]').disabled = true;
    // look again first, in case another guest ticked it a moment ago
    api('/' + encodeURIComponent(id)).then(function (existing) {
      if (existing) {
        claims[id] = existing;
        notes[id] = 'Someone has just ticked this one.';
        return;
      }
      var claim = { by: by, at: new Date().toISOString() };
      return api('/' + encodeURIComponent(id), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(claim)
      }).then(function () {
        claims[id] = claim;
        setMine(mine().concat(id));
        notes[id] = 'Thank you! It is now hidden from everyone else.';
      });
    }).then(function () {
      openId = null;
    }).catch(function () {
      notes[id] = 'That did not save. Check your connection and try again.';
    }).then(function () { busy = false; render(); });
  });

  render();
  refresh();
  if (DB) {
    setInterval(function () { if (!document.hidden) refresh(); }, 30000);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) refresh(); });
  }

  // RSVP. Replies go to the same Firebase database, under "rsvps". Guests cannot read each other's replies.
  var form = document.getElementById('rsvp-form');
  var doneBox = document.getElementById('rsvp-done');
  var statusEl = document.getElementById('rsvp-status');
  var sendBtn = document.getElementById('rsvp-send');
  var countField = document.getElementById('rsvp-count-field');

  function savedRsvp() {
    try { return JSON.parse(localStorage.getItem('myRsvp') || 'null'); } catch (e) { return null; }
  }
  function rsvpId() {
    if (code && guest) return 'g-' + code.replace(/[^a-z0-9-]/g, '');
    var saved = savedRsvp();
    if (saved && saved.id) return saved.id;
    return 'r-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  }
  function showCount() {
    var coming = form.elements.attending.value === 'yes';
    countField.hidden = !coming;
    document.getElementById('rsvp-kids-field').hidden = !coming;
    document.getElementById('rsvp-kidcount-field').hidden = !coming || form.elements.haskids.value !== 'yes';
  }
  function people(n, one, many) { return n + ' ' + (n === 1 ? one : many); }
  function showDone(r) {
    document.getElementById('rsvp-thanks').textContent = 'Thank you, ' + r.name;
    document.getElementById('rsvp-summary').textContent = r.attending
      ? 'We have you down as coming: ' + people(r.count, 'adult', 'adults') + (r.kids ? ' and ' + people(r.kids, 'child', 'children') : '') + '. We cannot wait to celebrate with you.'
      : 'We have you down as not able to make it. You will be missed.';
    form.hidden = true;
    doneBox.hidden = false;
  }

  var prior = savedRsvp();
  form.elements.name.value = prior && prior.name ? prior.name : (guest && guest.name ? guest.name : '');
  if (prior) {
    form.elements.attending.value = prior.attending ? 'yes' : 'no';
    form.elements.count.value = prior.count || 1;
    form.elements.haskids.value = prior.kids ? 'yes' : 'no';
    form.elements.kids.value = prior.kids || 1;
    form.elements.note.value = prior.note || '';
    showDone(prior);
  }
  showCount();
  form.addEventListener('change', showCount);
  document.getElementById('rsvp-change').addEventListener('click', function () {
    doneBox.hidden = true;
    form.hidden = false;
    statusEl.textContent = '';
    form.elements.name.focus();
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (sendBtn.disabled) return;
    if (!DB) {
      statusEl.textContent = 'RSVPs are not switched on yet. Please try again soon.';
      return;
    }
    var attending = form.elements.attending.value === 'yes';
    var count = attending ? Math.min(10, Math.max(1, parseInt(form.elements.count.value, 10) || 1)) : 0;
    var reply = {
      name: form.elements.name.value.trim().slice(0, 60),
      attending: attending,
      count: count,
      kids: attending && form.elements.haskids.value === 'yes' ? Math.min(10, Math.max(1, parseInt(form.elements.kids.value, 10) || 1)) : 0,
      note: form.elements.note.value.trim().slice(0, 300),
      at: new Date().toISOString()
    };
    if (!reply.name) return;
    var id = rsvpId();
    sendBtn.disabled = true;
    statusEl.textContent = 'Sending…';
    fetch(DB + '/rsvps/' + encodeURIComponent(id) + '.json', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reply)
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      reply.id = id;
      try { localStorage.setItem('myRsvp', JSON.stringify(reply)); } catch (e2) {}
      statusEl.textContent = '';
      showDone(reply);
    }).catch(function () {
      statusEl.textContent = 'That did not send. Check your connection and try again.';
    }).then(function () { sendBtn.disabled = false; });
  });

  // Countdown
  var box = document.getElementById('countdown');
  var done = document.getElementById('countdown-done');
  var els = {
    days: document.getElementById('cd-days'),
    hours: document.getElementById('cd-hours'),
    mins: document.getElementById('cd-mins'),
    secs: document.getElementById('cd-secs')
  };
  function pad(n) { return n < 10 ? '0' + n : String(n); }
  var timer;
  function tick() {
    var now = new Date();
    var left = PARTY - now;
    if (left <= 0) {
      box.hidden = true;
      var sameDay = now.getFullYear() === PARTY.getFullYear() && now.getMonth() === PARTY.getMonth() && now.getDate() === PARTY.getDate();
      done.hidden = !sameDay;
      clearInterval(timer);
      return;
    }
    var s = Math.floor(left / 1000);
    els.days.textContent = Math.floor(s / 86400);
    els.hours.textContent = pad(Math.floor(s % 86400 / 3600));
    els.mins.textContent = pad(Math.floor(s % 3600 / 60));
    els.secs.textContent = pad(s % 60);
  }
  timer = setInterval(tick, 1000);
  tick();
})();
