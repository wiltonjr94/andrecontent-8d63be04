ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS logo_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS layout jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.theme_settings
  ADD COLUMN IF NOT EXISTS custom_font_display_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS custom_font_body_url text NOT NULL DEFAULT '';