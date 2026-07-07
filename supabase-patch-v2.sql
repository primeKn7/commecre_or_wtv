-- ============================================================
-- AutoPark Manager – Patch v2
-- Corrige : paiement client bloqué + admin sans réservations
-- Instructions : coller dans Supabase → SQL Editor → Run
-- ============================================================

-- ----------------------------------------------------------------
-- FIX 1 : Paiement client
-- La policy payments_update_admin bloquait le client lors de la
-- simulation de paiement (sandbox). On remplace par une policy
-- qui autorise le propriétaire du paiement à mettre à jour le sien.
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "payments_update_admin" ON public.payments;

CREATE POLICY "payments_update_own_or_admin" ON public.payments
  FOR UPDATE
  USING (user_id = auth.uid() OR public.is_admin());

-- ----------------------------------------------------------------
-- FIX 2 : Admin voit 0 réservation
-- Les vues PostgreSQL nécessitent un GRANT explicite pour être
-- accessibles via l'API PostgREST de Supabase.
-- ----------------------------------------------------------------
GRANT SELECT ON public.reservations_with_details TO authenticated;
GRANT SELECT ON public.dashboard_stats TO anon, authenticated;
