// TEMPORARY TYPES -------------------------------

import type { ContrastConfig } from './contrast/contrastConfig'

export type Number0To1 = number
export type RGB_or_P3 = { r: number; g: number; b: number; alpha?: number }

export type Maybe<T> = T | null | undefined
export type ContrastModel = 'apca' | 'wcag'
export type ColorSpace = 'p3' | 'rgb' | 'srgb'
export type ColorInCSSFormat = string

// use culori type instead
// ⏸️export type Oklch = {
// ⏸️  l: number;
// ⏸️  c: number;
// ⏸️  h: number;
// ⏸️  alpha: number;
// ⏸️};

// prettier-ignore
export type HueExpr = number |
  string |
  ((hue: number) => number);

export type ChromaExpr =
    | number
    | string
    | ((contrastConfig: ContrastConfig, hue: number, alpha: number, colorSpace: ColorSpace) => number)

export type ChromaExpr2 = number | ((contrastConfig: ContrastConfig) => number)

export type ContrastRatio = number

export type SearchDirection = 'auto' | 'lighter' | 'darker'
