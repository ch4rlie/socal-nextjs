-- Create pages table
CREATE TABLE pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    meta_title TEXT,
    meta_description TEXT,
    is_published BOOLEAN DEFAULT false,
    publish_date TIMESTAMP WITH TIME ZONE,
    author_id UUID REFERENCES auth.users(id),
    last_edited_by UUID REFERENCES auth.users(id),
    page_type TEXT NOT NULL CHECK (
        page_type IN (
            'policy',
            'legal',
            'support',
            'about',
            'custom'
        )
    ),
    show_in_footer BOOLEAN DEFAULT false,
    show_in_header BOOLEAN DEFAULT false,
    footer_order INTEGER,
    header_order INTEGER,
    parent_page_id UUID REFERENCES pages(id),
    is_searchable BOOLEAN DEFAULT true,
    requires_auth BOOLEAN DEFAULT false,
    custom_css TEXT,
    custom_js TEXT,
    version INTEGER DEFAULT 1,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create page revisions table for version history
CREATE TABLE page_revisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    content TEXT NOT NULL,
    title TEXT NOT NULL,
    meta_title TEXT,
    meta_description TEXT,
    edited_by UUID REFERENCES auth.users(id),
    version INTEGER NOT NULL,
    change_summary TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create page sections table for modular content
CREATE TABLE page_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    title TEXT,
    content TEXT NOT NULL,
    section_type TEXT NOT NULL CHECK (
        section_type IN (
            'text',
            'html',
            'markdown',
            'contact_form',
            'faq',
            'image_gallery',
            'video',
            'custom'
        )
    ),
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_visible BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create FAQ items table for FAQ sections
CREATE TABLE faq_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_id UUID REFERENCES page_sections(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_visible BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Add indexes for better performance
CREATE INDEX idx_pages_slug ON pages(slug);
CREATE INDEX idx_pages_type ON pages(page_type);
CREATE INDEX idx_pages_published ON pages(is_published) WHERE is_published = true;
CREATE INDEX idx_page_revisions_page ON page_revisions(page_id);
CREATE INDEX idx_page_sections_page ON page_sections(page_id);
CREATE INDEX idx_faq_items_section ON faq_items(section_id);

-- Enable Row Level Security
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Published pages are viewable by everyone" ON pages
    FOR SELECT USING (is_published = true AND (NOT requires_auth OR auth.role() IS NOT NULL));

CREATE POLICY "Staff can manage all pages" ON pages
    FOR ALL USING (auth.jwt() ->> 'role' = 'staff');

CREATE POLICY "Staff can view revisions" ON page_revisions
    FOR SELECT USING (auth.jwt() ->> 'role' = 'staff');

CREATE POLICY "Staff can manage sections" ON page_sections
    FOR ALL USING (auth.jwt() ->> 'role' = 'staff');

CREATE POLICY "Anyone can view visible sections" ON page_sections
    FOR SELECT USING (
        is_visible = true AND
        EXISTS (
            SELECT 1 FROM pages
            WHERE id = page_sections.page_id
            AND is_published = true
            AND (NOT requires_auth OR auth.role() IS NOT NULL)
        )
    );

CREATE POLICY "Staff can manage FAQ items" ON faq_items
    FOR ALL USING (auth.jwt() ->> 'role' = 'staff');

CREATE POLICY "Anyone can view visible FAQ items" ON faq_items
    FOR SELECT USING (
        is_visible = true AND
        EXISTS (
            SELECT 1 FROM page_sections s
            JOIN pages p ON p.id = s.page_id
            WHERE s.id = faq_items.section_id
            AND s.is_visible = true
            AND p.is_published = true
            AND (NOT p.requires_auth OR auth.role() IS NOT NULL)
        )
    );

-- Insert some default pages
INSERT INTO pages (
    title,
    slug,
    content,
    page_type,
    is_published,
    show_in_footer,
    footer_order,
    meta_title,
    meta_description
) VALUES
(
    'Privacy Policy',
    'privacy-policy',
    'Our Privacy Policy content will go here.',
    'policy',
    true,
    true,
    1,
    'Privacy Policy - SoCal Prerunner',
    'Learn about how we collect, use, and protect your personal information.'
),
(
    'Terms and Conditions',
    'terms',
    'Our Terms and Conditions content will go here.',
    'legal',
    true,
    true,
    2,
    'Terms and Conditions - SoCal Prerunner',
    'Read our terms and conditions for using our website and services.'
),
(
    'Return Policy',
    'returns',
    'Our Return Policy content will go here.',
    'policy',
    true,
    true,
    3,
    'Return Policy - SoCal Prerunner',
    'Learn about our return and refund policies.'
),
(
    'Contact Us',
    'contact',
    'Contact form and information will go here.',
    'support',
    true,
    true,
    4,
    'Contact Us - SoCal Prerunner',
    'Get in touch with our team for support or inquiries.'
);

-- Function to update page timestamps
CREATE OR REPLACE FUNCTION update_page_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for timestamp updates
CREATE TRIGGER update_pages_timestamp
    BEFORE UPDATE ON pages
    FOR EACH ROW
    EXECUTE FUNCTION update_page_timestamp();

CREATE TRIGGER update_page_sections_timestamp
    BEFORE UPDATE ON page_sections
    FOR EACH ROW
    EXECUTE FUNCTION update_page_timestamp();
