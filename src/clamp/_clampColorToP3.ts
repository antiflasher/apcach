import type { ColorInCSSFormat } from '../types'
import type { Color } from 'culori'

import { convertToOklch_orThrow, inP3, toP3 } from '../utils/culoriUtils'
import { log } from '../utils/log'
import { healOklch } from '../utils/misc'

export function clampColorToP3(
    //
    colorInCssFormat: ColorInCSSFormat,
): Color | ColorInCSSFormat {
    log('culori > inP3 /// clampColorToSpace')

    // if already in p3, return it as-is
    // 🔶 can return color in `ColorInCSSFormat `
    if (inP3(colorInCssFormat)) return colorInCssFormat

    // otherwise, convert to oklch, then to p3
    let oklch
    if (colorInCssFormat.slice(4) === 'oklch') {
        oklch = colorInCssFormat
    } else {
        oklch = convertToOklch_orThrow(colorInCssFormat)
        log('culori > convertToOklch /// 394')
        oklch = healOklch(oklch)
    }
    // Clamp color to p3 gamut
    log('culori > toGamut(p3)')
    return toP3(oklch)
}
