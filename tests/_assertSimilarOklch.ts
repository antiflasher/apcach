import { expect } from 'bun:test'
import { parse, type Oklch } from 'culori'

export const _assertSimilarOklch = (
    //
    c1_: any,
    c2_: any,
    maxLDigit = 7,
) => {
    const c1 = parse(c1_) as Oklch
    expect(c1.mode).toBe('oklch')

    const c2 = parse(c2_) as Oklch
    expect(c2.mode).toBe('oklch')

    expect(c1.alpha).toBe(c2.alpha!)
    expect(c1.l.toFixed(maxLDigit)).toBe(c2.l!.toFixed(maxLDigit))
    expect(c1.c).toBe(c2.c!)
    expect(c1.h).toBe(c2.h!)
    // return expect(parse(c1_)).toMatchObject(parse(c2_))
    // exact conparaison
    // return expect(c1_).toBe(c2_)
}
