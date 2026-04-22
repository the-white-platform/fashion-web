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
import * as migration_20260416_213253 from './20260416_213253'
import * as migration_20260416_231504 from './20260416_231504'
import * as migration_20260417_145410 from './20260417_145410'
import * as migration_20260418_001413_tags_faqs_display_order from './20260418_001413_tags_faqs_display_order'
import * as migration_20260418_133103_company_info_legal_fields from './20260418_133103_company_info_legal_fields'
import * as migration_20260422_101419_vto_cache_hit_field from './20260422_101419_vto_cache_hit_field'
import * as migration_20260422_110925_users_provider_zalo_phone_index from './20260422_110925_users_provider_zalo_phone_index'
import * as migration_20260422_170456_users_otp_fields from './20260422_170456_users_otp_fields'

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
  {
    up: migration_20260416_213253.up,
    down: migration_20260416_213253.down,
    name: '20260416_213253',
  },
  {
    up: migration_20260416_231504.up,
    down: migration_20260416_231504.down,
    name: '20260416_231504',
  },
  {
    up: migration_20260417_145410.up,
    down: migration_20260417_145410.down,
    name: '20260417_145410',
  },
  {
    up: migration_20260418_001413_tags_faqs_display_order.up,
    down: migration_20260418_001413_tags_faqs_display_order.down,
    name: '20260418_001413_tags_faqs_display_order',
  },
  {
    up: migration_20260418_133103_company_info_legal_fields.up,
    down: migration_20260418_133103_company_info_legal_fields.down,
    name: '20260418_133103_company_info_legal_fields',
  },
  {
    up: migration_20260422_101419_vto_cache_hit_field.up,
    down: migration_20260422_101419_vto_cache_hit_field.down,
    name: '20260422_101419_vto_cache_hit_field',
  },
  {
    up: migration_20260422_110925_users_provider_zalo_phone_index.up,
    down: migration_20260422_110925_users_provider_zalo_phone_index.down,
    name: '20260422_110925_users_provider_zalo_phone_index',
  },
  {
    up: migration_20260422_170456_users_otp_fields.up,
    down: migration_20260422_170456_users_otp_fields.down,
    name: '20260422_170456_users_otp_fields',
  },
]
