import { describe, expect, it } from 'bun:test'
import { clampColorToSpace } from './clampColorToSpace'
import { convertToP3, inP3, inSrgb } from '../utils/culoriUtils'
import { formatCss } from 'culori'
import { apcachToCss } from '../apcach_conv/apcachToCss'

describe('apcach', () => {
    it('does something', () => {
        expect(inSrgb('blue')).toBeTrue()
        expect(inP3('blue')).toBeFalse()
        // expect(inP3('p3(oklch 50 50 50)')).toBeTrue()

        expect(clampColorToSpace('blue', 'p3')).toMatchObject({
            mode: 'p3',
            r: 0.00007592220743109613,
            g: 0.0006734071299084247,
            b: 0.9594334619490438,
            alpha: 1,
        })
        expect(clampColorToSpace('blue', 'rgb')).toBe('blue')
    })
})
