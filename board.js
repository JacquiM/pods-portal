// Tabs, the Memories photo wall and the Message Board.
(function () {
  var POD = window.POD || {};
  var DB = POD.db || '';
  var guestName = POD.guest && POD.guest.name ? POD.guest.name : '';
  var JPEG = 'data:image/jpeg;base64,';

  function get(path) {
    return fetch(DB + path + '.json').then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  }
  function put(path, body) {
    return fetch(DB + path + '.json', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
    });
  }
  function newId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  }
  function newestFirst(obj) {
    return Object.keys(obj || {}).map(function (id) {
      var v = obj[id] || {};
      v.id = id;
      return v;
    }).sort(function (a, b) { return String(b.at || '').localeCompare(String(a.at || '')); });
  }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  // ---- Tabs ----
  var panels = [].slice.call(document.querySelectorAll('.panel'));
  var links = [].slice.call(document.querySelectorAll('#tabs a'));
  var opened = {};
  var onOpen = {};
  function showTab(scroll) {
    var id = (location.hash || '').slice(1);
    if (!panels.some(function (p) { return p.id === id; })) id = 'invite';
    panels.forEach(function (p) { p.classList.toggle('active', p.id === id); });
    links.forEach(function (a) {
      if (a.getAttribute('href') === '#' + id) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    if (scroll) window.scrollTo(0, 0);
    if (onOpen[id] && !opened[id]) { opened[id] = true; onOpen[id](); }
  }
  document.body.classList.add('tabbed');
  window.addEventListener('hashchange', function () { showTab(true); });

  // ---- Memories ----
  var photoList = document.getElementById('photos');
  var photosEmpty = document.getElementById('photos-empty');
  var memoryForm = document.getElementById('memory-form');
  var memoryStatus = document.getElementById('memory-status');
  var memorySend = document.getElementById('memory-send');
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightbox-img');
  var lightboxCap = document.getElementById('lightbox-cap');
  memoryForm.elements.by.value = guestName;

  function credit(m) {
    return (m.caption ? m.caption + ' · ' : '') + 'from ' + (m.by || 'a guest');
  }
  function renderPhotos(items) {
    photoList.textContent = '';
    items.forEach(function (m) {
      if (typeof m.thumb !== 'string' || m.thumb.indexOf(JPEG) !== 0) return;
      var li = el('li');
      var b = el('button', 'photo');
      b.type = 'button';
      var img = el('img');
      img.src = m.thumb;
      img.alt = m.caption || 'Photo from ' + (m.by || 'a guest');
      img.loading = 'lazy';
      b.appendChild(img);
      b.appendChild(el('span', 'cap', credit(m)));
      b.addEventListener('click', function () { openPhoto(m); });
      li.appendChild(b);
      photoList.appendChild(li);
    });
    photosEmpty.hidden = photoList.children.length > 0;
    photosEmpty.textContent = 'No photos yet. Be the first to add one.';
  }
  function loadPhotos() {
    if (!DB) return;
    get('/memoryThumbs').then(function (data) { renderPhotos(newestFirst(data)); }).catch(function () {
      photosEmpty.hidden = false;
      photosEmpty.textContent = 'The photos could not be loaded. Check your connection and refresh.';
    });
  }
  function openPhoto(m) {
    lightboxImg.src = m.thumb;   // show the small one straight away, then swap in the full photo
    lightboxImg.alt = m.caption || 'Photo from ' + (m.by || 'a guest');
    lightboxCap.textContent = credit(m);
    if (lightbox.showModal) lightbox.showModal(); else lightbox.setAttribute('open', '');
    get('/memoryFull/' + encodeURIComponent(m.id)).then(function (full) {
      if (full && typeof full.img === 'string' && full.img.indexOf(JPEG) === 0 && lightboxCap.textContent === credit(m)) lightboxImg.src = full.img;
    }).catch(function () {});
  }
  function closePhoto() {
    if (lightbox.close) lightbox.close(); else lightbox.removeAttribute('open');
  }
  document.getElementById('lightbox-close').addEventListener('click', closePhoto);
  lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closePhoto(); });

  function readImage(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('unreadable')); };
      img.src = url;
    });
  }
  function shrink(img, max, quality) {
    var ratio = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    var c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(img.naturalWidth * ratio));
    c.height = Math.max(1, Math.round(img.naturalHeight * ratio));
    var ctx = c.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', quality);
  }
  // Photos are shrunk in the browser before upload so they stay small in the database.
  function prepare(file) {
    return readImage(file).then(function (img) {
      var sizes = [[1280, 0.78], [1024, 0.7], [800, 0.65], [640, 0.6]];
      var full = '';
      for (var i = 0; i < sizes.length; i++) {
        full = shrink(img, sizes[i][0], sizes[i][1]);
        if (full.length <= 680000) break;
      }
      return { full: full, thumb: shrink(img, 360, 0.7) };
    });
  }

  memoryForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (memorySend.disabled) return;
    if (!DB) { memoryStatus.textContent = 'Photo sharing is not switched on yet.'; return; }
    var by = memoryForm.elements.by.value.trim().slice(0, 60);
    var caption = memoryForm.elements.caption.value.trim().slice(0, 120);
    var files = [].slice.call(memoryForm.elements.files.files).filter(function (f) { return /^image\//.test(f.type); }).slice(0, 8);
    if (!by || !files.length) { memoryStatus.textContent = 'Choose at least one photo.'; return; }
    memorySend.disabled = true;
    var added = 0, failed = 0;
    var chain = Promise.resolve();
    files.forEach(function (file, i) {
      chain = chain.then(function () {
        memoryStatus.textContent = 'Adding photo ' + (i + 1) + ' of ' + files.length + '…';
        var id = newId();
        return prepare(file).then(function (p) {
          return put('/memoryFull/' + id, { img: p.full }).then(function () {
            var doc = { by: by, thumb: p.thumb, at: new Date().toISOString() };
            if (caption) doc.caption = caption;
            return put('/memoryThumbs/' + id, doc);
          });
        }).then(function () { added++; }, function () { failed++; });
      });
    });
    chain.then(function () {
      memorySend.disabled = false;
      if (added) {
        memoryForm.elements.files.value = '';
        memoryForm.elements.caption.value = '';
        loadPhotos();
      }
      memoryStatus.textContent = !failed
        ? (added === 1 ? 'Your photo is on the wall. Thank you!' : 'Your ' + added + ' photos are on the wall. Thank you!')
        : added
          ? added + ' added, ' + failed + ' could not be added. Try those again.'
          : 'The photos could not be added. Check your connection and try again.';
    });
  });
  onOpen.memories = loadPhotos;

  // ---- Message Board ----
  var STICKERS = ['heart', 'star', 'rainbow', 'cloud', 'moon'];
  var noteList = document.getElementById('notes');
  var notesEmpty = document.getElementById('notes-empty');
  var messageForm = document.getElementById('message-form');
  var messageStatus = document.getElementById('message-status');
  var messageSend = document.getElementById('message-send');
  var preview = document.getElementById('note-preview');
  messageForm.elements.by.value = guestName;

  function noteCard(tag, m) {
    var colour = Math.min(5, Math.max(0, parseInt(m.colour, 10) || 0));
    var sticker = STICKERS.indexOf(m.sticker) > -1 ? m.sticker : 'heart';
    var card = el(tag, 'sticky c' + colour + (m.hand === false ? '' : ' hand'));
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'sticker s-' + sticker);
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    var use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', '#' + sticker);
    svg.appendChild(use);
    card.appendChild(svg);
    card.appendChild(el('p', 'note-text', m.text));
    card.appendChild(el('p', 'note-by', 'With love, ' + m.by));
    return card;
  }
  function draft() {
    return {
      by: messageForm.elements.by.value.trim().slice(0, 60),
      text: messageForm.elements.text.value.trim().slice(0, 280),
      colour: parseInt(messageForm.elements.colour.value, 10) || 0,
      sticker: messageForm.elements.sticker.value,
      hand: messageForm.elements.hand.value === '1'
    };
  }
  function drawPreview() {
    var d = draft();
    preview.textContent = '';
    preview.appendChild(noteCard('div', {
      by: d.by || 'your name', text: d.text || 'Your message will appear here.',
      colour: d.colour, sticker: d.sticker, hand: d.hand
    }));
  }
  messageForm.addEventListener('input', drawPreview);
  messageForm.addEventListener('change', drawPreview);
  drawPreview();

  function loadNotes() {
    if (!DB) return;
    get('/messages').then(function (data) {
      var items = newestFirst(data).filter(function (m) { return typeof m.text === 'string' && typeof m.by === 'string'; });
      noteList.textContent = '';
      items.forEach(function (m) { noteList.appendChild(noteCard('li', m)); });
      notesEmpty.hidden = items.length > 0;
      notesEmpty.textContent = 'No messages yet. Be the first to leave one.';
    }).catch(function () {
      notesEmpty.hidden = false;
      notesEmpty.textContent = 'The messages could not be loaded. Check your connection and refresh.';
    });
  }
  messageForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (messageSend.disabled) return;
    if (!DB) { messageStatus.textContent = 'The message board is not switched on yet.'; return; }
    var d = draft();
    if (!d.by || !d.text) return;
    d.at = new Date().toISOString();
    messageSend.disabled = true;
    messageStatus.textContent = 'Pinning…';
    put('/messages/' + newId(), d).then(function () {
      messageForm.elements.text.value = '';
      drawPreview();
      messageStatus.textContent = 'Your message is on the board. Thank you!';
      loadNotes();
    }).catch(function () {
      messageStatus.textContent = 'That did not save. Check your connection and try again.';
    }).then(function () { messageSend.disabled = false; });
  });
  onOpen.messages = loadNotes;

  showTab(false);
})();
