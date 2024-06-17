import type { ContrastConfig, ContrastConfig_PREPARED } from './contrastConfig'

import { ColorSpace } from '../types'
import { clampColorToSpace } from '../clamp/clampColorToSpace'
import { colorToComps } from '../to-sort-somewhere/colorToComps'

// TODO: finish cleaning this function
export function prepareContrastConfig(
    contrastConfig: ContrastConfig,
    colorSpace: ColorSpace,
): ContrastConfig_PREPARED {
    const apcachIsOnFg: boolean = contrastConfig.fgColor === 'apcach'

    const colorAntagonistOriginal: string = apcachIsOnFg ? contrastConfig.bgColor : contrastConfig.fgColor
    const colorAntagonistClamped: any = clampColorToSpace(colorAntagonistOriginal, colorSpace)
    const colorAntagonistPrepared = colorToComps(
        colorAntagonistClamped,
        contrastConfig.contrastModel,
        colorSpace,
    )

    let config = {
        contrastModel: contrastConfig.contrastModel,
        cr: contrastConfig.cr,
        apcachIsOnFg,
    }

    // Drop alpha if antagonist is on bg
    if (config.apcachIsOnFg) {
        colorAntagonistPrepared.alpha = 1
    }

    // 💬 2024-06-17 rvion: patching is a bit dangerous
    // we should probably return an other object here
    let config_prepared = config as any as ContrastConfig_PREPARED
    config_prepared.colorAntagonist = colorAntagonistPrepared
    config_prepared.searchDirection = contrastConfig.searchDirection
    return config_prepared
}
