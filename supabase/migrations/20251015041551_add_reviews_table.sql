-- Create reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(contract_id, author_id) -- Each user can only review a contract once
);

-- Create indexes
CREATE INDEX idx_reviews_target ON public.reviews(target_id);
CREATE INDEX idx_reviews_contract ON public.reviews(contract_id);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reviews
CREATE POLICY "Reviews are public" ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create reviews on completed contracts they participated in" ON public.reviews FOR INSERT
  WITH CHECK (
    auth.uid() = author_id AND
    EXISTS (
      SELECT 1 FROM public.contracts
      WHERE
        id = contract_id AND
        status = 'CONCLUIDO' AND
        (company_id = author_id OR freela_id = author_id)
    )
  );

-- Function to update trust score (v1 - simple average)
CREATE OR REPLACE FUNCTION public.update_trust_score()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating DECIMAL;
BEGIN
  SELECT AVG(rating) INTO avg_rating
  FROM public.reviews
  WHERE target_id = NEW.target_id;

  UPDATE public.profiles
  SET trust_score = avg_rating
  WHERE id = NEW.target_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update trust score after a new review is inserted
CREATE TRIGGER on_new_review_update_trust_score
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_trust_score();
