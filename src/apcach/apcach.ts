import type { ContrastConfig, ContrastConfig_Ext } from '../contrast/contrastConfig'
import type { ColorSpace, ChromaExpr, Maybe } from '../types'

import { contrastToConfig } from '../contrast/contrastToConfig'
import { isValidContrast } from '../contrast/contrastIsLegal'
import { lightnessFromAntagonist } from '../light/lightnessFromAntagonist'
import { calcLightness } from '../scoring/calcLightness'
import { prepareContrastConfig } from '../contrast/prepareContrastConfig'
import type { MaxChromaFn } from './maxChroma'

export type Apcach = {
    lightness: number
    chroma: number
    hue: number
    alpha: number
    contrastConfig: ContrastConfig
    colorSpace: ColorSpace
}

export function apcach(
    //
    contrast: ContrastConfig_Ext,
    chroma: number | MaxChromaFn,
    hue: number | string = 0,
    alpha: number = 100,
    colorSpace: ColorSpace = 'p3',
): Apcach {
    // normalize for hue
    hue = typeof hue === 'number' ? hue : parseFloat(hue)

    // Compose contrast config
    const contrastConfig: ContrastConfig = contrastToConfig(contrast)

    // CASE A. Max chroma case
    // maxChroma() has been passed instead of a static value
    // we need finding the most saturated color with given hue and contrast ratio
    if (typeof chroma === 'function') return chroma(contrastConfig, hue, alpha, colorSpace)

    // CASE B. Constant chroma case
    let lightness
    const validContrast = isValidContrast(contrastConfig.cr, contrastConfig.contrastModel)
    if (validContrast) {
        lightness = calcLightness(prepareContrastConfig(contrastConfig, colorSpace), chroma, hue, colorSpace)
    } else {
        // APCA has a cut off at the value about 8
        lightness = lightnessFromAntagonist(contrastConfig)
    }

    return { lightness, chroma, hue, alpha, colorSpace, contrastConfig }
}

// function parseFloat2(val: Maybe<number | string>): number {
//     if (val == null) {
//         return 0
//     } else if (typeof val === 'number') {
//         if (isNaN(val)) {
//             throw new Error('Invalid number: NaN')
//         }
//         return val
//     } else {
//         return parseFloat(val)
//     }
// }
