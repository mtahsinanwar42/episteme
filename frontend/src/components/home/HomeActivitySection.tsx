import { useActivities } from "@/hooks/useActivities";
import type { Activity } from "@/models/activity";
import { config } from "@/config/config";
import { useMetadataFile } from "@/hooks/useMetadataFiles";
import { Link } from "react-router-dom";

export default function HomeActivitySection() {
  const { data: response, isLoading } = useActivities({
    limit: 3,
    sort: "-createdAt",
  });

  const activities = response?.data || [];

  if (isLoading) {
    return (
      <section className="mb-20">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Activities</h2>
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
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Activities</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Join our community events, workshops, and networking opportunities
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {activities.map((activity) => (
          <ActivityCard key={activity.id} activity={activity} />
        ))}
      </div>

      {/* See More Button */}
      <div className="text-center">
        <Link
          to="/activities"
          className="inline-block bg-linear-to-r from-emerald-600 to-teal-500 text-white px-8 py-4 rounded-lg font-semibold hover:shadow-lg transition-all"
        >
          See All Activities
        </Link>
      </div>
    </section>
  );
}

interface ActivityCardProps {
  activity: Activity;
}

function ActivityCard({ activity }: ActivityCardProps) {
  const { data: metadata, isLoading } = useMetadataFile({
    filePath: activity.metadataFilePath || "",
    resourceId: activity.id,
  });

  const imageUrl = metadata?.heroImagePath
    ? `${new URL(config.baseUrl).origin}/${metadata.heroImagePath}`
    : null;

  return (
    <article className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700 group">
      <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-900">
        {!isLoading && imageUrl ? (
          <img
            src={imageUrl}
            alt={activity.title}
            crossOrigin="anonymous"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            🎯
          </div>
        )}
        <div className="absolute top-4 left-4">
          <span className="bg-slate-800 dark:bg-slate-700 text-white px-3 py-1 rounded-full text-xs font-semibold">
            Activity
          </span>
        </div>
      </div>

      <div className="h-56 p-6 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-bold mb-3 line-clamp-2 transition-colors">
            {activity.title}
          </h3>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span>📅</span>
              <span>
                {new Date(activity.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        <Link
          to={`/activities/${activity.id}`}
          className="block w-full text-center bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          View Details
        </Link>
      </div>
    </article>
  );
}
