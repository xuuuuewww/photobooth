"use client";

import { create } from "zustand";

export type CameraStatus = "idle" | "requesting" | "ready" | "error";

export type CapturedFrame = {
  id: string;
  createdAt: number;
  dataUrl: string;
};

export type LayoutTemplateId = "strip-3" | "strip-4";

export type FilterId = "original" | "grayscale";

type BoothState = {
  cameraStatus: CameraStatus;
  frames: CapturedFrame[];
  layoutTemplate: LayoutTemplateId;
  mirror: boolean;
  filter: FilterId;
  compositeResult?: string;
  setCameraStatus: (status: CameraStatus) => void;
  setFrames: (frames: CapturedFrame[]) => void;
  addFrame: (frame: CapturedFrame) => void;
  clearFrames: () => void;
  setLayoutTemplate: (template: LayoutTemplateId) => void;
  setMirror: (mirror: boolean) => void;
  setFilter: (filter: FilterId) => void;
  setCompositeResult: (url?: string) => void;
};

export const useBoothStore = create<BoothState>((set) => ({
  cameraStatus: "idle",
  frames: [],
  layoutTemplate: "strip-3",
  mirror: true,
  filter: "original",
  compositeResult: undefined,
  setCameraStatus: (cameraStatus) => set({ cameraStatus }),
  setFrames: (frames) => set({ frames }),
  addFrame: (frame) =>
    set((state) => ({
      frames: [...state.frames, frame],
    })),
  clearFrames: () => set({ frames: [], compositeResult: undefined }),
  setLayoutTemplate: (layoutTemplate) => set({ layoutTemplate }),
  setMirror: (mirror) => set({ mirror }),
  setFilter: (filter) => set({ filter }),
  setCompositeResult: (compositeResult) => set({ compositeResult }),
}));

