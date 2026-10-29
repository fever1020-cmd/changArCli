import React, { useState } from 'react';
import CameraCapture from './components/CameraCapture';
import BarcodeScanner from './components/BarcodeScanner';
import BookResult from './components/BookResult';
import axios from 'axios';
import { FaBookOpen, FaBarcode, FaCamera } from 'react-icons/fa';

function App() {
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [activeTab, setActiveTab] = useState('barcode'); // 'barcode' or 'photo'

  // 배포된 백엔드 URL 기본 연결 (로컬 환경에서는 VITE_API_URL을 지정하거나 프록시 사용)
  const baseUrl = import.meta.env.VITE_API_URL || 'https://ar-scanner-backend.onrender.com';

  // Search by ISBN barcode
  const handleIsbnSearch = async (isbn) => {
    setLoading(true);
    setLoadingMsg(`바코드(${isbn})로 책 정보를 찾는 중입니다...`);
    setError(null);
    setResults(null);
    setExtractedText('');

    try {
      const response = await axios.get(`${baseUrl}/api/isbn-search`, {
        params: { isbn }
      });

      if (response.data.success) {
        setExtractedText(response.data.bookTitle || '');
        setResults(response.data.data);
      } else {
        setError(response.data.error || '해당 ISBN의 책 정보를 찾지 못했습니다.');
      }
    } catch (err) {
      console.error(err);
      setError('서버와 통신할 수 없습니다. 백엔드 상태를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // Search by text manually
  const handleTextSearch = async (title) => {
    setLoading(true);
    setLoadingMsg('AR Bookfinder에서 검색 중입니다...');
    setError(null);
    setResults(null);
    try {
      const response = await axios.get(`${baseUrl}/api/search`, {
        params: { title }
      });
      
      if (response.data.success) {
        setResults(response.data.data);
      } else {
        setError(response.data.error || 'Failed to search');
      }
    } catch (err) {
      console.error(err);
      setError('서버와 통신할 수 없습니다. 백엔드 서버가 켜져 있는지 확인하세요.');
    } finally {
      setLoading(false);
    }
  };

  // Search by uploading image
  const handleImageSearch = async (file) => {
    setLoading(true);
    setLoadingMsg('서버에서 이미지를 분석하여 검색 중입니다...');
    setError(null);
    setResults(null);
    setExtractedText('');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post(`${baseUrl}/api/upload-and-search`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        setExtractedText(response.data.extractedText);
        setResults(response.data.data);
      } else {
        setError(response.data.error || 'Failed to process image');
      }
    } catch (err) {
      console.error(err);
      setError('서버와 통신할 수 없거나 서버 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white text-center">
          <FaBookOpen className="text-4xl mx-auto mb-2 text-white/90" />
          <h1 className="text-2xl font-bold tracking-tight">AR 지수 스캐너</h1>
          <p className="text-blue-100 mt-1 text-xs">책 바코드 또는 표지를 스캔하여 AR 지수를 확인하세요</p>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-gray-100 bg-gray-50/50 p-1.5 gap-1.5 m-4 mb-2 rounded-2xl">
          <button
            onClick={() => setActiveTab('barcode')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'barcode'
                ? 'bg-white text-green-700 shadow-sm border border-gray-200/80'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <FaBarcode className={activeTab === 'barcode' ? 'text-green-600 text-base' : 'text-gray-400'} />
            <span>바코드 스캔 (추천)</span>
          </button>

          <button
            onClick={() => setActiveTab('photo')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'photo'
                ? 'bg-white text-blue-700 shadow-sm border border-gray-200/80'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <FaCamera className={activeTab === 'photo' ? 'text-blue-600' : 'text-gray-400'} />
            <span>표지 사진 촬영</span>
          </button>
        </div>
        
        <div className="p-5 space-y-5">
          {activeTab === 'barcode' ? (
            <div className="space-y-4">
              <BarcodeScanner onIsbnDetected={handleIsbnSearch} isLoading={loading} />
              
              {/* Fallback text search input */}
              <div className="pt-2 border-t border-gray-100">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const input = e.target.elements.manualQuery.value.trim();
                    if (input) {
                      if (/^(978|979)?\d{9}[\dX]?$/.test(input.replace(/[-\s]/g, ''))) {
                        handleIsbnSearch(input);
                      } else {
                        handleTextSearch(input);
                      }
                    }
                  }}
                  className="space-y-1.5"
                >
                  <label className="text-xs font-semibold text-gray-500">
                    바코드 번호 또는 책 제목 직접 입력:
                  </label>
                  <div className="flex gap-2">
                    <input
                      name="manualQuery"
                      type="text"
                      defaultValue={extractedText}
                      key={extractedText}
                      placeholder="예: 9780062303882 또는 Pete the Cat"
                      className="flex-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:bg-white focus:border-green-500 outline-none transition-all"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-green-700 hover:bg-green-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 cursor-pointer transition-colors"
                    >
                      검색
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <CameraCapture 
              onTextSearch={handleTextSearch} 
              onImageSearch={handleImageSearch}
              isLoading={loading} 
              extractedTitle={extractedText}
            />
          )}
          
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 font-medium">{loadingMsg}</p>
              <p className="text-xs text-gray-400 mt-1">(약 5~15초 소요될 수 있습니다)</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          {!loading && extractedText && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-center text-sm">
              <span className="text-gray-500">추출된 제목: </span>
              <span className="font-bold text-blue-800">{extractedText}</span>
            </div>
          )}

          {!loading && results && (
            <BookResult results={results} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
