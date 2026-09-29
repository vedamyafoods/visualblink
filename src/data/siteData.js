import {
  FiArrowUpRight,
  FiAward,
  FiBox,
  FiBriefcase,
  FiFeather,
  FiHeadphones,
  FiHeart,
  FiLayers,
  FiPackage,
  FiPrinter,
  FiShield,
  FiShoppingBag,
  FiTruck,
  FiZap,
} from 'react-icons/fi'

export const navItems = [
  { label: 'Products', href: '#products' },
  { label: 'Process', href: '#process' },
  { label: 'Portfolio', href: '#showcase' },
  { label: 'Pricing', href: '#quote' },
]

export const megaMenu = [
  'Business Cards',
  'Luxury Packaging',
  'Labels & Stickers',
  'Event Prints',
  'Retail Displays',
  'Brand Kits',
]

export const brands = [
  'Aster',
  'Northline',
  'Vela',
  'Monarch',
  'Cobalt',
  'Oriana',
  'Plume',
  'Vertex',
  'Kairo',
  'Noble',
]

export const categories = [
  { title: 'Business Cards', tag: 'Foil, matte, duplex', icon: FiLayers, tone: 'from-blue-500 to-cyan-400' },
  { title: 'Packaging', tag: 'Rigid boxes and mailers', icon: FiPackage, tone: 'from-violet-500 to-fuchsia-400' },
  { title: 'Labels', tag: 'Roll, sheet, waterproof', icon: FiFeather, tone: 'from-cyan-500 to-sky-400' },
  { title: 'Stickers', tag: 'Die-cut and kiss-cut', icon: FiHeart, tone: 'from-rose-500 to-orange-400' },
  { title: 'Flyers', tag: 'Launches and promos', icon: FiArrowUpRight, tone: 'from-amber-500 to-lime-400' },
  { title: 'Posters', tag: 'Gallery-grade color', icon: FiAward, tone: 'from-emerald-500 to-teal-400' },
  { title: 'Banners', tag: 'Indoor and outdoor', icon: FiZap, tone: 'from-indigo-500 to-blue-400' },
  { title: 'Brochures', tag: 'Premium folds', icon: FiPrinter, tone: 'from-slate-700 to-slate-400' },
  { title: 'Boxes', tag: 'Custom structures', icon: FiBox, tone: 'from-pink-500 to-rose-400' },
  { title: 'Invitations', tag: 'Textured papers', icon: FiBriefcase, tone: 'from-sky-500 to-violet-400' },
  { title: 'Hang Tags', tag: 'Retail-ready finishing', icon: FiShield, tone: 'from-lime-500 to-emerald-400' },
]

export const reasons = [
  { title: 'Fast Delivery', text: 'Priority production lanes with live dispatch visibility.', icon: FiTruck },
  { title: 'Premium Quality', text: 'Calibrated presses, expert proofs, and obsessive finish checks.', icon: FiAward },
  { title: 'Eco Friendly', text: 'FSC papers, low-VOC inks, and recyclable packaging options.', icon: FiFeather },
  { title: 'Low MOQ', text: 'Launch-ready small batches without sacrificing luxury finishing.', icon: FiBox },
  { title: '24x7 Support', text: 'Design, proofing, and order help whenever your team needs it.', icon: FiHeadphones },
  { title: 'Custom Design', text: 'Prepress specialists refine artwork for crisp, reliable output.', icon: FiLayers },
]

export const products = [
  {
    title: 'Velvet Business Cards',
    price: '$39',
    rating: '4.9',
    finish: 'Soft-touch, raised foil',
    tone: 'from-sky-500 via-blue-600 to-slate-900',
  },
  {
    title: 'Magnetic Retail Boxes',
    price: '$129',
    rating: '5.0',
    finish: 'Rigid board, satin wrap',
    tone: 'from-violet-500 via-fuchsia-500 to-slate-900',
  },
  {
    title: 'Waterproof Jar Labels',
    price: '$24',
    rating: '4.8',
    finish: 'Gloss laminate, roll stock',
    tone: 'from-cyan-400 via-teal-500 to-slate-900',
  },
]

export const processSteps = [
  'Choose Product',
  'Upload Design',
  'Approve Proof',
  'Printing',
  'Shipping',
]

export const stats = [
  { value: 50000, suffix: '+', label: 'Orders Delivered' },
  { value: 15000, suffix: '+', label: 'Happy Customers' },
  { value: 100, suffix: '+', label: 'Corporate Clients' },
  { value: 98, suffix: '%', label: 'Repeat Orders' },
]

export const testimonials = [
  {
    name: 'Maya Kapoor',
    role: 'Founder, Lumiere Skin',
    quote: 'The packaging felt like something from a global beauty counter. Proofing was precise and delivery landed early.',
    avatar: 'MK',
  },
  {
    name: 'Arjun Mehta',
    role: 'Brand Director, Kairo Foods',
    quote: 'Every label color matched across batches. That consistency changed how confidently we launched new SKUs.',
    avatar: 'AM',
  },
  {
    name: 'Nina Shah',
    role: 'Creative Lead, Noble Events',
    quote: 'Their invitation suite had the kind of finish clients keep touching. It made the whole event feel elevated.',
    avatar: 'NS',
  },
]

export const industries = [
  { label: 'Fashion', icon: FiShoppingBag },
  { label: 'Restaurant', icon: FiBriefcase },
  { label: 'Cosmetics', icon: FiFeather },
  { label: 'Jewelry', icon: FiAward },
  { label: 'Food', icon: FiPackage },
  { label: 'Electronics', icon: FiZap },
  { label: 'Healthcare', icon: FiHeart },
  { label: 'Corporate', icon: FiShield },
]

export const faqs = [
  {
    question: 'Can I order a sample before production?',
    answer: 'Yes. Request a calibrated proof or sample run for packaging, labels, cards, and custom projects.',
  },
  {
    question: 'Do you help fix design files?',
    answer: 'Our prepress team checks bleed, resolution, color mode, font outlines, and finishing layers before print approval.',
  },
  {
    question: 'How quickly can you ship?',
    answer: 'Many standard products ship in 2-4 business days after proof approval. Rush production is available on select items.',
  },
  {
    question: 'Can you support recurring brand orders?',
    answer: 'Yes. We support saved specs, repeat ordering, private portals, bulk pricing, and scheduled replenishment.',
  },
]

export const footerLinks = {
  Company: ['About', 'Portfolio', 'Sustainability', 'Careers'],
  Products: ['Cards', 'Boxes', 'Labels', 'Posters'],
  Support: ['Contact', 'Track order', 'Artwork guide', 'Help center'],
}

export const commands = [
  'Open product catalog',
  'Start instant quote',
  'Upload artwork',
  'Track an order',
  'View brand portfolio',
]
