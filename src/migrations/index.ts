import * as migration_20260111_185517_localization from './20260111_185517_localization'
import * as migration_20260111_190957_homepage_localization from './20260111_190957_homepage_localization'
import * as migration_20260111_200215_orders_and_inventory from './20260111_200215_orders_and_inventory'

export const migrations = [
  {
    up: migration_20260111_185517_localization.up,
    down: migration_20260111_185517_localization.down,
    name: '20260111_185517_localization',
  },
  {
    up: migration_20260111_190957_homepage_localization.up,
    down: migration_20260111_190957_homepage_localization.down,
    name: '20260111_190957_homepage_localization',
  },
  {
    up: migration_20260111_200215_orders_and_inventory.up,
    down: migration_20260111_200215_orders_and_inventory.down,
    name: '20260111_200215_orders_and_inventory',
  },
]
