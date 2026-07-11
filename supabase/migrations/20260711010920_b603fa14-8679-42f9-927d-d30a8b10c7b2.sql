
ALTER TABLE public.highlights ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false;
ALTER TABLE public.content_items ADD COLUMN IF NOT EXISTS coverage text;
ALTER TABLE public.content_items ADD COLUMN IF NOT EXISTS event_type text;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS services_title text NOT NULL DEFAULT 'SERVIÇOS DISPONIBILIZADOS';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS services_subtitle text NOT NULL DEFAULT 'Impulsione a sua empresa com vídeos incríveis e conquiste os melhores resultados.';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS text_styles jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE TABLE public.filter_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('coverage','event')),
  label text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.filter_options TO authenticated;
GRANT SELECT ON public.filter_options TO anon;
GRANT ALL ON public.filter_options TO service_role;
ALTER TABLE public.filter_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read filters" ON public.filter_options FOR SELECT TO public USING (true);
CREATE POLICY "Admins manage filters" ON public.filter_options FOR ALL TO authenticated USING (private.has_role(auth.uid(),'admin')) WITH CHECK (private.has_role(auth.uid(),'admin'));

INSERT INTO public.filter_options (kind, label, sort_order) VALUES
  ('coverage','Fotografia',0),
  ('coverage','Frames',1),
  ('coverage','Captação',2),
  ('event','Corporativo',0),
  ('event','Aniversário',1);
