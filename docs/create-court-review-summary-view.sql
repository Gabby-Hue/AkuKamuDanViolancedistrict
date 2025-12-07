-- SQL untuk membuat court_review_summary view
-- Jalankan query ini di Supabase SQL Editor

CREATE OR REPLACE VIEW public.court_review_summary AS
SELECT
  c.id AS court_id,
  COALESCE(AVG(r.rating), 0::NUMERIC)::NUMERIC(3, 2) AS average_rating,
  COUNT(r.*)::INTEGER AS review_count
FROM courts c
LEFT JOIN court_reviews r ON r.court_id = c.id
GROUP BY c.id;

-- Grant permissions untuk view ini
GRANT SELECT ON public.court_review_summary TO authenticated;
GRANT SELECT ON public.court_review_summary TO anon;

-- Comment untuk dokumentasi
COMMENT ON VIEW public.court_review_summary IS 'Summary view for court ratings and review counts. Joins courts with court_reviews to calculate average rating and total review count per court.';