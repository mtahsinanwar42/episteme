import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useActivities } from "@/hooks/useActivities";
import { ActivityCard } from "@/components/activity/ActivityCard";
import { Pagination } from "@/components/ui/pagination";
import { useSelector } from "react-redux";
import { UserRole } from "@/models/user";
import { Button } from "@/components/ui/button";
import type { RootState } from "@/stores/store";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import PageTitle from "@/components/common/PageTitle";
import PageSubTitle from "@/components/common/PageSubTitle";

export default function Activities() {
  const navigate = useNavigate();
  const currentRoles = useSelector(
    (state: RootState) => state?.auth?.user?.roles,
  );

  console.log(currentRoles);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9); // 3 cards x 3 rows by default

  const {
    data: response,
    isLoading,
    error,
  } = useActivities({
    page,
    limit: pageSize,
    sort: "-createdAt",
    paginate: true,
  });

  const activities = response?.data || [];
  const total = response?.total || 0;

  const currentPage = page;
  const currentLimit = response?.pagination?.next?.limit || pageSize;
  const totalPages = Math.ceil(total / currentLimit || 1);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  };

  const handleActivityClick = (activityId: string | number) => {
    navigate(`/activities/${activityId}`);
  };

  return (
    <div>
      <Breadcrumb items={[{ label: "Activities", href: "/activities" }]} />
      <div className="mb-6 flex justify-between items-end">
        <div>
          <PageTitle title="Activities" />
          <PageSubTitle text="Latest activities and events" />
        </div>

        {currentRoles?.includes(UserRole.ADMIN) && (
          <div className="flex justify-end">
            <Button
              onClick={() => navigate("/activities/new")}
              className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
            >
              Add New Activity
            </Button>
          </div>
        )}
      </div>

      {isLoading && <div className="text-slate-600">Loading activities...</div>}
      {error && <div className="text-red-600">{(error as Error).message}</div>}

      {!isLoading && !error && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map((activity) => (
              <div
                key={activity.id}
                onClick={() => handleActivityClick(activity.id)}
              >
                <ActivityCard activity={activity} />
              </div>
            ))}
          </div>

          {total > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={currentLimit}
              totalItems={total}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              pageSizeOptions={[3, 6, 9, 12, 15]}
            />
          )}
        </div>
      )}
    </div>
  );
}
