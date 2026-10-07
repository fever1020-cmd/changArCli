import React from 'react';
import { FaStar, FaTrophy } from 'react-icons/fa';

function BookResult({ results }) {
  if (!results || results.length === 0) {
    return (
      <div className="bg-gray-50 text-gray-600 p-6 rounded-xl text-center border border-gray-200">
        검색 결과가 없습니다. 책 제목을 다시 확인해주세요.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-800 border-b pb-2">검색 결과</h3>
      <div className="space-y-3">
        {results.map((book, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <h4 className="font-bold text-gray-900 leading-tight mb-1">{book.title}</h4>
            <p className="text-sm text-gray-500 mb-3">{book.author}</p>
            
            <div className="flex items-center justify-between mt-2 pt-3 border-t border-gray-100">
              <div className="flex items-center space-x-2 text-blue-700">
                <div className="bg-blue-100 p-1.5 rounded-lg">
                  <FaStar className="text-blue-600" />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider opacity-80">AR Level</div>
                  <div className="font-bold text-lg">{book.arLevel}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 text-amber-700">
                <div className="bg-amber-100 p-1.5 rounded-lg">
                  <FaTrophy className="text-amber-600" />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider opacity-80">Points</div>
                  <div className="font-bold text-lg">{book.points}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 text-center pt-2">
        출처: AR BookFinder (가장 유사한 상위 결과)
      </p>
    </div>
  );
}

export default BookResult;
