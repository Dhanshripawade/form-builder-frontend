import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

// Resolve API base URL
const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

export default function PreviewFill() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch(`${BASE_URL}/api/forms/${id}`)
      .then(r => r.json())
      .then(j => {
        if (j.success) setForm(j.form);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching form:", err);
        setLoading(false);
      });
  }, [id]);

  function setAnswer(qid, value) {
    setAnswers(a => ({ ...a, [qid]: value }));
  }

  async function handleSubmit() {
    try {
      const payload = {
        answers: Object.entries(answers).map(([questionClientId, answer]) => ({
          questionClientId,
          answer
        }))
      };
      const res = await fetch(`${BASE_URL}/api/forms/${id}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const j = await res.json();
      if (j.success) {
        setSubmitted(true);
      } else {
        alert('Error submitting form');
      }
    } catch (err) {
      alert(`Network or server error: ${err.message}`);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl font-semibold text-gray-500">
        Loading form...
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-green-50 p-4">
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl text-center max-w-md w-full">
          <div className="text-green-600 text-5xl md:text-7xl mb-4">✅</div>
          <h2 className="text-xl md:text-2xl font-bold mb-2">Form Submitted Successfully!</h2>
          <p className="text-gray-600 mb-6 text-sm md:text-base">
            Thank you for your time. Your responses have been recorded.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-5 py-2 md:px-6 md:py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-lg transition text-sm md:text-base"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="text-center mt-10 text-red-500 font-semibold">
        Form not found!
      </div>
    );
  }

  return (
    <div
      className="container mx-auto p-4 max-w-7xl"
      style={{
        background: 'linear-gradient(135deg, #f0f4ff, #e6f5f3)',
        minHeight: '100vh'
      }}
    >
      <h1 className="text-2xl md:text-4xl font-bold text-black drop-shadow-lg mb-4 mt-2 text-center">
        {form.title}
      </h1>

      {form.headerImage && (
        <div
          className="relative mx-auto rounded-lg overflow-hidden"
          style={{
            height: '200px',
            maxWidth: "100%",
            backgroundImage: `url(${BASE_URL + form.headerImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        ></div>
      )}

      {/* Questions */}
      <div className="p-4 md:p-8 backdrop-blur-xl bg-white/40 rounded-2xl shadow-2xl border border-white/30 mt-6">
        <div className="space-y-6">
          {form.questions.map(q => (
            <div
              key={q.clientId || q._id}
              className="p-4 md:p-6 rounded-xl border border-white/30 bg-white/20 backdrop-blur-md shadow-lg"
            >
              <h3 className="font-semibold text-lg md:text-xl text-gray-800 mb-3">{q.title}</h3>
              {q.image && (
                <img
                  src={BASE_URL + q.image}
                  alt="question"
                  className="w-full max-w-sm my-3 rounded-lg shadow-md"
                />
              )}
              {q.type === 'categorize' && q.options?.map((opt, i) => (
                <label key={i} className="flex items-center gap-2 mb-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    onChange={e => {
                      const prev = answers[q.clientId] || [];
                      const next = e.target.checked
                        ? [...prev, opt.text]
                        : prev.filter(x => x !== opt.text);
                      setAnswer(q.clientId, next);
                    }}
                  />
                  <span className="text-gray-700 text-sm md:text-base">{opt.text}</span>
                </label>
              ))}
              {q.type === 'cloze' && (
                <textarea
                  placeholder="Write your answer here..."
                  className="border p-2 md:p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 shadow-inner text-sm md:text-base"
                  onChange={e => setAnswer(q.clientId, e.target.value)}
                />
              )}
              {q.type === 'comprehension' && (
                <>
                  <div className="p-3 md:p-4 bg-white/70 border border-white/40 rounded-lg mb-3 shadow-sm text-sm md:text-base">
                    {q.comprehensionPassage}
                  </div>
                  <textarea
                    placeholder="Your answer to the comprehension..."
                    className="border p-2 md:p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 shadow-inner text-sm md:text-base"
                    onChange={e => setAnswer(q.clientId, e.target.value)}
                  />
                </>
              )}
            </div>
          ))}
        </div>
        <div className="mt-6 md:mt-8 text-center">
          <button
            onClick={handleSubmit}
            className="px-6 py-3 md:px-8 md:py-4 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-xl transition-all duration-300 text-base md:text-lg font-semibold"
          >
            Submit Form
          </button>
        </div>
      </div>
    </div>
  );
}
