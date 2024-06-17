import type { ColorSpace, ColorInCSSFormat, ContrastModel } from '../types'
import { calcContrastFromPreparedColors } from '../calc/calcContrastFromPreparedColors'
import { clampColorToSpace } from '../clamp/clampColorToSpace'
import { blendCompColors } from '../utils/misc'
import { colorToComps } from '../to-sort-somewhere/colorToComps'

export function calcContrast(
    fgColor: ColorInCSSFormat,
    bgColor: ColorInCSSFormat,
    contrastModel: ContrastModel = 'apca',
    colorSpace: ColorSpace = 'p3',
) {
    // Background color
    let bgColorClamped = clampColorToSpace(bgColor, colorSpace)
    let bgColorComps = colorToComps(bgColorClamped, contrastModel, colorSpace)

    // Foreground color
    let fgColorClamped = clampColorToSpace(fgColor, colorSpace)
    let fgColorComps = colorToComps(fgColorClamped, contrastModel, colorSpace)
    fgColorComps = blendCompColors(fgColorComps, bgColorComps)

    // Caclulate contrast
    return Math.abs(calcContrastFromPreparedColors(fgColorComps, bgColorComps, contrastModel, colorSpace))
}
