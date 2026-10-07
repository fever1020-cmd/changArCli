import React, { useState } from 'react';
import CameraCapture from './components/CameraCapture';
import BookResult from './components/BookResult';
import axios from 'axios';
import { FaBookOpen } from 'react-icons/fa';

function App() {
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [extractedText, setExtractedText] = useState('');

  const baseUrl = '';

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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-blue-600 p-6 text-white text-center">
          <FaBookOpen className="text-4xl mx-auto mb-3" />
          <h1 className="text-2xl font-bold">AR 지수 스캐너</h1>
          <p className="text-blue-100 mt-1 text-sm">책 표지를 찍어 AR 지수를 확인하세요</p>
        </div>
        
        <div className="p-6 space-y-6">
          <CameraCapture 
            onTextSearch={handleTextSearch} 
            onImageSearch={handleImageSearch}
            isLoading={loading} 
          />
          
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 font-medium">{loadingMsg}</p>
              <p className="text-xs text-gray-400 mt-1">(약 10~30초 소요될 수 있습니다)</p>
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
