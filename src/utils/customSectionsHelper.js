// Utility helpers for creating, normalizing, and converting dynamic product sections & fields

// Generate unique IDs for sections, fields, and options
export const generateId = (prefix = 'id') => `${prefix}_${Math.random().toString(36).substr(2, 9)}`;

// Fallback converter for legacy product data schemas into dynamic sections & fields
export const ensureCustomSections = (product) => {
  if (product && Array.isArray(product.customSections) && product.customSections.length > 0) {
    return product.customSections;
  }

  const sections = [];

  // 1. NCR Engine Configuration
  if (product?.ncrConfig || product?.enableNcrEngine) {
    const ncrConfig = product.ncrConfig || {};
    const ncrFields = [];

    ncrFields.push({
      id: generateId('f'),
      label: 'Top Sheet Printing Colour',
      type: 'dropdown',
      required: true,
      placeholder: 'Select colour...',
      helpText: '',
      options: [
        { id: generateId('opt'), label: 'Black and White', value: 'Black and White', priceModifier: 0 },
        { id: generateId('opt'), label: 'Full Colour (CMYK)', value: 'Full Colour (CMYK)', priceModifier: 2 }
      ]
    });

    ncrFields.push({
      id: generateId('f'),
      label: 'Duplicate Sheet Printing Colour',
      type: 'dropdown',
      required: true,
      placeholder: 'Select colour...',
      helpText: '',
      options: [
        { id: generateId('opt'), label: 'Black and White', value: 'Black and White', priceModifier: 0 },
        { id: generateId('opt'), label: 'Full Colour (CMYK)', value: 'Full Colour (CMYK)', priceModifier: 2 }
      ]
    });

    ncrFields.push({
      id: generateId('f'),
      label: 'Pad Type / Sets',
      type: 'dropdown',
      required: true,
      placeholder: 'Select pad type...',
      helpText: '',
      options: [
        { id: generateId('opt'), label: 'Single Copy (1 Part)', value: 'Single Copy', priceModifier: 0 },
        { id: generateId('opt'), label: 'with +1 Duplicate (2 Parts)', value: 'with +1 Duplicate', priceModifier: 5 },
        { id: generateId('opt'), label: 'with +2 Triplicate (3 Parts)', value: 'with +2 Triplicate', priceModifier: 10 }
      ]
    });

    ncrFields.push({
      id: generateId('f'),
      label: 'Duplicate Sheet Colour',
      type: 'dropdown',
      required: false,
      placeholder: 'Select paper colour...',
      helpText: '',
      options: [
        { id: generateId('opt'), label: 'Light Blue', value: 'Light Blue', priceModifier: 0 },
        { id: generateId('opt'), label: 'Pink', value: 'Pink', priceModifier: 0 },
        { id: generateId('opt'), label: 'Yellow', value: 'Yellow', priceModifier: 0 },
        { id: generateId('opt'), label: 'Green', value: 'Green', priceModifier: 0 }
      ]
    });

    ncrFields.push({
      id: generateId('f'),
      label: 'Invoice Numbering',
      type: 'dropdown',
      required: false,
      placeholder: 'Select numbering option...',
      helpText: 'do you want to print invoice numbers?',
      options: [
        { id: generateId('opt'), label: 'With Invoice Number', value: 'With Invoice Number', priceModifier: 1 },
        { id: generateId('opt'), label: 'Without Invoice Number', value: 'Without Invoice Number', priceModifier: 0 }
      ]
    });

    ncrFields.push({
      id: generateId('f'),
      label: 'Starting Invoice Number',
      type: 'text',
      required: false,
      placeholder: '001',
      helpText: 'choose the starting invoice number',
      options: []
    });

    sections.push({
      id: generateId('sec'),
      title: 'Printing & Invoice Configuration',
      enabled: true,
      fields: ncrFields
    });
  }

  // 2. Options & Variants (paperStock, finishes, sides, corners, lamination, etc.)
  if (product?.variants && typeof product.variants === 'object') {
    const variantFields = [];
    Object.entries(product.variants).forEach(([key, opts]) => {
      if (key === 'customAreaPricing') return;
      if (Array.isArray(opts) && opts.length > 0) {
        const formattedLabel = key
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase());

        const normalizedOptions = opts.map(o => ({
          id: generateId('opt'),
          label: typeof o === 'string' ? o : o.name || o.label || '',
          value: typeof o === 'string' ? o : o.name || o.value || '',
          priceModifier: typeof o === 'object' && (o.priceModifier || o.price) ? Number(o.priceModifier || o.price) : 0
        }));

        variantFields.push({
          id: generateId('f'),
          label: formattedLabel,
          type: 'dropdown',
          required: true,
          placeholder: `Select ${formattedLabel}...`,
          helpText: '',
          options: normalizedOptions
        });
      }
    });

    if (variantFields.length > 0) {
      sections.push({
        id: generateId('sec'),
        title: 'Product Specifications & Finishes',
        enabled: true,
        fields: variantFields
      });
    }
  }

  // 3. Technical Specs Attributes
  if (product?.specs && typeof product.specs === 'object' && Object.keys(product.specs).length > 0) {
    const specFields = Object.entries(product.specs).map(([key, val]) => ({
      id: generateId('f'),
      label: key.toUpperCase(),
      type: 'text',
      required: false,
      defaultValue: String(val),
      placeholder: String(val),
      helpText: '',
      options: []
    }));

    sections.push({
      id: generateId('sec'),
      title: 'Technical Specifications & Custom Attributes',
      enabled: true,
      fields: specFields
    });
  }

  // If no sections generated, provide a default section
  if (sections.length === 0) {
    sections.push({
      id: generateId('sec'),
      title: 'Product Options',
      enabled: true,
      fields: [
        {
          id: generateId('f'),
          label: 'Printing Option',
          type: 'dropdown',
          required: true,
          placeholder: 'Select option...',
          helpText: '',
          options: [
            { id: generateId('opt'), label: 'Standard Print', value: 'Standard Print', priceModifier: 0 },
            { id: generateId('opt'), label: 'Premium Finish', value: 'Premium Finish', priceModifier: 10 }
          ]
        }
      ]
    });
  }

  return sections;
};

// Preset Generators for Quick Product Creation in Admin
export const PRESET_CUSTOM_SECTIONS = {
  flexBanner: [
    {
      id: generateId('sec'),
      title: 'Banner Specifications',
      enabled: true,
      fields: [
        {
          id: generateId('f'),
          label: 'Material',
          type: 'dropdown',
          required: true,
          placeholder: 'Select material...',
          helpText: 'Choose flex banner substrate',
          options: [
            { id: generateId('opt'), label: 'Star Flex (Standard)', value: 'Star Flex', priceModifier: 0 },
            { id: generateId('opt'), label: 'Frontlit Heavy Vinyl', value: 'Frontlit Heavy Vinyl', priceModifier: 5 },
            { id: generateId('opt'), label: 'Backlit Translucent Flex', value: 'Backlit Translucent Flex', priceModifier: 15 },
            { id: generateId('opt'), label: 'Blackout Double-Sided Flex', value: 'Blackout Flex', priceModifier: 20 }
          ]
        },
        {
          id: generateId('f'),
          label: 'GSM / Weight',
          type: 'dropdown',
          required: true,
          placeholder: 'Select GSM...',
          helpText: '',
          options: [
            { id: generateId('opt'), label: '280 GSM Standard', value: '280 GSM', priceModifier: 0 },
            { id: generateId('opt'), label: '340 GSM Heavy Weight', value: '340 GSM', priceModifier: 4 },
            { id: generateId('opt'), label: '440 GSM Premium Heavy Duty', value: '440 GSM', priceModifier: 8 }
          ]
        },
        {
          id: generateId('f'),
          label: 'Dimensions',
          type: 'text',
          required: false,
          placeholder: 'e.g. 6ft x 3ft',
          helpText: 'Enter length x height in feet',
          options: []
        },
        {
          id: generateId('f'),
          label: 'Printing Technology',
          type: 'dropdown',
          required: true,
          placeholder: 'Select print type...',
          helpText: '',
          options: [
            { id: generateId('opt'), label: 'Eco Solvent High-Res Print', value: 'Eco Solvent', priceModifier: 0 },
            { id: generateId('opt'), label: 'UV Outdoor Fade-Resistant Print', value: 'UV Print', priceModifier: 10 }
          ]
        },
        {
          id: generateId('f'),
          label: 'Finishing Options',
          type: 'checkbox',
          required: false,
          placeholder: '',
          helpText: 'Select all finishing required',
          options: [
            { id: generateId('opt'), label: 'Metal Eyelets (Every 2ft)', value: 'Eyelets', priceModifier: 15 },
            { id: generateId('opt'), label: 'Reinforced Rope Edges', value: 'Rope', priceModifier: 10 },
            { id: generateId('opt'), label: 'Pole Pocket Fold (Top & Bottom)', value: 'Pole Pocket', priceModifier: 20 },
            { id: generateId('opt'), label: 'Matte Lamination Coating', value: 'Lamination', priceModifier: 25 }
          ]
        }
      ]
    },
    {
      id: generateId('sec'),
      title: 'Delivery & Turnaround',
      enabled: true,
      fields: [
        {
          id: generateId('f'),
          label: 'Production Turnaround',
          type: 'dropdown',
          required: true,
          placeholder: 'Select turnaround...',
          helpText: '',
          options: [
            { id: generateId('opt'), label: 'Standard 24-48 Hours', value: '24-48 Hours', priceModifier: 0 },
            { id: generateId('opt'), label: 'Same Day Super Express (+₹150)', value: 'Same Day Express', priceModifier: 150 }
          ]
        }
      ]
    }
  ],

  invoiceBook: [
    {
      id: generateId('sec'),
      title: 'Printing Configuration',
      enabled: true,
      fields: [
        {
          id: generateId('f'),
          label: 'Top Sheet Printing Colour',
          type: 'dropdown',
          required: true,
          placeholder: 'Select colour...',
          helpText: '',
          options: [
            { id: generateId('opt'), label: 'Black and White', value: 'Black and White', priceModifier: 0 },
            { id: generateId('opt'), label: 'Full Colour (CMYK)', value: 'Full Colour', priceModifier: 5 }
          ]
        },
        {
          id: generateId('f'),
          label: 'Duplicate Sheet Printing Colour',
          type: 'dropdown',
          required: true,
          placeholder: 'Select colour...',
          helpText: '',
          options: [
            { id: generateId('opt'), label: 'Black and White', value: 'Black and White', priceModifier: 0 },
            { id: generateId('opt'), label: 'Full Colour (CMYK)', value: 'Full Colour', priceModifier: 5 }
          ]
        },
        {
          id: generateId('f'),
          label: 'Pad Type',
          type: 'dropdown',
          required: true,
          placeholder: 'Select pad type...',
          helpText: '',
          options: [
            { id: generateId('opt'), label: 'Single Copy (1 Part)', value: 'Single Copy', priceModifier: 0 },
            { id: generateId('opt'), label: 'with +1 Duplicate', value: 'with +1 Duplicate', priceModifier: 10 },
            { id: generateId('opt'), label: 'with +2 Triplicate', value: 'with +2 Triplicate', priceModifier: 20 }
          ]
        },
        {
          id: generateId('f'),
          label: 'Duplicate Sheet Colour',
          type: 'dropdown',
          required: false,
          placeholder: 'Select sheet colour...',
          helpText: '',
          options: [
            { id: generateId('opt'), label: 'Light Blue', value: 'Light Blue', priceModifier: 0 },
            { id: generateId('opt'), label: 'Pink', value: 'Pink', priceModifier: 0 },
            { id: generateId('opt'), label: 'Yellow', value: 'Yellow', priceModifier: 0 }
          ]
        }
      ]
    },
    {
      id: generateId('sec'),
      title: 'Invoice Numbering & Serial',
      enabled: true,
      fields: [
        {
          id: generateId('f'),
          label: 'Invoice Numbering',
          type: 'dropdown',
          required: true,
          placeholder: 'Select option...',
          helpText: 'do you want to print invoice numbers?',
          options: [
            { id: generateId('opt'), label: 'With Invoice Number', value: 'With Invoice Number', priceModifier: 2 },
            { id: generateId('opt'), label: 'Without Invoice Number', value: 'Without Invoice Number', priceModifier: 0 }
          ]
        },
        {
          id: generateId('f'),
          label: 'Starting Invoice Number',
          type: 'text',
          required: false,
          placeholder: '001',
          helpText: 'choose the starting invoice number',
          options: []
        }
      ]
    }
  ],

  businessCard: [
    {
      id: generateId('sec'),
      title: 'Card Stock & Finishing',
      enabled: true,
      fields: [
        {
          id: generateId('f'),
          label: 'Paper Stock & Weight',
          type: 'dropdown',
          required: true,
          placeholder: 'Select paper stock...',
          helpText: '',
          options: [
            { id: generateId('opt'), label: '350 GSM Matte Art Card', value: '350 GSM Matte', priceModifier: 0 },
            { id: generateId('opt'), label: '400 GSM Velvet Soft-Touch Card', value: '400 GSM Velvet', priceModifier: 2 },
            { id: generateId('opt'), label: '300 GSM Recycled Kraft Board', value: '300 GSM Kraft', priceModifier: 1 }
          ]
        },
        {
          id: generateId('f'),
          label: 'Print Sides',
          type: 'radio',
          required: true,
          placeholder: '',
          helpText: '',
          options: [
            { id: generateId('opt'), label: 'Single-sided Print (Front Only)', value: 'Single-sided', priceModifier: 0 },
            { id: generateId('opt'), label: 'Double-sided Print (Front & Back)', value: 'Double-sided', priceModifier: 1.5 }
          ]
        },
        {
          id: generateId('f'),
          label: 'Edge Cutting & Corners',
          type: 'dropdown',
          required: false,
          placeholder: 'Select corner cut...',
          helpText: '',
          options: [
            { id: generateId('opt'), label: 'Standard Square Corners', value: 'Square Corners', priceModifier: 0 },
            { id: generateId('opt'), label: '3mm Rounded Corners (4 Edges)', value: '3mm Rounded', priceModifier: 0.5 },
            { id: generateId('opt'), label: '6mm Rounded Corners (4 Edges)', value: '6mm Rounded', priceModifier: 0.8 }
          ]
        }
      ]
    }
  ]
};
