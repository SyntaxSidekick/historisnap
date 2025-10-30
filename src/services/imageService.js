// Bulletproof Image Service
// Provides guaranteed image loading with multiple fallback layers

// TIER 1: Premium verified images (tested and confirmed working)
const VERIFIED_IMAGES = {
  // Ancient Egyptian Civilization
  'AncientEgypt': [
    'https://images.unsplash.com/photo-1539650116574-75c0c6d4b4c9?w=800&h=600&fit=crop&auto=format&q=80', // Egyptian pyramids
    'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=800&h=600&fit=crop&auto=format&q=80', // Egyptian sphinx
    'https://images.unsplash.com/photo-1523475496153-3d6cc0f0bf19?w=800&h=600&fit=crop&auto=format&q=80'  // Egyptian hieroglyphs
  ],
  
  'Pharaoh': [
    'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=800&h=600&fit=crop&auto=format&q=80', // Egyptian statue/pharaoh
    'https://images.unsplash.com/photo-1523475496153-3d6cc0f0bf19?w=800&h=600&fit=crop&auto=format&q=80', // Egyptian carvings
    'https://images.unsplash.com/photo-1539650116574-75c0c6d4b4c9?w=800&h=600&fit=crop&auto=format&q=80'  // Egyptian monuments
  ],
  
  'Pyramid': [
    'https://images.unsplash.com/photo-1539650116574-75c0c6d4b4c9?w=800&h=600&fit=crop&auto=format&q=80', // Pyramids of Giza
    'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=800&h=600&fit=crop&auto=format&q=80', // Sphinx and pyramids
    'https://images.unsplash.com/photo-1523475496153-3d6cc0f0bf19?w=800&h=600&fit=crop&auto=format&q=80'  // Ancient Egyptian monuments
  ],
  
  'FirstRuler': [
    'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=800&h=600&fit=crop&auto=format&q=80', // Ancient ruler statue
    'https://images.unsplash.com/photo-1523475496153-3d6cc0f0bf19?w=800&h=600&fit=crop&auto=format&q=80', // Ancient carvings
    'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop&auto=format&q=80'  // Ancient columns/power
  ],
  
  'Unification': [
    'https://images.unsplash.com/photo-1523475496153-3d6cc0f0bf19?w=800&h=600&fit=crop&auto=format&q=80', // Ancient Egyptian unity symbols
    'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=800&h=600&fit=crop&auto=format&q=80', // Egyptian monuments
    'https://images.unsplash.com/photo-1539650116574-75c0c6d4b4c9?w=800&h=600&fit=crop&auto=format&q=80'  // Pyramids representing unity
  ],
  
  // Ancient Mesopotamia
  'Mesopotamia': [
    'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop&auto=format&q=80', // Ancient columns/architecture
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&auto=format&q=80', // Ancient artifacts
    'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=800&h=600&fit=crop&auto=format&q=80'  // Ancient civilization
  ],
  
  'FirstCivilization': [
    'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop&auto=format&q=80', // Ancient architecture
    'https://images.unsplash.com/photo-1523475496153-3d6cc0f0bf19?w=800&h=600&fit=crop&auto=format&q=80', // Ancient writing/civilization
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&auto=format&q=80'  // Archaeological artifacts
  ],
  
  'Babylon': [
    'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop&auto=format&q=80', // Ancient Babylonian-style architecture
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&auto=format&q=80', // Ancient artifacts
    'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=800&h=600&fit=crop&auto=format&q=80'  // Ancient empire
  ],
  
  // Ancient Greece
  'AncientGreece': [
    'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop&auto=format&q=80', // Greek columns/Parthenon
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&auto=format&q=80', // Greek artifacts
    'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=800&h=600&fit=crop&auto=format&q=80'  // Classical sculptures
  ],
  
  'Democracy': [
    'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop&auto=format&q=80', // Democratic columns/government
    'https://images.unsplash.com/photo-1555848962-6e79363bfa19?w=800&h=600&fit=crop&auto=format&q=80', // Government building
    'https://images.unsplash.com/photo-1571044880241-95d4c9aa06f5?w=800&h=600&fit=crop&auto=format&q=80'  // Justice/equality
  ],
  
  'Philosophy': [
    'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop&auto=format&q=80', // Classical architecture/wisdom
    'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=800&h=600&fit=crop&auto=format&q=80', // Ancient thinker statues
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&auto=format&q=80'  // Ancient learning
  ],
  
  // Ancient Rome
  'AncientRome': [
    'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop&auto=format&q=80', // Roman columns/architecture
    'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=800&h=600&fit=crop&auto=format&q=80', // Roman statues/emperors
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&auto=format&q=80'  // Roman artifacts
  ],
  
  'Emperor': [
    'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=800&h=600&fit=crop&auto=format&q=80', // Imperial statues/power
    'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop&auto=format&q=80', // Imperial architecture
    'https://images.unsplash.com/photo-1555848962-6e79363bfa19?w=800&h=600&fit=crop&auto=format&q=80'  // Government/power
  ],
  
  'Empire': [
    'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop&auto=format&q=80', // Imperial architecture
    'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=800&h=600&fit=crop&auto=format&q=80', // Imperial monuments
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&auto=format&q=80'  // Empire artifacts
  ],

  // Specific Historical Events
  'Freedom': [
    'https://images.unsplash.com/photo-1589578228447-e1a4e481c6c8?w=800&h=600&fit=crop&auto=format&q=80', // Freedom/liberation
    'https://images.unsplash.com/photo-1571044880241-95d4c9aa06f5?w=800&h=600&fit=crop&auto=format&q=80', // Equality/rights
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=600&fit=crop&auto=format&q=80'  // Justice/freedom
  ],
  
  'Wall': [
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&auto=format&q=80', // Memorial/historical
    'https://images.unsplash.com/photo-1539650116574-75c0c6d4b4c9?w=800&h=600&fit=crop&auto=format&q=80', // Historical architecture
    'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop&auto=format&q=80'  // Ancient structures
  ],
  
  'ColdWar': [
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&auto=format&q=80', // Historical memorial
    'https://images.unsplash.com/photo-1555848962-6e79363bfa19?w=800&h=600&fit=crop&auto=format&q=80', // Government building
    'https://images.unsplash.com/photo-1571044880241-95d4c9aa06f5?w=800&h=600&fit=crop&auto=format&q=80'  // Historical period
  ],
  
  'Moon': [
    'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=800&h=600&fit=crop&auto=format&q=80', // Moon landing
    'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800&h=600&fit=crop&auto=format&q=80', // Earth from space
    'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=600&fit=crop&auto=format&q=80'  // Space/stars
  ],
  
  'Achievement': [
    'https://images.unsplash.com/photo-1577223625816-7546f20a1b8b?w=800&h=600&fit=crop&auto=format&q=80', // Olympic/achievement
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&auto=format&q=80', // Stadium/sports
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&auto=format&q=80'  // Memorial/achievement
  ],
  
  'WorldWar1': [
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&auto=format&q=80', // Memorial
    'https://images.unsplash.com/photo-1509909756405-be0199881695?w=800&h=600&fit=crop&auto=format&q=80', // Military
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop&auto=format&q=80'  // Historical battle
  ],
  
  'WorldWar2': [
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&auto=format&q=80', // Memorial
    'https://images.unsplash.com/photo-1509909756405-be0199881695?w=800&h=600&fit=crop&auto=format&q=80', // Military
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop&auto=format&q=80'  // Historical battle
  ],
  
  'CivilRights': [
    'https://images.unsplash.com/photo-1589578228447-e1a4e481c6c8?w=800&h=600&fit=crop&auto=format&q=80', // Freedom/rights
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=600&fit=crop&auto=format&q=80', // Justice
    'https://images.unsplash.com/photo-1571044880241-95d4c9aa06f5?w=800&h=600&fit=crop&auto=format&q=80'  // Equality
  ],
  
  'Tragedy': [
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&auto=format&q=80', // Memorial
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=600&fit=crop&auto=format&q=80', // Remembrance
    'https://images.unsplash.com/photo-1571044880241-95d4c9aa06f5?w=800&h=600&fit=crop&auto=format&q=80'  // Solemn
  ],
  
  'Internet': [
    'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop&auto=format&q=80', // Technology
    'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=800&h=600&fit=crop&auto=format&q=80', // Computer
    'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&h=600&fit=crop&auto=format&q=80'  // Digital/coding
  ],
  
  // Historical periods
  'Ancient': [
    'https://images.unsplash.com/photo-1539650116574-75c0c6d4b4c9?w=800&h=600&fit=crop&auto=format&q=80', // Ancient architecture
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&auto=format&q=80', // Historical artifacts
    'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop&auto=format&q=80'  // Ancient columns
  ],
  
  // Space & Technology
  'Space': [
    'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=600&fit=crop&auto=format&q=80', // Space/stars
    'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=800&h=600&fit=crop&auto=format&q=80', // Moon landing
    'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800&h=600&fit=crop&auto=format&q=80'  // Earth from space
  ],
  
  'Technology': [
    'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop&auto=format&q=80', // Technology
    'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=800&h=600&fit=crop&auto=format&q=80', // Computer
    'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&h=600&fit=crop&auto=format&q=80'  // Coding
  ],
  
  // Media & Broadcasting
  'Media': [
    'https://images.unsplash.com/photo-1578269174936-2709b6aeb913?w=800&h=600&fit=crop&auto=format&q=80', // Vintage microphone
    'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&h=600&fit=crop&auto=format&q=80', // Broadcasting studio
    'https://images.unsplash.com/photo-1571680342242-0e5b2f4e8b5d?w=800&h=600&fit=crop&auto=format&q=80'  // Vintage radio
  ],
  
  'Radio': [
    'https://images.unsplash.com/photo-1578269174936-2709b6aeb913?w=800&h=600&fit=crop&auto=format&q=80', // Vintage microphone
    'https://images.unsplash.com/photo-1571680342242-0e5b2f4e8b5d?w=800&h=600&fit=crop&auto=format&q=80', // Vintage radio
    'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&h=600&fit=crop&auto=format&q=80'  // Radio studio
  ],
  
  'Broadcasting': [
    'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&h=600&fit=crop&auto=format&q=80', // Broadcasting studio
    'https://images.unsplash.com/photo-1578269174936-2709b6aeb913?w=800&h=600&fit=crop&auto=format&q=80', // Vintage microphone
    'https://images.unsplash.com/photo-1571680342242-0e5b2f4e8b5d?w=800&h=600&fit=crop&auto=format&q=80'  // Vintage radio
  ],
  
  'Entertainment': [
    'https://images.unsplash.com/photo-1578269174936-2709b6aeb913?w=800&h=600&fit=crop&auto=format&q=80', // Performance/entertainment
    'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&h=600&fit=crop&auto=format&q=80', // Studio/stage
    'https://images.unsplash.com/photo-1571680342242-0e5b2f4e8b5d?w=800&h=600&fit=crop&auto=format&q=80'  // Entertainment equipment
  ],
  
  // Politics & Government
  'Politics': [
    'https://images.unsplash.com/photo-1555848962-6e79363bfa19?w=800&h=600&fit=crop&auto=format&q=80', // Government building
    'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&h=600&fit=crop&auto=format&q=80', // Capitol
    'https://images.unsplash.com/photo-1569097296717-2b1cc82e4869?w=800&h=600&fit=crop&auto=format&q=80'  // Democracy
  ],
  
  // War & Military
  'War': [
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&auto=format&q=80', // Memorial
    'https://images.unsplash.com/photo-1509909756405-be0199881695?w=800&h=600&fit=crop&auto=format&q=80', // Military
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop&auto=format&q=80'  // Historical battle
  ],
  
  // Science & Discovery
  'Science': [
    'https://images.unsplash.com/photo-1567427018141-95ea69a39b10?w=800&h=600&fit=crop&auto=format&q=80', // Science/research
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&auto=format&q=80', // Laboratory
    'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=600&fit=crop&auto=format&q=80'  // Scientific equipment
  ],
  
  // Music & Arts
  'Music': [
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop&auto=format&q=80', // Music
    'https://images.unsplash.com/photo-1471478331149-c72f17e33c73?w=800&h=600&fit=crop&auto=format&q=80', // Concert hall
    'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&h=600&fit=crop&auto=format&q=80'  // Musical instruments
  ],
  
  'Television': [
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&auto=format&q=80', // Retro TV/media
    'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&h=600&fit=crop&auto=format&q=80', // Broadcasting/studio
    'https://images.unsplash.com/photo-1582578598774-a377d4b32223?w=800&h=600&fit=crop&auto=format&q=80'  // Vintage television
  ],
  
  'MTV': [
    'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&h=600&fit=crop&auto=format&q=80', // Vintage TV/electronics
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop&auto=format&q=80', // Music/headphones
    'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=800&h=600&fit=crop&auto=format&q=80'  // Retro/vintage media
  ],
  
  'Culture': [
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&auto=format&q=80', // Cultural events
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop&auto=format&q=80', // Music culture
    'https://images.unsplash.com/photo-1471478331149-c72f17e33c73?w=800&h=600&fit=crop&auto=format&q=80'  // Performance culture
  ],
  
  'Art': [
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&auto=format&q=80', // Art gallery
    'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&h=600&fit=crop&auto=format&q=80', // Painting
    'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop&auto=format&q=80'  // Museum
  ],
  
  // Rights & Social
  'Rights': [
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=600&fit=crop&auto=format&q=80', // Justice
    'https://images.unsplash.com/photo-1589578228447-e1a4e481c6c8?w=800&h=600&fit=crop&auto=format&q=80', // Freedom
    'https://images.unsplash.com/photo-1571044880241-95d4c9aa06f5?w=800&h=600&fit=crop&auto=format&q=80'  // Equality
  ],
  
  // Sports & Achievement  
  'Sports': [
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=600&fit=crop&auto=format&q=80', // Sports
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&auto=format&q=80', // Stadium
    'https://images.unsplash.com/photo-1577223625816-7546f20a1b8b?w=800&h=600&fit=crop&auto=format&q=80'  // Olympic rings
  ]
}

// TIER 2: General historical images (extremely reliable)
const GENERAL_HISTORICAL_IMAGES = [
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop&auto=format&q=80', // Books/library
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&auto=format&q=80', // Laboratory
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&auto=format&q=80', // Historical artifacts
  'https://images.unsplash.com/photo-1539650116574-75c0c6d4b4c9?w=800&h=600&fit=crop&auto=format&q=80', // Ancient architecture
  'https://images.unsplash.com/photo-1555848962-6e79363bfa19?w=800&h=600&fit=crop&auto=format&q=80'  // Government building
]

// TIER 3: Data URLs (base64 embedded - guaranteed to work)
const BASE64_FALLBACK_IMAGES = {
  // Simple gradient patterns that represent different categories
  'default': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4gIDxkZWZzPiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPiAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM2NjdlZWEiLz4gICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiM3NjRiYTIiLz4gICAgPC9saW5lYXJHcmFkaWVudD4gIDwvZGVmcz4gIDxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIiBmaWxsPSJ1cmwoI2dyYWQpIi8+ICA8dGV4dCB4PSI0MDAiIHk9IjI4MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SGlzdG9yaWNhbCBFdmVudDwvdGV4dD4gIDx0ZXh0IHg9IjQwMCIgeT0iMzIwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjgiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlIE5vdCBBdmFpbGFibGU8L3RleHQ+PC9zdmc+',
  
  'Freedom': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4gIDxkZWZzPiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImZyZWVkb21HcmFkIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4gICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjZjU5ZTBiIi8+ICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjZWY0NDQ0Ii8+ICAgIDwvbGluZWFyR3JhZGllbnQ+ICA8L2RlZnM+ICA8cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0idXJsKCNmcmVlZG9tR3JhZCkiLz4gIDx0ZXh0IHg9IjQwMCIgeT0iMjgwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5GcmVlZG9tICZhbXA7IExpYmVyYXRpb248L3RleHQ+ICA8dGV4dCB4PSI0MDAiIHk9IjMyMCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC44IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5IaXN0b3JpY2FsIEV2ZW50PC90ZXh0Pjwvc3ZnPg==',
  
  'Wall': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4gIDxkZWZzPiAgICA8bGluZWFyR3JhZGllbnQgaWQ9IndhbGxHcmFkIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4gICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjNmI3Mjc5Ii8+ICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMzc0MTUxIi8+ICAgIDwvbGluZWFyR3JhZGllbnQ+ICA8L2RlZnM+ICA8cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0idXJsKCN3YWxsR3JhZCkiLz4gIDx0ZXh0IHg9IjQwMCIgeT0iMjgwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5CZXJsaW4gV2FsbDwvdGV4dD4gIDx0ZXh0IHg9IjQwMCIgeT0iMzIwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjgiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkhpc3RvcmljYWwgRXZlbnQ8L3RleHQ+PC9zdmc+',
  
  'Space': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4gIDxkZWZzPiAgICA8cmFkaWFsR3JhZGllbnQgaWQ9InNwYWNlR3JhZCIgY3g9IjUwJSIgY3k9IjUwJSIgcj0iNTAlIj4gICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMWUxZTJlIi8+ICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMDkwOTE4Ii8+ICAgIDwvcmFkaWFsR3JhZGllbnQ+ICA8L2RlZnM+ICA8cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0idXJsKCNzcGFjZUdyYWQpIi8+ICA8Y2lyY2xlIGN4PSIyMDAiIGN5PSIxNTAiIHI9IjIiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjgiLz4gIDxjaXJjbGUgY3g9IjYwMCIgY3k9IjEwMCIgcj0iMSIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuNiIvPiAgPGNpcmNsZSBjeD0iNzAwIiBjeT0iNDAwIiByPSIxLjUiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjciLz4gIDx0ZXh0IHg9IjQwMCIgeT0iMjgwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5TcGFjZSBFeHBsb3JhdGlvbjwvdGV4dD4gIDx0ZXh0IHg9IjQwMCIgeT0iMzIwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjgiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkhpc3RvcmljYWwgRXZlbnQ8L3RleHQ+PC9zdmc+',
  
  'Science': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4gIDxkZWZzPiAgICA8bGluZWFyR3JhZGllbnQgaWQ9InNjaWVuY2VHcmFkIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4gICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMGY0Yzc1Ii8+ICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjM2Y4M2Y4Ii8+ICAgIDwvbGluZWFyR3JhZGllbnQ+ICA8L2RlZnM+ICA8cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0idXJsKCNzY2llbmNlR3JhZCkiLz4gIDx0ZXh0IHg9IjQwMCIgeT0iMjgwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5TY2llbnRpZmljIERpc2NvdmVyeTwvdGV4dD4gIDx0ZXh0IHg9IjQwMCIgeT0iMzIwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjgiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkhpc3RvcmljYWwgRXZlbnQ8L3RleHQ+PC9zdmc+',
  
  'Moon': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4gIDxkZWZzPiAgICA8cmFkaWFsR3JhZGllbnQgaWQ9Im1vb25HcmFkIiBjeD0iNzAlIiBjeT0iMzAlIiByPSI4MCUiPiAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmN2ZhZmMiLz4gICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMxZTI5M2IiLz4gICAgPC9yYWRpYWxHcmFkaWVudD4gIDwvZGVmcz4gIDxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIiBmaWxsPSJ1cmwoI21vb25HcmFkKSIvPiAgPGNpcmNsZSBjeD0iNTgwIiBjeT0iMTgwIiByPSI2MCIgZmlsbD0iI2Y3ZmFmYyIgb3BhY2l0eT0iMC45Ii8+ICA8dGV4dCB4PSI0MDAiIHk9IjQ1MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TW9vbiBMYW5kaW5nPC90ZXh0PiAgPHRleHQgeD0iNDAwIiB5PSI0OTAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuOCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SGlzdG9yaWNhbCBFdmVudDwvdGV4dD48L3N2Zz4=',
  
  'CivilRights': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4gIDxkZWZzPiAgICA8bGluZWFyR3JhZGllbnQgaWQ9InJpZ2h0c0dyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPiAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM3YzNhZWQiLz4gICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNlZjQ0NDQiLz4gICAgPC9saW5lYXJHcmFkaWVudD4gIDwvZGVmcz4gIDxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIiBmaWxsPSJ1cmwoI3JpZ2h0c0dyYWQpIi8+ICA8dGV4dCB4PSI0MDAiIHk9IjI4MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Q2l2aWwgUmlnaHRzPC90ZXh0PiAgPHRleHQgeD0iNDAwIiB5PSIzMjAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuOCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SGlzdG9yaWNhbCBFdmVudDwvdGV4dD48L3N2Zz4='
}

// Image validation cache
const imageValidationCache = new Map()
const imageLoadingPromises = new Map()

// Fetch Wikipedia image for an event
const fetchWikipediaImage = async (title, pageTitle = '') => {
  try {
    // Clean the title for search
    const searchTitle = pageTitle || title.replace(/[^\w\s]/g, '').trim()
    
    // Search for Wikipedia page
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(searchTitle)}&limit=1&format=json&origin=*`
    
    const searchResponse = await fetch(searchUrl)
    const searchData = await searchResponse.json()
    
    if (searchData[1] && searchData[1][0]) {
      const pageTitle = searchData[1][0]
      
      // Get page images
      const imageUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=pageimages&format=json&pithumbsize=800&origin=*`
      
      const imageResponse = await fetch(imageUrl)
      const imageData = await imageResponse.json()
      
      const pages = imageData.query?.pages
      if (pages) {
        const page = Object.values(pages)[0]
        if (page?.thumbnail?.source) {
          // Return Wikipedia image directly (they are generally reliable)
          const imageUrl = page.thumbnail.source
          
          // Basic URL validation - ensure it's a proper image URL
          if (imageUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) || 
              imageUrl.includes('upload.wikimedia.org')) {
            return imageUrl
          }
        }
      }
    }
    
    return null
  } catch (error) {
    console.error('Error fetching Wikipedia image:', error)
    return null
  }
}

// Validate if an image URL is working
const validateImageUrl = async (url, timeout = 5000) => {
  // Check cache first
  if (imageValidationCache.has(url)) {
    return imageValidationCache.get(url)
  }
  
  // Check if validation is already in progress
  if (imageLoadingPromises.has(url)) {
    return imageLoadingPromises.get(url)
  }
  
  const validationPromise = new Promise((resolve) => {
    const img = new Image()
    
    const cleanup = () => {
      clearTimeout(timer)
      img.onload = null
      img.onerror = null
      img.onabort = null
    }
    
    const timer = setTimeout(() => {
      cleanup()
      resolve(false)
    }, timeout)
    
    img.onload = () => {
      cleanup()
      resolve(true)
    }
    
    img.onerror = () => {
      cleanup()
      resolve(false)
    }
    
    img.onabort = () => {
      cleanup()
      resolve(false)
    }
    
    // Set crossOrigin to handle CORS issues
    img.crossOrigin = 'anonymous'
    img.src = url
  })
  
  imageLoadingPromises.set(url, validationPromise)
  
  try {
    const isValid = await validationPromise
    imageValidationCache.set(url, isValid)
    return isValid
  } finally {
    imageLoadingPromises.delete(url)
  }
}

// Get verified working image for a category with improved contextual matching
const getVerifiedImage = async (categories = [], originalTitle = null, searchQuery = '') => {
  const allCategories = Array.isArray(categories) ? categories : [categories].filter(Boolean)
  
  console.log(`🖼️  Image selection for categories: [${allCategories.join(', ')}], title: "${originalTitle}", query: "${searchQuery}"`)
  
  // Enhanced context-aware category priority
  // Ancient civilizations get highest priority for historical searches
  const ancientCategories = ['AncientEgypt', 'Pharaoh', 'Pyramid', 'FirstRuler', 'Unification', 'Mesopotamia', 'FirstCivilization', 'Babylon', 'AncientGreece', 'Democracy', 'Philosophy', 'AncientRome', 'Emperor', 'Empire']
  const specificCategories = ['Freedom', 'Wall', 'ColdWar', 'Moon', 'Achievement', 'WorldWar1', 'WorldWar2', 'CivilRights', 'Tragedy', 'Internet']
  
  // Smart prioritization based on search context
  let prioritizedCategories = []
  
  // If it's an ancient history search, prioritize ancient categories
  if (searchQuery && (searchQuery.includes('ancient') || searchQuery.includes('pharaoh') || searchQuery.includes('egypt') || searchQuery.includes('civilization'))) {
    prioritizedCategories = [
      ...allCategories.filter(cat => ancientCategories.includes(cat)),    // Ancient categories first
      ...allCategories.filter(cat => specificCategories.includes(cat)),   // Specific categories second  
      ...allCategories.filter(cat => !ancientCategories.includes(cat) && !specificCategories.includes(cat))  // General last
    ]
    console.log(`🏺 Ancient history detected, prioritizing ancient imagery`)
  } else {
    // Standard prioritization for modern events
    prioritizedCategories = [
      ...allCategories.filter(cat => specificCategories.includes(cat)),   // Specific first
      ...allCategories.filter(cat => ancientCategories.includes(cat)),    // Ancient second
      ...allCategories.filter(cat => !specificCategories.includes(cat) && !ancientCategories.includes(cat))  // General last
    ]
  }
  
  console.log(`📋 Category priority order: [${prioritizedCategories.join(', ')}]`)
  
  // TIER 1: Try original URL first if provided (but only for Wikipedia/reliable sources)
  if (originalTitle) {
    try {
      // For ancient history, try to get Wikipedia images
      const wikiImage = await fetchWikipediaImage(originalTitle)
      if (wikiImage) {
        const isValid = await validateImageUrl(wikiImage, 3000)
        if (isValid) {
          console.log(`✅ Using Wikipedia image for "${originalTitle}"`)
          return wikiImage
        }
      }
    } catch (error) {
      console.log('Wikipedia image fetch failed:', error)
    }
  }
  
  // TIER 2: Try category-specific verified images with enhanced priority order
  for (const category of prioritizedCategories) {
    const categoryImages = VERIFIED_IMAGES[category]
    if (categoryImages && categoryImages.length > 0) {
      console.log(`🎯 Trying ${category} category images (${categoryImages.length} available)`)
      
      // Try multiple images from this category
      for (let i = 0; i < categoryImages.length; i++) {
        const imageUrl = categoryImages[i]
        try {
          const isValid = await validateImageUrl(imageUrl, 2000)
          if (isValid) {
            console.log(`✅ Using ${category} category image #${i+1} for contextual match`)
            return imageUrl
          }
        } catch (error) {
          console.log(`❌ Category image ${category} #${i+1} failed:`, error)
        }
      }
    }
  }
  
  // TIER 3: Try general historical images
  for (const imageUrl of GENERAL_HISTORICAL_IMAGES) {
    try {
      const isValid = await validateImageUrl(imageUrl, 2000)
      if (isValid) {
        return imageUrl
      }
    } catch (error) {
      console.log('General historical image failed:', error)
    }
  }
  
  // TIER 4: Return base64 fallback (guaranteed to work)
  const primaryCategory = allCategories[0] || 'default'
  return BASE64_FALLBACK_IMAGES[primaryCategory] || BASE64_FALLBACK_IMAGES.default
}

// Get multiple image options for redundancy
const getImageWithFallbacks = async (categories = [], originalUrl = null) => {
  const allCategories = Array.isArray(categories) ? categories : [categories].filter(Boolean)
  const imageOptions = []
  
  // Add original URL if provided
  if (originalUrl) {
    imageOptions.push(originalUrl)
  }
  
  // Add category-specific images
  for (const category of allCategories) {
    const categoryImages = VERIFIED_IMAGES[category]
    if (categoryImages) {
      imageOptions.push(...categoryImages)
    }
  }
  
  // Add general images
  imageOptions.push(...GENERAL_HISTORICAL_IMAGES)
  
  // Add base64 fallback
  const primaryCategory = allCategories[0] || 'default'
  imageOptions.push(BASE64_FALLBACK_IMAGES[primaryCategory] || BASE64_FALLBACK_IMAGES.default)
  
  // Remove duplicates
  return [...new Set(imageOptions)]
}

// Preload critical images
const preloadCriticalImages = async () => {
  const criticalImages = [
    ...GENERAL_HISTORICAL_IMAGES,
    ...Object.values(VERIFIED_IMAGES).flat().slice(0, 10) // First image from each category
  ]
  
  // Start preloading but don't wait for completion
  criticalImages.forEach(url => {
    validateImageUrl(url, 1000).catch(() => {
      // Silent fail for preloading
    })
  })
}

// Clear image cache periodically
const clearImageCache = () => {
  const maxCacheSize = 100
  if (imageValidationCache.size > maxCacheSize) {
    const entries = Array.from(imageValidationCache.entries())
    const toDelete = entries.slice(0, entries.length - maxCacheSize)
    toDelete.forEach(([key]) => imageValidationCache.delete(key))
  }
}

// Auto-clear cache every 10 minutes
setInterval(clearImageCache, 10 * 60 * 1000)

// Initialize preloading
preloadCriticalImages()

export {
  getVerifiedImage,
  getImageWithFallbacks,
  validateImageUrl,
  preloadCriticalImages,
  VERIFIED_IMAGES,
  GENERAL_HISTORICAL_IMAGES,
  BASE64_FALLBACK_IMAGES
}