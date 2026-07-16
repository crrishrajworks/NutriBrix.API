CREATE TABLE IF NOT EXISTS enquiries (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  pack VARCHAR(50) DEFAULT 'not-sure',
  location VARCHAR(255) DEFAULT '',
  message TEXT DEFAULT '',
  status VARCHAR(20) DEFAULT 'new',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) UNIQUE NOT NULL,
  excerpt TEXT DEFAULT '',
  content TEXT NOT NULL,
  cover_image VARCHAR(500) DEFAULT '',
  published BOOLEAN DEFAULT false,
  author VARCHAR(255) DEFAULT 'NutriBrix Team',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  weight VARCHAR(50) NOT NULL,
  price INTEGER NOT NULL,
  per_kg INTEGER NOT NULL,
  label VARCHAR(255) DEFAULT '',
  description TEXT DEFAULT '',
  image VARCHAR(500) DEFAULT '',
  featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS testimonials (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(500) DEFAULT '',
  initials VARCHAR(10) DEFAULT '',
  quote TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) DEFAULT 'Admin',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_settings (
  key VARCHAR(255) PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO site_settings (key, value) VALUES
  ('whatsapp_number', '91XXXXXXXXXX'),
  ('email', 'info@nutribrix.in'),
  ('phone', '+91 XXXXX XXXXX'),
  ('location', 'Rajkot, Gujarat'),
  ('domain', 'www.nutribrix.in')
ON CONFLICT (key) DO NOTHING;

INSERT INTO products (weight, price, per_kg, label, description, image, featured, display_order) VALUES
  ('5 KG', 149, 30, 'Small farmers', 'Trial & convenience pack', '/bag-5kg.jpg', false, 1),
  ('10 KG', 269, 27, 'Regular use', 'Mid-sized landholdings', '/bag-10kg.jpg', true, 2),
  ('30-40 KG', 525, 15, 'Bulk / FPO use', 'Farmer Producer Organizations', '/bag-30-40kg.jpg', false, 3)
ON CONFLICT DO NOTHING;

INSERT INTO testimonials (name, role, initials, quote, display_order) VALUES
  ('Ramesh Patel', 'Small farmer, 2-4 acre landholding, cotton & groundnut, Gujarat', 'RP', 'I used to burn what was left after harvest — there was no other way to clear the field. Now that waste goes back into the soil instead of up in smoke.', 1),
  ('Sunita Mehta', 'Vegetable grower, Junagadh, Gujarat', 'SM', 'The compressed block format means no spillage, no mess. My vegetable garden has never looked better. The gradual nutrient release really works.', 2),
  ('Dinesh Kumar', 'FPO Leader, Amreli, Gujarat', 'DK', 'Our FPO ordered 20 bags of the 30–40kg pack. The 10% discount made it very affordable. Soil moisture retention has improved noticeably across all our member farms.', 3),
  ('Bhavesh Joshi', 'Marginal farmer, Bhavnagar, Gujarat', 'BJ', 'I was sceptical at first, but NutriBrix changed my mind. The block format is genius — easy to handle, no mess, and the results speak for themselves.', 4)
ON CONFLICT DO NOTHING;
