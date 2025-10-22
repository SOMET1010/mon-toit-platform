-- Add CryptoNeo columns to leases table
ALTER TABLE leases
ADD COLUMN IF NOT EXISTS cryptoneo_operation_id TEXT,
ADD COLUMN IF NOT EXISTS cryptoneo_signature_status TEXT CHECK (cryptoneo_signature_status IN ('pending', 'processing', 'completed', 'failed')),
ADD COLUMN IF NOT EXISTS cryptoneo_signed_document_url TEXT,
ADD COLUMN IF NOT EXISTS cryptoneo_callback_received_at TIMESTAMPTZ;

-- Create index for faster lookups by operation_id
CREATE INDEX IF NOT EXISTS idx_leases_cryptoneo_operation_id ON leases(cryptoneo_operation_id);

-- Create index for status filtering
CREATE INDEX IF NOT EXISTS idx_leases_cryptoneo_signature_status ON leases(cryptoneo_signature_status);

-- Add comment
COMMENT ON COLUMN leases.cryptoneo_operation_id IS 'ID de l''opération de signature CryptoNeo';
COMMENT ON COLUMN leases.cryptoneo_signature_status IS 'Statut de la signature électronique CryptoNeo';
COMMENT ON COLUMN leases.cryptoneo_signed_document_url IS 'URL du document signé électroniquement';
COMMENT ON COLUMN leases.cryptoneo_callback_received_at IS 'Date de réception du callback CryptoNeo';

