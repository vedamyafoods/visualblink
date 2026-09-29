// Comprehensive Mock Data for Printigly Luxury Admin Backoffice

export const INITIAL_ORDERS = [
  {
    id: "PRT-98421",
    customer: {
      name: "Aarav Sharma",
      email: "aarav@nexusdesign.in",
      phone: "+91 98450 11223",
      company: "Nexus Design Labs",
      gstin: "29AAFCN8839M1Z5",
      isB2B: true,
      creditNet15: true,
    },
    items: [
      {
        productName: "Soft-Touch Matte Business Cards",
        variant: "350 GSM | Velvet Touch | Gold Foil Accent | Round Corners",
        quantity: 1000,
        unitPrice: 4.80,
        total: 4800,
      },
      {
        productName: "Custom Acrylic Desk Plaque",
        variant: "8mm Clear Cast Acrylic | UV Printed | Brass Standoffs",
        quantity: 5,
        unitPrice: 1400,
        total: 7000,
      }
    ],
    totalAmount: 13924, // includes 18% GST
    subtotal: 11800,
    gstAmount: 2124,
    shippingFee: 0,
    status: "Payment Confirmed", // Payment Confirmed, Artwork Verification, In Production, Quality Check, Packed & Ready, Dispatched, Delivered
    isExpress: true,
    expressDeadline: "2026-07-28T12:00:00.000Z", // Same day dispatch limit
    deliveryMethod: "Local Porter Express",
    deliveryAddress: "Indiranagar 100ft Road, Phase 2, Bangalore - 560038",
    createdAt: "2026-07-28T08:15:00Z",
    artworkFile: {
      fileName: "Nexus_GoldFoil_BusinessCard_v2.pdf",
      fileType: "pdf",
      dimensions: "91mm x 53mm",
      resolutionDpi: 300,
      cmykVerified: true,
      hasBleed: true,
      previewUrl: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=1200&auto=format&fit=crop",
      cloudinaryPublicId: "artwork/nexus_bc_v2",
    },
    designAssistanceRequested: false,
    assignedDesigner: null,
    awbNumber: "DUNZO-BLR-99812",
    notes: "Client requires extra padding in box packaging for acrylic plaques.",
  },
  {
    id: "PRT-98422",
    customer: {
      name: "Priya Nair",
      email: "priya@zestcoffee.com",
      phone: "+91 99011 44556",
      company: "Zest Artisanal Coffee",
      gstin: "29AAACZ1234F1Z8",
      isB2B: true,
      creditNet15: false,
    },
    items: [
      {
        productName: "Matte Kraft Coffee Packaging Pouches",
        variant: "250g | Recyclable Foil Lining | Zip Seal | One-Way Valve",
        quantity: 2500,
        unitPrice: 18.50,
        total: 46250,
      }
    ],
    totalAmount: 54575,
    subtotal: 46250,
    gstAmount: 8325,
    shippingFee: 0,
    status: "Artwork Verification",
    isExpress: true,
    expressDeadline: "2026-07-28T11:30:00.000Z",
    deliveryMethod: "Local Dunzo Parcel",
    deliveryAddress: "Koramangala 5th Block, Bangalore - 560095",
    createdAt: "2026-07-28T09:00:00Z",
    artworkFile: {
      fileName: "Zest_Coffee_Pouches_Artwork.ai",
      fileType: "ai",
      dimensions: "160mm x 240mm",
      resolutionDpi: 300,
      cmykVerified: true,
      hasBleed: true,
      previewUrl: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=1200&auto=format&fit=crop",
      cloudinaryPublicId: "artwork/zest_pouches_ai",
    },
    designAssistanceRequested: true,
    assignedDesigner: "Ananya R.",
    awbNumber: null,
    notes: "Verify font outline on coffee roast description paragraph.",
  },
  {
    id: "PRT-98423",
    customer: {
      name: "Rohan Kapoor",
      email: "rohan@elevatefit.in",
      phone: "+91 97112 88990",
      company: "Elevate Fitness Studios",
      gstin: "27AABCE9988D1Z2",
      isB2B: false,
      creditNet15: false,
    },
    items: [
      {
        productName: "Roll-Up Standee Banners",
        variant: "6ft x 3ft | Heavy Duty Aluminum Base | 440 GSM Non-Tear Flex",
        quantity: 4,
        unitPrice: 1850,
        total: 7400,
      }
    ],
    totalAmount: 8732,
    subtotal: 7400,
    gstAmount: 1332,
    shippingFee: 0,
    status: "In Production",
    isExpress: false,
    expressDeadline: null,
    deliveryMethod: "Pan-India BlueDart Express",
    deliveryAddress: "Bandra West, Mumbai, Maharashtra - 400050",
    createdAt: "2026-07-27T14:20:00Z",
    artworkFile: {
      fileName: "ElevateFit_Standee_Banner.psd",
      fileType: "psd",
      dimensions: "900mm x 1800mm",
      resolutionDpi: 150,
      cmykVerified: true,
      hasBleed: true,
      previewUrl: "https://images.unsplash.com/photo-1542744094-3a3121699563?q=80&w=1200&auto=format&fit=crop",
      cloudinaryPublicId: "artwork/elevate_standee",
    },
    designAssistanceRequested: false,
    assignedDesigner: null,
    awbNumber: "BD-883920192",
    notes: null,
  },
  {
    id: "PRT-98424",
    customer: {
      name: "Sneha Reddy",
      email: "sneha@bloomdecor.com",
      phone: "+91 98860 33441",
      company: "Bloom Luxury Decor",
      gstin: "36AAFCB7766K1Z9",
      isB2B: true,
      creditNet15: true,
    },
    items: [
      {
        productName: "Rigid Gift Packaging Boxes",
        variant: "1200 GSM Kappa Board | Magnetic Clasp | Gold Foil Logo",
        quantity: 500,
        unitPrice: 120,
        total: 60000,
      }
    ],
    totalAmount: 70800,
    subtotal: 60000,
    gstAmount: 10800,
    shippingFee: 0,
    status: "Quality Check",
    isExpress: false,
    expressDeadline: null,
    deliveryMethod: "Pan-India Delhivery Cargo",
    deliveryAddress: "Jubilee Hills, Hyderabad, Telangana - 500033",
    createdAt: "2026-07-26T11:00:00Z",
    artworkFile: {
      fileName: "Bloom_Box_DieCut_Final.pdf",
      fileType: "pdf",
      dimensions: "250mm x 200mm x 80mm",
      resolutionDpi: 300,
      cmykVerified: true,
      hasBleed: true,
      previewUrl: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1200&auto=format&fit=crop",
      cloudinaryPublicId: "artwork/bloom_rigid_box",
    },
    designAssistanceRequested: false,
    assignedDesigner: null,
    awbNumber: "DEL-77881920",
    notes: "Requires double bubble wrap layer.",
  },
  {
    id: "PRT-98425",
    customer: {
      name: "Vikram Sengupta",
      email: "vikram@techverse.io",
      phone: "+91 98300 77112",
      company: "TechVerse Solutions",
      gstin: "19AABCT5544R1Z1",
      isB2B: true,
      creditNet15: false,
    },
    items: [
      {
        productName: "Embroidered Premium Polo T-Shirts",
        variant: "240 GSM Matty Cotton | Chest Embroidery | Charcoal Grey",
        quantity: 150,
        unitPrice: 450,
        total: 67500,
      }
    ],
    totalAmount: 79650,
    subtotal: 67500,
    gstAmount: 12150,
    shippingFee: 0,
    status: "Packed & Ready",
    isExpress: false,
    expressDeadline: null,
    deliveryMethod: "Pan-India DTDC Express",
    deliveryAddress: "Salt Lake Sector V, Kolkata, West Bengal - 700091",
    createdAt: "2026-07-25T16:45:00Z",
    artworkFile: {
      fileName: "TechVerse_Embroidery_Vector.png",
      fileType: "png",
      dimensions: "100mm x 40mm",
      resolutionDpi: 300,
      cmykVerified: true,
      hasBleed: false,
      previewUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1200&auto=format&fit=crop",
      cloudinaryPublicId: "artwork/techverse_polo",
    },
    designAssistanceRequested: false,
    assignedDesigner: null,
    awbNumber: "DTDC-44120938",
    notes: "Grouped by sizes S(30), M(60), L(40), XL(20).",
  },
  {
    id: "PRT-98426",
    customer: {
      name: "Meera Mehta",
      email: "meera@artisanhaven.com",
      phone: "+91 98201 22334",
      company: "Artisan Haven Ltd",
      gstin: "27AABCA3322P1Z0",
      isB2B: true,
      creditNet15: true,
    },
    items: [
      {
        productName: "High-Gloss Promotional Flyers",
        variant: "170 GSM Art Paper | Front & Back Full Color | A5 Size",
        quantity: 5000,
        unitPrice: 1.90,
        total: 9500,
      }
    ],
    totalAmount: 11210,
    subtotal: 9500,
    gstAmount: 1710,
    shippingFee: 0,
    status: "Dispatched",
    isExpress: true,
    expressDeadline: "2026-07-27T12:00:00.000Z",
    deliveryMethod: "Pan-India BlueDart Express",
    deliveryAddress: "Lower Parel, Mumbai - 400013",
    createdAt: "2026-07-25T10:00:00Z",
    artworkFile: {
      fileName: "ArtisanHaven_Flyer_A5.pdf",
      fileType: "pdf",
      dimensions: "148mm x 210mm",
      resolutionDpi: 300,
      cmykVerified: true,
      hasBleed: true,
      previewUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1200&auto=format&fit=crop",
      cloudinaryPublicId: "artwork/artisan_flyer",
    },
    designAssistanceRequested: false,
    assignedDesigner: null,
    awbNumber: "BD-992019482",
    notes: null,
  },
  {
    id: "PRT-98427",
    customer: {
      name: "Karan Johar",
      email: "karan@dharmaevents.in",
      phone: "+91 98110 55443",
      company: "Dharma Events & Media",
      gstin: "07AAACD9911L1Z4",
      isB2B: true,
      creditNet15: true,
    },
    items: [
      {
        productName: "Custom Hardcover Wire-O Notebooks",
        variant: "300 GSM Laminated Cover | 80 GSM Natural Shade Pages | 100 Sheets",
        quantity: 500,
        unitPrice: 180,
        total: 90000,
      }
    ],
    totalAmount: 106200,
    subtotal: 90000,
    gstAmount: 16200,
    shippingFee: 0,
    status: "Delivered",
    isExpress: false,
    expressDeadline: null,
    deliveryMethod: "Pan-India Delhivery Air",
    deliveryAddress: "Connaught Place, New Delhi - 110001",
    createdAt: "2026-07-20T11:15:00Z",
    artworkFile: {
      fileName: "Dharma_Notebook_Cover.pdf",
      fileType: "pdf",
      dimensions: "A5 (148 x 210mm)",
      resolutionDpi: 300,
      cmykVerified: true,
      hasBleed: true,
      previewUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1200&auto=format&fit=crop",
      cloudinaryPublicId: "artwork/dharma_notebook",
    },
    designAssistanceRequested: false,
    assignedDesigner: null,
    awbNumber: "DEL-881920391",
    notes: "Delivered & signed by reception.",
  }
];

export const INITIAL_PRODUCTS = [
  {
    id: "prod-1",
    title: "Luxury Velvet Soft-Touch Business Cards",
    slug: "luxury-velvet-business-cards",
    category: "Business Stationery",
    basePrice: 4.50,
    summary: "Ultra-premium 350 GSM cards with silk velvet lamination and raised foil accents.",
    description: "Make an unforgettable executive first impression. Printed on heavy 350 GSM European artboard with tactile soft-touch velvet lamination. Option to add 3D raised gold/silver foil accents and rounded safety corners.",
    specs: {
      paperGsm: "350 GSM European Velvet Card",
      dimensions: "91mm x 53mm (Standard)",
      printTech: "HP Indigo Digital Off-Set High Density",
      turnaround: "24-48 Hours Express",
    },
    images: [
      "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1616469829941-c7200edec809?q=80&w=800&auto=format&fit=crop"
    ],
    minOrderQty: 100,
    variants: {
      paperStock: [
        { name: "350 GSM Soft-Touch Matte", priceModifier: 0 },
        { name: "400 GSM Extra Heavy Cotton Card", priceModifier: 1.50 },
        { name: "300 GSM Recyclable Textured Kraft", priceModifier: 0.50 }
      ],
      finishes: [
        { name: "Matte Velvet Lamination", priceModifier: 0 },
        { name: "Raised Gold Foil Accent (+ Front)", priceModifier: 2.20 },
        { name: "Spot UV Gloss on Logo", priceModifier: 1.80 }
      ],
      sides: [
        { name: "Single-sided", priceModifier: 0 },
        { name: "Double-sided", priceModifier: 1.50 }
      ],
      corners: [
        { name: "Standard", priceModifier: 0 },
        { name: "Edge Cutting", priceModifier: 1.00 },
        { name: "Rounded Corners", priceModifier: 0.50 }
      ],
      lamination: [
        { name: "No Lamination", priceModifier: 0 },
        { name: "Gloss Lamination", priceModifier: 0.50 },
        { name: "Matte Lamination", priceModifier: 0.80 },
        { name: "Velvet Soft-Touch Lamination", priceModifier: 1.50 }
      ],
      sizeFormat: [
        { name: "Standard (90x55mm)", priceModifier: 0 },
        { name: "Square (60x60mm)", priceModifier: 0.50 },
        { name: "Slim (90x45mm)", priceModifier: 0.30 },
        { name: "Foldable 4-Panel", priceModifier: 1.80 }
      ],
      foilAccents: [
        { name: "No Metallic Foil", priceModifier: 0 },
        { name: "Raised Gold Foil", priceModifier: 2.20 },
        { name: "Raised Silver Foil", priceModifier: 2.00 },
        { name: "Rose Gold Foil", priceModifier: 2.50 },
        { name: "Holographic Laser Foil", priceModifier: 3.00 }
      ],
      spotUV: [
        { name: "No Spot UV", priceModifier: 0 },
        { name: "Single-Sided Spot UV Logo", priceModifier: 1.20 },
        { name: "Double-Sided Spot UV Accent", priceModifier: 2.00 },
        { name: "3D Embossed Raised UV", priceModifier: 2.80 }
      ],
      proofService: [
        { name: "Print-Ready (Self Upload)", priceModifier: 0 },
        { name: "Prepress CMYK Proofing (+₹99)", priceModifier: 0.50 },
        { name: "Full Designer Support (+₹299)", priceModifier: 1.50 }
      ],
      packagingStyle: [
        { name: "Standard Eco Bulk Shrink", priceModifier: 0 },
        { name: "Acrylic Desk Storage Box", priceModifier: 1.20 },
        { name: "Luxury Gift Presentation Box", priceModifier: 3.50 }
      ],
      customAreaPricing: [
        { name: "Up to 50 sq cm (cm²)", maxArea: 50, priceModifier: 180 },
        { name: "Up to 100 sq cm (cm²)", maxArea: 100, priceModifier: 300 },
        { name: "Up to 250 sq cm (cm²)", maxArea: 250, priceModifier: 550 },
        { name: "Up to 500 sq cm (cm²)", maxArea: 500, priceModifier: 950 },
        { name: "Up to 1000 sq cm (cm²)", maxArea: 1000, priceModifier: 1700 }
      ]
    },
    tieredPricing: [
      { tierMin: 100, pricePerUnit: 6.50 },
      { tierMin: 300, pricePerUnit: 5.20 },
      { tierMin: 500, pricePerUnit: 4.80 },
      { tierMin: 1000, pricePerUnit: 4.20 },
      { tierMin: 2500, pricePerUnit: 3.50 }
    ],
    seo: {
      metaTitle: "Buy Luxury Velvet Soft-Touch Business Cards Online | Printigly",
      metaDescription: "Custom 350 GSM soft-touch business cards with gold foil accents. Same day dispatch available in Bangalore.",
      indexable: true
    }
  },
  {
    id: "prod-2",
    title: "Heavy-Duty Roll-Up Standee Banners",
    slug: "rollup-standee-banners",
    category: "Large Format Display",
    basePrice: 1750,
    summary: "Non-tear 440 GSM flex banner with anodized aluminum retractable stand.",
    description: "Designed for corporate expos, trade shows, and store entrances. Heavy aluminum base prevents tipping while high-definition UV ink ensures zero color fading.",
    specs: {
      paperGsm: "440 GSM Matte Non-Tear PET Flex",
      dimensions: "6ft x 3ft (Standard)",
      printTech: "Mimaki 8-Color Outdoor UV Inkjet",
      turnaround: "Same Day Dispatch",
    },
    images: [
      "https://images.unsplash.com/photo-1542744094-3a3121699563?q=80&w=800&auto=format&fit=crop"
    ],
    variants: {
      baseType: [
        { name: "Standard Aluminum Base", priceModifier: 0 },
        { name: "Luxury Chrome Heavy Base", priceModifier: 650 }
      ]
    },
    tieredPricing: [
      { tierMin: 1, pricePerUnit: 1850 },
      { tierMin: 5, pricePerUnit: 1650 },
      { tierMin: 10, pricePerUnit: 1450 }
    ],
    seo: {
      metaTitle: "Custom Roll-Up Standees 6x3 ft | Express Printigly",
      metaDescription: "High resolution non-tear standee banners with portable aluminum bag.",
      indexable: true
    }
  },
  {
    id: "prod-3",
    title: "Custom Rigid Gift Packaging Boxes",
    slug: "custom-rigid-gift-boxes",
    category: "Custom Packaging",
    basePrice: 115,
    summary: "Handcrafted 1200 GSM Kappa board rigid boxes with concealed magnetic closure.",
    description: "Elevate your brand's unboxing experience. Custom printed inside and out with velvet soft touch feel, ribbon pull tabs, and custom foam inserts.",
    specs: {
      paperGsm: "1200 GSM European Rigid Board",
      dimensions: "250mm x 200mm x 80mm",
      printTech: "Offset Litho + Metallic Foil Press",
      turnaround: "5-7 Working Days",
    },
    images: [
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop"
    ],
    variants: {
      boxStyle: [
        { name: "Magnetic Clasp Book Box", priceModifier: 0 },
        { name: "Top & Bottom Lid Style", priceModifier: -15 }
      ]
    },
    tieredPricing: [
      { tierMin: 100, pricePerUnit: 145 },
      { tierMin: 300, pricePerUnit: 125 },
      { tierMin: 500, pricePerUnit: 115 },
      { tierMin: 1000, pricePerUnit: 98 }
    ],
    seo: {
      metaTitle: "Custom Printed Rigid Gift Packaging Boxes | Printigly B2B",
      metaDescription: "Bespoke rigid boxes with magnetic lid for luxury products & luxury gifting.",
      indexable: true
    }
  }
];

export const INITIAL_DESIGN_REQUESTS = [
  {
    id: "DSGN-104",
    orderId: "PRT-98422",
    customerName: "Priya Nair (Zest Coffee)",
    phone: "+91 99011 44556",
    product: "Matte Kraft Coffee Packaging Pouches",
    brief: "We need font outline verification and placement of our new FSSAI license number (1122399900011) on the back panel.",
    assignedDesigner: "Ananya R.",
    status: "Proof Generated", // Assigned, In Progress, Proof Generated, Client Approved, Revision Requested
    proofUrl: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop",
    updatedAt: "2026-07-28T10:15:00Z",
    fee: 299,
  },
  {
    id: "DSGN-105",
    orderId: "PRT-98428",
    customerName: "Kavita Rao (Organic Bites)",
    phone: "+91 98801 88776",
    product: "Custom Standee & Sticker Labels",
    brief: "Create a vibrant green theme logo layout for eco-friendly snack packaging.",
    assignedDesigner: "Vikram S.",
    status: "In Progress",
    proofUrl: null,
    updatedAt: "2026-07-28T09:30:00Z",
    fee: 299,
  }
];

export const INITIAL_CUSTOMERS = [
  {
    id: "CUST-801",
    name: "Aarav Sharma",
    company: "Nexus Design Labs",
    email: "aarav@nexusdesign.in",
    phone: "+91 98450 11223",
    gstin: "29AAFCN8839M1Z5",
    totalSpend: 142500,
    totalOrders: 14,
    isB2B: true,
    creditNet15: true,
    logoUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop",
    status: "Active Corporate",
  },
  {
    id: "CUST-802",
    name: "Priya Nair",
    company: "Zest Artisanal Coffee",
    email: "priya@zestcoffee.com",
    phone: "+91 99011 44556",
    gstin: "29AAACZ1234F1Z8",
    totalSpend: 98200,
    totalOrders: 6,
    isB2B: true,
    creditNet15: false,
    logoUrl: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=200&auto=format&fit=crop",
    status: "Active Corporate",
  },
  {
    id: "CUST-803",
    name: "Rohan Kapoor",
    company: "Elevate Fitness Studios",
    email: "rohan@elevatefit.in",
    phone: "+91 97112 88990",
    gstin: null,
    totalSpend: 24800,
    totalOrders: 3,
    isB2B: false,
    creditNet15: false,
    logoUrl: null,
    status: "Regular Retail",
  }
];

export const REVENUE_ANALYTICS = [
  { month: "Jan", revenue: 420000, orders: 310, expressCount: 45 },
  { month: "Feb", revenue: 510000, orders: 380, expressCount: 62 },
  { month: "Mar", revenue: 680000, orders: 490, expressCount: 88 },
  { month: "Apr", revenue: 610000, orders: 430, expressCount: 71 },
  { month: "May", revenue: 790000, orders: 580, expressCount: 110 },
  { month: "Jun", revenue: 890000, orders: 640, expressCount: 135 },
  { month: "Jul (YTD)", revenue: 1040000, orders: 750, expressCount: 168 },
];

export const DAILY_ORDER_VOLUMES = [
  { day: "Mon", count: 42, express: 12 },
  { day: "Tue", count: 58, express: 19 },
  { day: "Wed", count: 65, express: 24 },
  { day: "Thu", count: 72, express: 28 },
  { day: "Fri", count: 89, express: 35 },
  { day: "Sat", count: 61, express: 18 },
  { day: "Sun", count: 25, express: 6 },
];

export const INITIAL_PRICING_RULES = {
  globalGstPercent: 18,
  expressSameDayMultiplier: 1.35, // +35% rush fee
  express24HrMultiplier: 1.15, // +15% rush fee
  volumeDiscounts: [
    { threshold: 10000, discountPercent: 5 },
    { threshold: 50000, discountPercent: 8 },
    { threshold: 100000, discountPercent: 12 },
  ]
};

export const INITIAL_CLOUDINARY_MEDIA = [
  {
    publicId: "printigly/mockups/business_cards_softtouch",
    url: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=800&auto=format&fit=crop",
    transformedUrl: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=800&auto=format&fit=crop",
    title: "Soft Touch Card Mockup",
    folder: "mockups",
    format: "jpg",
    size: "1.2 MB",
    dimensions: "2400 x 1600",
    createdAt: "2026-07-20",
    tags: ["stationery", "card", "mockup"]
  },
  {
    publicId: "printigly/mockups/standee_banner_6x3",
    url: "https://images.unsplash.com/photo-1542744094-3a3121699563?q=80&w=800&auto=format&fit=crop",
    transformedUrl: "https://images.unsplash.com/photo-1542744094-3a3121699563?q=80&w=800&auto=format&fit=crop",
    title: "Expo Standee Display Banner",
    folder: "displays",
    format: "png",
    size: "3.4 MB",
    dimensions: "3000 x 2000",
    createdAt: "2026-07-22",
    tags: ["banner", "standee", "expo"]
  },
  {
    publicId: "printigly/mockups/rigid_gift_box",
    url: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop",
    transformedUrl: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop",
    title: "Luxury Rigid Box Mockup",
    folder: "packaging",
    format: "jpg",
    size: "2.1 MB",
    dimensions: "2000 x 1500",
    createdAt: "2026-07-25",
    tags: ["packaging", "rigid box", "luxury"]
  }
];

export const INITIAL_LOGISTICS_LOGS = [
  {
    id: "LOG-991",
    orderId: "PRT-98421",
    type: "Hyperlocal Express",
    provider: "Porter Dispatch Bangalore",
    driverName: "Manjunath K.",
    driverPhone: "+91 98800 11223",
    status: "In Transit",
    pickupTime: "10:30 AM",
    estimatedDelivery: "11:45 AM",
    trackingUrl: "https://porter.in/track/PRT-98421",
  },
  {
    id: "LOG-992",
    orderId: "PRT-98422",
    type: "Hyperlocal Express",
    provider: "Dunzo Business",
    driverName: "Suresh P.",
    driverPhone: "+91 97411 55667",
    status: "Assigned",
    pickupTime: "Pending Pickup",
    estimatedDelivery: "12:15 PM",
    trackingUrl: "https://dunzo.com/track/PRT-98422",
  },
  {
    id: "LOG-993",
    orderId: "PRT-98423",
    type: "Pan-India Air Courier",
    provider: "BlueDart Express",
    awbNumber: "BD-883920192",
    status: "Manifest Created",
    pickupTime: "2026-07-27 16:00",
    estimatedDelivery: "2026-07-29",
    trackingUrl: "https://bluedart.com/track/BD-883920192",
  }
];
