-- Add new columns to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS duration_hours INTEGER,
ADD COLUMN IF NOT EXISTS total_cost DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);

-- Update existing bookings with calculated values
UPDATE bookings b
SET 
  duration_hours = CEIL(EXTRACT(EPOCH FROM (b.end_time - b.start_time)) / 3600),
  total_cost = (
    CASE 
      -- Minimum 6 hours
      WHEN EXTRACT(EPOCH FROM (b.end_time - b.start_time)) / 3600 <= 6 THEN 
        CEIL(6 * (r.cost / 24.0))
      -- 6-12 hours: hourly rate
      WHEN EXTRACT(EPOCH FROM (b.end_time - b.start_time)) / 3600 <= 12 THEN 
        CEIL(CEIL(EXTRACT(EPOCH FROM (b.end_time - b.start_time)) / 3600) * (r.cost / 24.0))
      -- 12-24 hours: full day rate
      WHEN EXTRACT(EPOCH FROM (b.end_time - b.start_time)) / 3600 <= 24 THEN 
        r.cost
      -- Multiple days
      ELSE 
        CEIL(CEIL(EXTRACT(EPOCH FROM (b.end_time - b.start_time)) / 3600) / 24.0) * r.cost
    END
  ),
  payment_method = 'CASH'
FROM rooms r
WHERE b.room_id = r.id AND b.duration_hours IS NULL;