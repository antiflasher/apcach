import { describe, expect, it } from 'bun:test'
import { crToBg } from '../contrast/crTo'
import { apcachToCss } from '../convert/apcachToCss'
import { apcach } from './apcach'

describe('apcach', () => {
    it('kinda work', () => {
        const apc = apcach(crToBg('#E8E8E8', 60, 'apca'), 0.2, 145)
        const str = apcachToCss(apc, 'oklch')
        expect(str).toBe(`oklch(52.71% 0.2 145)`)
    })
})
