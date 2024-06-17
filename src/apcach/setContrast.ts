import type { ContrastConfig } from '../contrast/contrastConfig'
import { Apcach, apcach } from './apcach'
import { type ContrastRatio } from '../types'
import { clipContrast } from '../utils/misc'

export function setContrast(
    //
    colorInApcach: Apcach,
    cr: ContrastRatio | ((cr: number) => number),
) {
    let newContrastConfig: ContrastConfig = colorInApcach.contrastConfig
    if (typeof cr === 'number') {
        newContrastConfig.cr = clipContrast(cr)
    } else if (typeof cr === 'function') {
        let newCr = cr(newContrastConfig.cr)
        newContrastConfig.cr = clipContrast(newCr)
    } else {
        throw new Error('Invalid format of contrast value')
    }
    return apcach(
        newContrastConfig,
        colorInApcach.chroma,
        colorInApcach.hue,
        colorInApcach.alpha,
        colorInApcach.colorSpace,
    )
}
