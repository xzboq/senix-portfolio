"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import { OnView } from "./OnView";

const Game = dynamic(() => import("./Game"), {
  ssr: false,
  loading: () => <div className="skeleton" aria-hidden="true">…</div>,
});

export function LazyGame(props: ComponentProps<typeof Game>) {
  return (
    <OnView minHeight={380}>
      <Game {...props} />
    </OnView>
  );
}
