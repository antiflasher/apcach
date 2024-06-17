import type { ColorInCSSFormat } from '../types'
import { clampChroma, type Color } from 'culori'
import { convertToOklch_orThrow, inSrgb } from '../utils/culoriUtils'
import { log } from '../utils/log'

export function clampColorToSRGB(
    //
    colorInCssFormat: ColorInCSSFormat,
): Color | ColorInCSSFormat {
    log('culori > inSrgb /// clampColorToSpace')
    if (inSrgb(colorInCssFormat)) return colorInCssFormat

    let oklch = convertToOklch_orThrow(colorInCssFormat)
    log('culori > convertToOklch /// 407')

    oklch = clampChroma(oklch, 'oklch')
    log('culori > clampChroma /// 409')
    return oklch
}
