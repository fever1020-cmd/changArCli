import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { FaBarcode, FaTimes, FaCamera, FaImage, FaSpinner } from 'react-icons/fa';

function BarcodeScanner({ onIsbnDetected, isLoading }) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const html5QrRef = useRef(null);
  const fileInputRef = useRef(null);

  const supportedFormats = [
    Html5QrcodeSupportedFormats.EAN_13,
    Html5QrcodeSupportedFormats.EAN_8,
    Html5QrcodeSupportedFormats.UPC_A,
    Html5QrcodeSupportedFormats.UPC_E,
    Html5QrcodeSupportedFormats.CODE_128,
    Html5QrcodeSupportedFormats.QR_CODE,
  ];

  const handleDetected = (decodedText) => {
    const cleaned = decodedText.replace(/[-\s]/g, '');
    console.log('[Barcode] Scanned text:', cleaned);

    // Check if it looks like an ISBN (13 or 10 digits)
    if (/^(978|979)\d{10}$/.test(cleaned) || /^\d{9}[\dX]$/i.test(cleaned)) {
      stopScanner();
      onIsbnDetected(cleaned);
    } else if (/^\d{10,13}$/.test(cleaned)) {
      // Any 10-13 digit barcode
      stopScanner();
      onIsbnDetected(cleaned);
    }
  };

  const startScanner = async () => {
    setError(null);
    setScanning(true);

    // Wait for DOM element #barcode-reader to be mounted
    setTimeout(async () => {
      try {
        if (html5QrRef.current) {
          try { await html5QrRef.current.stop(); } catch (e) {}
        }

        const html5QrCode = new Html5Qrcode('barcode-reader', {
          formatsToSupport: supportedFormats,
          verbose: false,
        });
        html5QrRef.current = html5QrCode;

        // Try environment camera first, fallback to user camera
        const config = {
          fps: 10,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdgePercentage = 0.75;
            const minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
            const qrboxSize = Math.floor(minEdgeSize * minEdgePercentage);
            return {
              width: qrboxSize,
              height: Math.floor(qrboxSize * 0.5),
            };
          },
          aspectRatio: 1.777778,
        };

        try {
          await html5QrCode.start(
            { facingMode: 'environment' },
            config,
            (decodedText) => handleDetected(decodedText),
            () => {} // scan failure frame
          );
        } catch (camErr) {
          console.warn('[Barcode] Environment camera failed, trying fallback:', camErr);
          // Fallback: try default camera without facingMode constraint
          await html5QrCode.start(
            {},
            config,
            (decodedText) => handleDetected(decodedText),
            () => {}
          );
        }
      } catch (err) {
        console.error('[Barcode] Final start error:', err);
        setScanning(false);
        const errStr = (err && err.message) ? err.message : String(err);
        if (errStr.includes('NotAllowedError') || errStr.includes('Permission')) {
          setError('카메라 권한이 허용되지 않았습니다. 브라우저 주소창 좌측 자물쇠 아이콘을 눌러 카메라 권한을 켜주세요.');
        } else {
          setError(`카메라 연결 실패: ${errStr}. 아래 '바코드 사진 찍어 올리기'를 이용해보세요!`);
        }
      }
    }, 150);
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

  // Scan from photo file fallback
  const handleFileScan = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError(null);
    try {
      const html5QrCode = new Html5Qrcode('barcode-file-temp', {
        formatsToSupport: supportedFormats,
        verbose: false,
      });

      const decodedText = await html5QrCode.scanFile(file, true);
      html5QrCode.clear();
      handleDetected(decodedText);
    } catch (err) {
      console.error('[Barcode] File scan error:', err);
      setError('사진에서 바코드를 인식하지 못했습니다. 바코드가 선명하게 나오도록 찍어주세요.');
    }
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div className="space-y-3">
      {/* Hidden file input for barcode photo */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileScan}
      />
      <div id="barcode-file-temp" className="hidden" />

      {!scanning ? (
        <div className="space-y-2">
          <button
            onClick={startScanner}
            disabled={isLoading}
            className="w-full flex flex-col items-center justify-center space-y-2 py-7 border-2 border-dashed border-green-500 rounded-2xl bg-green-50/80 text-green-700 hover:bg-green-100/70 transition-all cursor-pointer active:scale-[0.99]"
          >
            <div className="bg-green-600 text-white p-3.5 rounded-full shadow-md">
              <FaCamera className="text-2xl" />
            </div>
            <span className="font-bold text-base text-gray-800">실시간 바코드 스캔 시작</span>
            <span className="text-xs text-gray-500">카메라로 책 뒷면 바코드를 비추면 자동 인식</span>
          </button>

          <button
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <FaImage className="text-gray-500" />
            <span>바코드 사진 촬영 / 앨범에서 선택하기</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="relative rounded-2xl overflow-hidden border-2 border-green-500 shadow-md bg-black">
            <div id="barcode-reader" className="w-full min-h-[220px]" />
            <button
              onClick={stopScanner}
              className="absolute top-2 right-2 bg-black/60 text-white p-2 rounded-full shadow-md z-10 hover:bg-black/80 transition"
              title="닫기"
            >
              <FaTimes />
            </button>
          </div>
          <div className="flex items-center justify-center space-x-2 text-green-700 text-xs font-semibold py-1">
            <FaSpinner className="animate-spin" />
            <span>바코드(978...)를 화면 중앙 사각형에 맞춰주세요</span>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-xs text-center leading-relaxed">
          {error}
        </div>
      )}
    </div>
  );
}

export default BarcodeScanner;
