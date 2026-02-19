import * as migration_20260111_185517_localization from './20260111_185517_localization'
import * as migration_20260111_190957_homepage_localization from './20260111_190957_homepage_localization'
import * as migration_20260111_200215_orders_and_inventory from './20260111_200215_orders_and_inventory'
import * as migration_20260211_000000_bootstrap_essential_data from './20260211_000000_bootstrap_essential_data'
import * as migration_20260219_120620_init_addresses from './20260219_120620_init_addresses'

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
  {
    up: migration_20260211_000000_bootstrap_essential_data.up,
    down: migration_20260211_000000_bootstrap_essential_data.down,
    name: '20260211_000000_bootstrap_essential_data',
  },
  {
    up: migration_20260219_120620_init_addresses.up,
    down: migration_20260219_120620_init_addresses.down,
    name: '20260219_120620_init_addresses',
  },
]
