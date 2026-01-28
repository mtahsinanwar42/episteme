import { useEffect, useState } from "react";
import { announcementService } from "@/services/announcementService";
import type { Announcement } from "@/models/announcement";

export default function HeroSection() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestAnnouncement = async () => {
      try {
        const response = await announcementService.getAnnouncements({
          limit: 1,
          sort: "-createdAt",
        });
        if (response.data && response.data.length > 0) {
          setAnnouncement(response.data[0]);
        }
      } catch (error) {
        console.error("Failed to fetch announcement:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestAnnouncement();
  }, []);

  if (loading) {
    return (
      <div className="relative h-[600px] rounded-2xl overflow-hidden mb-16 bg-slate-200 dark:bg-slate-800 animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-gray-600 dark:text-gray-400 text-2xl">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="relative h-[600px] rounded-2xl overflow-hidden mb-16">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1532153955177-f59af40d6472?w=1600&q=80')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-purple-900/60 to-black/70"></div>
        </div>
        <div className="relative z-10 h-full flex items-center justify-center px-8 md:px-16">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Welcome to Episteme
            </h1>
            <p className="text-xl text-white/90">
              Advancing open science forward
            </p>
          </div>
        </div>
      </div>
    );
  }

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

      {/* Content */}
      <div className="relative z-10 h-full flex items-center px-8 md:px-16">
        <div className="max-w-4xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
            <span className="text-2xl">📢</span>
            <span className="text-white font-semibold">
              Latest Announcement
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            {announcement.title}
          </h1>

          {/* Description - get first 200 chars if metadata exists */}
          <p className="text-xl text-white/90 mb-8 leading-relaxed max-w-3xl">
            {announcement.metadataFilePath
              ? "Click to read more about this announcement."
              : ""}
          </p>

          {/* Date and CTA */}
          <div className="flex flex-wrap items-center gap-4">
            <a
              href={`/announcements/${announcement.id}`}
              className="bg-linear-to-r from-purple-600 to-pink-500 text-white px-8 py-4 rounded-lg font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2"
            >
              Read More
              <span>→</span>
            </a>
            <span className="text-white/70 text-sm">
              Posted on{" "}
              {new Date(announcement.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
    </div>
  );
}
