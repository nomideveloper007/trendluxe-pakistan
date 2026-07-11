
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;

DROP POLICY IF EXISTS "Anyone subscribes" ON public.newsletter_subscribers;
CREATE POLICY "Public subscribes" ON public.newsletter_subscribers FOR INSERT TO anon, authenticated WITH CHECK (email IS NOT NULL AND char_length(email) BETWEEN 3 AND 255);

DROP POLICY IF EXISTS "Anyone sends message" ON public.contact_messages;
CREATE POLICY "Public sends message" ON public.contact_messages FOR INSERT TO anon, authenticated WITH CHECK (
  char_length(name) BETWEEN 1 AND 100
  AND char_length(email) BETWEEN 3 AND 255
  AND char_length(subject) BETWEEN 1 AND 150
  AND char_length(message) BETWEEN 10 AND 2000
);
