"use client";

import Image from "next/image";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  PanelsTopLeft,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

type FeatureId = "organize" | "get-hired" | "manage-boards";

type Feature = {
  label: string;
  summary: string;
  kicker: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  width: number;
  height: number;
  icon: LucideIcon;
};

const featureOrder: FeatureId[] = ["organize", "get-hired", "manage-boards"];

const features: Record<FeatureId, Feature> = {
  organize: {
    label: "Organize applications",
    summary: "See every role in one place",
    kicker: "Your search, at a glance",
    title: "Keep every opportunity moving forward.",
    description:
      "See where each application stands, keep the important details close, and know what deserves your attention next.",
    image: "/hero-image/hero2.png",
    imageAlt: "Job application board with roles organized by application stage",
    width: 3726,
    height: 1924,
    icon: BriefcaseBusiness,
  },
  "get-hired": {
    label: "Get hired",
    summary: "Capture details as you go",
    kicker: "Be ready for every next step",
    title: "Spend less time keeping track, and more time preparing.",
    description:
      "Save role details and notes together so you can focus on thoughtful follow-ups and stronger interviews.",
    image: "/hero-image/hero3.png",
    imageAlt: "Job application form for saving role and company details",
    width: 3738,
    height: 1918,
    icon: ChartNoAxesCombined,
  },
  "manage-boards": {
    label: "Manage boards",
    summary: "Build a workflow that fits",
    kicker: "Make the process your own",
    title: "Create a workflow that works for you.",
    description:
      "Arrange your search into clear stages and adapt your board as your priorities change.",
    image: "/hero-image/hero1.png",
    imageAlt: "Job application board with customizable workflow columns",
    width: 3734,
    height: 1914,
    icon: PanelsTopLeft,
  },
};

export default function ImageTab() {
  const [activeTab, setActiveTab] = useState<FeatureId>("organize");
  const activeFeature = features[activeTab];
  const activeIndex = featureOrder.indexOf(activeTab);

  return (
    <section
      id="product-features"
      className="relative isolate overflow-hidden border-y border-zinc-200/70 bg-white py-20 transition-colors dark:border-zinc-800 dark:bg-zinc-950 sm:py-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-0 mx-auto h-80 max-w-5xl bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0.06),transparent_68%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.08),transparent_68%)]"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">
            Built for your next move
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-5xl">
            Your job search, with a clearer path forward.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-400 sm:text-lg">
            Keep applications, follow-ups, and next steps together in one
            workspace that moves with you.
          </p>
        </div>

        <div
          aria-label="Explore product features"
          className="mx-auto mt-10 grid max-w-5xl gap-3 sm:grid-cols-3"
          role="group"
        >
          {featureOrder.map((featureId) => {
            const feature = features[featureId];
            const Icon = feature.icon;
            const isActive = activeTab === featureId;

            return (
              <button
                key={featureId}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActiveTab(featureId)}
                className={`group flex min-h-20 items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950 ${
                  isActive
                    ? "border-zinc-900 bg-zinc-900 text-white shadow-lg shadow-zinc-950/10 dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950"
                    : "border-zinc-200 bg-white/80 text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-900"
                }`}
              >
                <span
                  className={`grid size-10 shrink-0 place-items-center rounded-xl border ${
                    isActive
                      ? "border-white/15 bg-white/10 dark:border-zinc-950/10 dark:bg-zinc-950/5"
                      : "border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800"
                  }`}
                >
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">
                    {feature.label}
                  </span>
                  <span
                    className={`mt-1 block text-xs ${
                      isActive
                        ? "text-zinc-300 dark:text-zinc-600"
                        : "text-zinc-500 dark:text-zinc-400"
                    }`}
                  >
                    {feature.summary}
                  </span>
                </span>
                <ArrowUpRight
                  aria-hidden="true"
                  className={`size-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
                    isActive ? "opacity-100" : "opacity-50"
                  }`}
                />
              </button>
            );
          })}
        </div>

        <div className="mx-auto mt-8 max-w-6xl overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-[0_30px_100px_-44px_rgba(0,0,0,0.32)] dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/40">
          <div className="flex h-12 items-center justify-between border-b border-zinc-200 bg-zinc-50 px-4 dark:border-zinc-800 dark:bg-zinc-900 sm:px-6">
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              <span className="size-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              <span className="size-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              <span className="ml-3 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Chhat workspace
              </span>
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Preview {String(activeIndex + 1).padStart(2, "0")} / 03
            </span>
          </div>

          <div className="bg-zinc-100 p-2 dark:bg-zinc-950 sm:p-4">
            <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800">
              <Image
                key={activeTab}
                src={activeFeature.image}
                alt={activeFeature.imageAlt}
                width={activeFeature.width}
                height={activeFeature.height}
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 92vw, 1152px"
                className="block h-auto w-full"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-zinc-200 px-5 py-5 dark:border-zinc-800 sm:flex-row sm:items-end sm:justify-between sm:px-8 sm:py-6">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                {activeFeature.kicker}
              </p>
              <h3 className="mt-2 text-xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-2xl">
                {activeFeature.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400 sm:text-base">
                {activeFeature.description}
              </p>
            </div>
            <span className="shrink-0 text-xs font-medium text-zinc-400 dark:text-zinc-500">
              {String(activeIndex + 1).padStart(2, "0")} — 03
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
