import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Printer } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { api } from '@/lib/api';

export function QrGalleryPage() {
  const { data, isError, isLoading } = useQuery({
    queryKey: ['qr-gallery'],
    queryFn: () => api.getFacultyList({ limit: 50 }),
  });

  return (
    <DashboardLayout
      title="Campus QR Collection"
      subtitle="Permanent office placards and QR identifiers for campus faculty."
      actions={
        <button className="secondary-button no-print" onClick={() => window.print()}>
          <Printer size={16} />
          Print collection
        </button>
      }
    >
      {isError && <p role="alert">Could not load QR codes. Please refresh.</p>}
      {isLoading && <p>Loading QR collection…</p>}
      <div className="qr-grid">
        {data?.items
          .filter((p) => p.activeQrToken)
          .map((p) => (
            <article className="qr-card" key={p.id}>
              <p>VNR VJIET · {p.department.code}</p>
              <img alt={'QR code for ' + p.displayName} src={api.getQrImageUrl(p.activeQrToken!)} />
              <h2>{p.displayName}</h2>
              <p>
                {p.office?.buildingName} · Room {p.office?.room}
              </p>
              <Link className="secondary-button" to={'/qr/' + p.activeQrToken}>
                Open live profile
              </Link>
            </article>
          ))}
      </div>
    </DashboardLayout>
  );
}
