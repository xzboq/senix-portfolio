"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Dict } from "@/content/dict";
import { setAmbientFallback, setSound, soundEnabled, subscribeSound } from "@/lib/sound";

/** Песня на кнопке звука: «Airplane Mode» — Limbo. Играет через встроенный плеер YouTube — сам файл
 *  на сайте не лежит. Видео — с музыкального канала Cakes & Eclairs: запись с канала артистки
 *  («Limbo - Topic») её владелец запретил проигрывать на других сайтах (ошибка 150).
 *  Плеер грузится только после первого включения музыки (до этого к YouTube нет ни одного запроса)
 *  и, по правилам YouTube, виден, пока включён: карточка 200×200 рядом с кнопками в углу.
 *  YouTube недоступен — кнопка включает синтезированный космический эмбиент из lib/sound.ts. */
const VIDEO = "jfFEpOEjqAw";
const TRACK = { title: "Airplane Mode", artist: "Limbo" };
const VOLUME = 40;
const SIZE = 200; // минимальный размер встроенного плеера по правилам YouTube

interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  setVolume(v: number): void;
  destroy(): void;
}
interface YTEvent {
  target: YTPlayer;
  data: number;
}
interface YTApi {
  Player: new (
    el: HTMLElement,
    opts: {
      width: number;
      height: number;
      videoId: string;
      host: string;
      playerVars: Record<string, string | number>;
      events: { onReady: (e: YTEvent) => void; onStateChange: (e: YTEvent) => void; onError: () => void };
    },
  ) => YTPlayer;
}
declare global {
  interface Window {
    YT?: YTApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

// карточка на сайте одна (в общем макете), поэтому плеер живёт на уровне модуля
let api: Promise<YTApi> | null = null;
let player: YTPlayer | null = null;
let ready: Promise<YTPlayer> | null = null;

function loadApi(): Promise<YTApi> {
  if (api) return api;
  api = new Promise<YTApi>((resolve, reject) => {
    if (window.YT?.Player) {
      resolve(window.YT);
      return;
    }
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      if (window.YT?.Player) resolve(window.YT);
    };
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    s.async = true;
    s.onerror = () => reject(new Error("youtube api"));
    document.head.append(s);
    window.setTimeout(() => reject(new Error("youtube api timeout")), 12000);
  }).catch((e: unknown) => {
    api = null;
    throw e;
  });
  return api;
}

export function Music({ t }: { t: Dict["fun"] }) {
  const on = useSyncExternalStore(subscribeSound, soundEnabled, () => false);
  const host = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  // включили музыку — грузим плеер (один раз) и играем; выключили — пауза
  useEffect(() => {
    if (!on) {
      player?.pauseVideo();
      return;
    }
    const box = host.current;
    if (failed || !box) return;
    let alive = true;
    const fail = () => {
      setFailed(true);
      setPlaying(false);
      setAmbientFallback(true);
    };
    if (!ready) {
      ready = loadApi().then(
        (YT) =>
          new Promise<YTPlayer>((resolve, reject) => {
            const el = document.createElement("div");
            box.append(el);
            const timer = window.setTimeout(() => reject(new Error("player timeout")), 15000);
            new YT.Player(el, {
              width: SIZE,
              height: SIZE,
              videoId: VIDEO,
              host: "https://www.youtube-nocookie.com",
              playerVars: { controls: 1, loop: 1, playlist: VIDEO, rel: 0, playsinline: 1, iv_load_policy: 3, origin: window.location.origin },
              events: {
                onReady: (e) => {
                  window.clearTimeout(timer);
                  e.target.setVolume(VOLUME);
                  if (soundEnabled()) e.target.playVideo();
                  player = e.target;
                  resolve(e.target);
                },
                onStateChange: (e) => setPlaying(e.data === 1 || e.data === 3),
                onError: () => {
                  window.clearTimeout(timer);
                  reject(new Error("player"));
                  fail();
                },
              },
            });
          }),
      );
    }
    ready.then(
      (p) => {
        if (alive && soundEnabled()) p.playVideo();
      },
      () => {
        if (alive) fail();
      },
    );
    return () => {
      alive = false;
    };
  }, [on, failed]);

  // на скрытой вкладке песня на паузе, вернулись — играет дальше
  useEffect(() => {
    const onVis = () => {
      if (!player || !soundEnabled()) return;
      if (document.hidden) player.pauseVideo();
      else player.playVideo();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // карточка уходит (окно стало уже 1024px) — плеер убираем
  useEffect(
    () => () => {
      player?.destroy();
      player = null;
      ready = null;
    },
    [],
  );

  const show = on && !failed;
  return (
    <div className="np" data-show={show || undefined} data-playing={(show && playing) || undefined} aria-hidden={!show} inert={!show}>
      <div className="np-head">
        <span className="np-eq" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="np-meta">
          <small>{t.nowPlaying}</small>
          <b>{TRACK.title}</b>
          <span>{TRACK.artist}</span>
        </span>
        <button type="button" className="np-close" onClick={() => setSound(false)} aria-label={t.soundOff} data-cursor={t.soundOff}>
          ✕
        </button>
      </div>
      <div className="np-screen" ref={host} />
    </div>
  );
}
