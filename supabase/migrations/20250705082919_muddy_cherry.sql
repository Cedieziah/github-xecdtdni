/*
  # Add Theme Settings Table

  1. New Table
    - `theme_settings` table to store global theme settings
    - Stores theme mode, font size, and other appearance settings
    - Includes audit fields for tracking changes

  2. Security
    - Enable RLS on theme_settings table
    - Add policies for admin management and public viewing
    - Ensure proper access control
*/

-- Create the theme_settings table
CREATE TABLE IF NOT EXISTS theme_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_mode TEXT NOT NULL DEFAULT 'dark',
  font_size TEXT NOT NULL DEFAULT 'default',
  is_global BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id)
);

-- Add comments for clarity
COMMENT ON TABLE theme_settings IS 'Stores global theme settings for the application';
COMMENT ON COLUMN theme_settings.theme_mode IS 'Theme mode (dark or light)';
COMMENT ON COLUMN theme_settings.font_size IS 'Font size (default, medium, large)';
COMMENT ON COLUMN theme_settings.is_global IS 'Whether these settings apply globally to all users';

-- Create trigger function for updating timestamp
CREATE OR REPLACE FUNCTION update_theme_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_update_theme_settings_updated_at
BEFORE UPDATE ON theme_settings
FOR EACH ROW
EXECUTE FUNCTION update_theme_settings_updated_at();

-- Enable Row Level Security
ALTER TABLE theme_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Policy for admins to manage theme settings
CREATE POLICY "Admins can manage theme settings"
ON theme_settings
FOR ALL
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'::user_role
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'::user_role
  )
);

-- Policy for all users to view theme settings
CREATE POLICY "All users can view theme settings"
ON theme_settings
FOR SELECT
TO authenticated
USING (true);

-- Insert default theme settings if none exist
INSERT INTO theme_settings (theme_mode, font_size, is_global, created_by)
SELECT 'dark', 'default', true, id
FROM profiles
WHERE role = 'admin'::user_role
LIMIT 1
ON CONFLICT DO NOTHING;

-- Create function to get current theme settings
CREATE OR REPLACE FUNCTION get_current_theme_settings()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  settings JSONB;
BEGIN
  SELECT jsonb_build_object(
    'theme_mode', theme_mode,
    'font_size', font_size,
    'is_global', is_global,
    'updated_at', updated_at
  )
  INTO settings
  FROM theme_settings
  WHERE is_global = true
  ORDER BY updated_at DESC
  LIMIT 1;
  
  RETURN COALESCE(settings, '{"theme_mode": "dark", "font_size": "default", "is_global": true}'::jsonb);
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_current_theme_settings() TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_theme_settings() TO anon;

-- Create function to update theme settings
CREATE OR REPLACE FUNCTION update_theme_settings(
  p_theme_mode TEXT,
  p_font_size TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_settings JSONB;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'::user_role
  ) THEN
    RAISE EXCEPTION 'Only administrators can update theme settings';
  END IF;
  
  -- Update or insert settings
  WITH upsert AS (
    UPDATE theme_settings
    SET 
      theme_mode = p_theme_mode,
      font_size = p_font_size,
      updated_at = now(),
      updated_by = auth.uid()
    WHERE is_global = true
    RETURNING *
  )
  INSERT INTO theme_settings (
    theme_mode, 
    font_size, 
    is_global, 
    created_by
  )
  SELECT 
    p_theme_mode, 
    p_font_size, 
    true, 
    auth.uid()
  WHERE NOT EXISTS (SELECT 1 FROM upsert);
  
  -- Return updated settings
  SELECT jsonb_build_object(
    'theme_mode', theme_mode,
    'font_size', font_size,
    'is_global', is_global,
    'updated_at', updated_at
  )
  INTO updated_settings
  FROM theme_settings
  WHERE is_global = true
  ORDER BY updated_at DESC
  LIMIT 1;
  
  RETURN updated_settings;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION update_theme_settings(TEXT, TEXT) TO authenticated;

-- Add helpful notice
DO $$
BEGIN
  RAISE NOTICE '--------------------------------------------------------------';
  RAISE NOTICE 'THEME SETTINGS SYSTEM CREATED SUCCESSFULLY';
  RAISE NOTICE '--------------------------------------------------------------';
  RAISE NOTICE 'Tables created: theme_settings';
  RAISE NOTICE 'Functions created: get_current_theme_settings, update_theme_settings';
  RAISE NOTICE 'RLS policies: Enabled with admin management and public viewing';
  RAISE NOTICE '';
  RAISE NOTICE 'To get current theme settings:';
  RAISE NOTICE 'SELECT get_current_theme_settings();';
  RAISE NOTICE '';
  RAISE NOTICE 'To update theme settings (admin only):';
  RAISE NOTICE 'SELECT update_theme_settings(''light'', ''medium'');';
  RAISE NOTICE '--------------------------------------------------------------';
END $$;