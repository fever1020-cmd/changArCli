import React, { useState, useRef } from 'react';
import { FaCamera, FaSearch, FaUpload, FaEdit, FaTimes } from 'react-icons/fa';

// Client-side image resize helper to keep uploaded files under 200KB
function resizeImage(file, maxWidth = 1000, quality = 0.8) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            const resizedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve({ resizedFile, dataUrl: canvas.toDataURL('image/jpeg', quality) });
          },
          'image/jpeg',
          quality
        );
      };
    };
  });
}

function CameraCapture({ onTextSearch, onImageSearch, isLoading, extractedTitle }) {
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [manualText, setManualText] = useState('');
  const fileInputRef = useRef(null);

  // Sync extracted title from parent if provided
  React.useEffect(() => {
    if (extractedTitle) {
      setManualText(extractedTitle);
    }
  }, [extractedTitle]);

  const handleCapture = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // Compress and resize image in browser
      const { resizedFile, dataUrl } = await resizeImage(file, 900, 0.8);
      setSelectedFile(resizedFile);
      setImagePreview(dataUrl);
    } catch (err) {
      console.error('Image resize error:', err);
      // Fallback to original file
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleClearImage = () => {
    setImagePreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUploadSearch = () => {
    if (selectedFile) {
      onImageSearch(selectedFile);
    }
  };

  const handleManualSearch = (e) => {
    e.preventDefault();
    if (manualText.trim()) {
      onTextSearch(manualText.trim());
    }
  };

  return (
    <div className="flex flex-col space-y-5">
      {/* Hidden file input */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        ref={fileInputRef}
        onChange={handleCapture}
      />
      
      {!imagePreview ? (
        <button
          onClick={() => fileInputRef.current.click()}
          disabled={isLoading}
          className="w-full flex flex-col items-center justify-center space-y-2 py-10 border-2 border-dashed border-blue-300 rounded-2xl bg-blue-50/80 text-blue-600 hover:bg-blue-100/70 transition-all cursor-pointer active:scale-[0.99]"
        >
          <div className="bg-blue-600 text-white p-4 rounded-full shadow-md">
            <FaCamera className="text-2xl" />
          </div>
          <span className="font-bold text-lg text-gray-800">책 표지 촬영 / 사진 선택</span>
          <span className="text-xs text-gray-500">자동으로 사진을 압축하고 글자를 읽어옵니다</span>
        </button>
      ) : (
        <div className="space-y-3">
          <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-gray-100">
            <img src={imagePreview} alt="Preview" className="w-full h-52 object-contain bg-black/5" />
            
            <button
              onClick={handleClearImage}
              disabled={isLoading}
              className="absolute top-2 right-2 bg-black/60 text-white p-2 rounded-full hover:bg-black/80 transition"
              title="사진 지우기"
            >
              <FaTimes />
            </button>

            <button
              onClick={() => fileInputRef.current.click()}
              disabled={isLoading}
              className="absolute bottom-2 right-2 bg-black/70 text-white px-3 py-1.5 rounded-lg text-xs font-medium backdrop-blur-sm flex items-center space-x-1 hover:bg-black/90 transition"
            >
              <FaCamera />
              <span>다시 찍기</span>
            </button>
          </div>

          <button
            onClick={handleUploadSearch}
            disabled={isLoading || !selectedFile}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold text-base disabled:opacity-50 flex items-center justify-center space-x-2 shadow-md transition-all active:scale-[0.98] cursor-pointer"
          >
            <FaUpload />
            <span>이 사진으로 AR 지수 찾기</span>
          </button>
        </div>
      )}

      {/* Manual Search & Edit Area */}
      <div className="pt-3 border-t border-gray-100">
        <form onSubmit={handleManualSearch} className="space-y-1.5">
          <label className="flex items-center justify-between text-xs font-semibold text-gray-600">
            <span className="flex items-center space-x-1.5">
              <FaEdit className="text-gray-400" />
              <span>책 제목 직접 입력 / 수정 검색</span>
            </span>
            {manualText && (
              <span className="text-blue-600 cursor-pointer" onClick={() => setManualText('')}>지우기</span>
            )}
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              className="flex-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500 outline-none transition-all"
              placeholder="예: Harry Potter or Charlotte's Web"
            />
            <button
              type="submit"
              disabled={isLoading || !manualText.trim()}
              className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center justify-center transition-colors cursor-pointer"
            >
              <FaSearch />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CameraCapture;

