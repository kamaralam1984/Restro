'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ────────────────────────────────────────────────────────────────────

type PageType = 'homepage' | 'menu' | 'about' | 'contact' | 'booking';

type SectionType =
  | 'hero'
  | 'featured'
  | 'about'
  | 'testimonials'
  | 'gallery'
  | 'contact-form'
  | 'map'
  | 'special-offers'
  | 'footer';

interface HeroProps { headline: string; subheadline: string; bgColor: string; btnText: string; btnLink: string; }
interface FeaturedProps { title: string; itemCount: number; layout: 'grid' | 'carousel'; }
interface AboutProps { heading: string; body: string; imageUrl: string; }
interface TestimonialsProps { show: boolean; title: string; }
interface GalleryProps { images: string[]; }
interface ContactFormProps { showPhone: boolean; showEmail: boolean; showMessage: boolean; }
interface SpecialOffersProps { title: string; offerText: string; bgColor: string; }
interface FooterProps { text: string; }

type SectionProps =
  | HeroProps
  | FeaturedProps
  | AboutProps
  | TestimonialsProps
  | GalleryProps
  | ContactFormProps
  | SpecialOffersProps
  | FooterProps;

interface Section {
  id: string;
  type: SectionType;
  props: SectionProps;
}

type PageConfig = Record<PageType, Section[]>;

// ─── Defaults ────────────────────────────────────────────────────────────────

const DEFAULT_SECTIONS: Record<SectionType, { label: string; defaultProps: SectionProps }> = {
  hero: { label: 'Hero (Banner)', defaultProps: { headline: 'Welcome to Our Restaurant', subheadline: 'Fine dining reimagined', bgColor: '#141414', btnText: 'Reserve a Table', btnLink: '/booking' } },
  featured: { label: 'Featured Items', defaultProps: { title: 'Our Signature Dishes', itemCount: 3, layout: 'grid' } },
  about: { label: 'About Us', defaultProps: { heading: 'Our Story', body: 'We craft unforgettable dining experiences with the finest ingredients.', imageUrl: '' } },
  testimonials: { label: 'Testimonials', defaultProps: { show: true, title: 'What Our Guests Say' } },
  gallery: { label: 'Gallery', defaultProps: { images: ['', '', '', '', '', ''] } },
  'contact-form': { label: 'Contact Form', defaultProps: { showPhone: true, showEmail: true, showMessage: true } },
  map: { label: 'Map & Location', defaultProps: {} as FooterProps },
  'special-offers': { label: 'Special Offers', defaultProps: { title: 'Today\'s Specials', offerText: '20% off on all starters this weekend!', bgColor: '#1a1000' } },
  footer: { label: 'Footer', defaultProps: { text: '© 2026 My Restaurant. All rights reserved.' } },
};

const DEFAULT_PAGE_CONFIG: PageConfig = {
  homepage: [
    { id: 'h1', type: 'hero', props: DEFAULT_SECTIONS.hero.defaultProps },
    { id: 'h2', type: 'featured', props: DEFAULT_SECTIONS.featured.defaultProps },
    { id: 'h3', type: 'testimonials', props: DEFAULT_SECTIONS.testimonials.defaultProps },
    { id: 'h4', type: 'footer', props: DEFAULT_SECTIONS.footer.defaultProps },
  ],
  menu: [
    { id: 'm1', type: 'featured', props: { ...(DEFAULT_SECTIONS.featured.defaultProps as FeaturedProps), title: 'Full Menu', itemCount: 6 } },
    { id: 'm2', type: 'footer', props: DEFAULT_SECTIONS.footer.defaultProps },
  ],
  about: [
    { id: 'a1', type: 'about', props: DEFAULT_SECTIONS.about.defaultProps },
    { id: 'a2', type: 'gallery', props: DEFAULT_SECTIONS.gallery.defaultProps },
    { id: 'a3', type: 'footer', props: DEFAULT_SECTIONS.footer.defaultProps },
  ],
  contact: [
    { id: 'c1', type: 'contact-form', props: DEFAULT_SECTIONS['contact-form'].defaultProps },
    { id: 'c2', type: 'map', props: DEFAULT_SECTIONS.map.defaultProps },
    { id: 'c3', type: 'footer', props: DEFAULT_SECTIONS.footer.defaultProps },
  ],
  booking: [
    { id: 'b1', type: 'hero', props: { ...(DEFAULT_SECTIONS.hero.defaultProps as HeroProps), headline: 'Reserve Your Table', btnText: 'Book Now', btnLink: '#booking-form' } },
    { id: 'b2', type: 'contact-form', props: DEFAULT_SECTIONS['contact-form'].defaultProps },
    { id: 'b3', type: 'footer', props: DEFAULT_SECTIONS.footer.defaultProps },
  ],
};

const PAGE_LABELS: Record<PageType, string> = {
  homepage: 'Homepage',
  menu: 'Menu Page',
  about: 'About',
  contact: 'Contact',
  booking: 'Booking',
};

const SECTION_PALETTE: SectionType[] = [
  'hero', 'featured', 'about', 'testimonials', 'gallery',
  'contact-form', 'map', 'special-offers', 'footer',
];

const SECTION_ICONS: Record<SectionType, string> = {
  hero: '🖼️', featured: '⭐', about: '📖', testimonials: '💬', gallery: '🖼️',
  'contact-form': '📋', map: '📍', 'special-offers': '🏷️', footer: '📄',
};

// ─── Section Preview Card ─────────────────────────────────────────────────────

function SectionPreviewCard({
  section, index, total, isSelected,
  onSelect, onMoveUp, onMoveDown, onRemove,
}: {
  section: Section; index: number; total: number; isSelected: boolean;
  onSelect: () => void; onMoveUp: () => void; onMoveDown: () => void; onRemove: () => void;
}) {
  const label = DEFAULT_SECTIONS[section.type]?.label ?? section.type;

  const getBgColor = () => {
    switch (section.type) {
      case 'hero': return 'linear-gradient(135deg, #1a1000, #2a1800)';
      case 'featured': return 'linear-gradient(135deg, #0a1000, #1a2000)';
      case 'about': return '#141414';
      case 'testimonials': return 'linear-gradient(135deg, #100a1a, #1a1030)';
      case 'gallery': return '#0f0f0f';
      case 'contact-form': return '#141414';
      case 'map': return '#101010';
      case 'special-offers': return (section.props as SpecialOffersProps).bgColor || '#1a1000';
      case 'footer': return '#080808';
      default: return '#141414';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      onClick={onSelect}
      style={{
        background: getBgColor(),
        border: isSelected ? '2px solid #3b82f6' : '1px solid rgba(200,151,42,0.2)',
        borderRadius: 10,
        padding: '16px 14px',
        cursor: 'pointer',
        marginBottom: 8,
        position: 'relative',
        transition: 'border-color 0.2s',
        minHeight: section.type === 'hero' ? 90 : section.type === 'gallery' ? 80 : 60,
      }}
    >
      {/* Section label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 16 }}>{SECTION_ICONS[section.type]}</span>
        <span style={{ color: '#f8f4ed', fontSize: 13, fontWeight: 600 }}>{label}</span>
        {isSelected && (
          <span style={{ marginLeft: 'auto', background: '#3b82f6', color: '#fff', fontSize: 10, padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>
            SELECTED
          </span>
        )}
      </div>

      {/* Mini preview content */}
      {section.type === 'hero' && (
        <div>
          <div style={{ color: '#c8972a', fontSize: 12, fontWeight: 700, marginBottom: 2 }}>
            {(section.props as HeroProps).headline}
          </div>
          <div style={{ color: '#a89070', fontSize: 10 }}>{(section.props as HeroProps).subheadline}</div>
          <div style={{ display: 'inline-block', background: '#c8972a', color: '#080808', fontSize: 9, padding: '2px 10px', borderRadius: 4, marginTop: 6, fontWeight: 700 }}>
            {(section.props as HeroProps).btnText}
          </div>
        </div>
      )}
      {section.type === 'featured' && (
        <div style={{ display: 'flex', gap: 4 }}>
          {Array.from({ length: Math.min((section.props as FeaturedProps).itemCount, 4) }).map((_, i) => (
            <div key={i} style={{ flex: 1, height: 28, background: 'rgba(200,151,42,0.15)', borderRadius: 4, border: '1px solid rgba(200,151,42,0.2)' }} />
          ))}
        </div>
      )}
      {section.type === 'gallery' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 3 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ height: 20, background: 'rgba(200,151,42,0.12)', borderRadius: 3 }} />
          ))}
        </div>
      )}
      {section.type === 'testimonials' && (
        <div style={{ color: '#a89070', fontSize: 10, fontStyle: 'italic' }}>"A wonderful dining experience..."</div>
      )}
      {section.type === 'special-offers' && (
        <div style={{ color: '#f59e0b', fontSize: 10, fontWeight: 600 }}>{(section.props as SpecialOffersProps).offerText || 'Special offer text'}</div>
      )}
      {section.type === 'footer' && (
        <div style={{ color: '#555', fontSize: 10 }}>{(section.props as FooterProps).text}</div>
      )}

      {/* Controls */}
      <div
        style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 4 }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onMoveUp}
          disabled={index === 0}
          style={{ background: 'rgba(200,151,42,0.15)', border: '1px solid rgba(200,151,42,0.3)', color: index === 0 ? '#444' : '#c8972a', borderRadius: 4, width: 22, height: 22, cursor: index === 0 ? 'default' : 'pointer', fontSize: 10 }}
        >↑</button>
        <button
          onClick={onMoveDown}
          disabled={index === total - 1}
          style={{ background: 'rgba(200,151,42,0.15)', border: '1px solid rgba(200,151,42,0.3)', color: index === total - 1 ? '#444' : '#c8972a', borderRadius: 4, width: 22, height: 22, cursor: index === total - 1 ? 'default' : 'pointer', fontSize: 10 }}
        >↓</button>
        <button
          onClick={onRemove}
          style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: 4, width: 22, height: 22, cursor: 'pointer', fontSize: 10 }}
        >×</button>
      </div>
    </motion.div>
  );
}

// ─── Properties Panel ─────────────────────────────────────────────────────────

function PropertiesPanel({
  section, onChange,
}: { section: Section; onChange: (props: SectionProps) => void }) {
  const inputStyle: React.CSSProperties = {
    width: '100%', background: '#1c1c1c', border: '1px solid rgba(200,151,42,0.25)',
    borderRadius: 6, color: '#f8f4ed', padding: '7px 10px', fontSize: 12,
    outline: 'none', boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = { color: '#a89070', fontSize: 11, marginBottom: 4, display: 'block' };
  const fieldWrap: React.CSSProperties = { marginBottom: 12 };

  const update = (partial: Partial<SectionProps>) =>
    onChange({ ...section.props, ...partial } as SectionProps);

  if (section.type === 'hero') {
    const p = section.props as HeroProps;
    return (
      <div>
        <div style={fieldWrap}><label style={labelStyle}>Headline</label><input style={inputStyle} value={p.headline} onChange={e => update({ headline: e.target.value })} /></div>
        <div style={fieldWrap}><label style={labelStyle}>Subheadline</label><input style={inputStyle} value={p.subheadline} onChange={e => update({ subheadline: e.target.value })} /></div>
        <div style={fieldWrap}><label style={labelStyle}>Background Color</label><div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><input type="color" value={p.bgColor} onChange={e => update({ bgColor: e.target.value })} style={{ width: 36, height: 28, border: 'none', background: 'none', cursor: 'pointer' }} /><input style={{ ...inputStyle, flex: 1 }} value={p.bgColor} onChange={e => update({ bgColor: e.target.value })} /></div></div>
        <div style={fieldWrap}><label style={labelStyle}>Button Text</label><input style={inputStyle} value={p.btnText} onChange={e => update({ btnText: e.target.value })} /></div>
        <div style={fieldWrap}><label style={labelStyle}>Button Link</label><input style={inputStyle} value={p.btnLink} onChange={e => update({ btnLink: e.target.value })} /></div>
      </div>
    );
  }

  if (section.type === 'featured') {
    const p = section.props as FeaturedProps;
    return (
      <div>
        <div style={fieldWrap}><label style={labelStyle}>Section Title</label><input style={inputStyle} value={p.title} onChange={e => update({ title: e.target.value })} /></div>
        <div style={fieldWrap}><label style={labelStyle}>Item Count (2–6)</label><input type="range" min={2} max={6} value={p.itemCount} onChange={e => update({ itemCount: Number(e.target.value) })} style={{ width: '100%', accentColor: '#c8972a' }} /><div style={{ color: '#c8972a', fontSize: 12, textAlign: 'center', marginTop: 4 }}>{p.itemCount} items</div></div>
        <div style={fieldWrap}><label style={labelStyle}>Layout</label><select style={{ ...inputStyle }} value={p.layout} onChange={e => update({ layout: e.target.value as 'grid' | 'carousel' })}><option value="grid">Grid</option><option value="carousel">Carousel</option></select></div>
      </div>
    );
  }

  if (section.type === 'about') {
    const p = section.props as AboutProps;
    return (
      <div>
        <div style={fieldWrap}><label style={labelStyle}>Heading</label><input style={inputStyle} value={p.heading} onChange={e => update({ heading: e.target.value })} /></div>
        <div style={fieldWrap}><label style={labelStyle}>Body Text</label><textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} value={p.body} onChange={e => update({ body: e.target.value })} /></div>
        <div style={fieldWrap}><label style={labelStyle}>Image URL</label><input style={inputStyle} value={p.imageUrl} placeholder="https://..." onChange={e => update({ imageUrl: e.target.value })} /></div>
      </div>
    );
  }

  if (section.type === 'testimonials') {
    const p = section.props as TestimonialsProps;
    return (
      <div>
        <div style={fieldWrap}><label style={labelStyle}>Section Title</label><input style={inputStyle} value={p.title} onChange={e => update({ title: e.target.value })} /></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input type="checkbox" checked={p.show} onChange={e => update({ show: e.target.checked })} style={{ accentColor: '#c8972a', width: 16, height: 16 }} />
          <span style={{ color: '#f8f4ed', fontSize: 12 }}>Show Testimonials</span>
        </div>
      </div>
    );
  }

  if (section.type === 'gallery') {
    const p = section.props as GalleryProps;
    return (
      <div>
        <div style={{ color: '#a89070', fontSize: 11, marginBottom: 10 }}>Gallery Image URLs (up to 6)</div>
        {p.images.map((url, i) => (
          <div key={i} style={fieldWrap}>
            <label style={labelStyle}>Image {i + 1}</label>
            <input style={inputStyle} value={url} placeholder="https://..." onChange={e => { const imgs = [...p.images]; imgs[i] = e.target.value; update({ images: imgs }); }} />
          </div>
        ))}
      </div>
    );
  }

  if (section.type === 'contact-form') {
    const p = section.props as ContactFormProps;
    const toggleRow = (label: string, checked: boolean, key: keyof ContactFormProps) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <input type="checkbox" checked={checked} onChange={e => update({ [key]: e.target.checked })} style={{ accentColor: '#c8972a', width: 16, height: 16 }} />
        <span style={{ color: '#f8f4ed', fontSize: 12 }}>{label}</span>
      </div>
    );
    return (
      <div>
        <div style={{ color: '#a89070', fontSize: 11, marginBottom: 12 }}>Show Fields</div>
        {toggleRow('Phone Number', p.showPhone, 'showPhone')}
        {toggleRow('Email Address', p.showEmail, 'showEmail')}
        {toggleRow('Message', p.showMessage, 'showMessage')}
      </div>
    );
  }

  if (section.type === 'special-offers') {
    const p = section.props as SpecialOffersProps;
    return (
      <div>
        <div style={fieldWrap}><label style={labelStyle}>Title</label><input style={inputStyle} value={p.title} onChange={e => update({ title: e.target.value })} /></div>
        <div style={fieldWrap}><label style={labelStyle}>Offer Text</label><textarea style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} value={p.offerText} onChange={e => update({ offerText: e.target.value })} /></div>
        <div style={fieldWrap}><label style={labelStyle}>Background Color</label><div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><input type="color" value={p.bgColor} onChange={e => update({ bgColor: e.target.value })} style={{ width: 36, height: 28, border: 'none', background: 'none', cursor: 'pointer' }} /><input style={{ ...inputStyle, flex: 1 }} value={p.bgColor} onChange={e => update({ bgColor: e.target.value })} /></div></div>
      </div>
    );
  }

  if (section.type === 'map') {
    return (
      <div style={{ color: '#a89070', fontSize: 12, lineHeight: 1.6 }}>
        Map section displays your restaurant location.<br />
        Configure your address in <span style={{ color: '#c8972a' }}>Settings → Restaurant Info</span>.
      </div>
    );
  }

  if (section.type === 'footer') {
    const p = section.props as FooterProps;
    return (
      <div style={fieldWrap}><label style={labelStyle}>Footer Text</label><input style={inputStyle} value={p.text || ''} onChange={e => update({ text: e.target.value })} /></div>
    );
  }

  return <div style={{ color: '#555', fontSize: 12 }}>Select a section to edit its properties.</div>;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function WebsiteBuilderPage() {
  const [activePage, setActivePage] = useState<PageType>('homepage');
  const [pageConfig, setPageConfig] = useState<PageConfig>(DEFAULT_PAGE_CONFIG);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [slug, setSlug] = useState<string>('my-restaurant');
  const [toast, setToast] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('restro_website_config');
    if (saved) {
      try { setPageConfig(JSON.parse(saved)); } catch {}
    }
    const admin = JSON.parse(localStorage.getItem('admin') || '{}');
    if (admin.restaurantSlug) setSlug(admin.restaurantSlug);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const currentSections = pageConfig[activePage];
  const selectedSection = currentSections.find(s => s.id === selectedId) ?? null;

  const updateSections = (sections: Section[]) =>
    setPageConfig(prev => ({ ...prev, [activePage]: sections }));

  const addSection = (type: SectionType) => {
    const id = `${type}-${Date.now()}`;
    const newSection: Section = { id, type, props: DEFAULT_SECTIONS[type].defaultProps };
    updateSections([...currentSections, newSection]);
    setSelectedId(id);
  };

  const moveSection = (index: number, dir: -1 | 1) => {
    const arr = [...currentSections];
    const target = index + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[index], arr[target]] = [arr[target], arr[index]];
    updateSections(arr);
  };

  const removeSection = (id: string) => {
    updateSections(currentSections.filter(s => s.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const updateProps = useCallback((id: string, props: SectionProps) => {
    setPageConfig(prev => ({
      ...prev,
      [activePage]: prev[activePage].map(s => s.id === id ? { ...s, props } : s),
    }));
  }, [activePage]);

  const handleSave = () => {
    localStorage.setItem('restro_website_config', JSON.stringify(pageConfig));
    showToast('Changes saved successfully!');
  };

  const handlePublish = () => {
    localStorage.setItem('restro_website_config', JSON.stringify(pageConfig));
    showToast('Changes live! Your site is updated.');
  };

  const handleReset = () => {
    setPageConfig(DEFAULT_PAGE_CONFIG);
    setSelectedId(null);
    localStorage.removeItem('restro_website_config');
    showToast('Reset to default configuration.');
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(`${window.location.origin}/r/${slug}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // ── Styles ──
  const panelBase: React.CSSProperties = {
    background: '#0d0d0d', borderRadius: 12, display: 'flex', flexDirection: 'column', overflow: 'hidden',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#080808', color: '#f8f4ed', fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ borderBottom: '1px solid rgba(200,151,42,0.2)', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 16, background: '#0a0a0a' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>🏗️</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#c8972a' }}>Website Builder</span>
        </div>
        <div style={{ color: '#555', fontSize: 12, marginLeft: 8 }}>
          Drag & drop your restaurant pages visually
        </div>
      </div>

      {/* 3-column layout */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '220px 1fr 280px', gap: 0, minHeight: 0, overflow: 'hidden' }}>

        {/* ── LEFT PANEL ── */}
        <div style={{ ...panelBase, borderRight: '1px solid rgba(200,151,42,0.12)', padding: '16px 12px', overflowY: 'auto' }}>
          {/* Pages */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ color: '#a89070', fontSize: 10, fontWeight: 700, letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>Pages</div>
            {(Object.keys(PAGE_LABELS) as PageType[]).map(page => (
              <button
                key={page}
                onClick={() => { setActivePage(page); setSelectedId(null); }}
                style={{
                  width: '100%', textAlign: 'left', padding: '7px 10px', borderRadius: 6, marginBottom: 3,
                  background: activePage === page ? 'rgba(200,151,42,0.18)' : 'transparent',
                  border: activePage === page ? '1px solid rgba(200,151,42,0.35)' : '1px solid transparent',
                  color: activePage === page ? '#c8972a' : '#a89070', fontSize: 12, cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {PAGE_LABELS[page]}
              </button>
            ))}
          </div>

          {/* Section Palette */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ color: '#a89070', fontSize: 10, fontWeight: 700, letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>Add Section</div>
            {SECTION_PALETTE.map(type => (
              <button
                key={type}
                onClick={() => addSection(type)}
                style={{
                  width: '100%', textAlign: 'left', padding: '6px 10px', borderRadius: 6, marginBottom: 3,
                  background: '#141414', border: '1px solid rgba(200,151,42,0.15)',
                  color: '#d4c4a0', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(200,151,42,0.1)'; (e.currentTarget as HTMLElement).style.color = '#c8972a'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#141414'; (e.currentTarget as HTMLElement).style.color = '#d4c4a0'; }}
              >
                <span style={{ fontSize: 13 }}>{SECTION_ICONS[type]}</span>
                <span>{DEFAULT_SECTIONS[type].label}</span>
                <span style={{ marginLeft: 'auto', color: '#555', fontSize: 14 }}>+</span>
              </button>
            ))}
          </div>

          {/* Preview Live */}
          <a
            href={`/r/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block', textAlign: 'center', padding: '8px 12px', borderRadius: 8,
              background: 'rgba(200,151,42,0.12)', border: '1px solid rgba(200,151,42,0.35)',
              color: '#c8972a', fontSize: 12, fontWeight: 600, textDecoration: 'none',
            }}
          >
            Preview Live →
          </a>
        </div>

        {/* ── MIDDLE PANEL (Preview) ── */}
        <div style={{ background: '#0a0a0a', overflowY: 'auto', padding: 20, borderRight: '1px solid rgba(200,151,42,0.12)' }}>
          {/* Live URL bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#141414', border: '1px solid rgba(200,151,42,0.2)', borderRadius: 8, padding: '8px 14px', marginBottom: 20 }}>
            <span style={{ color: '#22c55e', fontSize: 10, fontWeight: 700 }}>LIVE</span>
            <span style={{ color: '#a89070', fontSize: 12, flex: 1 }}>
              Your website is live at: <span style={{ color: '#c8972a' }}>/r/{slug}</span>
            </span>
            <button
              onClick={handleCopyLink}
              style={{ background: 'rgba(200,151,42,0.12)', border: '1px solid rgba(200,151,42,0.25)', color: copied ? '#22c55e' : '#c8972a', borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}
            >
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
            <a href={`/r/${slug}`} target="_blank" rel="noopener noreferrer" style={{ color: '#c8972a', fontSize: 11, fontWeight: 600, textDecoration: 'none' }}>Open ↗</a>
          </div>

          {/* Page sections */}
          <div style={{ maxWidth: 700, margin: '0 auto' }}>
            <div style={{ color: '#555', fontSize: 11, marginBottom: 12, textAlign: 'center' }}>
              {PAGE_LABELS[activePage]} — {currentSections.length} section{currentSections.length !== 1 ? 's' : ''}
            </div>
            <AnimatePresence>
              {currentSections.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ textAlign: 'center', padding: '60px 20px', color: '#444', border: '1px dashed #333', borderRadius: 12 }}
                >
                  <div style={{ fontSize: 32, marginBottom: 12 }}>📄</div>
                  <div style={{ fontSize: 13 }}>No sections yet. Add one from the left panel.</div>
                </motion.div>
              )}
              {currentSections.map((section, index) => (
                <SectionPreviewCard
                  key={section.id}
                  section={section}
                  index={index}
                  total={currentSections.length}
                  isSelected={selectedId === section.id}
                  onSelect={() => setSelectedId(section.id)}
                  onMoveUp={() => moveSection(index, -1)}
                  onMoveDown={() => moveSection(index, 1)}
                  onRemove={() => removeSection(section.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* ── RIGHT PANEL (Properties) ── */}
        <div style={{ ...panelBase, padding: 16, overflowY: 'auto' }}>
          {selectedSection ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid rgba(200,151,42,0.15)' }}>
                <span style={{ fontSize: 18 }}>{SECTION_ICONS[selectedSection.type]}</span>
                <div>
                  <div style={{ color: '#f8f4ed', fontSize: 13, fontWeight: 700 }}>{DEFAULT_SECTIONS[selectedSection.type]?.label}</div>
                  <div style={{ color: '#555', fontSize: 10 }}>Section Properties</div>
                </div>
              </div>
              <PropertiesPanel
                section={selectedSection}
                onChange={props => updateProps(selectedSection.id, props)}
              />
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#555', textAlign: 'center', padding: 20, gap: 12 }}>
              <div style={{ fontSize: 36 }}>👈</div>
              <div style={{ fontSize: 13 }}>Click any section in the preview to edit its properties</div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{ borderTop: '1px solid rgba(200,151,42,0.2)', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 12, background: '#0a0a0a' }}>
        <button
          onClick={handleSave}
          style={{ padding: '9px 22px', background: 'linear-gradient(135deg, #8b5a00, #c8972a)', color: '#080808', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
        >
          Save Changes
        </button>
        <button
          onClick={handlePublish}
          style={{ padding: '9px 22px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
        >
          Publish
        </button>
        <button
          onClick={handleReset}
          style={{ padding: '9px 22px', background: 'transparent', color: '#a89070', border: '1px solid rgba(200,151,42,0.25)', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
        >
          Reset to Default
        </button>
        <div style={{ flex: 1 }} />
        <span style={{ color: '#555', fontSize: 11 }}>
          {currentSections.length} sections on {PAGE_LABELS[activePage]}
        </span>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            style={{
              position: 'fixed', bottom: 70, left: '50%', transform: 'translateX(-50%)',
              background: '#1a1a1a', border: '1px solid rgba(200,151,42,0.4)', color: '#f8f4ed',
              padding: '10px 24px', borderRadius: 10, fontSize: 13, fontWeight: 600,
              boxShadow: '0 8px 32px rgba(0,0,0,0.6)', zIndex: 9999, whiteSpace: 'nowrap',
            }}
          >
            ✓ {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
