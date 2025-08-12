import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

export default function Builder() {
  const [title, setTitle] = useState('');
  const [headerFile, setHeaderFile] = useState(null);
  const [questions, setQuestions] = useState([]);
   const navigate = useNavigate();

  function addQuestion(type) {
    setQuestions(q => [...q, { clientId: Date.now().toString(), type, title: '', options: [], image: '' }]);
  }

  function updateQuestion(idx, patch) {
    setQuestions(q => q.map((item, i) => i === idx ? { ...item, ...patch } : item));
  }

  async function uploadFile(file) {
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${BASE_URL}/api/upload/single`, { method: 'POST', body: fd });
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
      return await res.json();
    } catch (err) {
      alert(`❌ File upload error: ${err.message}`);
      return {};
    }
  }

  async function handleSave() {
    try {
      let headerUrl = '';
      if (headerFile) {
        const r = await uploadFile(headerFile);
        if (r?.url) headerUrl = r.url;
      }

      const questionsToSend = [];
      for (const q of questions) {
        let qcopy = { ...q };
        if (q.imageFile) {
          const r = await uploadFile(q.imageFile);
          if (r?.url) qcopy.image = r.url;
        }
        questionsToSend.push(qcopy);
      }

      const payload = { title, headerImage: headerUrl, questions: questionsToSend };
      const res = await fetch(`${BASE_URL}/api/forms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(`Save failed: ${res.status}`);

      const json = await res.json();
      if (json?.form?._id) {
        alert(' Form created with id ' + json.form._id);
        navigate(`/forms/${json.form._id}`);  
      } else {
        alert(' Error creating form');
      }
    } catch (err) {
      alert(` Network or server error: ${err.message}`);
    }
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
      <div className="bg-gradient-to-br from-white via-gray-50 to-gray-100 shadow-2xl rounded-2xl p-4 sm:p-8 border border-gray-200">
        <h1 className="text-2xl sm:text-4xl font-extrabold mb-6 text-gray-800 border-b pb-3 sm:pb-4">
          ✨ Build Your Form
        </h1>

        {/* Title Input */}
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Enter your form title"
          className="border border-gray-300 p-2 sm:p-3 rounded-lg w-full mb-4 sm:mb-6 focus:ring-4 focus:ring-indigo-300 focus:outline-none text-base sm:text-lg"
        />

        {/* Header Image Upload */}
        <label className="block mb-4 sm:mb-6 font-medium text-gray-700 text-sm sm:text-base">
          Upload Header Image:
          <input
            type="file"
            onChange={e => setHeaderFile(e.target.files[0])}
            className="mt-2 block w-full text-xs sm:text-sm text-gray-600"
          />
        </label>

        {/* Question Buttons */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 mb-6 sm:mb-8">
          <button
            onClick={() => addQuestion('categorize')}
            className="px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white rounded-lg shadow-lg transition-transform transform hover:scale-105 text-md sm:text-base"
          >
            ➕ Add Categorize
          </button>
          <button
            onClick={() => addQuestion('cloze')}
            className="px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white rounded-lg shadow-lg transition-transform transform hover:scale-105 text-md sm:text-base"
          >
            ✏️ Add Cloze
          </button>
          <button
            onClick={() => addQuestion('comprehension')}
            className="px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white rounded-lg shadow-lg transition-transform transform hover:scale-105 text-md sm:text-base"
          >
            📖 Add Comprehension
          </button>
        </div>

        {/* Questions */}
        <div className="space-y-4 sm:space-y-6">
          {questions.map((q, idx) => (
            <div
              key={q.clientId}
              className="border border-gray-200 rounded-xl shadow-md p-4 sm:p-6 bg-white hover:shadow-xl transition-shadow"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4 gap-2">
                <span className="text-lg sm:text-xl font-semibold capitalize text-gray-700">{q.type}</span>
                <button
                  onClick={() => setQuestions(prev => prev.filter((_, i) => i !== idx))}
                  className="text-red-500 hover:underline text-sm sm:text-base"
                >
                  ❌ Remove
                </button>
              </div>

              <input
                placeholder="Enter question title"
                value={q.title}
                onChange={e => updateQuestion(idx, { title: e.target.value })}
                className="border p-2 sm:p-3 rounded-lg w-full mb-3 sm:mb-4 focus:ring-2 focus:ring-indigo-300 text-sm sm:text-base"
              />

              <label className="block mb-3 sm:mb-4 text-xs sm:text-sm text-gray-600">
                Question Image (optional):
                <input
                  type="file"
                  onChange={e => updateQuestion(idx, { imageFile: e.target.files[0] })}
                  className="mt-1 block w-full text-xs sm:text-sm text-gray-600"
                />
              </label>

              {q.type === 'categorize' && (
                <div>
                  <button
                    onClick={() => updateQuestion(idx, { options: [...(q.options || []), { text: 'Option' }] })}
                    className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-xs sm:text-sm"
                  >
                    ➕ Add Option
                  </button>
                  <div className="mt-3 space-y-2">
                    {(q.options || []).map((opt, i) => (
                      <div key={i} className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                        <input
                          value={opt.text}
                          onChange={e => {
                            const newOpts = (q.options || []).map((o, oi) => oi === i ? { ...o, text: e.target.value } : o);
                            updateQuestion(idx, { options: newOpts });
                          }}
                          className="border p-2 rounded flex-1 text-sm sm:text-base"
                        />
                        <button
                          onClick={() => updateQuestion(idx, { options: (q.options || []).filter((_, oi) => oi !== i) })}
                          className="text-red-500 hover:underline text-xs sm:text-sm"
                        >
                          ❌
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {q.type === 'cloze' && (
                <textarea
                  placeholder="Cloze text (use ___ for blanks)"
                  value={q.clozeText || ''}
                  onChange={e => updateQuestion(idx, { clozeText: e.target.value })}
                  className="border p-2 sm:p-3 w-full rounded-lg text-sm sm:text-base"
                />
              )}

              {q.type === 'comprehension' && (
                <textarea
                  placeholder="Passage text here..."
                  value={q.comprehensionPassage || ''}
                  onChange={e => updateQuestion(idx, { comprehensionPassage: e.target.value })}
                  className="border p-2 sm:p-3 w-full rounded-lg text-sm sm:text-base"
                />
              )}
            </div>
          ))}
        </div>

        {/* Save Button */}
        <div className="mt-6 sm:mt-8 text-center sm:text-right">
          <button
            onClick={handleSave}
            className="px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white rounded-xl shadow-lg transition-transform transform hover:scale-105 text-md sm:text-base w-full sm:w-auto"
          >
            💾 Save Form
          </button>
        </div>
      </div>
    </div>
  );
}
