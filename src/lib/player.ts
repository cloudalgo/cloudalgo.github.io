/**
 * The site's video controller: one engine behind every film on the site.
 *
 * Two kinds of player share it, told apart by `data-player` on the root:
 *
 *  - `film` (VideoPlayer.astro) -- a film a reader sits down to watch. A
 *    slate before the roll, then a floating deck with a timecode counter
 *    and a ruled timeline. It reports `video_start` / `video_progress` /
 *    `video_complete`, and starting one pauses any other film on the page.
 *  - `loop` (VideoReel.astro) -- a short silent recording. A counter chip,
 *    a progress line and one key. It reports nothing; VideoReel says why.
 *    With `data-ambient` it also runs itself: fetched on first sight,
 *    paused off screen, never started under reduced motion.
 *
 * The engine owns behaviour only. It writes state to data-* on the root
 * (started, playing, ended, idle, waiting, muted, cc, hasCue, hovering,
 * scrubbing, fs) and progress to the --p / --b / --h custom properties,
 * and every pixel of it lives in _player.scss. The one piece of DOM it
 * creates is the ruler's ticks, because only the file knows its length.
 *
 * Controls are found by `data-role`, never by class, so the stylesheet
 * can rename anything without breaking a key.
 */
import { track } from './analytics';

/** `m:ss`, or `hh:mm:ss` when `long` -- the counter's edit-suite form. */
export function formatTime(secs: number, long = false): string {
  const t = Number.isFinite(secs) && secs > 0 ? Math.floor(secs) : 0;
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  const z = (n: number) => String(n).padStart(2, '0');
  if (long) return `${z(h)}:${z(m)}:${z(s)}`;
  return h ? `${h}:${z(m)}:${z(s)}` : `${m}:${z(s)}`;
}

export interface Tick {
  /** Position along the ruler, 0..1. */
  at: number;
  major: boolean;
  label?: string;
}

/**
 * The ruler's marks. The minor step scales with the film -- every 5s
 * under two minutes, 10s under ten, a minute beyond -- so a ruler never
 * carries more than about twenty, and every third mark is major and
 * labelled. A label that would run off the right-hand end is dropped
 * rather than clipped.
 */
export function tickPlan(duration: number): Tick[] {
  if (!Number.isFinite(duration) || duration <= 0) return [];
  const minor = duration > 600 ? 60 : duration > 120 ? 10 : 5;
  const major = minor * 3;
  const ticks: Tick[] = [];
  for (let t = 0; t <= duration; t += minor) {
    const at = t / duration;
    const isMajor = t % major === 0;
    ticks.push({
      at,
      major: isMajor,
      label: isMajor && at < 0.92 ? formatTime(t) : undefined,
    });
  }
  return ticks;
}

const RATES = [1, 1.25, 1.5, 2, 0.75];
const IDLE_MS = 2500;
/** Every film on the page, so starting one can stop the rest. Loops are never in here. */
const films = new Set<HTMLVideoElement>();

type FullscreenVideo = HTMLVideoElement & { webkitEnterFullscreen?: () => void };

export function initPlayer(root: HTMLElement): void {
  if (root.dataset.wired) return;

  const all = <T extends HTMLElement = HTMLElement>(role: string) =>
    Array.from(root.querySelectorAll<T>(`[data-role="${role}"]`));
  const one = <T extends HTMLElement = HTMLElement>(role: string) =>
    root.querySelector<T>(`[data-role="${role}"]`);

  const video = one<HTMLVideoElement>('video');
  if (!video) return;

  const film = root.dataset.player === 'film';
  const ambient = root.hasAttribute('data-ambient');
  const cue = one('cue');
  const flashEl = one('flash');
  const surface = one('surface');
  const set = (key: string, value: boolean) => {
    root.dataset[key] = String(value);
  };

  /* Hand over from the native chrome only now that ours is wired. The
     stylesheet keeps our controls hidden until `data-wired` appears, so
     a script that never runs leaves the browser's player, not a slate
     with nothing behind it. */
  video.controls = false;
  set('started', false);
  set('playing', false);
  set('ended', false);
  set('idle', false);
  set('muted', video.muted);
  set('cc', !!cue && root.dataset.ccDefault !== 'false');
  set('fs', false);
  root.dataset.wired = 'true';
  if (film) films.add(video);

  // ── Painting ──
  let raf = 0;
  const paint = () => {
    const d = video.duration;
    const p = d > 0 ? video.currentTime / d : 0;
    root.style.setProperty('--p', p.toFixed(5));
    let b = 0;
    if (d > 0) {
      for (let i = 0; i < video.buffered.length; i++) {
        if (video.buffered.start(i) <= video.currentTime + 0.5) b = video.buffered.end(i) / d;
      }
    }
    root.style.setProperty('--b', b.toFixed(4));
    all('elapsed').forEach((el) => {
      el.textContent = formatTime(video.currentTime, el.hasAttribute('data-long'));
    });
    all('scrub').forEach((el) => {
      el.setAttribute('aria-valuenow', String(Math.round(p * 100)));
      el.setAttribute('aria-valuetext', `${formatTime(video.currentTime)} of ${formatTime(d)}`);
    });
  };
  /* timeupdate fires about four times a second, which steps a progress
     line visibly; a frame loop while playing keeps it continuous. */
  const loop = () => {
    paint();
    raf = requestAnimationFrame(loop);
  };

  const rule = () => {
    all('ticks').forEach((host) => {
      host.replaceChildren();
      for (const tick of tickPlan(video.duration)) {
        const mark = document.createElement('span');
        mark.className = tick.major ? 'player__tick player__tick--major' : 'player__tick';
        mark.style.left = `${tick.at * 100}%`;
        host.append(mark);
        if (tick.label) {
          const label = document.createElement('span');
          label.className = 'player__lab';
          label.style.left = `${Math.max(tick.at * 100, 2)}%`;
          label.textContent = tick.label;
          host.append(label);
        }
      }
    });
  };
  const onMeta = () => {
    all('total').forEach((el) => {
      el.textContent = formatTime(video.duration, el.hasAttribute('data-long'));
    });
    rule();
    paint();
  };
  video.addEventListener('loadedmetadata', onMeta);
  if (video.readyState >= 1) onMeta();
  video.addEventListener('progress', paint);
  video.addEventListener('seeked', paint);

  /* A loop whose source the page swaps (the product viewer's steps)
     starts over as a new recording, not mid-way through the old one. */
  video.addEventListener('emptied', () => {
    cancelAnimationFrame(raf);
    set('started', false);
    set('playing', false);
    set('ended', false);
    set('hasCue', false);
    paint();
  });

  // ── Idle: the deck steps away while a film plays untouched ──
  let idleTimer = 0;
  const wake = () => {
    set('idle', false);
    window.clearTimeout(idleTimer);
    if (!video.paused) {
      idleTimer = window.setTimeout(() => {
        /* Never hide the deck from a keyboard user who is on it. */
        if (root.querySelector(':focus-visible') || root.dataset.scrubbing === 'true') return;
        set('idle', true);
      }, IDLE_MS);
    }
  };
  root.addEventListener('pointermove', wake);
  root.addEventListener('focusin', wake);
  root.addEventListener('pointerleave', () => {
    if (!video.paused && root.dataset.scrubbing !== 'true') set('idle', true);
  });

  // ── Transport ──
  const play = () => {
    if (!video.getAttribute('src') && video.dataset.src) video.src = video.dataset.src;
    if (film) films.forEach((other) => other !== video && other.pause());
    if (video.ended) video.currentTime = 0;
    /* A refused play is a state, not an error: the poster and the key stay. */
    video.play().catch(() => {});
  };
  const flip = () => (video.paused ? play() : video.pause());
  const flash = () => {
    if (!flashEl) return;
    flashEl.classList.remove('is-on');
    void flashEl.offsetWidth; // restart the animation
    flashEl.classList.add('is-on');
  };
  const seekBy = (secs: number) => {
    if (!(video.duration > 0)) return;
    video.currentTime = Math.min(video.duration, Math.max(0, video.currentTime + secs));
    paint();
  };

  all('start').forEach((btn) => btn.addEventListener('click', play));
  all('toggle').forEach((btn) =>
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      flip();
    }),
  );
  surface?.addEventListener('click', (e) => {
    /* On touch, a tap on a hidden deck wakes it rather than pausing. */
    if ((e as PointerEvent).pointerType === 'touch' && root.dataset.idle === 'true') {
      wake();
      return;
    }
    flip();
    flash();
  });

  const label = (text: string) => all('toggle').forEach((btn) => btn.setAttribute('aria-label', text));
  video.addEventListener('play', () => {
    set('started', true);
    set('playing', true);
    set('ended', false);
    label('Pause');
    cancelAnimationFrame(raf);
    loop();
    wake();
  });
  video.addEventListener('pause', () => {
    set('playing', false);
    set('waiting', false);
    label('Play');
    cancelAnimationFrame(raf);
    paint();
    wake();
  });
  video.addEventListener('ended', () => {
    set('ended', true);
    set('playing', false);
    set('idle', false);
  });
  video.addEventListener('waiting', () => set('waiting', true));
  for (const ev of ['playing', 'canplay', 'seeked']) {
    video.addEventListener(ev, () => set('waiting', false));
  }

  // ── Seeking ──
  all('scrub').forEach((bar) => {
    const tip = bar.querySelector<HTMLElement>('[data-role="tip"]');
    const ratio = (e: PointerEvent) => {
      const box = bar.getBoundingClientRect();
      return Math.min(1, Math.max(0, (e.clientX - box.left) / box.width));
    };
    const hover = (r: number) => {
      root.style.setProperty('--h', r.toFixed(4));
      if (!tip) return;
      tip.textContent = formatTime(r * (video.duration || 0));
      /* Clamped so the tip never hangs off either end of the ruler. */
      const width = bar.getBoundingClientRect().width;
      const half = tip.offsetWidth / 2;
      tip.style.left = `${Math.min(width - half, Math.max(half, r * width))}px`;
    };
    const seek = (r: number) => {
      if (!(video.duration > 0)) return;
      video.currentTime = r * video.duration;
      paint();
    };

    bar.addEventListener('pointerdown', (e) => {
      if (!(video.duration > 0)) return;
      e.preventDefault();
      e.stopPropagation();
      bar.setPointerCapture(e.pointerId);
      set('scrubbing', true);
      const r = ratio(e);
      hover(r);
      seek(r);
    });
    bar.addEventListener('pointermove', (e) => {
      const r = ratio(e);
      set('hovering', true);
      hover(r);
      if (root.dataset.scrubbing === 'true') seek(r);
    });
    const release = () => {
      set('scrubbing', false);
      wake();
    };
    bar.addEventListener('pointerup', release);
    bar.addEventListener('pointercancel', release);
    bar.addEventListener('pointerleave', () => set('hovering', false));
    bar.addEventListener('click', (e) => e.stopPropagation());
    bar.addEventListener('keydown', (e) => {
      const d = video.duration;
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') seekBy(e.shiftKey ? 30 : 5);
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') seekBy(e.shiftKey ? -30 : -5);
      else if (e.key === 'PageUp') seekBy(d * 0.1);
      else if (e.key === 'PageDown') seekBy(-d * 0.1);
      else if (e.key === 'Home') seek(0);
      else if (e.key === 'End') seek(0.999);
      else return;
      e.preventDefault();
      e.stopPropagation();
    });
  });

  // ── Skip, speed, sound, captions, full screen ──
  all('skip').forEach((btn) => btn.addEventListener('click', () => seekBy(Number(btn.dataset.skip))));

  all('speed').forEach((btn) =>
    btn.addEventListener('click', () => {
      video.playbackRate = RATES[(RATES.indexOf(video.playbackRate) + 1) % RATES.length];
    }),
  );
  video.addEventListener('ratechange', () =>
    all('speed').forEach((btn) => {
      btn.textContent = `${video.playbackRate}×`;
    }),
  );

  const toggleMute = () => {
    video.muted = !video.muted;
    if (!video.muted && video.volume === 0) video.volume = 0.6;
  };
  all('mute').forEach((btn) => btn.addEventListener('click', toggleMute));
  video.addEventListener('volumechange', () => {
    const muted = video.muted || video.volume === 0;
    set('muted', muted);
    all('mute').forEach((btn) => btn.setAttribute('aria-label', muted ? 'Unmute' : 'Mute'));
  });

  /* Captions are timed by the browser and drawn by us, so they can rise
     clear of the deck instead of sitting under it. */
  const textTrack = video.textTracks[0];
  if (textTrack && cue) {
    textTrack.mode = 'hidden';
    textTrack.addEventListener('cuechange', () => {
      const text = Array.from(textTrack.activeCues ?? [])
        .map((c) => (c as VTTCue).text)
        .join('\n');
      cue.textContent = text;
      set('hasCue', !!text);
    });
  }
  const toggleCaptions = () => {
    const on = root.dataset.cc !== 'true';
    set('cc', on);
    all('cc').forEach((btn) => btn.setAttribute('aria-pressed', String(on)));
  };
  all('cc').forEach((btn) => {
    btn.setAttribute('aria-pressed', String(root.dataset.cc === 'true'));
    btn.addEventListener('click', toggleCaptions);
  });

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else if (root.requestFullscreen) void root.requestFullscreen();
    /* iPhone Safari has no element full screen, only the video's own. */
    else (video as FullscreenVideo).webkitEnterFullscreen?.();
  };
  all('fs').forEach((btn) => btn.addEventListener('click', toggleFullscreen));
  document.addEventListener('fullscreenchange', () => {
    const on = document.fullscreenElement === root;
    set('fs', on);
    all('fs').forEach((btn) => btn.setAttribute('aria-label', on ? 'Exit full screen' : 'Full screen'));
  });

  // ── Keyboard, while focus is inside the player ──
  root.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const key = e.key.toLowerCase();
    const onButton = (e.target as HTMLElement).closest('button');
    if ((key === ' ' && !onButton) || key === 'k') {
      flip();
      flash();
    } else if (key === 'j') seekBy(-10);
    else if (key === 'l') seekBy(10);
    else if (key === 'arrowleft') seekBy(-5);
    else if (key === 'arrowright') seekBy(5);
    else if (key === 'm') toggleMute();
    else if (key === 'c' && cue) toggleCaptions();
    else if (key === 'f' && film) toggleFullscreen();
    else if (/^[0-9]$/.test(key) && video.duration > 0) {
      video.currentTime = (Number(key) / 10) * video.duration;
      paint();
    } else return;
    e.preventDefault();
    wake();
  });

  // ── Measurement: films only ──
  //
  // A film is a claim that takes minutes to read, and whether anyone
  // watches it -- and where they stop -- is the only way to know whether
  // the minutes were worth making. Quartiles rather than a timer, so
  // films of different lengths compare. The name is the video's
  // aria-label, so a film's name is spelled in one place.
  if (film) {
    const name = video.getAttribute('aria-label') || 'untitled';
    let reported = false;
    const quartiles = new Set<number>();
    video.addEventListener('play', () => {
      if (reported) return;
      reported = true;
      track('video_start', { video_title: name });
    });
    video.addEventListener('timeupdate', () => {
      const d = video.duration;
      if (!(d > 0)) return;
      const pct = (video.currentTime / d) * 100;
      for (const q of [25, 50, 75]) {
        if (pct >= q && !quartiles.has(q)) {
          quartiles.add(q);
          track('video_progress', { video_title: name, percent: q });
        }
      }
    });
    video.addEventListener('ended', () => track('video_complete', { video_title: name }));
  }

  // ── Ambient loops: run only while seen, never against reduced motion ──
  if (ambient) {
    /* Whether the reader wants it running. It starts false for anyone
       who asked for less motion, and every press sets it -- which is why
       scrolling away and back does not override a deliberate pause. */
    let wanted = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const remember = () => {
      wanted = !video.paused;
    };
    all('toggle').forEach((btn) => btn.addEventListener('click', remember));
    surface?.addEventListener('click', remember);
    new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (wanted) play();
          } else {
            /* Off screen it stops: no decode budget, no data spent on a
               film nobody is looking at. */
            video.pause();
          }
        }
      },
      { threshold: 0.35 },
    ).observe(root);
  }
}

export function initPlayers(scope: ParentNode = document): void {
  scope.querySelectorAll<HTMLElement>('[data-player]').forEach(initPlayer);
}
