# Pulse — Music Player

A sleek, fully self-contained music player built with **plain HTML, CSS and vanilla JavaScript** — no frameworks, no build step.

## Task 4 (CodeAlpha — Frontend Development) checklist

| Requirement | Status |
|---|---|
| Music player interface using HTML | ✅ `index.html` |
| Styled with CSS | ✅ `style.css` — dark glassmorphism UI, responsive, animated vinyl + equalizer |
| JavaScript audio control (play / pause / next / previous) | ✅ `script.js` — HTML5 `<audio>` API |
| Song title, artist and duration display | ✅ now-playing area + per-track durations in the playlist |
| Progress bar | ✅ click/drag to seek + buffered indicator + time labels |
| Volume control | ✅ slider + mute toggle + keyboard |
| **Bonus:** playlist | ✅ 16 bundled tracks (SoundHelix samples + free Indian & Afghan recordings) |
| **Bonus:** autoplay | ✅ toggle switch — auto-advances (wraps at playlist end); pauses cleanly when off |
| **Also:** open songs from your computer | ✅ “Open songs” button — pick MP3/WAV/OGG/FLAC/M4A/AAC… any audio file; added to the playlist with a ✕ to remove |

Extras: shuffle, repeat (off / all / one), keyboard shortcuts, per-track artwork gradients, animated equalizer on the active track, `localStorage` persistence (volume, shuffle, repeat, autoplay, last track, cached durations), ARIA slider semantics, and a mirror-URL fallback if a local MP3 goes missing.

## Run it

Just open `index.html` in any browser — everything (including the audio, ~75 MB) is bundled in `tracks/`, so it works **offline**.

Optional (to mirror a deployed setup):

```bash
python -m http.server 8899
# then open http://127.0.0.1:8899/
```

## Files

```
music-player/
├── index.html      # markup: player card + playlist (+ hidden file picker)
├── style.css       # theme, layout, responsive rules, animations
├── script.js       # all player logic (audio, playlist, persistence, shortcuts)
└── tracks/         # 16 bundled, license-cleared MP3/OGG/FLAC files
```

## Keyboard shortcuts

| Key | Action |
|---|---|
| `Space` | Play / pause |
| `←` / `→` | Previous / next track (restart track if >3s in; seek ±5s when the progress bar is focused) |
| `↑` / `↓` | Volume up / down |
| `M` | Mute / unmute |
| `S` / `R` | Toggle shuffle / cycle repeat mode |

## Opening songs from your computer

Click **Open songs** in the playlist header (or pick with your file manager). Audio files are added to the end of the playlist, marked with a 🎵 cover and the artist “Your computer”, and start playing right away. Each added track gets a ✕ button to remove it. Added tracks last **for the current session** (browsers don’t allow persisting local file paths across reloads) and they aren’t included in the duration cache.

## Built-in tracks — sources & licenses

All built-in audio is free to use. The full details are also inside the app under **“Track sources & licenses”** in the playlist panel.

| # | Track | Artist | License |
|---|-------|--------|---------|
| 1–8 | SoundHelix Songs 1–8 (bundled MP3s) | Fictional names (Midnight Circuit…) | Free sample MP3s from [soundhelix.com](https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3) |
| 9 | Rag Des | NCERT | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) |
| 10 | Rag Deshkar | NCERT | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) |
| 11 | Raag Jhinjhoti | Ustad Abdul Karim Khan (1872–1937) | Public domain |
| 12 | Raga Adana | Traditional | Public domain |
| 13 | Rababa | Ustad Gada Mohammad (Afghan rubab master, Herat) | Public domain |
| 14 | Shirin Jan | Traditional Afghan | Public domain |
| 15 | Jonse Hosne | Traditional Afghan | Public domain |
| 16 | Poshideh Baz | Traditional Afghan | Public domain |

Wikimedia Commons file pages are linked from the in-app credits panel. FLAC files (tracks 14–15) play in current Chrome, Edge, Firefox and Safari.

## Notes

- Browser autoplay policies: audio starts only after a user gesture (click/keypress) — the **Autoplay** toggle controls what happens when a track *ends*, not what happens on page load.
- Built-in track titles/artists for the SoundHelix samples are fictional; the Indian and Afghan recordings use their authentic artists.
- If a built-in file goes missing, the SoundHelix tracks retry their online mirror URL once; Indian/Afghan tracks and user files are local-only.
- A corrupt or unsupported file auto-skips to the next track (with a toast). After 4 consecutive failures playback stops rather than looping forever.
