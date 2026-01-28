import { useEffect, useState } from "react";
import { activityService } from "@/services/activityService";
import type { Activity } from "@/models/activity";

export default function HomeActivitySection() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await activityService.getActivities({
          limit: 3,
          sort: "-createdAt",
        });
        setActivities(response.data || []);
      } catch (error) {
        console.error("Failed to fetch activities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  if (loading) {
    return (
      <section className="mb-20">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Upcoming Activities
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Join our community events, workshops, and networking opportunities
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-gray-200 dark:bg-gray-700 rounded-xl h-96 animate-pulse"
            ></div>
          ))}
        </div>
      </section>
    );
  }

  if (activities.length === 0) {
    return (
      <section className="mb-20">
        <div className="text-center py-12">
          <p className="text-xl text-gray-600 dark:text-gray-300">
            No activities available at the moment.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-20">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Upcoming Activities
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Join our community events, workshops, and networking opportunities
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {activities.map((activity) => (
          <article
            key={activity.id}
            className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700 group"
          >
            {/* Image */}
            <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-900">
              <div className="w-full h-full flex items-center justify-center text-6xl">
                🎯
              </div>
              <div className="absolute top-4 left-4">
                <span className="bg-slate-800 dark:bg-slate-700 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  Activity
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="h-56 p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold mb-3 line-clamp-2 transition-colors">
                  {activity.title}
                </h3>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span>📅</span>
                    <span>
                      {new Date(activity.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <a
                href={`/activities/${activity.id}`}
                className="block w-full text-center bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                View Details
              </a>
            </div>
          </article>
        ))}
      </div>

      {/* See More Button */}
      <div className="text-center">
        <a
          href="/activities"
          className="inline-block bg-gradient-to-r from-emerald-600 to-teal-500 text-white px-8 py-4 rounded-lg font-semibold hover:shadow-lg transition-all"
        >
          See All Activities
        </a>
      </div>
    </section>
  );
}
