-- LifeX Mobile - Events Table
-- 创建events表用于存储活动信息

-- 如果表已存在，先删除（仅用于开发环境）
-- DROP TABLE IF EXISTS events CASCADE;

-- 创建events表
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time VARCHAR(50) NOT NULL,
  location VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  price VARCHAR(50) DEFAULT 'Free',
  attendees INTEGER DEFAULT 0,
  image_url TEXT,
  tags TEXT[],
  is_hot BOOLEAN DEFAULT FALSE,
  organizer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_is_hot ON events(is_hot);
CREATE INDEX IF NOT EXISTS idx_events_is_active ON events(is_active);
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_business_id ON events(business_id);

-- 创建更新时间的触发器
CREATE OR REPLACE FUNCTION update_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_events_updated_at();

-- 创建增加浏览次数的函数
CREATE OR REPLACE FUNCTION increment_event_views(event_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE events
  SET view_count = view_count + 1
  WHERE id = event_id;
END;
$$ LANGUAGE plpgsql;

-- 设置Row Level Security (RLS)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- 允许所有人查看活跃的events
CREATE POLICY "Allow public read access to active events"
  ON events
  FOR SELECT
  USING (is_active = TRUE);

-- 只有认证用户可以创建events
CREATE POLICY "Allow authenticated users to create events"
  ON events
  FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

-- 只有event的创建者可以更新
CREATE POLICY "Allow organizers to update their own events"
  ON events
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = organizer_id)
  WITH CHECK (auth.uid() = organizer_id);

-- 只有event的创建者可以删除（软删除）
CREATE POLICY "Allow organizers to delete their own events"
  ON events
  FOR DELETE
  TO authenticated
  USING (auth.uid() = organizer_id);

-- 插入示例数据
INSERT INTO events (title, description, date, time, location, category, price, attendees, image_url, tags, is_hot) VALUES
  ('Auckland Food & Wine Festival', 'Celebrate local cuisine and premium wines from New Zealand''s finest vineyards', '2024-12-15', '12:00 PM - 8:00 PM', 'Viaduct Harbour', 'Food & Drink', '$25', 2300, 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=200&fit=crop&crop=center&auto=format&q=60', ARRAY['food', 'wine', 'festival'], TRUE),
  
  ('Auckland Marathon 2024', 'Join thousands of runners in this iconic race through Auckland''s most scenic routes', '2024-12-20', '6:30 AM - 12:00 PM', 'Auckland Domain', 'Sports & Fitness', 'Free', 8500, 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&h=200&fit=crop&crop=center&auto=format&q=60', ARRAY['marathon', 'fitness', 'community'], TRUE),
  
  ('NZ Art Week Exhibition', 'Contemporary New Zealand artists showcase their latest works', '2024-12-18', '10:00 AM - 6:00 PM', 'Auckland Art Gallery', 'Arts & Culture', '$15', 1800, 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=200&fit=crop&crop=center&auto=format&q=60', ARRAY['art', 'exhibition', 'culture'], FALSE),
  
  ('Tech Innovation Summit', 'Leading tech companies and startups discuss the future of technology', '2024-12-22', '9:00 AM - 5:00 PM', 'Aotea Centre', 'Business & Technology', '$120', 950, 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=200&fit=crop&crop=center&auto=format&q=60', ARRAY['tech', 'innovation', 'networking'], FALSE),
  
  ('Summer Music Festival', 'Local and international artists perform live across multiple stages', '2024-12-28', '2:00 PM - 11:00 PM', 'Western Springs', 'Music & Entertainment', '$85', 12000, 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=200&fit=crop&crop=center&auto=format&q=60', ARRAY['music', 'festival', 'summer'], TRUE),
  
  ('Christmas Market 2024', 'Browse handcrafted gifts and enjoy festive food and drinks', '2024-12-14', '10:00 AM - 8:00 PM', 'Aotea Square', 'Food & Drink', 'Free', 5000, 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=400&h=200&fit=crop&crop=center&auto=format&q=60', ARRAY['christmas', 'market', 'shopping'], TRUE);

-- 显示创建的表信息
SELECT 
  COUNT(*) as total_events,
  COUNT(CASE WHEN is_hot THEN 1 END) as hot_events,
  COUNT(CASE WHEN is_active THEN 1 END) as active_events
FROM events;

COMMENT ON TABLE events IS 'Stores event information for the LifeX mobile application';
COMMENT ON COLUMN events.id IS 'Unique identifier for the event';
COMMENT ON COLUMN events.title IS 'Event title';
COMMENT ON COLUMN events.description IS 'Detailed description of the event';
COMMENT ON COLUMN events.date IS 'Event date';
COMMENT ON COLUMN events.time IS 'Event time (stored as string for flexibility)';
COMMENT ON COLUMN events.location IS 'Event location/venue';
COMMENT ON COLUMN events.category IS 'Event category (e.g., Food & Drink, Sports & Fitness)';
COMMENT ON COLUMN events.price IS 'Event price (stored as string for flexibility, e.g., "Free", "$25")';
COMMENT ON COLUMN events.attendees IS 'Number of attendees';
COMMENT ON COLUMN events.image_url IS 'URL to event image';
COMMENT ON COLUMN events.tags IS 'Array of tags for categorization';
COMMENT ON COLUMN events.is_hot IS 'Whether the event is featured/hot';
COMMENT ON COLUMN events.organizer_id IS 'Reference to the user who created the event';
COMMENT ON COLUMN events.business_id IS 'Reference to associated business (if applicable)';
COMMENT ON COLUMN events.is_active IS 'Whether the event is active/visible';
COMMENT ON COLUMN events.view_count IS 'Number of times the event was viewed';
COMMENT ON COLUMN events.like_count IS 'Number of likes';
COMMENT ON COLUMN events.share_count IS 'Number of times the event was shared';

