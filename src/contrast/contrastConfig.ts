import type { Color, Oklch, P3, Rgb } from 'culori'
import type { ContrastRatio, ContrastModel, SearchDirection, PreparedColor } from '../types'

export const TO_FIND = Symbol('TO_FIND')

// 1. ------------------------------------------------------------
/** extended way to specify a contrast config */
export type ContrastConfig_Ext = number | ContrastConfig

// 2. ------------------------------------------------------------
/** before preparation */
export type ContrastConfig = {
    bgColor: Oklch | typeof TO_FIND
    fgColor: Oklch | typeof TO_FIND
    cr: ContrastRatio
    contrastModel: ContrastModel
    searchDirection: SearchDirection
}

// 3. ------------------------------------------------------------
/** normalized and prepared contrast config */
export type ContrastConfig_PREPARED = {
    cr: ContrastRatio
    contrastModel: ContrastModel
    searchDirection: SearchDirection
    apcachIsOnFg: boolean
    colorAntagonist: P3 | Rgb
}
