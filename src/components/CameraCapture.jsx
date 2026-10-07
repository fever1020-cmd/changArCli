import React, { useState, useRef } from 'react';
import { FaCamera, FaSearch, FaUpload, FaEdit } from 'react-icons/fa';

function CameraCapture({ onTextSearch, onImageSearch, isLoading }) {
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [manualText, setManualText] = useState('');
  const fileInputRef = useRef(null);

  const handleCapture = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    const imageUrl = URL.createObjectURL(file);
    setImagePreview(imageUrl);
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
    <div className="flex flex-col space-y-6">
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
          className="w-full flex flex-col items-center justify-center space-y-2 py-12 border-2 border-dashed border-blue-300 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
        >
          <FaCamera className="text-4xl mb-2" />
          <span className="font-bold text-lg">책 표지 촬영하기</span>
          <span className="text-sm opacity-70">서버에서 글자를 대신 읽어줍니다</span>
        </button>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-xl overflow-hidden border border-gray-200 shadow-sm">
            <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
            <button
              onClick={() => fileInputRef.current.click()}
              disabled={isLoading}
              className="absolute bottom-2 right-2 bg-black/60 text-white px-3 py-1.5 rounded-lg text-sm font-medium backdrop-blur-sm flex items-center space-x-1 hover:bg-black/80 transition"
            >
              <FaCamera />
              <span>다시 찍기</span>
            </button>
          </div>

          <button
            onClick={handleUploadSearch}
            disabled={isLoading || !selectedFile}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2 shadow-md transition-all active:scale-[0.98]"
          >
            <FaUpload />
            <span>이 사진으로 AR 지수 찾기</span>
          </button>
        </div>
      )}

      {/* Manual Search Fallback */}
      <div className="pt-4 border-t border-gray-100">
        <form onSubmit={handleManualSearch} className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-500">
            <FaEdit />
            <span>직접 제목 입력해서 검색하기</span>
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="예: Harry Potter"
            />
            <button
              type="submit"
              disabled={isLoading || !manualText.trim()}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-900 disabled:opacity-50 flex items-center justify-center transition-colors"
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
