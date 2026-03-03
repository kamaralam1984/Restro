'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import api from '@/services/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function VisitorTracker() {
  const pathname = usePathname();
  const startTimeRef = useRef<number | null>(null);
  const lastPathRef = useRef<string | null>(null);
  const visitorIdRef = useRef<string | null>(null);
  const geoRef = useRef<{ country?: string | null; state?: string | null; city?: string | null } | null>(null);
  const utmRef = useRef<{ source?: string; medium?: string; campaign?: string; referrer?: string } | null>(null);

  // Load visitorId from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('visitorId');
    if (stored) {
      visitorIdRef.current = stored;
    }

    // Load GeoIP info from sessionStorage or backend
    const geoStored = typeof window !== 'undefined' ? sessionStorage.getItem('visitorGeo') : null;
    if (geoStored) {
      try {
        geoRef.current = JSON.parse(geoStored);
      } catch {
        geoRef.current = null;
      }
    } else {
      api
        .get<{ country?: string | null; state?: string | null; city?: string | null }>('/visitors/geo')
        .then((geo) => {
          geoRef.current = geo;
          sessionStorage.setItem('visitorGeo', JSON.stringify(geo));
        })
        .catch(() => {
          geoRef.current = null;
        });
    }

    // UTM/source detection
    const utmStored = sessionStorage.getItem('visitorUtm');
    if (utmStored) {
      try {
        utmRef.current = JSON.parse(utmStored);
      } catch {
        utmRef.current = null;
      }
    } else if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const params = url.searchParams;
      let source = params.get('utm_source') || undefined;
      let medium = params.get('utm_medium') || undefined;
      const campaign = params.get('utm_campaign') || undefined;
      const referrer = document.referrer || undefined;

      if (!source) {
        if (referrer) {
          try {
            const refUrl = new URL(referrer);
            if (refUrl.hostname.includes('google')) source = 'Google';
            else if (refUrl.hostname.includes('facebook')) source = 'Facebook';
            else if (refUrl.hostname.includes('instagram')) source = 'Instagram';
            else source = refUrl.hostname;
            medium = medium || 'referral';
          } catch {
            source = 'Referral';
            medium = medium || 'referral';
          }
        } else {
          source = 'Direct';
          medium = medium || 'direct';
        }
      }

      const utm = { source, medium, campaign, referrer };
      utmRef.current = utm;
      sessionStorage.setItem('visitorUtm', JSON.stringify(utm));
    }
  }, []);

  // Track page changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const now = Date.now();

    const sendEvent = async () => {
      if (startTimeRef.current && lastPathRef.current) {
        const durationSec = Math.round((now - startTimeRef.current) / 1000);
        try {
          const geo = geoRef.current;
          const utm = utmRef.current;
          const payload: any = {
            visitorId: visitorIdRef.current,
            page: lastPathRef.current,
            durationSec,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          };
          if (geo) {
            if (geo.country) payload.country = geo.country;
            if (geo.state) payload.state = geo.state;
            if (geo.city) payload.city = geo.city;
          }
          if (utm) {
            if (utm.source) payload.source = utm.source;
            if (utm.medium) payload.medium = utm.medium;
            if (utm.campaign) payload.campaign = utm.campaign;
            if (utm.referrer) payload.referrer = utm.referrer;
          }

          const data = await api.post<{ visitorId: string }>('/visitors/track', payload);
          if (data?.visitorId && !visitorIdRef.current) {
            visitorIdRef.current = data.visitorId;
            localStorage.setItem('visitorId', data.visitorId);
          }
        } catch {
          // ignore tracking failures
        }
      }
      startTimeRef.current = now;
      lastPathRef.current = pathname || '/';
    };

    void sendEvent();
  }, [pathname]);

  // Ensure last page is tracked on tab close
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleBeforeUnload = () => {
      if (!startTimeRef.current || !lastPathRef.current) return;
      const now = Date.now();
      const durationSec = Math.round((now - startTimeRef.current) / 1000);
      const geo = geoRef.current;
      const utm = utmRef.current;
      const payload: any = {
        visitorId: visitorIdRef.current,
        page: lastPathRef.current,
        durationSec,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
      if (geo) {
        if (geo.country) payload.country = geo.country;
        if (geo.state) payload.state = geo.state;
        if (geo.city) payload.city = geo.city;
      }
      if (utm) {
        if (utm.source) payload.source = utm.source;
        if (utm.medium) payload.medium = utm.medium;
        if (utm.campaign) payload.campaign = utm.campaign;
        if (utm.referrer) payload.referrer = utm.referrer;
      }
      try {
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        navigator.sendBeacon(`${API_BASE}/visitors/track`, blob);
      } catch {
        // ignore
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return null;
}

