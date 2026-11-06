"use client";

import dynamic from "next/dynamic";
import type { Locale } from "@/content/i18n";
import type { Dict } from "@/content/dict";
import type { Slug } from "@/content/projects";
import { Boundary } from "./Boundary";
import { OnView } from "./OnView";

export interface LabProps<T> {
  t: T;
  shared: { verdicts: Dict["verdicts"]; categories: Dict["categories"]; sample: string[] };
}

const Skeleton = () => <div className="skeleton" aria-hidden="true">…</div>;
const KiberLab = dynamic(() => import("./labs/KiberLab"), { ssr: false, loading: Skeleton });
const SearchLab = dynamic(() => import("./labs/SearchLab"), { ssr: false, loading: Skeleton });
const WishLab = dynamic(() => import("./labs/WishLab"), { ssr: false, loading: Skeleton });
const WeatherLab = dynamic(() => import("./labs/WeatherLab"), { ssr: false, loading: Skeleton });
const DriftLab = dynamic(() => import("./labs/DriftLab"), { ssr: false, loading: Skeleton });
const FreshLab = dynamic(() => import("./labs/FreshLab"), { ssr: false, loading: Skeleton });

interface Props {
  slug: Slug;
  lang: Locale;
  lab: Dict["lab"];
  shared: LabProps<unknown>["shared"];
  error: { message: string; action: string };
}

export function Lab({ slug, lang, lab, shared, error }: Props) {
  return (
    <Boundary message={error.message} action={error.action}>
      <OnView minHeight={320}>
        {slug === "kiber-yordamchi" && <KiberLab lang={lang} t={lab.kiber} shared={shared} />}
        {slug === "senixsearch" && <SearchLab lang={lang} t={lab.search} shared={shared} />}
        {slug === "wishpool" && <WishLab t={lab.wish} shared={shared} />}
        {slug === "weather" && <WeatherLab t={lab.weather} shared={shared} />}
        {slug === "drift-chirchik" && <DriftLab lang={lang} t={lab.drift} shared={shared} />}
        {slug === "fresh-chirchik" && <FreshLab t={lab.fresh} shared={shared} />}
      </OnView>
    </Boundary>
  );
}
