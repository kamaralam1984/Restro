'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChefHat, Mail, Phone, MapPin, Instagram, Twitter, Youtube } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';

  return (
    <footer className="border-t" style={{ background: 'var(--lp-bg, #09090f)', borderColor: 'var(--lp-border, rgba(255,255,255,0.07))' }}>
      <div className="container mx-auto px-4 sm:px-6 py-14">
        {isLandingPage ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Brand */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #8b5a00, #c8972a)' }}>
                  <ChefHat className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-black" style={{ color: 'var(--lp-text)' }}>Restro OS</span>
              </div>
              <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--lp-text-2)' }}>
                India's all-in-one restaurant management platform. Orders, billing, bookings, analytics & staff — one powerful OS.
              </p>
              <div className="flex gap-3">
                {[
                  { icon: Instagram, label: 'Instagram' },
                  { icon: Twitter, label: 'Twitter' },
                  { icon: Youtube, label: 'YouTube' },
                ].map(s => {
                  const Icon = s.icon;
                  return (
                    <button key={s.label} aria-label={s.label}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors border"
                      style={{ background: 'var(--lp-surface)', borderColor: 'var(--lp-border)', color: 'var(--lp-text-2)' }}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-sm font-bold mb-4 uppercase tracking-wider" style={{ color: 'var(--lp-text-3)' }}>Product</h4>
              <ul className="space-y-2.5">
                {[
                  { href: '/features', label: 'Features' },
                  { href: '/#pricing', label: 'Pricing' },
                  { href: '/restaurant/signup', label: 'Start Free Trial' },
                  { href: '/demo', label: 'Book a Demo' },
                  { href: '/admin/login', label: 'Admin Login' },
                ].map(l => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm transition-colors hover:text-amber-400"
                      style={{ color: 'var(--lp-text-2)' }}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-sm font-bold mb-4 uppercase tracking-wider" style={{ color: 'var(--lp-text-3)' }}>Company</h4>
              <ul className="space-y-2.5">
                {[
                  { href: '/about', label: 'About Us' },
                  { href: '/contact', label: 'Contact' },
                  { href: '/privacy', label: 'Privacy Policy' },
                  { href: '/terms', label: 'Terms of Service' },
                  { href: '/refund', label: 'Refund Policy' },
                ].map(l => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm transition-colors hover:text-amber-400"
                      style={{ color: 'var(--lp-text-2)' }}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-sm font-bold mb-4 uppercase tracking-wider" style={{ color: 'var(--lp-text-3)' }}>Contact</h4>
              <ul className="space-y-3">
                {[
                  { icon: Mail, text: 'hello@restroos.com' },
                  { icon: Phone, text: '+91 98765 43210' },
                  { icon: MapPin, text: 'India' },
                ].map(c => {
                  const Icon = c.icon;
                  return (
                    <li key={c.text} className="flex items-center gap-2.5 text-sm"
                      style={{ color: 'var(--lp-text-2)' }}>
                      <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#c8972a' }} />
                      {c.text}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--lp-text)' }}>
                <ChefHat className="w-5 h-5" style={{ color: '#c8972a' }} />
                Restro OS
              </h3>
              <p className="text-sm" style={{ color: 'var(--lp-text-2)' }}>
                Fine dining experience with exceptional service.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider" style={{ color: '#c8972a' }}>Links</h4>
              <ul className="space-y-2">
                {['/menu', '/booking', '/cart', '/admin/login'].map(href => (
                  <li key={href}>
                    <Link href={href} className="text-sm capitalize hover:text-amber-400 transition-colors"
                      style={{ color: 'var(--lp-text-2)' }}>
                      {href.replace('/', '').replace('/login', ' Login').replace('-', ' ') || 'Home'}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider" style={{ color: '#c8972a' }}>Contact</h4>
              <p className="text-sm" style={{ color: 'var(--lp-text-2)' }}>info@restroos.com</p>
              <p className="text-sm" style={{ color: 'var(--lp-text-2)' }}>+91 98765 43210</p>
            </div>
          </div>
        )}

        <div className="mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t"
          style={{ borderColor: 'var(--lp-border)' }}>
          <p className="text-xs" style={{ color: 'var(--lp-text-3)' }}>
            © {new Date().getFullYear()} Restro OS. All rights reserved.
          </p>
          {isLandingPage && (
            <p className="text-xs" style={{ color: 'var(--lp-text-3)' }}>
              Made with ❤️ for Indian Restaurants
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
