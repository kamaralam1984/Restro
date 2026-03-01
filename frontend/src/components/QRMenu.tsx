'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useLanguage } from '@/context/LanguageContext';

export default function QRMenu() {
  const { t } = useLanguage();
  const [menuUrl, setMenuUrl] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/menu`;
      setMenuUrl(url);
    }
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">QR Code Menu</h2>
      <p className="text-gray-600 mb-4">
        Scan this QR code to view our digital menu on your device.
      </p>
      {menuUrl && (
        <div className="flex flex-col items-center">
          <div className="bg-white p-4 rounded-lg border-2 border-gray-200 mb-4">
            <QRCodeSVG value={menuUrl} size={256} />
          </div>
          <p className="text-sm text-gray-600 text-center max-w-xs break-all">{menuUrl}</p>
          <button
            onClick={() => {
              navigator.share?.({ url: menuUrl, title: 'Restro OS Menu' }) ||
              navigator.clipboard.writeText(menuUrl);
              alert('Menu link copied!');
            }}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Share Menu
          </button>
        </div>
      )}
    </div>
  );
}

