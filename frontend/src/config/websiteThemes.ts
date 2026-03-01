/**
 * 15 website themes for rental admin to choose from.
 * Applied to the restaurant's storefront (buttons, links, accents).
 */
export interface WebsiteTheme {
  id: string;
  name: string;
  primary: string;
  primaryDark: string;
  accent: string;
  preview: [string, string, string]; // 3 swatch colors for preview card
}

export const WEBSITE_THEMES: WebsiteTheme[] = [
  { id: 'default',    name: 'Classic Orange',   primary: '#ea580c', primaryDark: '#c2410c', accent: '#fed7aa', preview: ['#ea580c', '#c2410c', '#9a3412'] },
  { id: 'ocean',      name: 'Ocean Blue',        primary: '#0284c7', primaryDark: '#0369a1', accent: '#7dd3fc', preview: ['#0284c7', '#0369a1', '#075985'] },
  { id: 'forest',     name: 'Forest Green',      primary: '#16a34a', primaryDark: '#15803d', accent: '#86efac', preview: ['#16a34a', '#15803d', '#166534'] },
  { id: 'sunset',     name: 'Sunset',            primary: '#dc2626', primaryDark: '#b91c1c', accent: '#fca5a5', preview: ['#dc2626', '#ea580c', '#f59e0b'] },
  { id: 'royal',      name: 'Royal Purple',      primary: '#7c3aed', primaryDark: '#6d28d9', accent: '#c4b5fd', preview: ['#7c3aed', '#6d28d9', '#5b21b6'] },
  { id: 'rose',       name: 'Rose',              primary: '#e11d48', primaryDark: '#be123c', accent: '#fda4af', preview: ['#e11d48', '#be123c', '#9f1239'] },
  { id: 'teal',       name: 'Teal',              primary: '#0d9488', primaryDark: '#0f766e', accent: '#5eead4', preview: ['#0d9488', '#0f766e', '#115e59'] },
  { id: 'amber',      name: 'Amber',             primary: '#d97706', primaryDark: '#b45309', accent: '#fcd34d', preview: ['#d97706', '#b45309', '#92400e'] },
  { id: 'slate',      name: 'Slate',              primary: '#475569', primaryDark: '#334155', accent: '#94a3b8', preview: ['#475569', '#334155', '#1e293b'] },
  { id: 'emerald',    name: 'Emerald',           primary: '#059669', primaryDark: '#047857', accent: '#6ee7b7', preview: ['#059669', '#047857', '#065f46'] },
  { id: 'indigo',     name: 'Indigo',            primary: '#4f46e5', primaryDark: '#4338ca', accent: '#a5b4fc', preview: ['#4f46e5', '#4338ca', '#3730a3'] },
  { id: 'coral',      name: 'Coral',             primary: '#f43f5e', primaryDark: '#e11d48', accent: '#fda4af', preview: ['#f43f5e', '#e11d48', '#be123c'] },
  { id: 'mint',       name: 'Mint',              primary: '#10b981', primaryDark: '#059669', accent: '#a7f3d0', preview: ['#10b981', '#059669', '#047857'] },
  { id: 'gold',       name: 'Gold',              primary: '#ca8a04', primaryDark: '#a16207', accent: '#fde047', preview: ['#ca8a04', '#a16207', '#854d0e'] },
  { id: 'navy',       name: 'Navy',              primary: '#1e40af', primaryDark: '#1e3a8a', accent: '#93c5fd', preview: ['#1e40af', '#1e3a8a', '#1e3a8a'] },
];

export const DEFAULT_THEME_ID = 'default';

export function getThemeById(id: string): WebsiteTheme | undefined {
  return WEBSITE_THEMES.find((t) => t.id === id);
}

export function getThemePrimaryColor(id: string): string {
  return getThemeById(id)?.primary ?? WEBSITE_THEMES[0].primary;
}
