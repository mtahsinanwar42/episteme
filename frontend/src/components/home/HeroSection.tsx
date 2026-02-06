import { useState, useEffect, useCallback } from 'react';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { Link } from 'react-router-dom';
import { formatDate } from '@/utils/dateFormatter';

export default function HeroSection() {
  const { data: response, isLoading } = useAnnouncements({
    limit: 3,
    sort: '-createdAt',
    status: 1,
  });

  const announcements = response?.data || [];
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const slideTo = useCallback(
    (index: number) => {
      if (isTransitioning || announcements.length === 0) return;
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrent(
          ((index % announcements.length) + announcements.length) %
            announcements.length,
        );
        setTimeout(() => setIsTransitioning(false), 50);
      }, 300);
    },
    [announcements.length, isTransitioning],
  );

  useEffect(() => {
    if (announcements.length <= 1) return;
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % announcements.length);
        setTimeout(() => setIsTransitioning(false), 50);
      }, 300);
    }, 3000);
    return () => clearInterval(timer);
  }, [announcements.length]);

  if (isLoading) {
    return (
      <div className="relative h-[600px] rounded-2xl overflow-hidden mb-16 bg-slate-800 animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  const announcement = announcements[current];

  return (
    <div className="relative h-[600px] rounded-2xl overflow-hidden mb-16">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1532153955177-f59af40d6472?w=1600&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-slate-900/70 to-black/80"></div>
      </div>

      <div className="relative z-10 h-full flex flex-col justify-center gap-16 px-8 md:px-16">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-2">
            Welcome to Episteme
          </h1>
          <p className="text-xl text-white/90">
            Advancing open science forward
          </p>
        </div>

        {announcement && (
          <div className="max-w-4xl relative mx-auto text-center">
            {/* Announcement Content with fade transition */}
            <div
              className="transition-opacity duration-300 ease-in-out"
              style={{ opacity: isTransitioning ? 0 : 1 }}
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
                <span className="text-2xl">📢</span>
                <span className="text-white font-semibold">
                  Latest Announcement
                </span>
                {announcements.length > 1 && (
                  <span className="text-white/60 text-sm ml-1">
                    {current + 1} / {announcements.length}
                  </span>
                )}
              </div>

              {/* Title */}
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-3 leading-tight">
                {announcement.title}
              </h2>

              {/* Date */}
              <span className="text-white/70 text-sm mb-8 block">
                Posted on {formatDate(announcement.createdAt)}
              </span>

              {/* CTA */}
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  to={`/announcements/${announcement.id}`}
                  className="bg-linear-to-r from-purple-600 to-pink-500 text-white px-8 py-4 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 inline-flex items-center gap-2"
                >
                  Read More
                  <span>→</span>
                </Link>
              </div>
            </div>

            {/* Carousel Dots */}
            {announcements.length > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8">
                {announcements.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => slideTo(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === current
                        ? '!bg-white scale-125'
                        : '!bg-white/40 hover:!bg-white/70'
                    }`}
                    aria-label={`Go to announcement ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-background to-transparent"></div>
    </div>
  );
}
