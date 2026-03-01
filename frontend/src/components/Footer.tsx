'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';

  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-orange-600">👨‍🍳</span>
              Restro OS
            </h3>
            <p className="text-slate-400">
              {isLandingPage
                ? 'All-in-one restaurant management: orders, billing, bookings, analytics & staff — one powerful platform.'
                : 'Fine dining experience with exceptional service. Pure & Delicious food delivered hot & fresh.'}
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-orange-600">Quick Links</h4>
            <ul className="space-y-2 text-slate-400">
              {isLandingPage ? (
                <>
                  <li><Link href="/#features" className="hover:text-orange-600 transition-colors">Features</Link></li>
                  <li><Link href="/#pricing" className="hover:text-orange-600 transition-colors">Pricing</Link></li>
                  <li><Link href="/contact" className="hover:text-orange-600 transition-colors">Contact</Link></li>
                  <li><Link href="/admin/login" className="hover:text-orange-600 transition-colors">Admin Login</Link></li>
                </>
              ) : (
                <>
                  <li><Link href="/menu" className="hover:text-orange-600 transition-colors">Menu</Link></li>
                  <li><Link href="/booking" className="hover:text-orange-600 transition-colors">Reservations</Link></li>
                  <li><Link href="/cart" className="hover:text-orange-600 transition-colors">Cart</Link></li>
                  <li><Link href="/admin/login" className="hover:text-orange-600 transition-colors">Admin</Link></li>
                </>
              )}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-orange-600">Contact</h4>
            <p className="text-slate-400 mb-1">Email: info@restroos.com</p>
            <p className="text-slate-400 mb-1">Phone: +1 (555) 123-4567</p>
            <p className="text-slate-400">Address: 123 Main Street, City</p>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
          <p>&copy; {new Date().getFullYear()} Restro OS. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
