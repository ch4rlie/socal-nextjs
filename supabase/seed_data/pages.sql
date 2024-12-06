-- Insert dummy pages
INSERT INTO pages (id, title, slug, content, page_type, requires_auth, is_published, meta_title, meta_description, show_in_footer, show_in_header, footer_order, header_order, is_searchable, created_at, updated_at)
VALUES
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'About SoCal Prerunner',
    'about',
    '',
    'about',
    false,
    true,
    'About Us - SoCal Prerunner | Off-Road Vehicle Parts & Accessories',
    'Learn about SoCal Prerunner, your premier source for high-quality off-road vehicle parts and accessories. Discover our story and commitment to the off-road community.',
    true,
    true,
    1,
    1,
    true,
    NOW(),
    NOW()
  ),
  (
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    'Shipping Policy',
    'shipping-policy',
    '',
    'policy',
    false,
    true,
    'Shipping Policy - SoCal Prerunner',
    'Read our shipping policy to learn about delivery times, costs, and tracking your order.',
    true,
    false,
    2,
    null,
    true,
    NOW(),
    NOW()
  ),
  (
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
    'Frequently Asked Questions',
    'faq',
    '',
    'support',
    false,
    true,
    'FAQ - SoCal Prerunner | Common Questions Answered',
    'Find answers to commonly asked questions about our products, shipping, returns, and more.',
    true,
    true,
    3,
    2,
    true,
    NOW(),
    NOW()
  );

-- Insert page sections
INSERT INTO page_sections (id, page_id, content, section_type, sort_order, is_visible, created_at, updated_at)
VALUES
  -- About page sections
  (
    'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    '{"time":1710633600000,"blocks":[{"id":"header","type":"header","data":{"text":"Welcome to SoCal Prerunner","level":2}},{"id":"intro","type":"paragraph","data":{"text":"SoCal Prerunner is your premier destination for high-quality off-road vehicle parts and accessories. Founded by passionate off-road enthusiasts, we understand the importance of reliable equipment for your adventures."}}]}',
    'text',
    0,
    true,
    NOW(),
    NOW()
  ),
  (
    'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a15',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    '{"time":1710633600000,"blocks":[{"id":"mission-header","type":"header","data":{"text":"Our Mission","level":2}},{"id":"mission-text","type":"paragraph","data":{"text":"We are committed to providing the off-road community with top-tier products, expert guidance, and exceptional service. Our team of experienced professionals is dedicated to helping you build and maintain your dream off-road vehicle."}}]}',
    'text',
    1,
    true,
    NOW(),
    NOW()
  ),
  -- Shipping policy sections
  (
    'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a16',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    '{"time":1710633600000,"blocks":[{"id":"shipping-header","type":"header","data":{"text":"General Shipping Information","level":2}},{"id":"shipping-info","type":"paragraph","data":{"text":"We offer various shipping options to meet your needs. Most orders are processed within 1-2 business days and shipped via trusted carriers."}},{"id":"shipping-list","type":"list","data":{"style":"unordered","items":["Free shipping on orders over $100","Standard shipping (3-5 business days)","Express shipping (1-2 business days)","International shipping available"]}}]}',
    'text',
    0,
    true,
    NOW(),
    NOW()
  ),
  -- FAQ page sections
  (
    '16eebc99-9c0b-4ef8-bb6d-6bb9bd380a17',
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
    '',
    'faq',
    0,
    true,
    NOW(),
    NOW()
  );

-- Insert FAQ items
INSERT INTO faq_items (id, section_id, question, answer, sort_order, created_at, updated_at)
VALUES
  (
    '27eebc99-9c0b-4ef8-bb6d-6bb9bd380a18',
    '16eebc99-9c0b-4ef8-bb6d-6bb9bd380a17',
    'What payment methods do you accept?',
    'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and Shop Pay.',
    0,
    NOW(),
    NOW()
  ),
  (
    '38eebc99-9c0b-4ef8-bb6d-6bb9bd380a19',
    '16eebc99-9c0b-4ef8-bb6d-6bb9bd380a17',
    'What is your return policy?',
    'We offer a 30-day return policy for most items. Products must be in original condition with all packaging and documentation. Custom orders may not be eligible for return.',
    1,
    NOW(),
    NOW()
  ),
  (
    '49eebc99-9c0b-4ef8-bb6d-6bb9bd380a20',
    '16eebc99-9c0b-4ef8-bb6d-6bb9bd380a17',
    'Do you ship internationally?',
    'Yes, we ship to most countries worldwide. International shipping rates and delivery times vary by location. Please note that customers are responsible for any import duties or taxes.',
    2,
    NOW(),
    NOW()
  ),
  (
    '5aeebc99-9c0b-4ef8-bb6d-6bb9bd380a21',
    '16eebc99-9c0b-4ef8-bb6d-6bb9bd380a17',
    'How can I track my order?',
    'Once your order ships, you will receive a tracking number via email. You can use this number to track your package on our website or directly through the carrier''s website.',
    3,
    NOW(),
    NOW()
  );
