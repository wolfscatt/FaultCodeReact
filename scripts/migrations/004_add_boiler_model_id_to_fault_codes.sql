-- Migration: Add boiler_model_id to fault_codes table
-- This allows fault codes to be associated with specific boiler models

-- Add the column (nullable, as some fault codes apply to all models of a brand)
ALTER TABLE public.fault_codes
ADD COLUMN IF NOT EXISTS boiler_model_id uuid;

-- Add foreign key constraint if the column was just created
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'fault_codes_boiler_model_id_fkey'
  ) THEN
    ALTER TABLE public.fault_codes
    ADD CONSTRAINT fault_codes_boiler_model_id_fkey
    FOREIGN KEY (boiler_model_id) REFERENCES public.boiler_models(id);
  END IF;
END $$;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_fault_codes_boiler_model_id 
ON public.fault_codes(boiler_model_id);

-- Add comment
COMMENT ON COLUMN public.fault_codes.boiler_model_id IS 
'Optional reference to a specific boiler model. If NULL, the fault code applies to all models of the brand.';

