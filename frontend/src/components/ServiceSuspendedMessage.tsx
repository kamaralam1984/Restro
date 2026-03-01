'use client';

import Link from 'next/link';

interface ServiceSuspendedMessageProps {
  restaurantName?: string;
  /** When true, show "Subscription Expired" instead of "Service Temporarily Suspended" */
  subscriptionExpired?: boolean;
}

export default function ServiceSuspendedMessage({ restaurantName, subscriptionExpired }: ServiceSuspendedMessageProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {restaurantName && (
          <h1 className="text-xl font-bold text-white mb-2">{restaurantName}</h1>
        )}
        <p className="text-amber-400 text-lg font-medium mb-2">
          {subscriptionExpired ? 'Subscription Expired' : 'Service Temporarily Suspended'}
        </p>
        <p className="text-slate-400 text-sm mb-6">
          {subscriptionExpired
            ? 'This restaurant\'s subscription has expired. They are not accepting orders or bookings until renewal.'
            : 'This restaurant is currently not accepting orders or bookings. Please check back later or contact the restaurant.'}
        </p>
        <Link href="/" className="text-orange-400 hover:text-orange-300 text-sm font-medium">
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
