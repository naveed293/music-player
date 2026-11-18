/* ═══════════════════════════════════════════════════════════
   Pulse · Music Player — vanilla JavaScript
   Features: play/pause, next/previous, seek, volume + mute,
   playlist with live durations, autoplay, shuffle, repeat,
   keyboard shortcuts, localStorage persistence, and opening
   your own audio files (MP3/WAV/OGG/FLAC/…) from the computer.
   Built-in catalogue includes Indian & Afghan recordings that
   are Public Domain or CC-licensed (see the Credits panel).
   ═══════════════════════════════════════════════════════════ */
'use strict';

/* ── Built-in catalogue ──────────────────────────────────────
   SoundHelix samples bundled locally + free cultural recordings
   from Wikimedia Commons (India / Afghanistan). Mirror URLs are
   kept as automatic fallbacks for the SoundHelix files only.   */
const BUILT_IN_TRACKS = [
  { title: 'Neon Skyline',    artist: 'Midnight Circuit', src: 'tracks/soundhelix-1.mp3', mirror: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', a: '#7c3aed', b: '#db2777', note: '♪' },
  { title: 'Golden Hour',     artist: 'Aria Vale',        src: 'tracks/soundhelix-2.mp3', mirror: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', a: '#f97316', b: '#eab308', note: '♫' },
  { title: 'Midnight Drive',  artist: 'Neon Coast',       src: 'tracks/soundhelix-3.mp3', mirror: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', a: '#0ea5e9', b: '#6366f1', note: '♬' },
  { title: 'Solar Wind',      artist: 'Echo Harbor',      src: 'tracks/soundhelix-4.mp3', mirror: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', a: '#10b981', b: '#14b8a6', note: '♩' },
  { title: 'Velvet Static',   artist: 'Luna Mar',         src: 'tracks/soundhelix-5.mp3', mirror: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', a: '#ec4899', b: '#8b5cf6', note: '♪' },
  { title: 'Analog Hearts',   artist: 'Cassette Club',    src: 'tracks/soundhelix-6.mp3', mirror: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', a: '#f43f5e', b: '#f97316', note: '♫' },
  { title: 'Coastal Drift',   artist: 'Harbor & Pine',    src: 'tracks/soundhelix-7.mp3', mirror: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', a: '#22d3ee', b: '#0ea5e9', note: '♬' },
  { title: 'Aurora Waves',    artist: 'Polaris',          src: 'tracks/soundhelix-8.mp3', mirror: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', a: '#a3e635', b: '#10b981', note: '♩' },
  /* ── 🇮🇳 India (CC / Public domain — Wikimedia Commons) ── */
  { title: 'Rag Des',                  artist: 'NCERT · India',                     src: 'tracks/india-rag-des-ncert.ogg',                a: '#f97316', b: '#16a34a', note: '♬' },
  { title: 'Rag Deshkar',              artist: 'NCERT · India',                     src: 'tracks/india-rag-deshkar-ncert.ogg',            a: '#eab308', b: '#f97316', note: '♪' },
  { title: 'Raag Jhinjhoti',           artist: 'Ustad Abdul Karim Khan · India',    src: 'tracks/india-abdul-karim-khan-jhinjhoti.ogg',   a: '#ef4444', b: '#f59e0b', note: '♫' },
  { title: 'Raga Adana',               artist: 'Traditional · India',               src: 'tracks/india-raga-adana.ogg',                   a: '#10b981', b: '#f97316', note: '♩' },
  /* ── 🇦🇫 Afghanistan (Public domain — Wikimedia Commons) ── */
  { title: 'Rababa',                   artist: 'Ustad Gada Mohammad · Afghanistan', src: 'tracks/afghan-rubaba.ogg',                      a: '#166534', b: '#b91c1c', note: '♪' },
  { title: 'Shirin Jan',               artist: 'Traditional Afghan · Afghanistan',  src: 'tracks/afghan-shirin-jan.flac',                 a: '#7c2d12', b: '#dc2626', note: '♫' },
  { title: 'Jonse Hosne',              artist: 'Traditional Afghan · Afghanistan',  src: 'tracks/afghan-jonse-hosne.flac',                a: '#14532d', b: '#84cc16', note: '♬' },
  { title: 'Poshideh Baz',             artist: 'Traditional Afghan · Afghanistan',  src: 'tracks/afghan-poshideh-baz.ogg',                a: '#1e3a8a', b: '#0f766e', note: '♩' },
];

const USER_PALETTE = [
  ['#8b5cf6', '#22d3ee'], ['#f97316', '#f43f5e'], ['#10b981', '#a3e635'],
  ['#6366f1', '#ec4899'], ['#14b8a6', '#eab308'], ['#f43f5e', '#8b5cf6'],
];

/* Tracks added via “Open songs” live here for this session only
   (object URLs cannot be persisted across reloads). */
const userTracks = [];
const getAllTracks = () => [...BUILT_IN_TRACKS, ...userTracks];

const STORAGE_KEY = 'pulse-player-state';
const DURATION_CACHE_KEY = 'pulse-durations';
const REPEAT_MODES = ['off', 'all', 'one'];

/* src → seconds. Built-in entries persist in localStorage; user files are session-only. */
const durationMap = new Map();

/* ── Element refs ── */
const audio          = document.getElementById('audioPlayer');
const playerCard     = document.querySelector('.player');
const liveDot        = document.getElementById('liveDot');
const statusText     = document.getElementById('statusText');
const vinyl          = document.getElementById('vinyl');
const artwork        = document.getElementById('artwork');
const artworkNote    = document.getElementById('artworkNote');
const trackBadge     = document.getElementById('trackBadge');
const songTitle      = document.getElementById('songTitle');
const songArtist     = document.getElementById('songArtist');
const currentTimeEl  = document.getElementById('currentTime');
const durationEl     = document.getElementById('duration');
const progressBar    = document.getElementById('progressBar');
const progressFill   = document.getElementById('progressFill');
const progressBuffer = document.getElementById('progressBuffered');
const playPauseBtn   = document.getElementById('playPauseBtn');
const prevBtn        = document.getElementById('prevBtn');
const nextBtn        = document.getElementById('nextBtn');
const shuffleBtn     = document.getElementById('shuffleBtn');
const repeatBtn      = document.getElementById('repeatBtn');
const muteBtn        = document.getElementById('muteBtn');
const volumeSlider   = document.getElementById('volumeSlider');
const volumeValue    = document.getElementById('volumeValue');
const autoplayToggle = document.getElementById('autoplayToggle');
const trackList      = document.getElementById('trackList');
const playlistCount  = document.getElementById('playlistCount');
const playlistTotal  = document.getElementById('playlistTotal');
const openFilesBtn   = document.getElementById('openFilesBtn');
const fileInput      = document.getElementById('fileInput');
const toast          = document.getElementById('toast');

/* ── State ── */
let currentIndex = 0;
let isPlaying = false;
let shuffle = false;
let repeatMode = 'off';
let volume = 0.8;
let lastVolume = 0.8;
let toastTimer = null;
let triedMirror = false;
let consecutiveErrors = 0;
const MAX_CONSECUTIVE_ERRORS = 4;

/* ───────────────────────────── helpers ───────────────────────────── */

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '0:00';
  const s = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(s / 60);
  const secs = String(s % 60).padStart(2, '0');
  return `${mins}:${secs}`;
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[ch]));
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3600);
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      volume, shuffle, repeatMode,
      autoplay: autoplayToggle.checked,
      lastIndex: Math.min(currentIndex, BUILT_IN_TRACKS.length - 1),
    }));
  } catch { /* storage unavailable — non-fatal */ }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const s = JSON.parse(raw);
    if (typeof s.volume === 'number') volume = Math.min(1, Math.max(0, s.volume));
    if (typeof s.shuffle === 'boolean') shuffle = s.shuffle;
    if (REPEAT_MODES.includes(s.repeatMode)) repeatMode = s.repeatMode;
    if (typeof s.autoplay === 'boolean') autoplayToggle.checked = s.autoplay;
    if (typeof s.lastIndex === 'number' && BUILT_IN_TRACKS[s.lastIndex]) currentIndex = s.lastIndex;
  } catch { /* corrupted state — fall back to defaults */ }
}

function loadDurationCache() {
  try {
    const cache = JSON.parse(localStorage.getItem(DURATION_CACHE_KEY)) || {};
    Object.entries(cache).forEach(([src, secs]) => {
      if (typeof secs === 'number' && Number.isFinite(secs)) durationMap.set(src, secs);
    });
  } catch { /* ignore */ }
}

function persistDurations() {
  const out = {};
  durationMap.forEach((secs, src) => {
    if (!src.startsWith('blob:')) out[src] = secs; // user object-URLs are not persistable
  });
  try { localStorage.setItem(DURATION_CACHE_KEY, JSON.stringify(out)); } catch { /* ignore */ }
}

function setStatus(text, playing) {
  statusText.textContent = text;
  liveDot.classList.toggle('playing', Boolean(playing));
  playerCard.classList.toggle('is-playing', Boolean(playing));
  vinyl.classList.toggle('spinning', Boolean(playing));
}

/* ─────────────────────────── playlist UI ─────────────────────────── */

function updateTotals() {
  let total = 0;
  getAllTracks().forEach((t) => {
    const d = durationMap.get(t.src);
    if (d) total += d;
  });
  playlistTotal.textContent = total > 0 ? formatTime(total) : '—';
}

function buildPlaylist() {
  trackList.innerHTML = '';
  const all = getAllTracks();
  playlistCount.textContent = all.length;
  trackBadge.textContent = all.length ? `TRACK ${Math.min(currentIndex, all.length - 1) + 1} / ${all.length}` : 'EMPTY';

  all.forEach((track, i) => {
    const li = document.createElement('li');
    li.className = 'track-row';
    li.innerHTML = `
      <button class="track-item" data-index="${i}" style="--art-a:${track.a};--art-b:${track.b}" aria-label="Play ${escapeHtml(track.title)} by ${escapeHtml(track.artist)}">
        <span class="track-index">${String(i + 1).padStart(2, '0')}</span>
        <span class="track-cover" aria-hidden="true">${track.note}</span>
        <span class="track-text">
          <span class="track-title">${escapeHtml(track.title)}</span>
          <span class="track-artist">${escapeHtml(track.artist)}</span>
        </span>
        <span class="track-right">
          <span class="eq" aria-hidden="true"><span></span><span></span><span></span><span></span></span>
          <span class="track-duration" data-duration-for="${i}">–:––</span>
        </span>
      </button>
      ${track.user ? `<button class="remove-btn" data-remove="${i}" title="Remove from playlist" aria-label="Remove ${escapeHtml(track.title)} from playlist">✕</button>` : ''}`;
    trackList.appendChild(li);
  });

  updatePlaylistActive();
  fillVisibleDurations();
  updateTotals();
  probeDurations();
}

/** Fill cells instantly for anything already in the duration map. */
function fillVisibleDurations() {
  trackList.querySelectorAll('[data-duration-for]').forEach((cell, i) => {
    const known = durationMap.get(getAllTracks()[i].src);
    if (known) cell.textContent = formatTime(known);
  });
}

/** Probe real durations in the background (metadata only) and fill them in. */
function probeDurations() {
  getAllTracks().forEach((track) => {
    if (durationMap.get(track.src)) return;
    const probe = new Audio();
    probe.preload = 'metadata';
    probe.src = track.src;
    probe.addEventListener('loadedmetadata', () => {
      if (!Number.isFinite(probe.duration)) return;
      durationMap.set(track.src, probe.duration);
      persistDurations();
      const idx = getAllTracks().findIndex((t) => t.src === track.src);
      const cell = idx > -1 ? trackList.querySelector(`[data-duration-for="${idx}"]`) : null;
      if (cell) cell.textContent = formatTime(probe.duration);
      updateTotals();
    }, { once: true });
    probe.addEventListener('error', () => {
      const idx = getAllTracks().findIndex((t) => t.src === track.src);
      const cell = idx > -1 ? trackList.querySelector(`[data-duration-for="${idx}"]`) : null;
      if (cell) cell.textContent = '–:––';
    }, { once: true });
  });
}

function updatePlaylistActive() {
  trackList.querySelectorAll('.track-item').forEach((item) => {
    const isActive = Number(item.dataset.index) === currentIndex;
    item.classList.toggle('active', isActive);
    item.classList.toggle('playing', isActive && isPlaying);
    item.setAttribute('aria-current', isActive ? 'true' : 'false');
  });
}

/* User tracks (opened from this computer) */
function addFilesFromComputer(files) {
  if (!files.length) return;
  let firstNewIndex = null;
  files.forEach((file) => {
    const title = file.name.replace(/\.[^.]+$/, '') || file.name;
    const palette = USER_PALETTE[userTracks.length % USER_PALETTE.length];
    userTracks.push({
      title,
      artist: 'Your computer',
      src: URL.createObjectURL(file),
      note: '🎵',
      a: palette[0],
      b: palette[1],
      user: true,
    });
    if (firstNewIndex === null) firstNewIndex = BUILT_IN_TRACKS.length + userTracks.length - 1;
  });
  buildPlaylist();
  loadTrack(firstNewIndex, true);
  showToast(`Added ${files.length} track${files.length > 1 ? 's' : ''} from your computer 🎧`);
}

function removeUserTrack(index) {
  const all = getAllTracks();
  const track = all[index];
  if (!track || !track.user) return;

  const userIdx = index - BUILT_IN_TRACKS.length;
  const wasCurrent = index === currentIndex;
  try { URL.revokeObjectURL(track.src); } catch { /* ignore */ }
  durationMap.delete(track.src);
  userTracks.splice(userIdx, 1);

  if (index < currentIndex) currentIndex -= 1;
  buildPlaylist();

  if (wasCurrent) {
    audio.pause();
    const remaining = getAllTracks();
    if (remaining.length) {
      loadTrack(Math.min(index, remaining.length - 1), false);
    } else {
      audio.removeAttribute('src');
      audio.load();
      songTitle.textContent = 'No tracks left';
      songArtist.textContent = 'Open some songs to keep listening';
      trackBadge.textContent = 'EMPTY';
      setStatus('Ready', false);
    }
  }
  updatePlaylistActive();
  showToast(`Removed “${track.title}”`);
}

/* ────────────────────────── playback core ────────────────────────── */

function loadTrack(index, autoplay) {
  const all = getAllTracks();
  if (!all.length) return;
  currentIndex = ((index % all.length) + all.length) % all.length;
  const track = all[currentIndex];

  triedMirror = false;
  audio.src = track.src;
  audio.load();

  songTitle.textContent = track.title;
  songArtist.textContent = track.artist;
  trackBadge.textContent = `TRACK ${currentIndex + 1} / ${all.length}`;
  artwork.style.setProperty('--art-a', track.a);
  artwork.style.setProperty('--art-b', track.b);
  artworkNote.textContent = track.note;
  artworkNote.setAttribute('aria-hidden', 'true');

  progressBar.style.setProperty('--fill', '0%');
  progressBar.setAttribute('aria-valuenow', '0');
  progressBar.setAttribute('aria-valuetext', '0:00 of 0:00');
  progressBuffer.style.width = '0%';
  currentTimeEl.textContent = '0:00';
  durationEl.textContent = '0:00';

  updatePlaylistActive();
  saveState();

  if (autoplay) {
    playTrack();
  } else {
    setStatus('Ready', false);
  }
}

function playTrack() {
  const playPromise = audio.play();
  if (playPromise && typeof playPromise.catch === 'function') {
    playPromise.catch((err) => {
      isPlaying = false;
      setStatus('Paused', false);
      updatePlaylistActive();
      if (err && err.name === 'NotAllowedError') {
        showToast('Tap play to start listening 🎧');
      } else {
        showToast('Could not play this track — check your connection.');
      }
    });
  }
}

function togglePlay() {
  if (audio.paused) {
    playTrack();
  } else {
    audio.pause();
  }
}

function nextTrack(userInitiated = true) {
  const all = getAllTracks();
  if (shuffle && all.length > 1) {
    let random;
    do { random = Math.floor(Math.random() * all.length); } while (random === currentIndex);
    loadTrack(random, true);
    return;
  }
  loadTrack(currentIndex + 1, true);
  if (userInitiated) saveState();
}

function prevTrack() {
  // If we're a few seconds in, restart the current track first (standard player UX).
  if (audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }
  loadTrack(currentIndex - 1, true);
}

function setVolume(value, { fromMute = false } = {}) {
  volume = Math.min(1, Math.max(0, value));
  audio.volume = volume;
  audio.muted = volume === 0;
  if (volume > 0 && !fromMute) lastVolume = volume;

  volumeSlider.value = Math.round(volume * 100);
  volumeSlider.style.setProperty('--vol', `${Math.round(volume * 100)}%`);
  volumeValue.textContent = Math.round(volume * 100);
  muteBtn.classList.toggle('muted', volume === 0);
  muteBtn.setAttribute('aria-pressed', String(volume === 0));
  muteBtn.setAttribute('aria-label', volume === 0 ? 'Unmute volume' : 'Mute volume');
  saveState();
}

function toggleMute() {
  if (volume > 0) {
    lastVolume = volume;
    setVolume(0, { fromMute: true });
  } else {
    setVolume(lastVolume > 0 ? lastVolume : 0.8);
  }
}

function cycleRepeat() {
  const next = REPEAT_MODES[(REPEAT_MODES.indexOf(repeatMode) + 1) % REPEAT_MODES.length];
  repeatMode = next;
  repeatBtn.classList.toggle('active', repeatMode !== 'off');
  repeatBtn.classList.toggle('repeat-one-mode', repeatMode === 'one');
  const label = repeatMode === 'off' ? 'Repeat: off' : repeatMode === 'all' ? 'Repeat: all' : 'Repeat: one';
  repeatBtn.title = label;
  repeatBtn.setAttribute('aria-label', label);
  repeatBtn.setAttribute('aria-pressed', String(repeatMode !== 'off'));
  saveState();
}

function toggleShuffle() {
  shuffle = !shuffle;
  shuffleBtn.classList.toggle('active', shuffle);
  shuffleBtn.setAttribute('aria-pressed', String(shuffle));
  shuffleBtn.setAttribute('aria-label', shuffle ? 'Shuffle on' : 'Shuffle off');
  saveState();
}

/* ─────────────────────────── progress bar ────────────────────────── */

function seekToClientX(clientX) {
  const duration = audio.duration;
  if (!Number.isFinite(duration) || duration <= 0) return;
  const rect = progressBar.getBoundingClientRect();
  const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  audio.currentTime = ratio * duration;
  paintProgress(ratio, audio.currentTime, duration);
}

function paintProgress(ratio, current, duration) {
  const pct = `${(ratio * 100).toFixed(2)}%`;
  progressBar.style.setProperty('--fill', pct);
  progressBar.setAttribute('aria-valuenow', String(Math.round(ratio * 100)));
  progressBar.setAttribute('aria-valuetext', `${formatTime(current)} of ${formatTime(duration)}`);
  currentTimeEl.textContent = formatTime(current);
}

let dragging = false;

progressBar.addEventListener('pointerdown', (event) => {
  if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
  dragging = true;
  progressBar.classList.add('dragging');
  progressBar.setPointerCapture(event.pointerId);
  seekToClientX(event.clientX);
});
progressBar.addEventListener('pointermove', (event) => {
  if (dragging) seekToClientX(event.clientX);
});
const endDrag = (event) => {
  if (!dragging) return;
  dragging = false;
  progressBar.classList.remove('dragging');
  try { progressBar.releasePointerCapture(event.pointerId); } catch { /* already released */ }
};
progressBar.addEventListener('pointerup', endDrag);
progressBar.addEventListener('pointercancel', endDrag);

progressBar.addEventListener('keydown', (event) => {
  const duration = audio.duration;
  if (!Number.isFinite(duration)) return;
  const STEP = 5;
  if (event.key === 'ArrowLeft') { audio.currentTime = Math.max(0, audio.currentTime - STEP); event.preventDefault(); }
  else if (event.key === 'ArrowRight') { audio.currentTime = Math.min(duration, audio.currentTime + STEP); event.preventDefault(); }
  else if (event.key === 'Home') { audio.currentTime = 0; event.preventDefault(); }
  else if (event.key === 'End') { audio.currentTime = duration; event.preventDefault(); }
});

/* ─────────────────────────── audio events ────────────────────────── */

audio.addEventListener('play', () => {
  isPlaying = true;
  setStatus('Now playing', true);
  playPauseBtn.setAttribute('aria-label', 'Pause');
  updatePlaylistActive();
});
audio.addEventListener('pause', () => {
  isPlaying = false;
  setStatus('Paused', false);
  playPauseBtn.setAttribute('aria-label', 'Play');
  updatePlaylistActive();
});
audio.addEventListener('waiting', () => setStatus('Buffering…', true));
audio.addEventListener('playing', () => {
  consecutiveErrors = 0;
  setStatus('Now playing', true);
});

audio.addEventListener('loadedmetadata', () => {
  durationEl.textContent = formatTime(audio.duration);
  paintProgress(0, 0, audio.duration);
  if (Number.isFinite(audio.duration)) {
    const src = audio.getAttribute('src');
    if (src && !durationMap.has(src)) {
      durationMap.set(src, audio.duration);
      persistDurations();
      const idx = getAllTracks().findIndex((t) => t.src === src);
      const cell = idx > -1 ? trackList.querySelector(`[data-duration-for="${idx}"]`) : null;
      if (cell) cell.textContent = formatTime(audio.duration);
      updateTotals();
    }
  }
});

audio.addEventListener('timeupdate', () => {
  const duration = audio.duration;
  if (!Number.isFinite(duration) || duration <= 0 || dragging) return;
  paintProgress(audio.currentTime / duration, audio.currentTime, duration);
});

audio.addEventListener('progress', () => {
  try {
    if (audio.buffered.length && Number.isFinite(audio.duration) && audio.duration > 0) {
      const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
      progressBuffer.style.width = `${Math.min(100, (bufferedEnd / audio.duration) * 100)}%`;
    }
  } catch { /* buffered ranges can throw mid-load — safe to ignore */ }
});

audio.addEventListener('ended', () => {
  if (repeatMode === 'one') {
    audio.currentTime = 0;
    playTrack();
    return;
  }
  if (shuffle) {
    nextTrack(false);
    return;
  }
  const all = getAllTracks();
  const isLast = currentIndex === all.length - 1;
  if (!isLast) {
    loadTrack(currentIndex + 1, true);           // autoplay: keep the music going
  } else if (repeatMode === 'all' || autoplayToggle.checked) {
    loadTrack(0, true);                          // wrap around
  } else {
    isPlaying = false;
    setStatus('Finished', false);
    playPauseBtn.setAttribute('aria-label', 'Play');
    audio.currentTime = 0;
    paintProgress(0, 0, audio.duration || 0);
    updatePlaylistActive();
  }
});

audio.addEventListener('error', () => {
  if (!audio.getAttribute('src')) return;
  const track = getAllTracks()[currentIndex];
  if (!triedMirror && track && track.mirror) {
    // Local file failed (moved/deleted?) — fall back to the online mirror once.
    triedMirror = true;
    audio.src = track.mirror;
    audio.load();
    playTrack();
    return;
  }
  setStatus('Error', false);
  consecutiveErrors += 1;
  if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
    showToast('Several files in a row failed to load — stopping here.');
    return;
  }
  showToast('This track failed to load. Skipping to the next one…');
  if (getAllTracks().length > 1) nextTrack(false);
});

/* ─────────────────────────── wiring up ───────────────────────────── */

playPauseBtn.addEventListener('click', togglePlay);
nextBtn.addEventListener('click', () => nextTrack(true));
prevBtn.addEventListener('click', prevTrack);
shuffleBtn.addEventListener('click', toggleShuffle);
repeatBtn.addEventListener('click', cycleRepeat);
muteBtn.addEventListener('click', toggleMute);
autoplayToggle.addEventListener('change', saveState);

volumeSlider.addEventListener('input', (event) => {
  const value = Number(event.target.value) / 100;
  setVolume(value);
});

/* Playlist clicks: play a track, or remove a user-added one */
trackList.addEventListener('click', (event) => {
  const removeBtn = event.target.closest('[data-remove]');
  if (removeBtn) {
    removeUserTrack(Number(removeBtn.dataset.remove));
    return;
  }
  const btn = event.target.closest('.track-item');
  if (!btn) return;
  const index = Number(btn.dataset.index);
  if (index === currentIndex) {
    togglePlay();
  } else {
    loadTrack(index, true);
  }
});

/* Open songs from the computer */
openFilesBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', () => {
  addFilesFromComputer([...fileInput.files]);
  fileInput.value = ''; // allow picking the same file again later
});

/* Keyboard shortcuts (ignored while typing in form fields) */
document.addEventListener('keydown', (event) => {
  const tag = (event.target.tagName || '').toLowerCase();
  if (tag === 'input' || tag === 'textarea' || tag === 'select') {
    if (event.target !== volumeSlider) return; // let the volume slider keep native behaviour
  }
  if (event.target.closest && event.target.closest('#progressBar')) return; // handled there

  switch (event.code) {
    case 'Space':
      event.preventDefault();
      togglePlay();
      break;
    case 'ArrowLeft':
      event.preventDefault();
      prevTrack();
      break;
    case 'ArrowRight':
      event.preventDefault();
      nextTrack(true);
      break;
    case 'ArrowUp':
      event.preventDefault();
      setVolume(volume + 0.05);
      break;
    case 'ArrowDown':
      event.preventDefault();
      setVolume(volume - 0.05);
      break;
    case 'KeyM':
      toggleMute();
      break;
    case 'KeyS':
      toggleShuffle();
      break;
    case 'KeyR':
      cycleRepeat();
      break;
    default:
      break;
  }
});

/* ────────────────────────────── init ─────────────────────────────── */

loadState();
loadDurationCache();
buildPlaylist();
shuffleBtn.classList.toggle('active', shuffle);
shuffleBtn.setAttribute('aria-pressed', String(shuffle));
repeatBtn.classList.toggle('active', repeatMode !== 'off');
repeatBtn.classList.toggle('repeat-one-mode', repeatMode === 'one');
setVolume(volume, { fromMute: true });
loadTrack(currentIndex, false);   // preload the remembered track without autoplaying
