import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { FaBarcode, FaTimes, FaSpinner } from 'react-icons/fa';

function BarcodeScanner({ onIsbnDetected, isLoading }) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const scannerRef = useRef(null);
  const html5QrRef = useRef(null);

  const startScanner = async () => {
    setError(null);
    setScanning(true);

    try {
      const html5QrCode = new Html5Qrcode('barcode-reader');
      html5QrRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 280, height: 120 },
          aspectRatio: 2.0,
          formatsToSupport: [
            0,  // QR_CODE
            4,  // EAN_13 (ISBN barcode format)
            3,  // EAN_8
            11, // UPC_A
            12, // UPC_E
          ],
        },
        (decodedText) => {
          // ISBN barcodes: 13 digits starting with 978 or 979
          const cleaned = decodedText.replace(/[-\s]/g, '');
          console.log('[Barcode] Scanned:', cleaned);

          if (/^(978|979)\d{10}$/.test(cleaned) || /^\d{10}$/.test(cleaned)) {
            // Valid ISBN detected!
            stopScanner();
            onIsbnDetected(cleaned);
          }
        },
        () => {} // ignore scan errors
      );
    } catch (err) {
      console.error('[Barcode] Start error:', err);
      setScanning(false);
      if (err.toString().includes('NotAllowedError') || err.toString().includes('Permission')) {
        setError('카메라 권한이 거부되었습니다. 브라우저 설정에서 카메라 권한을 허용해주세요.');
      } else {
        setError('카메라를 시작할 수 없습니다. 다른 앱에서 카메라를 사용 중인지 확인하세요.');
      }
    }
  };

  const stopScanner = async () => {
    if (html5QrRef.current) {
      try {
        await html5QrRef.current.stop();
        html5QrRef.current.clear();
      } catch (e) {}
      html5QrRef.current = null;
    }
    setScanning(false);
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div className="space-y-3">
      {!scanning ? (
        <button
          onClick={startScanner}
          disabled={isLoading}
          className="w-full flex flex-col items-center justify-center space-y-2 py-8 border-2 border-dashed border-green-400 rounded-2xl bg-green-50/80 text-green-700 hover:bg-green-100/70 transition-all cursor-pointer active:scale-[0.99]"
        >
          <div className="bg-green-600 text-white p-4 rounded-full shadow-md">
            <FaBarcode className="text-2xl" />
          </div>
          <span className="font-bold text-lg text-gray-800">ISBN 바코드 스캔</span>
          <span className="text-xs text-gray-500">책 뒷면 바코드를 비춰주세요 (가장 정확!)</span>
        </button>
      ) : (
        <div className="space-y-2">
          <div className="relative rounded-2xl overflow-hidden border-2 border-green-400 shadow-md bg-black">
            <div id="barcode-reader" ref={scannerRef} className="w-full" />
            <button
              onClick={stopScanner}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow-md z-10 hover:bg-red-600 transition"
            >
              <FaTimes />
            </button>
          </div>
          <div className="flex items-center justify-center space-x-2 text-green-700 text-sm font-semibold py-2">
            <FaSpinner className="animate-spin" />
            <span>바코드(978...)를 카메라에 비춰주세요</span>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs text-center">
          {error}
        </div>
      )}
    </div>
  );
}

export default BarcodeScanner;
