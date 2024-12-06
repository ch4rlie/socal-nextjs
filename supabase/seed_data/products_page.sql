-- Insert products page
INSERT INTO pages (id, title, slug, content, page_type, requires_auth, is_published, meta_title, meta_description, show_in_footer, show_in_header, footer_order, header_order, is_searchable, created_at, updated_at)
VALUES
  (
    '6beebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'Products',
    'products',
    '',
    'custom',
    false,
    true,
    'Off-Road Vehicle Parts & Accessories | SoCal Prerunner',
    'Browse our extensive collection of high-quality off-road vehicle parts and accessories. From suspension systems to lighting solutions, find everything you need for your off-road adventure.',
    true,
    true,
    0,
    0,
    true,
    NOW(),
    NOW()
  );

-- Insert page sections
INSERT INTO page_sections (id, page_id, content, section_type, sort_order, is_visible, created_at, updated_at)
VALUES
  -- Hero section
  (
    '7ceebc99-9c0b-4ef8-bb6d-6bb9bd380a23',
    '6beebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    '{"time":1710633600000,"blocks":[{"id":"hero-header","type":"header","data":{"text":"Off-Road Parts & Accessories","level":1}},{"id":"hero-subtext","type":"paragraph","data":{"text":"Discover our extensive collection of high-quality parts and accessories for your off-road vehicle. From essential components to performance upgrades, we have everything you need to enhance your off-road experience."}}]}',
    'text',
    0,
    true,
    NOW(),
    NOW()
  ),
  -- Categories section
  (
    '8deebc99-9c0b-4ef8-bb6d-6bb9bd380a24',
    '6beebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    '{"time":1710633600000,"blocks":[{"id":"categories-header","type":"header","data":{"text":"Product Categories","level":2}},{"id":"categories-list","type":"list","data":{"style":"unordered","items":["Suspension Systems","Lighting Solutions","Performance Parts","Body Armor & Protection","Wheels & Tires","Recovery Gear","Storage Solutions","Electronics & Navigation"]}}]}',
    'text',
    1,
    true,
    NOW(),
    NOW()
  ),
  -- Featured Products section
  (
    '9eeebc99-9c0b-4ef8-bb6d-6bb9bd380a25',
    '6beebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    '{"time":1710633600000,"blocks":[{"id":"featured-header","type":"header","data":{"text":"Featured Products","level":2}},{"id":"featured-intro","type":"paragraph","data":{"text":"Check out our hand-picked selection of premium off-road equipment and accessories."}},{"id":"featured-list","type":"list","data":{"style":"unordered","items":["Premium Long Travel Suspension Kit","High-Output LED Light Bars","Heavy-Duty Steel Bumpers","Off-Road Recovery Kit","All-Terrain Wheel & Tire Package"]}}]}',
    'text',
    2,
    true,
    NOW(),
    NOW()
  ),
  -- Why Choose Us section
  (
    'afeebc99-9c0b-4ef8-bb6d-6bb9bd380a26',
    '6beebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    '{"time":1710633600000,"blocks":[{"id":"why-header","type":"header","data":{"text":"Why Choose SoCal Prerunner","level":2}},{"id":"why-text","type":"paragraph","data":{"text":"At SoCal Prerunner, we pride ourselves on offering:"}},{"id":"why-list","type":"list","data":{"style":"unordered","items":["Premium Quality Parts","Expert Technical Support","Fast & Reliable Shipping","Competitive Pricing","Extensive Product Selection","Professional Installation Services","Satisfaction Guarantee","Dedicated Customer Support"]}}]}',
    'text',
    3,
    true,
    NOW(),
    NOW()
  );
