import * as migration_20260415_113943_initial from './20260415_113943_initial'

export const migrations = [
  {
    up: migration_20260415_113943_initial.up,
    down: migration_20260415_113943_initial.down,
    name: '20260415_113943_initial',
  },
]
