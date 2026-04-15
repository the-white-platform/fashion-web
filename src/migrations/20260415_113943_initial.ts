import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('vi', 'en');
  CREATE TYPE "public"."enum_pages_hero_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_hero_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_pages_blocks_cta_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_cta_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_pages_blocks_content_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
  CREATE TYPE "public"."enum_pages_blocks_content_columns_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_content_columns_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_pages_blocks_media_block_position" AS ENUM('default', 'fullscreen');
  CREATE TYPE "public"."enum_pages_blocks_archive_populate_by" AS ENUM('collection', 'selection');
  CREATE TYPE "public"."enum_pages_blocks_archive_relation_to" AS ENUM('posts');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_pages_hero_type" AS ENUM('none', 'highImpact', 'mediumImpact', 'lowImpact');
  CREATE TYPE "public"."enum__pages_v_version_hero_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_version_hero_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__pages_v_blocks_content_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_content_columns_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_content_columns_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__pages_v_blocks_media_block_position" AS ENUM('default', 'fullscreen');
  CREATE TYPE "public"."enum__pages_v_blocks_archive_populate_by" AS ENUM('collection', 'selection');
  CREATE TYPE "public"."enum__pages_v_blocks_archive_relation_to" AS ENUM('posts');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_published_locale" AS ENUM('vi', 'en');
  CREATE TYPE "public"."enum__pages_v_version_hero_type" AS ENUM('none', 'highImpact', 'mediumImpact', 'lowImpact');
  CREATE TYPE "public"."enum_posts_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__posts_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__posts_v_published_locale" AS ENUM('vi', 'en');
  CREATE TYPE "public"."enum_users_payment_methods_type" AS ENUM('cod', 'bank_transfer', 'momo', 'vnpay');
  CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'editor', 'staff', 'customer');
  CREATE TYPE "public"."enum_users_provider" AS ENUM('local', 'google', 'facebook');
  CREATE TYPE "public"."enum_products_color_variants_size_inventory_size" AS ENUM('XS', 'S', 'M', 'L', 'XL', '2X', '39', '40', '41', '42', '43', '44', '45');
  CREATE TYPE "public"."enum_products_sizes" AS ENUM('XS', 'S', 'M', 'L', 'XL', '2X', '39', '40', '41', '42', '43', '44', '45');
  CREATE TYPE "public"."enum_products_tag" AS ENUM('MỚI', 'BÁN CHẠY', 'GIẢM 20%', 'GIẢM 30%', 'GIẢM 50%', 'HOT');
  CREATE TYPE "public"."enum_products_stock_status" AS ENUM('in_stock', 'low_stock', 'out_of_stock');
  CREATE TYPE "public"."enum_reviews_fit" AS ENUM('runs_small', 'true_to_size', 'runs_large');
  CREATE TYPE "public"."enum_reviews_moderation_status" AS ENUM('pending', 'approved', 'rejected');
  CREATE TYPE "public"."enum_orders_activity_log_action" AS ENUM('created', 'status_change', 'payment_update', 'note', 'return_requested', 'refund');
  CREATE TYPE "public"."enum_orders_status" AS ENUM('pending', 'confirmed', 'processing', 'shipping', 'delivered', 'cancelled', 'refunded');
  CREATE TYPE "public"."enum_orders_payment_method" AS ENUM('cod', 'bank_transfer', 'qr_code', 'vnpay', 'stripe', 'momo');
  CREATE TYPE "public"."enum_orders_payment_payment_status" AS ENUM('pending', 'paid', 'failed', 'refunded');
  CREATE TYPE "public"."enum_orders_return_request_return_status" AS ENUM('none', 'requested', 'approved', 'rejected', 'received', 'refunded');
  CREATE TYPE "public"."enum_coupons_type" AS ENUM('percentage', 'fixed', 'shipping');
  CREATE TYPE "public"."enum_stock_movements_type" AS ENUM('sale', 'cancellation', 'return', 'restock', 'adjustment');
  CREATE TYPE "public"."enum_notifications_type" AS ENUM('new_order', 'order_status_change', 'low_stock', 'out_of_stock', 'return_request', 'new_user', 'new_form_submission');
  CREATE TYPE "public"."enum_newsletter_subscribers_status" AS ENUM('active', 'unsubscribed', 'bounced');
  CREATE TYPE "public"."enum_newsletter_subscribers_source" AS ENUM('footer_form', 'checkout', 'manual');
  CREATE TYPE "public"."enum_newsletter_campaigns_status" AS ENUM('draft', 'sending', 'sent', 'failed');
  CREATE TYPE "public"."enum_newsletter_campaigns_target_audience" AS ENUM('all_active', 'custom_segment');
  CREATE TYPE "public"."enum_chat_conversations_status" AS ENUM('active', 'closed', 'admin_takeover');
  CREATE TYPE "public"."enum_chat_conversations_channel" AS ENUM('web', 'zalo');
  CREATE TYPE "public"."enum_chat_messages_role" AS ENUM('user', 'assistant', 'admin');
  CREATE TYPE "public"."enum_chat_messages_channel" AS ENUM('web', 'zalo');
  CREATE TYPE "public"."enum_loyalty_accounts_tier" AS ENUM('bronze', 'silver', 'gold', 'platinum');
  CREATE TYPE "public"."enum_loyalty_transactions_type" AS ENUM('earn_purchase', 'earn_review', 'earn_referral', 'redeem', 'expire', 'adjustment');
  CREATE TYPE "public"."enum_referrals_status" AS ENUM('pending', 'completed', 'expired');
  CREATE TYPE "public"."enum_referrals_referrer_reward" AS ENUM('pending', 'credited');
  CREATE TYPE "public"."enum_referrals_referee_reward" AS ENUM('pending', 'credited');
  CREATE TYPE "public"."enum_redirects_to_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_forms_confirmation_type" AS ENUM('message', 'redirect');
  CREATE TYPE "public"."enum_header_nav_items_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_footer_nav_items_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_homepage_quick_filters_filter_type" AS ENUM('all', 'category', 'tag');
  CREATE TYPE "public"."enum_homepage_quick_filters_tag_filter" AS ENUM('sale', 'new', 'bestseller');
  CREATE TABLE "pages_hero_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_hero_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_pages_hero_links_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "pages_blocks_cta_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_blocks_cta_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_pages_blocks_cta_links_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "pages_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"rich_text" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_content_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"size" "enum_pages_blocks_content_columns_size" DEFAULT 'oneThird',
  	"rich_text" jsonb,
  	"enable_link" boolean,
  	"link_type" "enum_pages_blocks_content_columns_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_pages_blocks_content_columns_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "pages_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_media_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"position" "enum_pages_blocks_media_block_position" DEFAULT 'default',
  	"media_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_archive" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"intro_content" jsonb,
  	"populate_by" "enum_pages_blocks_archive_populate_by" DEFAULT 'collection',
  	"relation_to" "enum_pages_blocks_archive_relation_to" DEFAULT 'posts',
  	"limit" numeric DEFAULT 10,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_form_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"form_id" integer,
  	"enable_intro" boolean,
  	"intro_content" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"published_at" timestamp(3) with time zone,
  	"slug" varchar,
  	"slug_lock" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "pages_locales" (
  	"hero_type" "enum_pages_hero_type" DEFAULT 'lowImpact',
  	"hero_rich_text" jsonb,
  	"hero_media_id" integer,
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "pages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"locale" "_locales",
  	"pages_id" integer,
  	"categories_id" integer,
  	"posts_id" integer
  );
  
  CREATE TABLE "_pages_v_version_hero_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__pages_v_version_hero_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__pages_v_version_hero_links_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cta_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__pages_v_blocks_cta_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__pages_v_blocks_cta_links_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"rich_text" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_content_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"size" "enum__pages_v_blocks_content_columns_size" DEFAULT 'oneThird',
  	"rich_text" jsonb,
  	"enable_link" boolean,
  	"link_type" "enum__pages_v_blocks_content_columns_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__pages_v_blocks_content_columns_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_media_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"position" "enum__pages_v_blocks_media_block_position" DEFAULT 'default',
  	"media_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_archive" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"intro_content" jsonb,
  	"populate_by" "enum__pages_v_blocks_archive_populate_by" DEFAULT 'collection',
  	"relation_to" "enum__pages_v_blocks_archive_relation_to" DEFAULT 'posts',
  	"limit" numeric DEFAULT 10,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_form_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"form_id" integer,
  	"enable_intro" boolean,
  	"intro_content" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_published_at" timestamp(3) with time zone,
  	"version_slug" varchar,
  	"version_slug_lock" boolean DEFAULT true,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__pages_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_pages_v_locales" (
  	"version_hero_type" "enum__pages_v_version_hero_type" DEFAULT 'lowImpact',
  	"version_hero_rich_text" jsonb,
  	"version_hero_media_id" integer,
  	"version_meta_title" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"locale" "_locales",
  	"pages_id" integer,
  	"categories_id" integer,
  	"posts_id" integer
  );
  
  CREATE TABLE "posts_populated_authors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar
  );
  
  CREATE TABLE "posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"published_at" timestamp(3) with time zone,
  	"slug" varchar,
  	"slug_lock" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_posts_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "posts_locales" (
  	"title" varchar,
  	"content" jsonb,
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "posts_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"posts_id" integer,
  	"categories_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "_posts_v_version_populated_authors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"name" varchar
  );
  
  CREATE TABLE "_posts_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_published_at" timestamp(3) with time zone,
  	"version_slug" varchar,
  	"version_slug_lock" boolean DEFAULT true,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__posts_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__posts_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_posts_v_locales" (
  	"version_title" varchar,
  	"version_content" jsonb,
  	"version_meta_title" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_posts_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"posts_id" integer,
  	"categories_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"caption" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_square_url" varchar,
  	"sizes_square_width" numeric,
  	"sizes_square_height" numeric,
  	"sizes_square_mime_type" varchar,
  	"sizes_square_filesize" numeric,
  	"sizes_square_filename" varchar,
  	"sizes_small_url" varchar,
  	"sizes_small_width" numeric,
  	"sizes_small_height" numeric,
  	"sizes_small_mime_type" varchar,
  	"sizes_small_filesize" numeric,
  	"sizes_small_filename" varchar,
  	"sizes_medium_url" varchar,
  	"sizes_medium_width" numeric,
  	"sizes_medium_height" numeric,
  	"sizes_medium_mime_type" varchar,
  	"sizes_medium_filesize" numeric,
  	"sizes_medium_filename" varchar,
  	"sizes_large_url" varchar,
  	"sizes_large_width" numeric,
  	"sizes_large_height" numeric,
  	"sizes_large_mime_type" varchar,
  	"sizes_large_filesize" numeric,
  	"sizes_large_filename" varchar,
  	"sizes_xlarge_url" varchar,
  	"sizes_xlarge_width" numeric,
  	"sizes_xlarge_height" numeric,
  	"sizes_xlarge_mime_type" varchar,
  	"sizes_xlarge_filesize" numeric,
  	"sizes_xlarge_filename" varchar
  );
  
  CREATE TABLE "media_locales" (
  	"alt" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "categories_breadcrumbs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"doc_id" integer,
  	"url" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "categories_locales" (
  	"title" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "users_cart" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"product_id" integer,
  	"variant" varchar,
  	"size" varchar,
  	"quantity" numeric DEFAULT 1
  );
  
  CREATE TABLE "users_wishlist" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"product_id" integer
  );
  
  CREATE TABLE "users_shipping_addresses" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"phone" varchar NOT NULL,
  	"address" varchar NOT NULL,
  	"city_id" integer NOT NULL,
  	"district_id" integer NOT NULL,
  	"ward_id" integer,
  	"is_default" boolean
  );
  
  CREATE TABLE "users_payment_methods" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_users_payment_methods_type",
  	"card_number" varchar,
  	"is_default" boolean
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"role" "enum_users_role" DEFAULT 'customer' NOT NULL,
  	"name" varchar,
  	"phone" varchar,
  	"sub" varchar,
  	"provider" "enum_users_provider" DEFAULT 'local',
  	"image_url" varchar,
  	"email_verified" boolean DEFAULT false,
  	"email_verify_token" varchar,
  	"referral_code" varchar,
  	"zalo_user_id" varchar,
  	"zalo_notifications" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "products_color_variants_size_inventory" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"size" "enum_products_color_variants_size_inventory_size" NOT NULL,
  	"stock" numeric DEFAULT 0 NOT NULL,
  	"low_stock_threshold" numeric DEFAULT 5
  );
  
  CREATE TABLE "products_color_variants" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"color_hex" varchar NOT NULL
  );
  
  CREATE TABLE "products_color_variants_locales" (
  	"color" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "products_colors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"hex" varchar NOT NULL
  );
  
  CREATE TABLE "products_sizes" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_products_sizes",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "products_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"feature" varchar NOT NULL
  );
  
  CREATE TABLE "products" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"price" numeric NOT NULL,
  	"original_price" numeric,
  	"tag" "enum_products_tag",
  	"in_stock" boolean DEFAULT true,
  	"stock_status" "enum_products_stock_status" DEFAULT 'in_stock',
  	"featured" boolean DEFAULT false,
  	"average_rating" numeric DEFAULT 0,
  	"review_count" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "products_locales" (
  	"name" varchar NOT NULL,
  	"description" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "products_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer,
  	"media_id" integer
  );
  
  CREATE TABLE "reviews" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"product_id" integer NOT NULL,
  	"user_id" integer NOT NULL,
  	"order_id" integer,
  	"rating" numeric NOT NULL,
  	"title" varchar,
  	"comment" varchar NOT NULL,
  	"fit" "enum_reviews_fit",
  	"size_ordered" varchar,
  	"height" numeric,
  	"weight" numeric,
  	"verified" boolean DEFAULT false,
  	"moderation_status" "enum_reviews_moderation_status" DEFAULT 'pending',
  	"helpful_count" numeric DEFAULT 0,
  	"admin_reply" varchar,
  	"admin_reply_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "reviews_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "orders_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"product_id" integer NOT NULL,
  	"product_name" varchar NOT NULL,
  	"variant" varchar,
  	"size" varchar NOT NULL,
  	"quantity" numeric DEFAULT 1 NOT NULL,
  	"unit_price" numeric NOT NULL,
  	"line_total" numeric NOT NULL,
  	"product_image" varchar
  );
  
  CREATE TABLE "orders_return_request_return_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"product_id" integer,
  	"variant" varchar,
  	"size" varchar,
  	"quantity" numeric DEFAULT 1
  );
  
  CREATE TABLE "orders_activity_log" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"action" "enum_orders_activity_log_action" NOT NULL,
  	"timestamp" timestamp(3) with time zone NOT NULL,
  	"from_value" varchar,
  	"to_value" varchar,
  	"performed_by_id" integer,
  	"note" varchar
  );
  
  CREATE TABLE "orders" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order_number" varchar NOT NULL,
  	"status" "enum_orders_status" DEFAULT 'pending' NOT NULL,
  	"customer_info_customer_name" varchar NOT NULL,
  	"customer_info_customer_email" varchar NOT NULL,
  	"customer_info_customer_phone" varchar NOT NULL,
  	"customer_info_user_id" integer,
  	"shipping_address_address" varchar NOT NULL,
  	"shipping_address_ward_id" integer,
  	"shipping_address_district_id" integer NOT NULL,
  	"shipping_address_city_id" integer NOT NULL,
  	"shipping_address_postal_code" varchar,
  	"shipping_address_notes" varchar,
  	"payment_method" "enum_orders_payment_method" NOT NULL,
  	"payment_payment_status" "enum_orders_payment_payment_status" DEFAULT 'pending' NOT NULL,
  	"payment_transaction_id" varchar,
  	"payment_paid_at" timestamp(3) with time zone,
  	"totals_subtotal" numeric NOT NULL,
  	"totals_shipping_fee" numeric DEFAULT 0,
  	"totals_discount" numeric DEFAULT 0,
  	"totals_total" numeric NOT NULL,
  	"totals_coupon_code" varchar,
  	"totals_points_redeemed" numeric DEFAULT 0,
  	"totals_points_discount" numeric DEFAULT 0,
  	"admin_notes" varchar,
  	"fulfillment_carrier" varchar,
  	"fulfillment_tracking_number" varchar,
  	"fulfillment_shipped_at" timestamp(3) with time zone,
  	"fulfillment_delivered_at" timestamp(3) with time zone,
  	"return_request_return_status" "enum_orders_return_request_return_status" DEFAULT 'none',
  	"return_request_return_reason" varchar,
  	"return_request_refund_amount" numeric,
  	"return_request_return_requested_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "coupons" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"code" varchar NOT NULL,
  	"type" "enum_coupons_type" NOT NULL,
  	"value" numeric NOT NULL,
  	"min_order_amount" numeric DEFAULT 0,
  	"max_discount" numeric,
  	"usage_limit" numeric DEFAULT 0,
  	"usage_count" numeric DEFAULT 0,
  	"valid_from" timestamp(3) with time zone,
  	"valid_until" timestamp(3) with time zone,
  	"active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "coupons_locales" (
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "size_charts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"category_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_medium_url" varchar,
  	"sizes_medium_width" numeric,
  	"sizes_medium_height" numeric,
  	"sizes_medium_mime_type" varchar,
  	"sizes_medium_filesize" numeric,
  	"sizes_medium_filename" varchar,
  	"sizes_large_url" varchar,
  	"sizes_large_width" numeric,
  	"sizes_large_height" numeric,
  	"sizes_large_mime_type" varchar,
  	"sizes_large_filesize" numeric,
  	"sizes_large_filename" varchar
  );
  
  CREATE TABLE "size_charts_locales" (
  	"title" varchar NOT NULL,
  	"alt" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "stock_movements" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"product_id" integer NOT NULL,
  	"variant" varchar NOT NULL,
  	"size" varchar NOT NULL,
  	"type" "enum_stock_movements_type" NOT NULL,
  	"quantity" numeric NOT NULL,
  	"previous_stock" numeric NOT NULL,
  	"new_stock" numeric NOT NULL,
  	"order_id" integer,
  	"performed_by_id" integer,
  	"note" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "provinces" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"code" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "districts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"code" varchar NOT NULL,
  	"province_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "wards" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"code" varchar NOT NULL,
  	"district_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "notifications" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"recipient_id" integer NOT NULL,
  	"type" "enum_notifications_type" NOT NULL,
  	"title" varchar NOT NULL,
  	"message" varchar NOT NULL,
  	"link" varchar,
  	"read" boolean DEFAULT false,
  	"read_at" timestamp(3) with time zone,
  	"metadata" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "notification_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"in_app_new_order" boolean DEFAULT true,
  	"in_app_low_stock" boolean DEFAULT true,
  	"in_app_return_request" boolean DEFAULT true,
  	"in_app_new_user" boolean DEFAULT true,
  	"email_new_order" boolean DEFAULT true,
  	"email_low_stock" boolean DEFAULT true,
  	"email_return_request" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "push_subscriptions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"endpoint" varchar NOT NULL,
  	"keys_p256dh" varchar NOT NULL,
  	"keys_auth" varchar NOT NULL,
  	"user_agent" varchar,
  	"active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "newsletter_subscribers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL,
  	"name" varchar,
  	"status" "enum_newsletter_subscribers_status" DEFAULT 'active' NOT NULL,
  	"subscribed_at" timestamp(3) with time zone,
  	"unsubscribed_at" timestamp(3) with time zone,
  	"source" "enum_newsletter_subscribers_source",
  	"unsubscribe_token" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "newsletter_campaigns" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"status" "enum_newsletter_campaigns_status" DEFAULT 'draft' NOT NULL,
  	"sent_at" timestamp(3) with time zone,
  	"recipient_count" numeric,
  	"target_audience" "enum_newsletter_campaigns_target_audience" DEFAULT 'all_active',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "newsletter_campaigns_locales" (
  	"subject" varchar NOT NULL,
  	"content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "chat_conversations_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag" varchar
  );
  
  CREATE TABLE "chat_conversations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer,
  	"guest_id" varchar,
  	"status" "enum_chat_conversations_status" DEFAULT 'active' NOT NULL,
  	"started_at" timestamp(3) with time zone,
  	"last_message_at" timestamp(3) with time zone,
  	"message_count" numeric DEFAULT 0,
  	"summary" varchar,
  	"assigned_to_id" integer,
  	"channel" "enum_chat_conversations_channel" DEFAULT 'web' NOT NULL,
  	"zalo_user_id" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "chat_messages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"conversation_id" integer NOT NULL,
  	"role" "enum_chat_messages_role" NOT NULL,
  	"content" varchar,
  	"sender_name" varchar,
  	"metadata" jsonb,
  	"channel" "enum_chat_messages_channel",
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "loyalty_accounts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"points" numeric DEFAULT 0 NOT NULL,
  	"lifetime_points" numeric DEFAULT 0 NOT NULL,
  	"tier" "enum_loyalty_accounts_tier" DEFAULT 'bronze' NOT NULL,
  	"tier_updated_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "loyalty_transactions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"type" "enum_loyalty_transactions_type" NOT NULL,
  	"points" numeric NOT NULL,
  	"balance" numeric NOT NULL,
  	"description" varchar,
  	"order_id" integer,
  	"review_id" integer,
  	"expires_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "referrals" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"referrer_id" integer NOT NULL,
  	"referee_id" integer,
  	"referral_code" varchar NOT NULL,
  	"status" "enum_referrals_status" DEFAULT 'pending' NOT NULL,
  	"referrer_reward" "enum_referrals_referrer_reward" DEFAULT 'pending',
  	"referee_reward" "enum_referrals_referee_reward" DEFAULT 'pending',
  	"completed_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "redirects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"from" varchar NOT NULL,
  	"to_type" "enum_redirects_to_type" DEFAULT 'reference',
  	"to_url" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "redirects_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer
  );
  
  CREATE TABLE "forms_blocks_checkbox" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"width" numeric,
  	"required" boolean,
  	"default_value" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_checkbox_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "forms_blocks_country" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"width" numeric,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_country_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "forms_blocks_email" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"width" numeric,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_email_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "forms_blocks_message" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_message_locales" (
  	"message" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "forms_blocks_number" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"width" numeric,
  	"default_value" numeric,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_number_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "forms_blocks_select_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "forms_blocks_select_options_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "forms_blocks_select" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"width" numeric,
  	"placeholder" varchar,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_select_locales" (
  	"label" varchar,
  	"default_value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "forms_blocks_state" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"width" numeric,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_state_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "forms_blocks_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"width" numeric,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_text_locales" (
  	"label" varchar,
  	"default_value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "forms_blocks_textarea" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"width" numeric,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_textarea_locales" (
  	"label" varchar,
  	"default_value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "forms_emails" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"email_to" varchar,
  	"cc" varchar,
  	"bcc" varchar,
  	"reply_to" varchar,
  	"email_from" varchar
  );
  
  CREATE TABLE "forms_emails_locales" (
  	"subject" varchar DEFAULT 'You''ve received a new message.' NOT NULL,
  	"message" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "forms" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"confirmation_type" "enum_forms_confirmation_type" DEFAULT 'message',
  	"redirect_url" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "forms_locales" (
  	"submit_button_label" varchar,
  	"confirmation_message" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "form_submissions_submission_data" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"field" varchar NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "form_submissions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"form_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "search_categories" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"relation_to" varchar,
  	"title" varchar
  );
  
  CREATE TABLE "search" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"priority" numeric,
  	"slug" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "search_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "search_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"posts_id" integer
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer,
  	"media_id" integer,
  	"categories_id" integer,
  	"users_id" integer,
  	"products_id" integer,
  	"reviews_id" integer,
  	"orders_id" integer,
  	"coupons_id" integer,
  	"size_charts_id" integer,
  	"stock_movements_id" integer,
  	"provinces_id" integer,
  	"districts_id" integer,
  	"wards_id" integer,
  	"notifications_id" integer,
  	"notification_preferences_id" integer,
  	"push_subscriptions_id" integer,
  	"newsletter_subscribers_id" integer,
  	"newsletter_campaigns_id" integer,
  	"chat_conversations_id" integer,
  	"chat_messages_id" integer,
  	"loyalty_accounts_id" integer,
  	"loyalty_transactions_id" integer,
  	"referrals_id" integer,
  	"redirects_id" integer,
  	"forms_id" integer,
  	"form_submissions_id" integer,
  	"search_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "header_nav_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_header_nav_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar NOT NULL
  );
  
  CREATE TABLE "header" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "header_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer
  );
  
  CREATE TABLE "footer_nav_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_footer_nav_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar NOT NULL
  );
  
  CREATE TABLE "footer" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "footer_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer
  );
  
  CREATE TABLE "homepage_carousel_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"cta_link" varchar DEFAULT '/products' NOT NULL,
  	"background_image_id" integer
  );
  
  CREATE TABLE "homepage_carousel_slides_locales" (
  	"title" varchar NOT NULL,
  	"subtitle" varchar NOT NULL,
  	"cta_text" varchar DEFAULT 'Explore Now' NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "homepage_quick_filters" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"filter_type" "enum_homepage_quick_filters_filter_type" DEFAULT 'all' NOT NULL,
  	"category_id" integer,
  	"tag_filter" "enum_homepage_quick_filters_tag_filter"
  );
  
  CREATE TABLE "homepage_quick_filters_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "homepage" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "homepage_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer
  );
  
  CREATE TABLE "payment_methods" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"cod_enabled" boolean DEFAULT true,
  	"cod_icon_id" integer,
  	"cod_sort_order" numeric DEFAULT 1,
  	"bank_transfer_enabled" boolean DEFAULT true,
  	"bank_transfer_icon_id" integer,
  	"bank_transfer_bank_name" varchar,
  	"bank_transfer_account_number" varchar,
  	"bank_transfer_account_name" varchar,
  	"bank_transfer_branch" varchar,
  	"bank_transfer_sort_order" numeric DEFAULT 2,
  	"qr_code_enabled" boolean DEFAULT true,
  	"qr_code_icon_id" integer,
  	"qr_code_qr_image_id" integer,
  	"qr_code_sort_order" numeric DEFAULT 3,
  	"vnpay_enabled" boolean DEFAULT false,
  	"vnpay_icon_id" integer,
  	"vnpay_sort_order" numeric DEFAULT 4,
  	"stripe_enabled" boolean DEFAULT false,
  	"stripe_icon_id" integer,
  	"stripe_sort_order" numeric DEFAULT 5,
  	"momo_enabled" boolean DEFAULT false,
  	"momo_icon_id" integer,
  	"momo_sort_order" numeric DEFAULT 6,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "payment_methods_locales" (
  	"cod_name" varchar DEFAULT 'Thanh toán khi nhận hàng',
  	"cod_description" varchar,
  	"bank_transfer_name" varchar DEFAULT 'Chuyển khoản ngân hàng',
  	"bank_transfer_description" varchar,
  	"qr_code_name" varchar DEFAULT 'Thanh toán bằng mã QR',
  	"qr_code_description" varchar,
  	"qr_code_instructions" jsonb,
  	"vnpay_name" varchar DEFAULT 'VNPay',
  	"vnpay_description" varchar,
  	"stripe_name" varchar DEFAULT 'Credit/Debit Card',
  	"stripe_description" varchar,
  	"momo_name" varchar DEFAULT 'Ví MoMo',
  	"momo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "pages_hero_links" ADD CONSTRAINT "pages_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta_links" ADD CONSTRAINT "pages_blocks_cta_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta" ADD CONSTRAINT "pages_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_content_columns" ADD CONSTRAINT "pages_blocks_content_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_content" ADD CONSTRAINT "pages_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_media_block" ADD CONSTRAINT "pages_blocks_media_block_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_media_block" ADD CONSTRAINT "pages_blocks_media_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_archive" ADD CONSTRAINT "pages_blocks_archive_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_form_block" ADD CONSTRAINT "pages_blocks_form_block_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_form_block" ADD CONSTRAINT "pages_blocks_form_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_hero_media_id_media_id_fk" FOREIGN KEY ("hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_hero_links" ADD CONSTRAINT "_pages_v_version_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta_links" ADD CONSTRAINT "_pages_v_blocks_cta_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta" ADD CONSTRAINT "_pages_v_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_content_columns" ADD CONSTRAINT "_pages_v_blocks_content_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_content" ADD CONSTRAINT "_pages_v_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_media_block" ADD CONSTRAINT "_pages_v_blocks_media_block_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_media_block" ADD CONSTRAINT "_pages_v_blocks_media_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_archive" ADD CONSTRAINT "_pages_v_blocks_archive_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_form_block" ADD CONSTRAINT "_pages_v_blocks_form_block_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_form_block" ADD CONSTRAINT "_pages_v_blocks_form_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_version_hero_media_id_media_id_fk" FOREIGN KEY ("version_hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_populated_authors" ADD CONSTRAINT "posts_populated_authors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_locales" ADD CONSTRAINT "posts_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_locales" ADD CONSTRAINT "posts_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_version_populated_authors" ADD CONSTRAINT "_posts_v_version_populated_authors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_parent_id_posts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_locales" ADD CONSTRAINT "_posts_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_locales" ADD CONSTRAINT "_posts_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories_breadcrumbs" ADD CONSTRAINT "categories_breadcrumbs_doc_id_categories_id_fk" FOREIGN KEY ("doc_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categories_breadcrumbs" ADD CONSTRAINT "categories_breadcrumbs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categories_locales" ADD CONSTRAINT "categories_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_cart" ADD CONSTRAINT "users_cart_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_cart" ADD CONSTRAINT "users_cart_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_wishlist" ADD CONSTRAINT "users_wishlist_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_wishlist" ADD CONSTRAINT "users_wishlist_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_shipping_addresses" ADD CONSTRAINT "users_shipping_addresses_city_id_provinces_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."provinces"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_shipping_addresses" ADD CONSTRAINT "users_shipping_addresses_district_id_districts_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."districts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_shipping_addresses" ADD CONSTRAINT "users_shipping_addresses_ward_id_wards_id_fk" FOREIGN KEY ("ward_id") REFERENCES "public"."wards"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_shipping_addresses" ADD CONSTRAINT "users_shipping_addresses_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_payment_methods" ADD CONSTRAINT "users_payment_methods_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_color_variants_size_inventory" ADD CONSTRAINT "products_color_variants_size_inventory_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products_color_variants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_color_variants" ADD CONSTRAINT "products_color_variants_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_color_variants_locales" ADD CONSTRAINT "products_color_variants_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products_color_variants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_colors" ADD CONSTRAINT "products_colors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_sizes" ADD CONSTRAINT "products_sizes_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_features" ADD CONSTRAINT "products_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_locales" ADD CONSTRAINT "products_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reviews" ADD CONSTRAINT "reviews_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reviews" ADD CONSTRAINT "reviews_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reviews_rels" ADD CONSTRAINT "reviews_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reviews_rels" ADD CONSTRAINT "reviews_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reviews_rels" ADD CONSTRAINT "reviews_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "orders_items" ADD CONSTRAINT "orders_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orders_items" ADD CONSTRAINT "orders_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "orders_return_request_return_items" ADD CONSTRAINT "orders_return_request_return_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orders_return_request_return_items" ADD CONSTRAINT "orders_return_request_return_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "orders_activity_log" ADD CONSTRAINT "orders_activity_log_performed_by_id_users_id_fk" FOREIGN KEY ("performed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orders_activity_log" ADD CONSTRAINT "orders_activity_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_info_user_id_users_id_fk" FOREIGN KEY ("customer_info_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orders" ADD CONSTRAINT "orders_shipping_address_ward_id_wards_id_fk" FOREIGN KEY ("shipping_address_ward_id") REFERENCES "public"."wards"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orders" ADD CONSTRAINT "orders_shipping_address_district_id_districts_id_fk" FOREIGN KEY ("shipping_address_district_id") REFERENCES "public"."districts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orders" ADD CONSTRAINT "orders_shipping_address_city_id_provinces_id_fk" FOREIGN KEY ("shipping_address_city_id") REFERENCES "public"."provinces"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "coupons_locales" ADD CONSTRAINT "coupons_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."coupons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "size_charts" ADD CONSTRAINT "size_charts_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "size_charts_locales" ADD CONSTRAINT "size_charts_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."size_charts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_performed_by_id_users_id_fk" FOREIGN KEY ("performed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "districts" ADD CONSTRAINT "districts_province_id_provinces_id_fk" FOREIGN KEY ("province_id") REFERENCES "public"."provinces"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "wards" ADD CONSTRAINT "wards_district_id_districts_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."districts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_id_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "newsletter_campaigns_locales" ADD CONSTRAINT "newsletter_campaigns_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."newsletter_campaigns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "chat_conversations_tags" ADD CONSTRAINT "chat_conversations_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."chat_conversations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "chat_conversations" ADD CONSTRAINT "chat_conversations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "chat_conversations" ADD CONSTRAINT "chat_conversations_assigned_to_id_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_conversation_id_chat_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."chat_conversations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "loyalty_accounts" ADD CONSTRAINT "loyalty_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "loyalty_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "loyalty_transactions_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "loyalty_transactions_review_id_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."reviews"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referrer_id_users_id_fk" FOREIGN KEY ("referrer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referee_id_users_id_fk" FOREIGN KEY ("referee_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_checkbox" ADD CONSTRAINT "forms_blocks_checkbox_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_checkbox_locales" ADD CONSTRAINT "forms_blocks_checkbox_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_checkbox"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_country" ADD CONSTRAINT "forms_blocks_country_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_country_locales" ADD CONSTRAINT "forms_blocks_country_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_country"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_email" ADD CONSTRAINT "forms_blocks_email_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_email_locales" ADD CONSTRAINT "forms_blocks_email_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_email"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_message" ADD CONSTRAINT "forms_blocks_message_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_message_locales" ADD CONSTRAINT "forms_blocks_message_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_message"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_number" ADD CONSTRAINT "forms_blocks_number_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_number_locales" ADD CONSTRAINT "forms_blocks_number_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_number"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_select_options" ADD CONSTRAINT "forms_blocks_select_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_select"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_select_options_locales" ADD CONSTRAINT "forms_blocks_select_options_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_select_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_select" ADD CONSTRAINT "forms_blocks_select_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_select_locales" ADD CONSTRAINT "forms_blocks_select_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_select"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_state" ADD CONSTRAINT "forms_blocks_state_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_state_locales" ADD CONSTRAINT "forms_blocks_state_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_state"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_text" ADD CONSTRAINT "forms_blocks_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_text_locales" ADD CONSTRAINT "forms_blocks_text_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_text"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_textarea" ADD CONSTRAINT "forms_blocks_textarea_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_textarea_locales" ADD CONSTRAINT "forms_blocks_textarea_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_textarea"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_emails" ADD CONSTRAINT "forms_emails_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_emails_locales" ADD CONSTRAINT "forms_emails_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_emails"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_locales" ADD CONSTRAINT "forms_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "form_submissions_submission_data" ADD CONSTRAINT "form_submissions_submission_data_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."form_submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "search_categories" ADD CONSTRAINT "search_categories_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."search"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search" ADD CONSTRAINT "search_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "search_locales" ADD CONSTRAINT "search_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."search"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."search"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_reviews_fk" FOREIGN KEY ("reviews_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_orders_fk" FOREIGN KEY ("orders_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_coupons_fk" FOREIGN KEY ("coupons_id") REFERENCES "public"."coupons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_size_charts_fk" FOREIGN KEY ("size_charts_id") REFERENCES "public"."size_charts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_stock_movements_fk" FOREIGN KEY ("stock_movements_id") REFERENCES "public"."stock_movements"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_provinces_fk" FOREIGN KEY ("provinces_id") REFERENCES "public"."provinces"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_districts_fk" FOREIGN KEY ("districts_id") REFERENCES "public"."districts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_wards_fk" FOREIGN KEY ("wards_id") REFERENCES "public"."wards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_notifications_fk" FOREIGN KEY ("notifications_id") REFERENCES "public"."notifications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_notification_preferences_fk" FOREIGN KEY ("notification_preferences_id") REFERENCES "public"."notification_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_push_subscriptions_fk" FOREIGN KEY ("push_subscriptions_id") REFERENCES "public"."push_subscriptions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_newsletter_subscribers_fk" FOREIGN KEY ("newsletter_subscribers_id") REFERENCES "public"."newsletter_subscribers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_newsletter_campaigns_fk" FOREIGN KEY ("newsletter_campaigns_id") REFERENCES "public"."newsletter_campaigns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_chat_conversations_fk" FOREIGN KEY ("chat_conversations_id") REFERENCES "public"."chat_conversations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_chat_messages_fk" FOREIGN KEY ("chat_messages_id") REFERENCES "public"."chat_messages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_loyalty_accounts_fk" FOREIGN KEY ("loyalty_accounts_id") REFERENCES "public"."loyalty_accounts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_loyalty_transactions_fk" FOREIGN KEY ("loyalty_transactions_id") REFERENCES "public"."loyalty_transactions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_referrals_fk" FOREIGN KEY ("referrals_id") REFERENCES "public"."referrals"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_redirects_fk" FOREIGN KEY ("redirects_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_forms_fk" FOREIGN KEY ("forms_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_form_submissions_fk" FOREIGN KEY ("form_submissions_id") REFERENCES "public"."form_submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_search_fk" FOREIGN KEY ("search_id") REFERENCES "public"."search"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_nav_items" ADD CONSTRAINT "header_nav_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_nav_items" ADD CONSTRAINT "footer_nav_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_carousel_slides" ADD CONSTRAINT "homepage_carousel_slides_background_image_id_media_id_fk" FOREIGN KEY ("background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_carousel_slides" ADD CONSTRAINT "homepage_carousel_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_carousel_slides_locales" ADD CONSTRAINT "homepage_carousel_slides_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_carousel_slides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_quick_filters" ADD CONSTRAINT "homepage_quick_filters_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_quick_filters" ADD CONSTRAINT "homepage_quick_filters_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_quick_filters_locales" ADD CONSTRAINT "homepage_quick_filters_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_quick_filters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_cod_icon_id_media_id_fk" FOREIGN KEY ("cod_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_bank_transfer_icon_id_media_id_fk" FOREIGN KEY ("bank_transfer_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_qr_code_icon_id_media_id_fk" FOREIGN KEY ("qr_code_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_qr_code_qr_image_id_media_id_fk" FOREIGN KEY ("qr_code_qr_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_vnpay_icon_id_media_id_fk" FOREIGN KEY ("vnpay_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_stripe_icon_id_media_id_fk" FOREIGN KEY ("stripe_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_momo_icon_id_media_id_fk" FOREIGN KEY ("momo_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payment_methods_locales" ADD CONSTRAINT "payment_methods_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payment_methods"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_hero_links_order_idx" ON "pages_hero_links" USING btree ("_order");
  CREATE INDEX "pages_hero_links_parent_id_idx" ON "pages_hero_links" USING btree ("_parent_id");
  CREATE INDEX "pages_hero_links_locale_idx" ON "pages_hero_links" USING btree ("_locale");
  CREATE INDEX "pages_blocks_cta_links_order_idx" ON "pages_blocks_cta_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_links_parent_id_idx" ON "pages_blocks_cta_links" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_order_idx" ON "pages_blocks_cta" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_parent_id_idx" ON "pages_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_path_idx" ON "pages_blocks_cta" USING btree ("_path");
  CREATE INDEX "pages_blocks_content_columns_order_idx" ON "pages_blocks_content_columns" USING btree ("_order");
  CREATE INDEX "pages_blocks_content_columns_parent_id_idx" ON "pages_blocks_content_columns" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_content_order_idx" ON "pages_blocks_content" USING btree ("_order");
  CREATE INDEX "pages_blocks_content_parent_id_idx" ON "pages_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_content_path_idx" ON "pages_blocks_content" USING btree ("_path");
  CREATE INDEX "pages_blocks_media_block_order_idx" ON "pages_blocks_media_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_media_block_parent_id_idx" ON "pages_blocks_media_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_media_block_path_idx" ON "pages_blocks_media_block" USING btree ("_path");
  CREATE INDEX "pages_blocks_media_block_media_idx" ON "pages_blocks_media_block" USING btree ("media_id");
  CREATE INDEX "pages_blocks_archive_order_idx" ON "pages_blocks_archive" USING btree ("_order");
  CREATE INDEX "pages_blocks_archive_parent_id_idx" ON "pages_blocks_archive" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_archive_path_idx" ON "pages_blocks_archive" USING btree ("_path");
  CREATE INDEX "pages_blocks_form_block_order_idx" ON "pages_blocks_form_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_form_block_parent_id_idx" ON "pages_blocks_form_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_form_block_path_idx" ON "pages_blocks_form_block" USING btree ("_path");
  CREATE INDEX "pages_blocks_form_block_form_idx" ON "pages_blocks_form_block" USING btree ("form_id");
  CREATE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE INDEX "pages_hero_hero_media_idx" ON "pages_locales" USING btree ("hero_media_id");
  CREATE INDEX "pages_meta_meta_image_idx" ON "pages_locales" USING btree ("meta_image_id","_locale");
  CREATE UNIQUE INDEX "pages_locales_locale_parent_id_unique" ON "pages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_rels_order_idx" ON "pages_rels" USING btree ("order");
  CREATE INDEX "pages_rels_parent_idx" ON "pages_rels" USING btree ("parent_id");
  CREATE INDEX "pages_rels_path_idx" ON "pages_rels" USING btree ("path");
  CREATE INDEX "pages_rels_locale_idx" ON "pages_rels" USING btree ("locale");
  CREATE INDEX "pages_rels_pages_id_idx" ON "pages_rels" USING btree ("pages_id","locale");
  CREATE INDEX "pages_rels_categories_id_idx" ON "pages_rels" USING btree ("categories_id","locale");
  CREATE INDEX "pages_rels_posts_id_idx" ON "pages_rels" USING btree ("posts_id","locale");
  CREATE INDEX "_pages_v_version_hero_links_order_idx" ON "_pages_v_version_hero_links" USING btree ("_order");
  CREATE INDEX "_pages_v_version_hero_links_parent_id_idx" ON "_pages_v_version_hero_links" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_hero_links_locale_idx" ON "_pages_v_version_hero_links" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_cta_links_order_idx" ON "_pages_v_blocks_cta_links" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cta_links_parent_id_idx" ON "_pages_v_blocks_cta_links" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_order_idx" ON "_pages_v_blocks_cta" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cta_parent_id_idx" ON "_pages_v_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_path_idx" ON "_pages_v_blocks_cta" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_content_columns_order_idx" ON "_pages_v_blocks_content_columns" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_content_columns_parent_id_idx" ON "_pages_v_blocks_content_columns" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_content_order_idx" ON "_pages_v_blocks_content" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_content_parent_id_idx" ON "_pages_v_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_content_path_idx" ON "_pages_v_blocks_content" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_media_block_order_idx" ON "_pages_v_blocks_media_block" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_media_block_parent_id_idx" ON "_pages_v_blocks_media_block" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_media_block_path_idx" ON "_pages_v_blocks_media_block" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_media_block_media_idx" ON "_pages_v_blocks_media_block" USING btree ("media_id");
  CREATE INDEX "_pages_v_blocks_archive_order_idx" ON "_pages_v_blocks_archive" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_archive_parent_id_idx" ON "_pages_v_blocks_archive" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_archive_path_idx" ON "_pages_v_blocks_archive" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_form_block_order_idx" ON "_pages_v_blocks_form_block" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_form_block_parent_id_idx" ON "_pages_v_blocks_form_block" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_form_block_path_idx" ON "_pages_v_blocks_form_block" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_form_block_form_idx" ON "_pages_v_blocks_form_block" USING btree ("form_id");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_snapshot_idx" ON "_pages_v" USING btree ("snapshot");
  CREATE INDEX "_pages_v_published_locale_idx" ON "_pages_v" USING btree ("published_locale");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE INDEX "_pages_v_autosave_idx" ON "_pages_v" USING btree ("autosave");
  CREATE INDEX "_pages_v_version_hero_version_hero_media_idx" ON "_pages_v_locales" USING btree ("version_hero_media_id");
  CREATE INDEX "_pages_v_version_meta_version_meta_image_idx" ON "_pages_v_locales" USING btree ("version_meta_image_id","_locale");
  CREATE UNIQUE INDEX "_pages_v_locales_locale_parent_id_unique" ON "_pages_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_rels_order_idx" ON "_pages_v_rels" USING btree ("order");
  CREATE INDEX "_pages_v_rels_parent_idx" ON "_pages_v_rels" USING btree ("parent_id");
  CREATE INDEX "_pages_v_rels_path_idx" ON "_pages_v_rels" USING btree ("path");
  CREATE INDEX "_pages_v_rels_locale_idx" ON "_pages_v_rels" USING btree ("locale");
  CREATE INDEX "_pages_v_rels_pages_id_idx" ON "_pages_v_rels" USING btree ("pages_id","locale");
  CREATE INDEX "_pages_v_rels_categories_id_idx" ON "_pages_v_rels" USING btree ("categories_id","locale");
  CREATE INDEX "_pages_v_rels_posts_id_idx" ON "_pages_v_rels" USING btree ("posts_id","locale");
  CREATE INDEX "posts_populated_authors_order_idx" ON "posts_populated_authors" USING btree ("_order");
  CREATE INDEX "posts_populated_authors_parent_id_idx" ON "posts_populated_authors" USING btree ("_parent_id");
  CREATE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");
  CREATE INDEX "posts_updated_at_idx" ON "posts" USING btree ("updated_at");
  CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");
  CREATE INDEX "posts__status_idx" ON "posts" USING btree ("_status");
  CREATE INDEX "posts_meta_meta_image_idx" ON "posts_locales" USING btree ("meta_image_id","_locale");
  CREATE UNIQUE INDEX "posts_locales_locale_parent_id_unique" ON "posts_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "posts_rels_order_idx" ON "posts_rels" USING btree ("order");
  CREATE INDEX "posts_rels_parent_idx" ON "posts_rels" USING btree ("parent_id");
  CREATE INDEX "posts_rels_path_idx" ON "posts_rels" USING btree ("path");
  CREATE INDEX "posts_rels_posts_id_idx" ON "posts_rels" USING btree ("posts_id");
  CREATE INDEX "posts_rels_categories_id_idx" ON "posts_rels" USING btree ("categories_id");
  CREATE INDEX "posts_rels_users_id_idx" ON "posts_rels" USING btree ("users_id");
  CREATE INDEX "_posts_v_version_populated_authors_order_idx" ON "_posts_v_version_populated_authors" USING btree ("_order");
  CREATE INDEX "_posts_v_version_populated_authors_parent_id_idx" ON "_posts_v_version_populated_authors" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_parent_idx" ON "_posts_v" USING btree ("parent_id");
  CREATE INDEX "_posts_v_version_version_slug_idx" ON "_posts_v" USING btree ("version_slug");
  CREATE INDEX "_posts_v_version_version_updated_at_idx" ON "_posts_v" USING btree ("version_updated_at");
  CREATE INDEX "_posts_v_version_version_created_at_idx" ON "_posts_v" USING btree ("version_created_at");
  CREATE INDEX "_posts_v_version_version__status_idx" ON "_posts_v" USING btree ("version__status");
  CREATE INDEX "_posts_v_created_at_idx" ON "_posts_v" USING btree ("created_at");
  CREATE INDEX "_posts_v_updated_at_idx" ON "_posts_v" USING btree ("updated_at");
  CREATE INDEX "_posts_v_snapshot_idx" ON "_posts_v" USING btree ("snapshot");
  CREATE INDEX "_posts_v_published_locale_idx" ON "_posts_v" USING btree ("published_locale");
  CREATE INDEX "_posts_v_latest_idx" ON "_posts_v" USING btree ("latest");
  CREATE INDEX "_posts_v_autosave_idx" ON "_posts_v" USING btree ("autosave");
  CREATE INDEX "_posts_v_version_meta_version_meta_image_idx" ON "_posts_v_locales" USING btree ("version_meta_image_id","_locale");
  CREATE UNIQUE INDEX "_posts_v_locales_locale_parent_id_unique" ON "_posts_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_posts_v_rels_order_idx" ON "_posts_v_rels" USING btree ("order");
  CREATE INDEX "_posts_v_rels_parent_idx" ON "_posts_v_rels" USING btree ("parent_id");
  CREATE INDEX "_posts_v_rels_path_idx" ON "_posts_v_rels" USING btree ("path");
  CREATE INDEX "_posts_v_rels_posts_id_idx" ON "_posts_v_rels" USING btree ("posts_id");
  CREATE INDEX "_posts_v_rels_categories_id_idx" ON "_posts_v_rels" USING btree ("categories_id");
  CREATE INDEX "_posts_v_rels_users_id_idx" ON "_posts_v_rels" USING btree ("users_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_square_sizes_square_filename_idx" ON "media" USING btree ("sizes_square_filename");
  CREATE INDEX "media_sizes_small_sizes_small_filename_idx" ON "media" USING btree ("sizes_small_filename");
  CREATE INDEX "media_sizes_medium_sizes_medium_filename_idx" ON "media" USING btree ("sizes_medium_filename");
  CREATE INDEX "media_sizes_large_sizes_large_filename_idx" ON "media" USING btree ("sizes_large_filename");
  CREATE INDEX "media_sizes_xlarge_sizes_xlarge_filename_idx" ON "media" USING btree ("sizes_xlarge_filename");
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "categories_breadcrumbs_order_idx" ON "categories_breadcrumbs" USING btree ("_order");
  CREATE INDEX "categories_breadcrumbs_parent_id_idx" ON "categories_breadcrumbs" USING btree ("_parent_id");
  CREATE INDEX "categories_breadcrumbs_locale_idx" ON "categories_breadcrumbs" USING btree ("_locale");
  CREATE INDEX "categories_breadcrumbs_doc_idx" ON "categories_breadcrumbs" USING btree ("doc_id");
  CREATE INDEX "categories_parent_idx" ON "categories" USING btree ("parent_id");
  CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE UNIQUE INDEX "categories_locales_locale_parent_id_unique" ON "categories_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "users_cart_order_idx" ON "users_cart" USING btree ("_order");
  CREATE INDEX "users_cart_parent_id_idx" ON "users_cart" USING btree ("_parent_id");
  CREATE INDEX "users_cart_product_idx" ON "users_cart" USING btree ("product_id");
  CREATE INDEX "users_wishlist_order_idx" ON "users_wishlist" USING btree ("_order");
  CREATE INDEX "users_wishlist_parent_id_idx" ON "users_wishlist" USING btree ("_parent_id");
  CREATE INDEX "users_wishlist_product_idx" ON "users_wishlist" USING btree ("product_id");
  CREATE INDEX "users_shipping_addresses_order_idx" ON "users_shipping_addresses" USING btree ("_order");
  CREATE INDEX "users_shipping_addresses_parent_id_idx" ON "users_shipping_addresses" USING btree ("_parent_id");
  CREATE INDEX "users_shipping_addresses_city_idx" ON "users_shipping_addresses" USING btree ("city_id");
  CREATE INDEX "users_shipping_addresses_district_idx" ON "users_shipping_addresses" USING btree ("district_id");
  CREATE INDEX "users_shipping_addresses_ward_idx" ON "users_shipping_addresses" USING btree ("ward_id");
  CREATE INDEX "users_payment_methods_order_idx" ON "users_payment_methods" USING btree ("_order");
  CREATE INDEX "users_payment_methods_parent_id_idx" ON "users_payment_methods" USING btree ("_parent_id");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_sub_idx" ON "users" USING btree ("sub");
  CREATE UNIQUE INDEX "users_referral_code_idx" ON "users" USING btree ("referral_code");
  CREATE INDEX "users_zalo_user_id_idx" ON "users" USING btree ("zalo_user_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "products_color_variants_size_inventory_order_idx" ON "products_color_variants_size_inventory" USING btree ("_order");
  CREATE INDEX "products_color_variants_size_inventory_parent_id_idx" ON "products_color_variants_size_inventory" USING btree ("_parent_id");
  CREATE INDEX "products_color_variants_order_idx" ON "products_color_variants" USING btree ("_order");
  CREATE INDEX "products_color_variants_parent_id_idx" ON "products_color_variants" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "products_color_variants_locales_locale_parent_id_unique" ON "products_color_variants_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "products_colors_order_idx" ON "products_colors" USING btree ("_order");
  CREATE INDEX "products_colors_parent_id_idx" ON "products_colors" USING btree ("_parent_id");
  CREATE INDEX "products_sizes_order_idx" ON "products_sizes" USING btree ("order");
  CREATE INDEX "products_sizes_parent_idx" ON "products_sizes" USING btree ("parent_id");
  CREATE INDEX "products_features_order_idx" ON "products_features" USING btree ("_order");
  CREATE INDEX "products_features_parent_id_idx" ON "products_features" USING btree ("_parent_id");
  CREATE INDEX "products_features_locale_idx" ON "products_features" USING btree ("_locale");
  CREATE UNIQUE INDEX "products_slug_idx" ON "products" USING btree ("slug");
  CREATE INDEX "products_updated_at_idx" ON "products" USING btree ("updated_at");
  CREATE INDEX "products_created_at_idx" ON "products" USING btree ("created_at");
  CREATE UNIQUE INDEX "products_locales_locale_parent_id_unique" ON "products_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "products_rels_order_idx" ON "products_rels" USING btree ("order");
  CREATE INDEX "products_rels_parent_idx" ON "products_rels" USING btree ("parent_id");
  CREATE INDEX "products_rels_path_idx" ON "products_rels" USING btree ("path");
  CREATE INDEX "products_rels_categories_id_idx" ON "products_rels" USING btree ("categories_id");
  CREATE INDEX "products_rels_media_id_idx" ON "products_rels" USING btree ("media_id");
  CREATE INDEX "reviews_product_idx" ON "reviews" USING btree ("product_id");
  CREATE INDEX "reviews_user_idx" ON "reviews" USING btree ("user_id");
  CREATE INDEX "reviews_order_idx" ON "reviews" USING btree ("order_id");
  CREATE INDEX "reviews_updated_at_idx" ON "reviews" USING btree ("updated_at");
  CREATE INDEX "reviews_created_at_idx" ON "reviews" USING btree ("created_at");
  CREATE INDEX "reviews_rels_order_idx" ON "reviews_rels" USING btree ("order");
  CREATE INDEX "reviews_rels_parent_idx" ON "reviews_rels" USING btree ("parent_id");
  CREATE INDEX "reviews_rels_path_idx" ON "reviews_rels" USING btree ("path");
  CREATE INDEX "reviews_rels_media_id_idx" ON "reviews_rels" USING btree ("media_id");
  CREATE INDEX "reviews_rels_users_id_idx" ON "reviews_rels" USING btree ("users_id");
  CREATE INDEX "orders_items_order_idx" ON "orders_items" USING btree ("_order");
  CREATE INDEX "orders_items_parent_id_idx" ON "orders_items" USING btree ("_parent_id");
  CREATE INDEX "orders_items_product_idx" ON "orders_items" USING btree ("product_id");
  CREATE INDEX "orders_return_request_return_items_order_idx" ON "orders_return_request_return_items" USING btree ("_order");
  CREATE INDEX "orders_return_request_return_items_parent_id_idx" ON "orders_return_request_return_items" USING btree ("_parent_id");
  CREATE INDEX "orders_return_request_return_items_product_idx" ON "orders_return_request_return_items" USING btree ("product_id");
  CREATE INDEX "orders_activity_log_order_idx" ON "orders_activity_log" USING btree ("_order");
  CREATE INDEX "orders_activity_log_parent_id_idx" ON "orders_activity_log" USING btree ("_parent_id");
  CREATE INDEX "orders_activity_log_performed_by_idx" ON "orders_activity_log" USING btree ("performed_by_id");
  CREATE UNIQUE INDEX "orders_order_number_idx" ON "orders" USING btree ("order_number");
  CREATE INDEX "orders_customer_info_customer_info_user_idx" ON "orders" USING btree ("customer_info_user_id");
  CREATE INDEX "orders_shipping_address_shipping_address_ward_idx" ON "orders" USING btree ("shipping_address_ward_id");
  CREATE INDEX "orders_shipping_address_shipping_address_district_idx" ON "orders" USING btree ("shipping_address_district_id");
  CREATE INDEX "orders_shipping_address_shipping_address_city_idx" ON "orders" USING btree ("shipping_address_city_id");
  CREATE INDEX "orders_updated_at_idx" ON "orders" USING btree ("updated_at");
  CREATE INDEX "orders_created_at_idx" ON "orders" USING btree ("created_at");
  CREATE UNIQUE INDEX "coupons_code_idx" ON "coupons" USING btree ("code");
  CREATE INDEX "coupons_updated_at_idx" ON "coupons" USING btree ("updated_at");
  CREATE INDEX "coupons_created_at_idx" ON "coupons" USING btree ("created_at");
  CREATE UNIQUE INDEX "coupons_locales_locale_parent_id_unique" ON "coupons_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "size_charts_category_idx" ON "size_charts" USING btree ("category_id");
  CREATE INDEX "size_charts_updated_at_idx" ON "size_charts" USING btree ("updated_at");
  CREATE INDEX "size_charts_created_at_idx" ON "size_charts" USING btree ("created_at");
  CREATE UNIQUE INDEX "size_charts_filename_idx" ON "size_charts" USING btree ("filename");
  CREATE INDEX "size_charts_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "size_charts" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "size_charts_sizes_medium_sizes_medium_filename_idx" ON "size_charts" USING btree ("sizes_medium_filename");
  CREATE INDEX "size_charts_sizes_large_sizes_large_filename_idx" ON "size_charts" USING btree ("sizes_large_filename");
  CREATE UNIQUE INDEX "size_charts_locales_locale_parent_id_unique" ON "size_charts_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "stock_movements_product_idx" ON "stock_movements" USING btree ("product_id");
  CREATE INDEX "stock_movements_order_idx" ON "stock_movements" USING btree ("order_id");
  CREATE INDEX "stock_movements_performed_by_idx" ON "stock_movements" USING btree ("performed_by_id");
  CREATE INDEX "stock_movements_updated_at_idx" ON "stock_movements" USING btree ("updated_at");
  CREATE INDEX "stock_movements_created_at_idx" ON "stock_movements" USING btree ("created_at");
  CREATE UNIQUE INDEX "provinces_code_idx" ON "provinces" USING btree ("code");
  CREATE INDEX "provinces_updated_at_idx" ON "provinces" USING btree ("updated_at");
  CREATE INDEX "provinces_created_at_idx" ON "provinces" USING btree ("created_at");
  CREATE UNIQUE INDEX "districts_code_idx" ON "districts" USING btree ("code");
  CREATE INDEX "districts_province_idx" ON "districts" USING btree ("province_id");
  CREATE INDEX "districts_updated_at_idx" ON "districts" USING btree ("updated_at");
  CREATE INDEX "districts_created_at_idx" ON "districts" USING btree ("created_at");
  CREATE UNIQUE INDEX "wards_code_idx" ON "wards" USING btree ("code");
  CREATE INDEX "wards_district_idx" ON "wards" USING btree ("district_id");
  CREATE INDEX "wards_updated_at_idx" ON "wards" USING btree ("updated_at");
  CREATE INDEX "wards_created_at_idx" ON "wards" USING btree ("created_at");
  CREATE INDEX "notifications_recipient_idx" ON "notifications" USING btree ("recipient_id");
  CREATE INDEX "notifications_updated_at_idx" ON "notifications" USING btree ("updated_at");
  CREATE INDEX "notifications_created_at_idx" ON "notifications" USING btree ("created_at");
  CREATE UNIQUE INDEX "notification_preferences_user_idx" ON "notification_preferences" USING btree ("user_id");
  CREATE INDEX "notification_preferences_updated_at_idx" ON "notification_preferences" USING btree ("updated_at");
  CREATE INDEX "notification_preferences_created_at_idx" ON "notification_preferences" USING btree ("created_at");
  CREATE INDEX "push_subscriptions_user_idx" ON "push_subscriptions" USING btree ("user_id");
  CREATE INDEX "push_subscriptions_updated_at_idx" ON "push_subscriptions" USING btree ("updated_at");
  CREATE INDEX "push_subscriptions_created_at_idx" ON "push_subscriptions" USING btree ("created_at");
  CREATE UNIQUE INDEX "newsletter_subscribers_email_idx" ON "newsletter_subscribers" USING btree ("email");
  CREATE UNIQUE INDEX "newsletter_subscribers_unsubscribe_token_idx" ON "newsletter_subscribers" USING btree ("unsubscribe_token");
  CREATE INDEX "newsletter_subscribers_updated_at_idx" ON "newsletter_subscribers" USING btree ("updated_at");
  CREATE INDEX "newsletter_subscribers_created_at_idx" ON "newsletter_subscribers" USING btree ("created_at");
  CREATE INDEX "newsletter_campaigns_updated_at_idx" ON "newsletter_campaigns" USING btree ("updated_at");
  CREATE INDEX "newsletter_campaigns_created_at_idx" ON "newsletter_campaigns" USING btree ("created_at");
  CREATE UNIQUE INDEX "newsletter_campaigns_locales_locale_parent_id_unique" ON "newsletter_campaigns_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "chat_conversations_tags_order_idx" ON "chat_conversations_tags" USING btree ("_order");
  CREATE INDEX "chat_conversations_tags_parent_id_idx" ON "chat_conversations_tags" USING btree ("_parent_id");
  CREATE INDEX "chat_conversations_user_idx" ON "chat_conversations" USING btree ("user_id");
  CREATE INDEX "chat_conversations_assigned_to_idx" ON "chat_conversations" USING btree ("assigned_to_id");
  CREATE INDEX "chat_conversations_updated_at_idx" ON "chat_conversations" USING btree ("updated_at");
  CREATE INDEX "chat_conversations_created_at_idx" ON "chat_conversations" USING btree ("created_at");
  CREATE INDEX "chat_messages_conversation_idx" ON "chat_messages" USING btree ("conversation_id");
  CREATE INDEX "chat_messages_updated_at_idx" ON "chat_messages" USING btree ("updated_at");
  CREATE INDEX "chat_messages_created_at_idx" ON "chat_messages" USING btree ("created_at");
  CREATE UNIQUE INDEX "loyalty_accounts_user_idx" ON "loyalty_accounts" USING btree ("user_id");
  CREATE INDEX "loyalty_accounts_updated_at_idx" ON "loyalty_accounts" USING btree ("updated_at");
  CREATE INDEX "loyalty_accounts_created_at_idx" ON "loyalty_accounts" USING btree ("created_at");
  CREATE INDEX "loyalty_transactions_user_idx" ON "loyalty_transactions" USING btree ("user_id");
  CREATE INDEX "loyalty_transactions_order_idx" ON "loyalty_transactions" USING btree ("order_id");
  CREATE INDEX "loyalty_transactions_review_idx" ON "loyalty_transactions" USING btree ("review_id");
  CREATE INDEX "loyalty_transactions_updated_at_idx" ON "loyalty_transactions" USING btree ("updated_at");
  CREATE INDEX "loyalty_transactions_created_at_idx" ON "loyalty_transactions" USING btree ("created_at");
  CREATE INDEX "referrals_referrer_idx" ON "referrals" USING btree ("referrer_id");
  CREATE INDEX "referrals_referee_idx" ON "referrals" USING btree ("referee_id");
  CREATE UNIQUE INDEX "referrals_referral_code_idx" ON "referrals" USING btree ("referral_code");
  CREATE INDEX "referrals_updated_at_idx" ON "referrals" USING btree ("updated_at");
  CREATE INDEX "referrals_created_at_idx" ON "referrals" USING btree ("created_at");
  CREATE UNIQUE INDEX "redirects_from_idx" ON "redirects" USING btree ("from");
  CREATE INDEX "redirects_updated_at_idx" ON "redirects" USING btree ("updated_at");
  CREATE INDEX "redirects_created_at_idx" ON "redirects" USING btree ("created_at");
  CREATE INDEX "redirects_rels_order_idx" ON "redirects_rels" USING btree ("order");
  CREATE INDEX "redirects_rels_parent_idx" ON "redirects_rels" USING btree ("parent_id");
  CREATE INDEX "redirects_rels_path_idx" ON "redirects_rels" USING btree ("path");
  CREATE INDEX "redirects_rels_pages_id_idx" ON "redirects_rels" USING btree ("pages_id");
  CREATE INDEX "redirects_rels_posts_id_idx" ON "redirects_rels" USING btree ("posts_id");
  CREATE INDEX "forms_blocks_checkbox_order_idx" ON "forms_blocks_checkbox" USING btree ("_order");
  CREATE INDEX "forms_blocks_checkbox_parent_id_idx" ON "forms_blocks_checkbox" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_checkbox_path_idx" ON "forms_blocks_checkbox" USING btree ("_path");
  CREATE UNIQUE INDEX "forms_blocks_checkbox_locales_locale_parent_id_unique" ON "forms_blocks_checkbox_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "forms_blocks_country_order_idx" ON "forms_blocks_country" USING btree ("_order");
  CREATE INDEX "forms_blocks_country_parent_id_idx" ON "forms_blocks_country" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_country_path_idx" ON "forms_blocks_country" USING btree ("_path");
  CREATE UNIQUE INDEX "forms_blocks_country_locales_locale_parent_id_unique" ON "forms_blocks_country_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "forms_blocks_email_order_idx" ON "forms_blocks_email" USING btree ("_order");
  CREATE INDEX "forms_blocks_email_parent_id_idx" ON "forms_blocks_email" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_email_path_idx" ON "forms_blocks_email" USING btree ("_path");
  CREATE UNIQUE INDEX "forms_blocks_email_locales_locale_parent_id_unique" ON "forms_blocks_email_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "forms_blocks_message_order_idx" ON "forms_blocks_message" USING btree ("_order");
  CREATE INDEX "forms_blocks_message_parent_id_idx" ON "forms_blocks_message" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_message_path_idx" ON "forms_blocks_message" USING btree ("_path");
  CREATE UNIQUE INDEX "forms_blocks_message_locales_locale_parent_id_unique" ON "forms_blocks_message_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "forms_blocks_number_order_idx" ON "forms_blocks_number" USING btree ("_order");
  CREATE INDEX "forms_blocks_number_parent_id_idx" ON "forms_blocks_number" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_number_path_idx" ON "forms_blocks_number" USING btree ("_path");
  CREATE UNIQUE INDEX "forms_blocks_number_locales_locale_parent_id_unique" ON "forms_blocks_number_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "forms_blocks_select_options_order_idx" ON "forms_blocks_select_options" USING btree ("_order");
  CREATE INDEX "forms_blocks_select_options_parent_id_idx" ON "forms_blocks_select_options" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "forms_blocks_select_options_locales_locale_parent_id_unique" ON "forms_blocks_select_options_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "forms_blocks_select_order_idx" ON "forms_blocks_select" USING btree ("_order");
  CREATE INDEX "forms_blocks_select_parent_id_idx" ON "forms_blocks_select" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_select_path_idx" ON "forms_blocks_select" USING btree ("_path");
  CREATE UNIQUE INDEX "forms_blocks_select_locales_locale_parent_id_unique" ON "forms_blocks_select_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "forms_blocks_state_order_idx" ON "forms_blocks_state" USING btree ("_order");
  CREATE INDEX "forms_blocks_state_parent_id_idx" ON "forms_blocks_state" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_state_path_idx" ON "forms_blocks_state" USING btree ("_path");
  CREATE UNIQUE INDEX "forms_blocks_state_locales_locale_parent_id_unique" ON "forms_blocks_state_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "forms_blocks_text_order_idx" ON "forms_blocks_text" USING btree ("_order");
  CREATE INDEX "forms_blocks_text_parent_id_idx" ON "forms_blocks_text" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_text_path_idx" ON "forms_blocks_text" USING btree ("_path");
  CREATE UNIQUE INDEX "forms_blocks_text_locales_locale_parent_id_unique" ON "forms_blocks_text_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "forms_blocks_textarea_order_idx" ON "forms_blocks_textarea" USING btree ("_order");
  CREATE INDEX "forms_blocks_textarea_parent_id_idx" ON "forms_blocks_textarea" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_textarea_path_idx" ON "forms_blocks_textarea" USING btree ("_path");
  CREATE UNIQUE INDEX "forms_blocks_textarea_locales_locale_parent_id_unique" ON "forms_blocks_textarea_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "forms_emails_order_idx" ON "forms_emails" USING btree ("_order");
  CREATE INDEX "forms_emails_parent_id_idx" ON "forms_emails" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "forms_emails_locales_locale_parent_id_unique" ON "forms_emails_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "forms_updated_at_idx" ON "forms" USING btree ("updated_at");
  CREATE INDEX "forms_created_at_idx" ON "forms" USING btree ("created_at");
  CREATE UNIQUE INDEX "forms_locales_locale_parent_id_unique" ON "forms_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "form_submissions_submission_data_order_idx" ON "form_submissions_submission_data" USING btree ("_order");
  CREATE INDEX "form_submissions_submission_data_parent_id_idx" ON "form_submissions_submission_data" USING btree ("_parent_id");
  CREATE INDEX "form_submissions_form_idx" ON "form_submissions" USING btree ("form_id");
  CREATE INDEX "form_submissions_updated_at_idx" ON "form_submissions" USING btree ("updated_at");
  CREATE INDEX "form_submissions_created_at_idx" ON "form_submissions" USING btree ("created_at");
  CREATE INDEX "search_categories_order_idx" ON "search_categories" USING btree ("_order");
  CREATE INDEX "search_categories_parent_id_idx" ON "search_categories" USING btree ("_parent_id");
  CREATE INDEX "search_slug_idx" ON "search" USING btree ("slug");
  CREATE INDEX "search_meta_meta_image_idx" ON "search" USING btree ("meta_image_id");
  CREATE INDEX "search_updated_at_idx" ON "search" USING btree ("updated_at");
  CREATE INDEX "search_created_at_idx" ON "search" USING btree ("created_at");
  CREATE UNIQUE INDEX "search_locales_locale_parent_id_unique" ON "search_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "search_rels_order_idx" ON "search_rels" USING btree ("order");
  CREATE INDEX "search_rels_parent_idx" ON "search_rels" USING btree ("parent_id");
  CREATE INDEX "search_rels_path_idx" ON "search_rels" USING btree ("path");
  CREATE INDEX "search_rels_posts_id_idx" ON "search_rels" USING btree ("posts_id");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("posts_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_products_id_idx" ON "payload_locked_documents_rels" USING btree ("products_id");
  CREATE INDEX "payload_locked_documents_rels_reviews_id_idx" ON "payload_locked_documents_rels" USING btree ("reviews_id");
  CREATE INDEX "payload_locked_documents_rels_orders_id_idx" ON "payload_locked_documents_rels" USING btree ("orders_id");
  CREATE INDEX "payload_locked_documents_rels_coupons_id_idx" ON "payload_locked_documents_rels" USING btree ("coupons_id");
  CREATE INDEX "payload_locked_documents_rels_size_charts_id_idx" ON "payload_locked_documents_rels" USING btree ("size_charts_id");
  CREATE INDEX "payload_locked_documents_rels_stock_movements_id_idx" ON "payload_locked_documents_rels" USING btree ("stock_movements_id");
  CREATE INDEX "payload_locked_documents_rels_provinces_id_idx" ON "payload_locked_documents_rels" USING btree ("provinces_id");
  CREATE INDEX "payload_locked_documents_rels_districts_id_idx" ON "payload_locked_documents_rels" USING btree ("districts_id");
  CREATE INDEX "payload_locked_documents_rels_wards_id_idx" ON "payload_locked_documents_rels" USING btree ("wards_id");
  CREATE INDEX "payload_locked_documents_rels_notifications_id_idx" ON "payload_locked_documents_rels" USING btree ("notifications_id");
  CREATE INDEX "payload_locked_documents_rels_notification_preferences_i_idx" ON "payload_locked_documents_rels" USING btree ("notification_preferences_id");
  CREATE INDEX "payload_locked_documents_rels_push_subscriptions_id_idx" ON "payload_locked_documents_rels" USING btree ("push_subscriptions_id");
  CREATE INDEX "payload_locked_documents_rels_newsletter_subscribers_id_idx" ON "payload_locked_documents_rels" USING btree ("newsletter_subscribers_id");
  CREATE INDEX "payload_locked_documents_rels_newsletter_campaigns_id_idx" ON "payload_locked_documents_rels" USING btree ("newsletter_campaigns_id");
  CREATE INDEX "payload_locked_documents_rels_chat_conversations_id_idx" ON "payload_locked_documents_rels" USING btree ("chat_conversations_id");
  CREATE INDEX "payload_locked_documents_rels_chat_messages_id_idx" ON "payload_locked_documents_rels" USING btree ("chat_messages_id");
  CREATE INDEX "payload_locked_documents_rels_loyalty_accounts_id_idx" ON "payload_locked_documents_rels" USING btree ("loyalty_accounts_id");
  CREATE INDEX "payload_locked_documents_rels_loyalty_transactions_id_idx" ON "payload_locked_documents_rels" USING btree ("loyalty_transactions_id");
  CREATE INDEX "payload_locked_documents_rels_referrals_id_idx" ON "payload_locked_documents_rels" USING btree ("referrals_id");
  CREATE INDEX "payload_locked_documents_rels_redirects_id_idx" ON "payload_locked_documents_rels" USING btree ("redirects_id");
  CREATE INDEX "payload_locked_documents_rels_forms_id_idx" ON "payload_locked_documents_rels" USING btree ("forms_id");
  CREATE INDEX "payload_locked_documents_rels_form_submissions_id_idx" ON "payload_locked_documents_rels" USING btree ("form_submissions_id");
  CREATE INDEX "payload_locked_documents_rels_search_id_idx" ON "payload_locked_documents_rels" USING btree ("search_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "header_nav_items_order_idx" ON "header_nav_items" USING btree ("_order");
  CREATE INDEX "header_nav_items_parent_id_idx" ON "header_nav_items" USING btree ("_parent_id");
  CREATE INDEX "header_rels_order_idx" ON "header_rels" USING btree ("order");
  CREATE INDEX "header_rels_parent_idx" ON "header_rels" USING btree ("parent_id");
  CREATE INDEX "header_rels_path_idx" ON "header_rels" USING btree ("path");
  CREATE INDEX "header_rels_pages_id_idx" ON "header_rels" USING btree ("pages_id");
  CREATE INDEX "footer_nav_items_order_idx" ON "footer_nav_items" USING btree ("_order");
  CREATE INDEX "footer_nav_items_parent_id_idx" ON "footer_nav_items" USING btree ("_parent_id");
  CREATE INDEX "footer_rels_order_idx" ON "footer_rels" USING btree ("order");
  CREATE INDEX "footer_rels_parent_idx" ON "footer_rels" USING btree ("parent_id");
  CREATE INDEX "footer_rels_path_idx" ON "footer_rels" USING btree ("path");
  CREATE INDEX "footer_rels_pages_id_idx" ON "footer_rels" USING btree ("pages_id");
  CREATE INDEX "homepage_carousel_slides_order_idx" ON "homepage_carousel_slides" USING btree ("_order");
  CREATE INDEX "homepage_carousel_slides_parent_id_idx" ON "homepage_carousel_slides" USING btree ("_parent_id");
  CREATE INDEX "homepage_carousel_slides_background_image_idx" ON "homepage_carousel_slides" USING btree ("background_image_id");
  CREATE UNIQUE INDEX "homepage_carousel_slides_locales_locale_parent_id_unique" ON "homepage_carousel_slides_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "homepage_quick_filters_order_idx" ON "homepage_quick_filters" USING btree ("_order");
  CREATE INDEX "homepage_quick_filters_parent_id_idx" ON "homepage_quick_filters" USING btree ("_parent_id");
  CREATE INDEX "homepage_quick_filters_category_idx" ON "homepage_quick_filters" USING btree ("category_id");
  CREATE UNIQUE INDEX "homepage_quick_filters_locales_locale_parent_id_unique" ON "homepage_quick_filters_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "homepage_rels_order_idx" ON "homepage_rels" USING btree ("order");
  CREATE INDEX "homepage_rels_parent_idx" ON "homepage_rels" USING btree ("parent_id");
  CREATE INDEX "homepage_rels_path_idx" ON "homepage_rels" USING btree ("path");
  CREATE INDEX "homepage_rels_categories_id_idx" ON "homepage_rels" USING btree ("categories_id");
  CREATE INDEX "payment_methods_cod_cod_icon_idx" ON "payment_methods" USING btree ("cod_icon_id");
  CREATE INDEX "payment_methods_bank_transfer_bank_transfer_icon_idx" ON "payment_methods" USING btree ("bank_transfer_icon_id");
  CREATE INDEX "payment_methods_qr_code_qr_code_icon_idx" ON "payment_methods" USING btree ("qr_code_icon_id");
  CREATE INDEX "payment_methods_qr_code_qr_code_qr_image_idx" ON "payment_methods" USING btree ("qr_code_qr_image_id");
  CREATE INDEX "payment_methods_vnpay_vnpay_icon_idx" ON "payment_methods" USING btree ("vnpay_icon_id");
  CREATE INDEX "payment_methods_stripe_stripe_icon_idx" ON "payment_methods" USING btree ("stripe_icon_id");
  CREATE INDEX "payment_methods_momo_momo_icon_idx" ON "payment_methods" USING btree ("momo_icon_id");
  CREATE UNIQUE INDEX "payment_methods_locales_locale_parent_id_unique" ON "payment_methods_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_hero_links" CASCADE;
  DROP TABLE "pages_blocks_cta_links" CASCADE;
  DROP TABLE "pages_blocks_cta" CASCADE;
  DROP TABLE "pages_blocks_content_columns" CASCADE;
  DROP TABLE "pages_blocks_content" CASCADE;
  DROP TABLE "pages_blocks_media_block" CASCADE;
  DROP TABLE "pages_blocks_archive" CASCADE;
  DROP TABLE "pages_blocks_form_block" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "pages_locales" CASCADE;
  DROP TABLE "pages_rels" CASCADE;
  DROP TABLE "_pages_v_version_hero_links" CASCADE;
  DROP TABLE "_pages_v_blocks_cta_links" CASCADE;
  DROP TABLE "_pages_v_blocks_cta" CASCADE;
  DROP TABLE "_pages_v_blocks_content_columns" CASCADE;
  DROP TABLE "_pages_v_blocks_content" CASCADE;
  DROP TABLE "_pages_v_blocks_media_block" CASCADE;
  DROP TABLE "_pages_v_blocks_archive" CASCADE;
  DROP TABLE "_pages_v_blocks_form_block" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "_pages_v_locales" CASCADE;
  DROP TABLE "_pages_v_rels" CASCADE;
  DROP TABLE "posts_populated_authors" CASCADE;
  DROP TABLE "posts" CASCADE;
  DROP TABLE "posts_locales" CASCADE;
  DROP TABLE "posts_rels" CASCADE;
  DROP TABLE "_posts_v_version_populated_authors" CASCADE;
  DROP TABLE "_posts_v" CASCADE;
  DROP TABLE "_posts_v_locales" CASCADE;
  DROP TABLE "_posts_v_rels" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "media_locales" CASCADE;
  DROP TABLE "categories_breadcrumbs" CASCADE;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "categories_locales" CASCADE;
  DROP TABLE "users_cart" CASCADE;
  DROP TABLE "users_wishlist" CASCADE;
  DROP TABLE "users_shipping_addresses" CASCADE;
  DROP TABLE "users_payment_methods" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "products_color_variants_size_inventory" CASCADE;
  DROP TABLE "products_color_variants" CASCADE;
  DROP TABLE "products_color_variants_locales" CASCADE;
  DROP TABLE "products_colors" CASCADE;
  DROP TABLE "products_sizes" CASCADE;
  DROP TABLE "products_features" CASCADE;
  DROP TABLE "products" CASCADE;
  DROP TABLE "products_locales" CASCADE;
  DROP TABLE "products_rels" CASCADE;
  DROP TABLE "reviews" CASCADE;
  DROP TABLE "reviews_rels" CASCADE;
  DROP TABLE "orders_items" CASCADE;
  DROP TABLE "orders_return_request_return_items" CASCADE;
  DROP TABLE "orders_activity_log" CASCADE;
  DROP TABLE "orders" CASCADE;
  DROP TABLE "coupons" CASCADE;
  DROP TABLE "coupons_locales" CASCADE;
  DROP TABLE "size_charts" CASCADE;
  DROP TABLE "size_charts_locales" CASCADE;
  DROP TABLE "stock_movements" CASCADE;
  DROP TABLE "provinces" CASCADE;
  DROP TABLE "districts" CASCADE;
  DROP TABLE "wards" CASCADE;
  DROP TABLE "notifications" CASCADE;
  DROP TABLE "notification_preferences" CASCADE;
  DROP TABLE "push_subscriptions" CASCADE;
  DROP TABLE "newsletter_subscribers" CASCADE;
  DROP TABLE "newsletter_campaigns" CASCADE;
  DROP TABLE "newsletter_campaigns_locales" CASCADE;
  DROP TABLE "chat_conversations_tags" CASCADE;
  DROP TABLE "chat_conversations" CASCADE;
  DROP TABLE "chat_messages" CASCADE;
  DROP TABLE "loyalty_accounts" CASCADE;
  DROP TABLE "loyalty_transactions" CASCADE;
  DROP TABLE "referrals" CASCADE;
  DROP TABLE "redirects" CASCADE;
  DROP TABLE "redirects_rels" CASCADE;
  DROP TABLE "forms_blocks_checkbox" CASCADE;
  DROP TABLE "forms_blocks_checkbox_locales" CASCADE;
  DROP TABLE "forms_blocks_country" CASCADE;
  DROP TABLE "forms_blocks_country_locales" CASCADE;
  DROP TABLE "forms_blocks_email" CASCADE;
  DROP TABLE "forms_blocks_email_locales" CASCADE;
  DROP TABLE "forms_blocks_message" CASCADE;
  DROP TABLE "forms_blocks_message_locales" CASCADE;
  DROP TABLE "forms_blocks_number" CASCADE;
  DROP TABLE "forms_blocks_number_locales" CASCADE;
  DROP TABLE "forms_blocks_select_options" CASCADE;
  DROP TABLE "forms_blocks_select_options_locales" CASCADE;
  DROP TABLE "forms_blocks_select" CASCADE;
  DROP TABLE "forms_blocks_select_locales" CASCADE;
  DROP TABLE "forms_blocks_state" CASCADE;
  DROP TABLE "forms_blocks_state_locales" CASCADE;
  DROP TABLE "forms_blocks_text" CASCADE;
  DROP TABLE "forms_blocks_text_locales" CASCADE;
  DROP TABLE "forms_blocks_textarea" CASCADE;
  DROP TABLE "forms_blocks_textarea_locales" CASCADE;
  DROP TABLE "forms_emails" CASCADE;
  DROP TABLE "forms_emails_locales" CASCADE;
  DROP TABLE "forms" CASCADE;
  DROP TABLE "forms_locales" CASCADE;
  DROP TABLE "form_submissions_submission_data" CASCADE;
  DROP TABLE "form_submissions" CASCADE;
  DROP TABLE "search_categories" CASCADE;
  DROP TABLE "search" CASCADE;
  DROP TABLE "search_locales" CASCADE;
  DROP TABLE "search_rels" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "header_nav_items" CASCADE;
  DROP TABLE "header" CASCADE;
  DROP TABLE "header_rels" CASCADE;
  DROP TABLE "footer_nav_items" CASCADE;
  DROP TABLE "footer" CASCADE;
  DROP TABLE "footer_rels" CASCADE;
  DROP TABLE "homepage_carousel_slides" CASCADE;
  DROP TABLE "homepage_carousel_slides_locales" CASCADE;
  DROP TABLE "homepage_quick_filters" CASCADE;
  DROP TABLE "homepage_quick_filters_locales" CASCADE;
  DROP TABLE "homepage" CASCADE;
  DROP TABLE "homepage_rels" CASCADE;
  DROP TABLE "payment_methods" CASCADE;
  DROP TABLE "payment_methods_locales" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_pages_hero_links_link_type";
  DROP TYPE "public"."enum_pages_hero_links_link_appearance";
  DROP TYPE "public"."enum_pages_blocks_cta_links_link_type";
  DROP TYPE "public"."enum_pages_blocks_cta_links_link_appearance";
  DROP TYPE "public"."enum_pages_blocks_content_columns_size";
  DROP TYPE "public"."enum_pages_blocks_content_columns_link_type";
  DROP TYPE "public"."enum_pages_blocks_content_columns_link_appearance";
  DROP TYPE "public"."enum_pages_blocks_media_block_position";
  DROP TYPE "public"."enum_pages_blocks_archive_populate_by";
  DROP TYPE "public"."enum_pages_blocks_archive_relation_to";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum_pages_hero_type";
  DROP TYPE "public"."enum__pages_v_version_hero_links_link_type";
  DROP TYPE "public"."enum__pages_v_version_hero_links_link_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_cta_links_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_cta_links_link_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_content_columns_size";
  DROP TYPE "public"."enum__pages_v_blocks_content_columns_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_content_columns_link_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_media_block_position";
  DROP TYPE "public"."enum__pages_v_blocks_archive_populate_by";
  DROP TYPE "public"."enum__pages_v_blocks_archive_relation_to";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum__pages_v_published_locale";
  DROP TYPE "public"."enum__pages_v_version_hero_type";
  DROP TYPE "public"."enum_posts_status";
  DROP TYPE "public"."enum__posts_v_version_status";
  DROP TYPE "public"."enum__posts_v_published_locale";
  DROP TYPE "public"."enum_users_payment_methods_type";
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_users_provider";
  DROP TYPE "public"."enum_products_color_variants_size_inventory_size";
  DROP TYPE "public"."enum_products_sizes";
  DROP TYPE "public"."enum_products_tag";
  DROP TYPE "public"."enum_products_stock_status";
  DROP TYPE "public"."enum_reviews_fit";
  DROP TYPE "public"."enum_reviews_moderation_status";
  DROP TYPE "public"."enum_orders_activity_log_action";
  DROP TYPE "public"."enum_orders_status";
  DROP TYPE "public"."enum_orders_payment_method";
  DROP TYPE "public"."enum_orders_payment_payment_status";
  DROP TYPE "public"."enum_orders_return_request_return_status";
  DROP TYPE "public"."enum_coupons_type";
  DROP TYPE "public"."enum_stock_movements_type";
  DROP TYPE "public"."enum_notifications_type";
  DROP TYPE "public"."enum_newsletter_subscribers_status";
  DROP TYPE "public"."enum_newsletter_subscribers_source";
  DROP TYPE "public"."enum_newsletter_campaigns_status";
  DROP TYPE "public"."enum_newsletter_campaigns_target_audience";
  DROP TYPE "public"."enum_chat_conversations_status";
  DROP TYPE "public"."enum_chat_conversations_channel";
  DROP TYPE "public"."enum_chat_messages_role";
  DROP TYPE "public"."enum_chat_messages_channel";
  DROP TYPE "public"."enum_loyalty_accounts_tier";
  DROP TYPE "public"."enum_loyalty_transactions_type";
  DROP TYPE "public"."enum_referrals_status";
  DROP TYPE "public"."enum_referrals_referrer_reward";
  DROP TYPE "public"."enum_referrals_referee_reward";
  DROP TYPE "public"."enum_redirects_to_type";
  DROP TYPE "public"."enum_forms_confirmation_type";
  DROP TYPE "public"."enum_header_nav_items_link_type";
  DROP TYPE "public"."enum_footer_nav_items_link_type";
  DROP TYPE "public"."enum_homepage_quick_filters_filter_type";
  DROP TYPE "public"."enum_homepage_quick_filters_tag_filter";`)
}
