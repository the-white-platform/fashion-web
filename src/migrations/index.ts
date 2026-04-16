import * as migration_20260415_113943_initial from './20260415_113943_initial'
import * as migration_20260416_081243_feature_highlights from './20260416_081243_feature_highlights'
import * as migration_20260416_090220_hot_tag_filter from './20260416_090220_hot_tag_filter'
import * as migration_20260416_091050_vto_generations from './20260416_091050_vto_generations'

export const migrations = [
  {
    up: migration_20260415_113943_initial.up,
    down: migration_20260415_113943_initial.down,
    name: '20260415_113943_initial',
  },
  {
    up: migration_20260416_081243_feature_highlights.up,
    down: migration_20260416_081243_feature_highlights.down,
    name: '20260416_081243_feature_highlights',
  },
  {
    up: migration_20260416_090220_hot_tag_filter.up,
    down: migration_20260416_090220_hot_tag_filter.down,
    name: '20260416_090220_hot_tag_filter',
  },
  {
    up: migration_20260416_091050_vto_generations.up,
    down: migration_20260416_091050_vto_generations.down,
    name: '20260416_091050_vto_generations',
  },
]
