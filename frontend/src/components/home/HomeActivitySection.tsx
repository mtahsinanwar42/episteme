import { useActivities } from "@/hooks/useActivities";
import type { Activity } from "@/models/activity";
import { config } from "@/config/config";
import { useMetadataFile } from "@/hooks/useMetadataFiles";
import { Link } from "react-router-dom";
import { formatDate } from "@/utils/dateFormatter";

export default function HomeActivitySection() {
  const { data: response, isLoading } = useActivities({
    limit: 3,
    sort: "-createdAt",
    status: 1,
  });

  const activities = response?.data || [];

  if (isLoading) {
    return (
      <section className="mb-20">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Activities</h2>
            <p className="text-xl text-foreground/80">
              Join our community events, workshops, and networking opportunities
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="gradient-card rounded-xl h-96 animate-pulse"
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
          <p className="text-xl text-foreground/80">
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
          <p className="text-xl text-foreground/80">
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
          className="inline-block bg-linear-to-r from-purple-600 to-pink-500 text-white px-8 py-4 rounded-lg font-semibold hover:shadow-lg transition-all"
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
    <article className="grid grid-cols-[55%_45%] gradient-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border-b-2 border-border">
      {/* Content */}
      <div className="p-4 flex flex-col justify-between">
        <div className="flex flex-col gap-2">
          <div className="inline-flex">
            <span className="gradient-card text-foreground px-3 py-1 rounded-full text-xs font-semibold border border-border">
              Activity
            </span>
          </div>
          <h3 className="font-semibold text-foreground line-clamp-2">
            {activity.title}
          </h3>
          {metadata?.summary && (
            <p className="text-sm text-foreground/60 line-clamp-2">
              {metadata.summary}
            </p>
          )}
          <span className="text-sm text-foreground/50">
            {formatDate(activity.createdAt)}
          </span>
        </div>

        <Link
          to={`/activities/${activity.id}`}
          className="text-foreground/80 font-semibold hover:underline inline-flex items-center gap-1 mt-3"
        >
          Read More
          <span>→</span>
        </Link>
      </div>

      {/* Image */}
      <div className="h-full flex items-center justify-center">
        {!isLoading && imageUrl ? (
          <img
            src={imageUrl}
            alt={activity.title}
            crossOrigin="anonymous"
            className="h-44 w-4/5 object-cover rounded-md"
            loading="lazy"
          />
        ) : (
          <div className="h-44 w-4/5 gradient-card rounded-md" />
        )}
      </div>
    </article>
  );
}
