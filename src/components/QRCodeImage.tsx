import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface Props {
  value: string;
  size?: number;
  className?: string;
}

export const QRCodeImage: React.FC<Props> = ({ value, size = 120, className = '' }) => {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(value, {
      width: size * 2, // higher resolution for crisp display & scanning
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    })
      .then(url => {
        if (isMounted) setDataUrl(url);
      })
      .catch(err => {
        console.error('Failed to generate QR code', err);
      });

    return () => {
      isMounted = false;
    };
  }, [value, size]);

  if (!dataUrl) {
    return (
      <div 
        className={`bg-slate-100 animate-pulse rounded-xl border border-slate-200 shrink-0 ${className}`} 
        style={{ width: size, height: size }} 
      />
    );
  }

  return (
    <img 
      src={dataUrl} 
      alt={`QR Code for ${value}`} 
      className={`rounded-xl border border-slate-200 shrink-0 shadow-sm bg-white p-1 ${className}`} 
      style={{ width: size, height: size }}
    />
  );
};
