import * as CSS from 'csstype'
import { Token } from '../css'
import { Configs } from './config'

export const filter: Configs = {
  filter: true,
  backdropFilter: true,
}

export type FilterProps<Y = 'responsive', M = 'colorMode'> = {
  filter?: Token<CSS.Property.Filter, unknown, Y, M>
  backdropFilter?: Token<CSS.Property.BackdropFilter, unknown, Y, M>
}
