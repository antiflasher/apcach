import type { ColorSpace, ColorInCSSFormat } from '../types'

import { clampChroma, type Color } from 'culori'
import { convertToOklch_orThrow, inP3, inSrgb, toP3 } from './culoriUtils'
import { log } from './log'
import { healOklch } from './misc'
import { ASSERT_EXAUSTED } from './assert'

// ----------------------------------------------------------------------

export function clampColorToSpace(
    //
    colorInCssFormat: ColorInCSSFormat,
    colorSpace: ColorSpace,
): Color {
    if (colorSpace === 'p3') return clampColorToP3(colorInCssFormat)
    if (colorSpace === 'rgb') return clampColorToSRGB(colorInCssFormat)

    return ASSERT_EXAUSTED(colorSpace, 'unknown colorSpace')
}

function clampColorToP3(
    //
    colorInCssFormat: ColorInCSSFormat,
): Color {
    log('culori > inP3 /// clampColorToSpace')
    // if already in p3, return
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

function clampColorToSRGB(
    //
    colorInCssFormat: ColorInCSSFormat,
): Color {
    log('culori > inSrgb /// clampColorToSpace')
    if (inSrgb(colorInCssFormat)) return colorInCssFormat

    let oklch = convertToOklch_orThrow(colorInCssFormat)
    log('culori > convertToOklch /// 407')

    oklch = clampChroma(oklch, 'oklch')
    log('culori > clampChroma /// 409')
    return oklch
}
