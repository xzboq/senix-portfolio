"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import { Boundary } from "./Boundary";
import { OnView } from "./OnView";

const Game = dynamic(() => import("./Game"), {
  ssr: false,
  loading: () => <div className="skeleton" aria-hidden="true">…</div>,
});

export function LazyGame({ error, ...props }: ComponentProps<typeof Game> & { error: { message: string; action: string } }) {
  return (
    <Boundary message={error.message} action={error.action}>
      <OnView minHeight={380}>
        <Game {...props} />
      </OnView>
    </Boundary>
  );
}
