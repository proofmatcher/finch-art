const { getDb } = require('./schema');
const bcrypt = require('bcryptjs');

async function seed() {
  const db = getDb();

  console.log('🌱 Seeding database...');

  // Seed admin user
  const adminPassword = await bcrypt.hash('FinchArt2024!', 12);
  const admin = db.prepare(`
    INSERT OR IGNORE INTO users (email, password_hash, first_name, last_name, is_admin)
    VALUES (?, ?, ?, ?, 1)
  `).run('admin@finchart.com', adminPassword, 'Robert', 'Finch');
  console.log('✅ Admin user seeded');

  // Seed artworks
  const artworks = [
    {
      title: 'Desert Solstice',
      slug: 'desert-solstice',
      description: 'A explosive celebration of color and energy capturing the spiritual power of the New Mexico desert at its peak. Bold vermillion and cadmium orange interplay with cobalt and teal in this signature Finch canvas. The layered mixed media surface reveals the depth of the Southwest spirit world that has inspired Porter\'s work for decades.',
      category: 'painting',
      medium: 'Mixed Media on Canvas',
      style: 'Abstract Expressionism',
      subject: 'Landscape & Nature',
      width_inches: 48,
      height_inches: 36,
      depth_inches: 1.5,
      year: 2023,
      price: 4200,
      sale_price: null,
      is_featured: 1,
      is_available: 1,
      has_prints: 1,
      print_price: 185,
      image_url: '/uploads/artwork_desert_solstice.png',
      ships_from: 'Santa Fe, NM',
      shipping_days: 14
    },
    {
      title: 'Spirit Reflection',
      slug: 'spirit-reflection',
      description: 'Deep crimson and emerald speak to the dialogue between earth and sky in this meditative canvas. Porter\'s 18+ years studying A Course in Miracles informs this piece\'s spiritual depth — a reflection of the inner world projected outward through color and form. Collectors of note compare this to the emotional charge of early de Kooning.',
      category: 'painting',
      medium: 'Mixed Media on Canvas',
      style: 'Abstract Expressionism',
      subject: 'Spiritual & Mystical',
      width_inches: 36,
      height_inches: 36,
      depth_inches: 1.5,
      year: 2022,
      price: 3600,
      sale_price: 2880,
      is_on_sale: 1,
      is_featured: 1,
      is_available: 1,
      has_prints: 1,
      print_price: 155,
      image_url: '/uploads/artwork_spirit_reflection.png',
      ships_from: 'Santa Fe, NM',
      shipping_days: 14
    },
    {
      title: 'Santa Fe Sky',
      slug: 'santa-fe-sky',
      description: 'The vast New Mexico sky at dusk — purples and golds colliding in sweeping horizontal marks that capture the infinite horizon of the high desert. One of Porter\'s most celebrated landscape works, this piece evokes the expansive spiritual freedom that drew him from Little Rock to the American Southwest.',
      category: 'painting',
      medium: 'Mixed Media on Canvas',
      style: 'Abstract Expressionism',
      subject: 'Landscape & Sky',
      width_inches: 60,
      height_inches: 40,
      depth_inches: 1.5,
      year: 2023,
      price: 5800,
      sale_price: null,
      is_featured: 1,
      is_available: 1,
      has_prints: 1,
      print_price: 215,
      image_url: '/uploads/artwork_santa_fe_sky.png',
      ships_from: 'Santa Fe, NM',
      shipping_days: 21
    },
    {
      title: 'Cosmic Tide',
      slug: 'cosmic-tide',
      description: 'Cerulean and cobalt surge across this large-format canvas, channeling the oceanic energy Porter encountered during his time on the Pacific coast. The dripping paint creates a sense of movement and flow — water in perpetual conversation with the cosmic forces that shape our world. A deeply meditative and visually arresting piece.',
      category: 'painting',
      medium: 'Mixed Media on Canvas',
      style: 'Abstract Expressionism',
      subject: 'Ocean & Water',
      width_inches: 48,
      height_inches: 48,
      depth_inches: 2,
      year: 2021,
      price: 5200,
      sale_price: null,
      is_featured: 0,
      is_available: 1,
      has_prints: 1,
      print_price: 195,
      image_url: '/uploads/artwork_cosmic_tide.png',
      ships_from: 'Santa Fe, NM',
      shipping_days: 14
    },
    {
      title: 'Fire Dance',
      slug: 'fire-dance',
      description: 'Orange and vermillion erupt against a dark ground in this powerful statement about primal energy and creative force. Porter\'s use of multiple application instruments — palette knife, brush, pour, and hand — creates a surface texture that photographs cannot fully capture. Must be seen in person to appreciate its full luminosity.',
      category: 'painting',
      medium: 'Mixed Media on Canvas',
      style: 'Abstract Expressionism',
      subject: 'Fire & Energy',
      width_inches: 36,
      height_inches: 48,
      depth_inches: 1.5,
      year: 2023,
      price: 3900,
      sale_price: null,
      is_featured: 1,
      is_available: 1,
      has_prints: 1,
      print_price: 165,
      image_url: '/uploads/artwork_fire_dance.png',
      ships_from: 'Santa Fe, NM',
      shipping_days: 14
    },
    {
      title: 'Purple Meditation',
      slug: 'purple-meditation',
      description: 'Violet and gold — the colors of royalty and spirit — dance together in this luminous meditation. Inspired by Porter\'s long practice of A Course in Miracles, this work invites the viewer into a state of contemplative openness. The gold leaf accents catch light differently throughout the day, giving the piece an almost living quality.',
      category: 'painting',
      medium: 'Mixed Media on Canvas',
      style: 'Abstract Expressionism',
      subject: 'Spiritual & Mystical',
      width_inches: 48,
      height_inches: 60,
      depth_inches: 1.5,
      year: 2022,
      price: 6500,
      sale_price: null,
      is_featured: 0,
      is_available: 1,
      has_prints: 1,
      print_price: 225,
      image_url: '/uploads/artwork_purple_meditation.png',
      ships_from: 'Santa Fe, NM',
      shipping_days: 21
    },
    {
      title: 'Green Spirit',
      slug: 'green-spirit',
      description: 'Nature\'s life force rendered in emerald and forest green, punctuated by crimson and magenta that speak of passion and growth. Porter painted this series during spring in Santa Fe, inspired by the Rio Grande bosque coming alive after a desert winter. The gestural marks carry a sense of urgency and joy that is immediately felt.',
      category: 'painting',
      medium: 'Mixed Media on Canvas',
      style: 'Abstract Expressionism',
      subject: 'Nature & Plants',
      width_inches: 30,
      height_inches: 40,
      depth_inches: 1.5,
      year: 2022,
      price: 2800,
      sale_price: 2240,
      is_on_sale: 1,
      is_featured: 0,
      is_available: 1,
      has_prints: 1,
      print_price: 135,
      image_url: '/uploads/artwork_green_spirit.png',
      ships_from: 'Santa Fe, NM',
      shipping_days: 14
    },
    {
      title: 'Golden Dawn',
      slug: 'golden-dawn',
      description: 'The high desert awakens in this luminous sunrise panorama. Amber, ochre, and cadmium orange ignite the horizon while deep blue sky holds the warmth below. Porter has been painting the New Mexico light since 2007 from his studio in the Albuquerque-Santa Fe corridor, and this piece represents the full mastery of that decades-long study.',
      category: 'painting',
      medium: 'Mixed Media on Canvas',
      style: 'Abstract Expressionism',
      subject: 'Landscape & Sunrise',
      width_inches: 60,
      height_inches: 30,
      depth_inches: 1.5,
      year: 2023,
      price: 4800,
      sale_price: null,
      is_featured: 1,
      is_available: 1,
      has_prints: 1,
      print_price: 195,
      image_url: '/uploads/artwork_golden_dawn.png',
      ships_from: 'Santa Fe, NM',
      shipping_days: 21
    },
    {
      title: 'Crimson Horizon',
      slug: 'crimson-horizon',
      description: 'A study in the power of red — how a single dominant hue can carry an entire emotional universe. This intimate canvas was painted during a period of intense personal reflection and radiates a warmth that transforms any wall it inhabits. Porter considers this one of his most purely emotional works.',
      category: 'painting',
      medium: 'Mixed Media on Canvas',
      style: 'Abstract Expressionism',
      subject: 'Abstract',
      width_inches: 24,
      height_inches: 24,
      depth_inches: 1.5,
      year: 2021,
      price: 1800,
      sale_price: null,
      is_featured: 0,
      is_available: 1,
      has_prints: 1,
      print_price: 95,
      image_url: '/uploads/artwork_spirit_reflection.png',
      ships_from: 'Santa Fe, NM',
      shipping_days: 10
    },
    {
      title: 'Blue Mesa',
      slug: 'blue-mesa',
      description: 'The iconic mesa formations of Northern New Mexico translated into pure color energy. Cool cobalt and prussian blue build layer upon layer, with warm earth tones emerging from beneath like geology made visible. Porter\'s Sorbonne-trained eye for European modernism is clearly visible in the compositional rigor beneath the apparent spontaneity.',
      category: 'painting',
      medium: 'Mixed Media on Canvas',
      style: 'Abstract Expressionism',
      subject: 'Landscape',
      width_inches: 48,
      height_inches: 36,
      depth_inches: 1.5,
      year: 2020,
      price: 3400,
      sale_price: null,
      is_featured: 0,
      is_available: 1,
      has_prints: 1,
      print_price: 145,
      image_url: '/uploads/artwork_cosmic_tide.png',
      ships_from: 'Santa Fe, NM',
      shipping_days: 14
    },
    {
      title: 'Solstice Fire',
      slug: 'solstice-fire',
      description: 'Summer solstice energy captured at its peak — the longest day of the year rendered in arcs of orange and gold that spiral outward from a luminous center. This is one of Porter\'s ceremonial pieces, painted to mark the turning point of the solar year. Arrives with a signed Certificate of Authenticity.',
      category: 'painting',
      medium: 'Mixed Media on Canvas',
      style: 'Abstract Expressionism',
      subject: 'Spiritual & Ceremonial',
      width_inches: 40,
      height_inches: 40,
      depth_inches: 1.5,
      year: 2023,
      price: 4400,
      sale_price: null,
      is_featured: 0,
      is_available: 1,
      has_prints: 1,
      print_price: 175,
      image_url: '/uploads/artwork_fire_dance.png',
      ships_from: 'Santa Fe, NM',
      shipping_days: 14
    },
    {
      title: 'Mystical Garden',
      slug: 'mystical-garden',
      description: 'Porter\'s love of nature and the spirit world collide in this verdant, charged canvas. Inspired by the gardens he encountered during his study-abroad year at the Sorbonne in Paris (1984–85), this piece blends European sensibility with Southwest energy. A lush, layered work that rewards extended looking.',
      category: 'painting',
      medium: 'Mixed Media on Canvas',
      style: 'Abstract Expressionism',
      subject: 'Nature & Garden',
      width_inches: 36,
      height_inches: 48,
      depth_inches: 1.5,
      year: 2022,
      price: 3100,
      sale_price: null,
      is_featured: 0,
      is_available: 1,
      has_prints: 1,
      print_price: 135,
      image_url: '/uploads/artwork_green_spirit.png',
      ships_from: 'Santa Fe, NM',
      shipping_days: 14
    }
  ];

  const insertArtwork = db.prepare(`
    INSERT OR IGNORE INTO artworks 
    (title, slug, description, category, medium, style, subject, 
     width_inches, height_inches, depth_inches, year, price, sale_price, is_on_sale,
     is_featured, is_available, has_prints, print_price, image_url, ships_from, shipping_days)
    VALUES 
    (@title, @slug, @description, @category, @medium, @style, @subject,
     @width_inches, @height_inches, @depth_inches, @year, @price, @sale_price, @is_on_sale,
     @is_featured, @is_available, @has_prints, @print_price, @image_url, @ships_from, @shipping_days)
  `);

  for (const artwork of artworks) {
    insertArtwork.run({
      ...artwork,
      is_on_sale: artwork.is_on_sale || 0
    });
  }

  console.log(`✅ ${artworks.length} artworks seeded`);
  console.log('✅ Database seeding complete!');
}

// Run directly: node db/seed.js
// Or exported for auto-seed on first boot
if (require.main === module) {
  seed().catch(console.error);
}

module.exports = seed;
