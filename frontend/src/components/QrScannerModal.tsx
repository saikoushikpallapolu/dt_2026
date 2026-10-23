import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Html5Qrcode } from 'html5-qrcode';
import { X, ArrowRight, Camera, Upload } from 'lucide-react';
import { api } from '@/lib/api';

export function QrScannerModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'camera' | 'upload' | 'directory'>('camera');
  const [error, setError] = useState('');
  const [manual, setManual] = useState('');
  const scanner = useRef<Html5Qrcode | null>(null);
  const handled = useRef(false);
  const { data } = useQuery({ queryKey: ['scanner-faculty'], queryFn: () => api.getFacultyList({ limit: 50 }), enabled: isOpen });

  function open(text: string) {
    let path = text.trim();
    try {
      if (/^https?:/.test(path)) path = new URL(path).pathname;
    } catch {
      setError('This QR link is not valid.');
      return;
    }
    if (!path.startsWith('/')) path = '/qr/' + path;
    if (!/^\/(qr|faculty)\/[a-zA-Z0-9_-]+$/.test(path)) {
      setError('Please scan a valid faculty QR code from this portal.');
      return;
    }
    if (handled.current) return;
    handled.current = true;
    onClose();
    navigate(path);
  }

  useEffect(() => {
    if (!isOpen) return;
    handled.current = false;
    setError('');
    if (tab !== 'camera') return;
    let disposed = false;
    const instance = new Html5Qrcode('qr-reader');
    scanner.current = instance;

    const starting = instance
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 230, height: 230 } },
        (text) => {
          if (!disposed) open(text);
        },
        () => {}
      )
      .catch(() => {
        if (!disposed) {
          setError(
            window.isSecureContext
              ? 'Camera unavailable. Please grant camera permission or upload a photo of the QR code.'
              : 'Live camera scanning requires HTTPS. Use your native camera app to scan the sticker, or upload a photo.'
          );
        }
      });

    return () => {
      disposed = true;
      void starting
        .then(async () => {
          if (instance.isScanning) await instance.stop();
          instance.clear();
        })
        .catch(() => {});
      scanner.current = null;
    };
  }, [isOpen, tab]);

  async function upload(file?: File) {
    if (!file) return;
    setError('');
    const reader = new Html5Qrcode('qr-upload');
    try {
      open(await reader.scanFile(file, false));
    } catch {
      setError('No readable QR code found in this image. Try a clearer photo.');
    } finally {
      reader.clear();
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-violet-950/40 backdrop-blur-sm p-4" role="dialog" aria-modal="true" aria-label="Scan faculty QR">
      <div className="panel scanner-panel">
        <div className="flex items-center justify-between">
          <div>
            <p className="eyebrow">VNR VJIET</p>
            <h2 className="text-xl font-semibold mt-2">Scan Faculty QR Code</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close scanner">
            <X />
          </button>
        </div>

        <div className="scanner-tabs">
          {(['camera', 'upload', 'directory'] as const).map((t) => (
            <button className={tab === t ? 'active' : ''} key={t} onClick={() => setTab(t)}>
              {t === 'camera' ? 'Camera' : t === 'upload' ? 'Upload QR Photo' : 'Faculty List'}
            </button>
          ))}
        </div>

        <div id="qr-reader" className={tab === 'camera' ? '' : 'hidden'} />
        <div id="qr-upload" className="hidden" />

        {tab === 'camera' && (
          <p className="muted text-xs mt-4 flex gap-2">
            <Camera size={16} />
            Point your camera at a faculty door placard to view real-time status.
          </p>
        )}

        {tab === 'upload' && (
          <label className="flex flex-col items-center gap-4 border border-dashed border-violet-200 rounded-xl p-8 cursor-pointer">
            <Upload className="text-violet-500" />
            <span className="text-sm">Choose a photo of a faculty QR code</span>
            <input type="file" accept="image/*" onChange={(e) => upload(e.target.files?.[0])} className="max-w-full text-xs" />
          </label>
        )}

        {tab === 'directory' && (
          <div>
            <p className="muted text-xs mb-3">Select a faculty member to open their live status:</p>
            <div className="sample-list">
              {data?.items
                .filter((p) => p.activeQrToken)
                .map((p) => (
                  <button key={p.id} onClick={() => open('/qr/' + p.activeQrToken)}>
                    <span>
                      {p.displayName}
                      <small className="block muted">
                        {p.department.code} · Room {p.office?.room}
                      </small>
                    </span>
                    <ArrowRight size={17} />
                  </button>
                ))}
            </div>
          </div>
        )}

        {error && <p role="alert" className="text-xs text-amber-800 bg-amber-50 p-3 rounded-lg mt-4">{error}</p>}

        <form
          className="scanner-manual"
          onSubmit={(e) => {
            e.preventDefault();
            handled.current = false;
            open(manual);
          }}
        >
          <input
            aria-label="QR link or code"
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            placeholder="Or enter QR token directly (e.g. vnr-prasanna)"
            required
          />
          <button className="primary-button" type="submit">
            Open
          </button>
        </form>
      </div>
    </div>
  );
}
