
CREATE TABLE public.brands (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  logo_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT ON public.brands TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.brands TO authenticated;
GRANT ALL ON public.brands TO service_role;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read brands" ON public.brands FOR SELECT USING (true);
CREATE POLICY "Admins manage brands" ON public.brands FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON public.brands
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.item_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  media_type TEXT NOT NULL DEFAULT 'image',
  url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT ON public.item_media TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.item_media TO authenticated;
GRANT ALL ON public.item_media TO service_role;
ALTER TABLE public.item_media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read item media" ON public.item_media FOR SELECT USING (true);
CREATE POLICY "Admins manage item media" ON public.item_media FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER update_item_media_updated_at BEFORE UPDATE ON public.item_media
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
