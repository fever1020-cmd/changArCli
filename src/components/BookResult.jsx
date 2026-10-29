import React, { useState } from 'react';
import { FaStar, FaTrophy, FaExternalLinkAlt, FaCheck, FaCopy } from 'react-icons/fa';

const RENAISSANCE_LOGIN_URL = 'https://login.renaissance.com/15871d9a-a324-4abc-9d14-1b2a15cc96e0/student?state=17708a39-3789-424e-87a7-326945bc4564';

function BookResult({ results }) {
  const [copiedQuiz, setCopiedQuiz] = useState(null);

  const handleOpenRenaissance = (book) => {
    const textToCopy = book.quizNo || book.title;

    // Clipboard copy
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy).catch(() => {});
    }

    setCopiedQuiz(textToCopy);

    // Open Renaissance student login in new tab
    window.open(RENAISSANCE_LOGIN_URL, '_blank', 'noopener,noreferrer');

    setTimeout(() => {
      setCopiedQuiz(null);
    }, 4000);
  };

  if (!results || results.length === 0) {
    return (
      <div className="bg-gray-50 text-gray-600 p-6 rounded-xl text-center border border-gray-200">
        검색 결과가 없습니다. 책 제목을 다시 확인해주세요.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {copiedQuiz && (
        <div className="bg-green-500 text-white p-3 rounded-xl shadow-lg text-center text-sm font-semibold flex items-center justify-center space-x-2 animate-bounce">
          <FaCheck className="text-white" />
          <span>퀴즈 번호 [{copiedQuiz}] 복사 완료! 로그인 후 붙여넣으세요.</span>
        </div>
      )}

      <div className="flex items-center justify-between border-b pb-2">
        <h3 className="text-lg font-bold text-gray-800">검색 결과</h3>
        <span className="text-xs text-blue-600 font-medium">클릭 시 르네상스 이동</span>
      </div>

      <div className="space-y-3">
        {results.map((book, index) => (
          <div 
            key={index} 
            onClick={() => handleOpenRenaissance(book)}
            className="group cursor-pointer bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-blue-400 transition-all active:scale-[0.99]"
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className="font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
                {book.title}
              </h4>
              {book.quizNo && (
                <span className="shrink-0 bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-blue-200">
                  Quiz #{book.quizNo}
                </span>
              )}
            </div>
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

            {/* Quick action button */}
            <div className="mt-3 pt-2 flex items-center justify-end text-xs font-semibold text-blue-600 group-hover:text-blue-700">
              <span className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                <FaCopy className="text-blue-500" />
                <span>퀴즈번호 복사 & 르네상스 이동</span>
                <FaExternalLinkAlt className="text-[10px]" />
              </span>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 text-center pt-2">
        출처: AR BookFinder | 카드를 누르면 르네상스 로그인 화면으로 이동합니다.
      </p>
    </div>
  );
}

export default BookResult;

