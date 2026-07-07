-- ============================================================
-- AutoPark Manager – Schema Supabase PostgreSQL (v3)
-- ============================================================
-- Instructions :
--   1. Connectez-vous a https://supabase.com
--   2. Ouvrez votre projet → SQL Editor
--   3. Collez ce fichier et executez-le
-- ============================================================

-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- PROFILES (etend auth.users de Supabase Auth)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name  TEXT NOT NULL DEFAULT '',
  last_name   TEXT NOT NULL DEFAULT '',
  full_name   TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
  email       TEXT NOT NULL,
  phone       TEXT,
  role        TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'admin')),
  avatar_url  TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PARKING CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.parking_categories (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  description   TEXT,
  icon          TEXT,
  image_url     TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PARKING SPOTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.parking_spots (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id     UUID NOT NULL REFERENCES public.parking_categories(id) ON DELETE RESTRICT,
  name            TEXT NOT NULL,
  code            TEXT NOT NULL UNIQUE,
  slug            TEXT NOT NULL UNIQUE,
  description     TEXT,
  location_label  TEXT,
  main_image_url  TEXT,
  gallery         TEXT[] DEFAULT '{}',
  hourly_price    NUMERIC(10, 2) NOT NULL CHECK (hourly_price > 0),
  daily_price     NUMERIC(10, 2) NOT NULL CHECK (daily_price > 0),
  status          TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'maintenance')),
  services        TEXT[] DEFAULT '{}',
  capacity        INTEGER NOT NULL DEFAULT 1,
  is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CART ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.cart_items (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  parking_spot_id  UUID NOT NULL REFERENCES public.parking_spots(id) ON DELETE CASCADE,
  start_date_time  TIMESTAMPTZ NOT NULL,
  end_date_time    TIMESTAMPTZ NOT NULL CHECK (end_date_time > start_date_time),
  duration_hours   NUMERIC(10, 2) NOT NULL,
  unit_price       NUMERIC(10, 2) NOT NULL,
  total_price      NUMERIC(10, 2) NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PROMO CODES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT NOT NULL UNIQUE,
  type        TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value       NUMERIC(10, 2) NOT NULL CHECK (value > 0),
  max_uses    INTEGER NOT NULL DEFAULT 1,
  used_count  INTEGER NOT NULL DEFAULT 0,
  starts_at   TIMESTAMPTZ NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- RESERVATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reservations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_number  TEXT NOT NULL UNIQUE,
  user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  parking_spot_id     UUID NOT NULL REFERENCES public.parking_spots(id) ON DELETE RESTRICT,
  promo_code_id       UUID REFERENCES public.promo_codes(id) ON DELETE SET NULL,
  start_date_time     TIMESTAMPTZ NOT NULL,
  end_date_time       TIMESTAMPTZ NOT NULL CHECK (end_date_time > start_date_time),
  duration_hours      NUMERIC(10, 2) NOT NULL,
  amount              NUMERIC(10, 2) NOT NULL,
  discount_amount     NUMERIC(10, 2) NOT NULL DEFAULT 0,
  final_amount        NUMERIC(10, 2) NOT NULL DEFAULT 0,
  status              TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'active', 'completed', 'cancelled', 'expired')),
  payment_status      TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'success', 'failed', 'refunded')),
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PAYMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id      UUID NOT NULL REFERENCES public.reservations(id) ON DELETE RESTRICT,
  user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  provider            TEXT NOT NULL DEFAULT 'manual' CHECK (provider IN ('stripe', 'paystack', 'flutterwave', 'manual')),
  provider_reference  TEXT,
  amount              NUMERIC(10, 2) NOT NULL,
  currency            TEXT NOT NULL DEFAULT 'XOF',
  status              TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
  paid_at             TIMESTAMPTZ,
  metadata            JSONB DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CONTACT MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name   TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT,
  subject     TEXT NOT NULL,
  message     TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'resolved')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SITE SETTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.site_settings (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name                TEXT NOT NULL DEFAULT 'AutoPark Manager',
  logo_url                 TEXT,
  contact_email            TEXT NOT NULL DEFAULT '',
  contact_phone            TEXT NOT NULL DEFAULT '',
  address                  TEXT NOT NULL DEFAULT '',
  currency                 TEXT NOT NULL DEFAULT 'XOF',
  opening_hours            TEXT NOT NULL DEFAULT '08:00 - 20:00',
  facebook_url             TEXT,
  instagram_url            TEXT,
  linkedin_url             TEXT,
  sandbox_payment_enabled  BOOLEAN NOT NULL DEFAULT TRUE,
  maintenance_mode         BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- AUDIT LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action       TEXT NOT NULL,
  entity       TEXT NOT NULL,
  entity_id    TEXT NOT NULL,
  description  TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- FONCTIONS & TRIGGERS
-- ============================================================

-- Trigger updated_at automatique
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger : creer le profil automatiquement lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Appliquer les triggers updated_at
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'profiles', 'parking_categories', 'parking_spots',
    'cart_items', 'promo_codes', 'reservations',
    'payments', 'contact_messages'
  ] LOOP
    EXECUTE format(
      'CREATE OR REPLACE TRIGGER trg_%I_updated_at
       BEFORE UPDATE ON public.%I
       FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()',
      t, t
    );
  END LOOP;
END;
$$;

-- Trigger creation profil a l'inscription
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fonction generation numero de reservation unique
CREATE OR REPLACE FUNCTION public.generate_reservation_number()
RETURNS TEXT AS $$
DECLARE
  num TEXT;
BEGIN
  num := 'APM-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 99999)::TEXT, 5, '0');
  WHILE EXISTS (SELECT 1 FROM public.reservations WHERE reservation_number = num) LOOP
    num := 'APM-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 99999)::TEXT, 5, '0');
  END LOOP;
  RETURN num;
END;
$$ LANGUAGE plpgsql;

-- Trigger auto-generation numero reservation
CREATE OR REPLACE FUNCTION public.set_reservation_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.reservation_number IS NULL OR NEW.reservation_number = '' THEN
    NEW.reservation_number := public.generate_reservation_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_reservation_number ON public.reservations;
CREATE TRIGGER trg_reservation_number
  BEFORE INSERT ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION public.set_reservation_number();

-- Trigger : calcul automatique de final_amount = amount - discount_amount
CREATE OR REPLACE FUNCTION public.compute_final_amount()
RETURNS TRIGGER AS $$
BEGIN
  NEW.final_amount := NEW.amount - COALESCE(NEW.discount_amount, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_compute_final_amount ON public.reservations;
CREATE TRIGGER trg_compute_final_amount
  BEFORE INSERT OR UPDATE ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION public.compute_final_amount();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper : verifier si l'utilisateur est admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PROFILES
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (id = auth.uid() OR public.is_admin());
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (id = auth.uid() OR public.is_admin());
CREATE POLICY "profiles_admin_all" ON public.profiles FOR ALL USING (public.is_admin());

-- PARKING CATEGORIES (lecture publique, ecriture admin)
DROP POLICY IF EXISTS "categories_public_read" ON public.parking_categories;
DROP POLICY IF EXISTS "categories_admin_write" ON public.parking_categories;
CREATE POLICY "categories_public_read" ON public.parking_categories FOR SELECT USING (TRUE);
CREATE POLICY "categories_admin_write" ON public.parking_categories FOR ALL USING (public.is_admin());

-- PARKING SPOTS (lecture publique, ecriture admin)
DROP POLICY IF EXISTS "spots_public_read" ON public.parking_spots;
DROP POLICY IF EXISTS "spots_admin_write" ON public.parking_spots;
CREATE POLICY "spots_public_read" ON public.parking_spots FOR SELECT USING (TRUE);
CREATE POLICY "spots_admin_write" ON public.parking_spots FOR ALL USING (public.is_admin());

-- CART ITEMS (propre a l'utilisateur)
DROP POLICY IF EXISTS "cart_own" ON public.cart_items;
CREATE POLICY "cart_own" ON public.cart_items FOR ALL USING (user_id = auth.uid());

-- PROMO CODES (lecture si actif, ecriture admin)
DROP POLICY IF EXISTS "promo_read_active" ON public.promo_codes;
DROP POLICY IF EXISTS "promo_admin_write" ON public.promo_codes;
CREATE POLICY "promo_read_active" ON public.promo_codes FOR SELECT USING (is_active = TRUE AND expires_at > NOW() OR public.is_admin());
CREATE POLICY "promo_admin_write" ON public.promo_codes FOR ALL USING (public.is_admin());

-- RESERVATIONS
DROP POLICY IF EXISTS "reservations_own" ON public.reservations;
DROP POLICY IF EXISTS "reservations_insert_own" ON public.reservations;
DROP POLICY IF EXISTS "reservations_update_admin" ON public.reservations;
DROP POLICY IF EXISTS "reservations_update_own_or_admin" ON public.reservations;
CREATE POLICY "reservations_select" ON public.reservations FOR SELECT USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "reservations_insert_own" ON public.reservations FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "reservations_update" ON public.reservations FOR UPDATE USING (user_id = auth.uid() OR public.is_admin());

-- PAYMENTS
DROP POLICY IF EXISTS "payments_own" ON public.payments;
DROP POLICY IF EXISTS "payments_insert_own" ON public.payments;
DROP POLICY IF EXISTS "payments_update_admin" ON public.payments;
DROP POLICY IF EXISTS "payments_update_own_or_admin" ON public.payments;
CREATE POLICY "payments_select" ON public.payments FOR SELECT USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "payments_insert_own" ON public.payments FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "payments_update" ON public.payments FOR UPDATE USING (user_id = auth.uid() OR public.is_admin());

-- CONTACT MESSAGES (tout le monde peut ecrire, admin lit/modifie/supprime)
DROP POLICY IF EXISTS "contact_insert" ON public.contact_messages;
DROP POLICY IF EXISTS "contact_admin_read" ON public.contact_messages;
DROP POLICY IF EXISTS "contact_admin_update" ON public.contact_messages;
DROP POLICY IF EXISTS "contact_admin_delete" ON public.contact_messages;
CREATE POLICY "contact_insert" ON public.contact_messages FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "contact_admin_select" ON public.contact_messages FOR SELECT USING (public.is_admin());
CREATE POLICY "contact_admin_update" ON public.contact_messages FOR UPDATE USING (public.is_admin());
CREATE POLICY "contact_admin_delete" ON public.contact_messages FOR DELETE USING (public.is_admin());

-- SITE SETTINGS (lecture publique, ecriture admin)
DROP POLICY IF EXISTS "settings_public_read" ON public.site_settings;
DROP POLICY IF EXISTS "settings_admin_write" ON public.site_settings;
CREATE POLICY "settings_public_read" ON public.site_settings FOR SELECT USING (TRUE);
CREATE POLICY "settings_admin_write" ON public.site_settings FOR ALL USING (public.is_admin());

-- AUDIT LOGS (admin + insert pour tout utilisateur connecte)
DROP POLICY IF EXISTS "audit_admin" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_insert_auth" ON public.audit_logs;
CREATE POLICY "audit_admin" ON public.audit_logs FOR SELECT USING (public.is_admin());
CREATE POLICY "audit_insert_auth" ON public.audit_logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- REALTIME
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.reservations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.contact_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.parking_spots;

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('parking-images', 'parking-images', TRUE),
  ('avatars', 'avatars', TRUE),
  ('logos', 'logos', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Policies storage
DROP POLICY IF EXISTS "storage_public_read" ON storage.objects;
DROP POLICY IF EXISTS "storage_auth_upload" ON storage.objects;
DROP POLICY IF EXISTS "storage_admin_manage" ON storage.objects;
DROP POLICY IF EXISTS "storage_own_avatar" ON storage.objects;
CREATE POLICY "storage_public_read" ON storage.objects FOR SELECT USING (bucket_id IN ('parking-images', 'avatars', 'logos'));
CREATE POLICY "storage_auth_upload" ON storage.objects FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND bucket_id IN ('parking-images', 'avatars', 'logos'));
CREATE POLICY "storage_admin_manage" ON storage.objects FOR ALL USING (public.is_admin() AND bucket_id IN ('parking-images', 'logos'));
CREATE POLICY "storage_own_avatar" ON storage.objects FOR ALL USING (auth.uid()::TEXT = (storage.foldername(name))[1] AND bucket_id = 'avatars');

-- ============================================================
-- DONNEES INITIALES
-- ============================================================

-- Categories de parking
INSERT INTO public.parking_categories (name, slug, description, icon, display_order) VALUES
  ('Standard', 'standard', 'Places de parking classiques et accessibles', 'Car', 1),
  ('VIP', 'vip', 'Places premium avec services haut de gamme', 'Star', 2),
  ('Couvert', 'covered', 'Places a l''abri des intemperies', 'Home', 3),
  ('Moto', 'motorcycle', 'Places dediees aux motos et scooters', 'Bike', 4),
  ('Camion', 'truck', 'Places pour poids lourds et utilitaires', 'Truck', 5),
  ('Longue duree', 'long-term', 'Places avec tarifs avantageux pour sejours prolonges', 'Clock', 6),
  ('Evenementiel', 'event', 'Places reservees pour evenements speciaux', 'Calendar', 7)
ON CONFLICT (slug) DO NOTHING;

-- Parametres du site par defaut
INSERT INTO public.site_settings (site_name, contact_email, currency, opening_hours)
VALUES ('AutoPark Manager', 'contact@autopark.com', 'XOF', '08:00 - 20:00')
ON CONFLICT DO NOTHING;

-- ============================================================
-- VUES UTILES (optionnel, le code n'en depend pas)
-- ============================================================

-- Vue reservations avec details
CREATE OR REPLACE VIEW public.reservations_with_details AS
SELECT
  r.*,
  p.full_name AS client_name,
  p.email AS client_email,
  p.phone AS client_phone,
  ps.name AS spot_name,
  ps.code AS spot_code,
  pc.name AS category_name
FROM public.reservations r
JOIN public.profiles p ON p.id = r.user_id
JOIN public.parking_spots ps ON ps.id = r.parking_spot_id
JOIN public.parking_categories pc ON pc.id = ps.category_id;

-- Vue statistiques dashboard
CREATE OR REPLACE VIEW public.dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM public.reservations WHERE status != 'cancelled') AS total_reservations,
  (SELECT COUNT(*) FROM public.reservations WHERE DATE(created_at) = CURRENT_DATE AND status != 'cancelled') AS today_reservations,
  (SELECT COALESCE(SUM(amount), 0) FROM public.payments WHERE DATE(created_at) = CURRENT_DATE AND status = 'success') AS today_revenue,
  (SELECT COALESCE(SUM(amount), 0) FROM public.payments WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE) AND status = 'success') AS month_revenue,
  (SELECT COUNT(*) FROM public.profiles WHERE role = 'client') AS total_clients,
  (SELECT COUNT(*) FROM public.parking_spots WHERE status = 'available' AND is_active = TRUE) AS available_spots,
  (SELECT COUNT(*) FROM public.parking_spots WHERE status = 'occupied' AND is_active = TRUE) AS occupied_spots,
  (SELECT COUNT(*) FROM public.contact_messages WHERE status = 'new') AS new_messages;

-- Acces API aux vues (PostgREST requiert un GRANT explicite)
GRANT SELECT ON public.reservations_with_details TO authenticated;
GRANT SELECT ON public.dashboard_stats TO anon, authenticated;
