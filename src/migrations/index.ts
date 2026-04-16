import * as migration_20260415_113943_initial from './20260415_113943_initial'
import * as migration_20260416_081243_feature_highlights from './20260416_081243_feature_highlights'
import * as migration_20260416_090220_hot_tag_filter from './20260416_090220_hot_tag_filter'
import * as migration_20260416_091050_vto_generations from './20260416_091050_vto_generations'
import * as migration_20260416_092317_vto_cache_fields from './20260416_092317_vto_cache_fields'
import * as migration_20260416_093233_vto_provider_field from './20260416_093233_vto_provider_field'
import * as migration_20260416_114044_order_email_optional from './20260416_114044_order_email_optional'
import * as migration_20260416_121609_chat_context_global from './20260416_121609_chat_context_global'
import * as migration_20260416_122610_chat_context_site_features from './20260416_122610_chat_context_site_features'
import * as migration_20260416_133436_drop_footer_nav_items from './20260416_133436_drop_footer_nav_items'

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
  {
    up: migration_20260416_092317_vto_cache_fields.up,
    down: migration_20260416_092317_vto_cache_fields.down,
    name: '20260416_092317_vto_cache_fields',
  },
  {
    up: migration_20260416_093233_vto_provider_field.up,
    down: migration_20260416_093233_vto_provider_field.down,
    name: '20260416_093233_vto_provider_field',
  },
  {
    up: migration_20260416_114044_order_email_optional.up,
    down: migration_20260416_114044_order_email_optional.down,
    name: '20260416_114044_order_email_optional',
  },
  {
    up: migration_20260416_121609_chat_context_global.up,
    down: migration_20260416_121609_chat_context_global.down,
    name: '20260416_121609_chat_context_global',
  },
  {
    up: migration_20260416_122610_chat_context_site_features.up,
    down: migration_20260416_122610_chat_context_site_features.down,
    name: '20260416_122610_chat_context_site_features',
  },
  {
    up: migration_20260416_133436_drop_footer_nav_items.up,
    down: migration_20260416_133436_drop_footer_nav_items.down,
    name: '20260416_133436_drop_footer_nav_items',
  },
]
