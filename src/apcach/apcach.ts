import type { ContrastConfig, ContrastConfig_Ext } from '../contrast/contrastConfig'
import type { ColorSpace, ChromaExpr, Maybe } from '../types'

import { contrastToConfig } from '../contrast/contrastToConfig'
import { contrastIsLegal } from '../contrast/contrastIsLegal'
import { lightnessFromAntagonist } from '../light/lightnessFromAntagonist'
import { calcLightness } from '../scoring/calcLightness'
import { prepareContrastConfig } from '../contrast/prepareContrastConfig'
import type { MaxChromaFn } from './maxChroma'

export type Apcach = {
    lightness: number
    chroma: number
    hue: number
    //
    alpha: number
    //
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
    // 💬 2024-06-16 rvion:
    // | checking if something is either null or undefined should be done
    // | in one go by doing `hue == null` (two equal sign).
    // | (almost the only case when one want to use `==` instead of `===`).

    // 💬 2024-06-16 rvion:
    // | not sure if parseFloat is guaranteed to accept number
    // | probably better to only pass strings to it

    // Check for hue
    hue = typeof hue === 'number' ? hue : parseFloat(hue)

    // Compose contrast config
    const contrastConfig: ContrastConfig = contrastToConfig(contrast)

    if (typeof chroma === 'function') {
        // Max chroma case
        return chroma(contrastConfig, hue, alpha, colorSpace)
    } else {
        // Constant chroma case
        let lightness
        if (contrastIsLegal(contrastConfig.cr, contrastConfig.contrastModel)) {
            lightness = calcLightness(
                prepareContrastConfig(contrastConfig, colorSpace),
                chroma, // parseFloat(chroma),
                hue, // parseFloat(hue),
                colorSpace,
            )
        } else {
            // APCA has a cut off at the value about 8
            lightness = lightnessFromAntagonist(contrastConfig)
        }

        return {
            lightness,
            chroma,
            hue,
            //
            alpha,
            //
            colorSpace,
            contrastConfig,
        }
    }
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
