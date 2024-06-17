import { apcach } from './apcach/apcach'
import { maxChroma } from './apcach/maxChroma'
import { crTo, crToBg, crToBgBlack, crToBgWhite, crToFg, crToFgBlack, crToFgWhite } from './contrast/crTo'

// manipulate apcach
import { setHue } from './apcach/setHue'
import { setChroma } from './apcach/setChroma'
import { setContrast } from './apcach/setContrast'

// TODO
import { apcachToCss } from './apcach_conv/apcachToCss'
import { cssToApcach } from './apcach_conv/cssToApcach'
import { calcContrast } from './apcach_conv/calcContrast'
import { inColorSpace } from './to-sort-somewhere/inColorSpace'

export {
    apcach,
    apcachToCss,
    calcContrast,
    crTo,
    crToBg,
    crToBgBlack,
    crToBgWhite,
    crToFg,
    crToFgBlack,
    crToFgWhite,
    cssToApcach,
    inColorSpace,
    maxChroma,
    setChroma,
    setContrast,
    setHue,
}
