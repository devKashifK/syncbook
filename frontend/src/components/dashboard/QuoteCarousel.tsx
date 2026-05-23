'use client';

import { useState, useEffect } from 'react';
import { Quote } from 'lucide-react';

type QuoteType = { text: string; author: string };

const FALLBACK_QUOTES: QuoteType[] = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
];

export default function QuoteCarousel() {
  const [quotes, setQuotes] = useState<QuoteType[]>(FALLBACK_QUOTES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    fetch('https://dummyjson.com/quotes?limit=10')
      .then(res => res.json())
      .then(data => {
        if (data?.quotes?.length > 0) {
          setQuotes(data.quotes.map((q: { quote: string; author: string }) => ({ text: q.quote, author: q.author })));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (quotes.length === 0) return;
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => { setCurrentIndex(prev => (prev + 1) % quotes.length); setIsTransitioning(false); }, 500);
    }, 8000);
    return () => clearInterval(timer);
  }, [quotes.length]);

  if (quotes.length === 0) return null;

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 mb-8 group relative cursor-default">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-blue-400/10 to-blue-500/10 rounded-2xl blur-md transition-opacity duration-700 opacity-0 group-hover:opacity-100" />
      <div className="relative bg-white/40 hover:bg-white/60 backdrop-blur-md border border-slate-200/50 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 shadow-sm transition-all duration-500">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 shadow-inner">
          <Quote className="h-4 w-4 text-blue-400 rotate-180" />
        </div>
        <div className={`flex-1 transition-opacity duration-500 text-center sm:text-left ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          <p className="text-sm font-medium text-slate-700 italic leading-relaxed">&quot;{quotes[currentIndex].text}&quot;</p>
        </div>
        <div className={`flex-shrink-0 transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-full">
            {quotes[currentIndex].author}
          </span>
        </div>
      </div>
    </div>
  );
}
