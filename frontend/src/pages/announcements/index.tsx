import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { AnnouncementCard } from "@/components/announcement/AnnouncementCard";
import { Pagination } from "@/components/ui/pagination";
import { useSelector } from "react-redux";
import { UserRole } from "@/models/user";
import { Button } from "@/components/ui/button";
import type { RootState } from "@/stores/store";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import PageTitle from "@/components/common/PageTitle";
import PageSubTitle from "@/components/common/PageSubTitle";

export default function Announcements() {
  const navigate = useNavigate();
  const currentRoles = useSelector(
    (state: RootState) => state?.auth?.user?.roles,
  );

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9); // 3 cards x 3 rows by default

  const {
    data: response,
    isLoading,
    error,
  } = useAnnouncements({
    page,
    limit: pageSize,
    sort: "-createdAt",
    paginate: true,
  });

  const announcements = response?.data || [];
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

  const handleAnnouncementClick = (announcementId: string | number) => {
    navigate(`/announcements/${announcementId}`);
  };

  return (
    <div>
      <Breadcrumb
        items={[{ label: "Announcements", href: "/announcements" }]}
      />
      <div className="mb-6 flex justify-between items-end">
        <div>
          <PageTitle title="Announcements" />
          <PageSubTitle text="Latest announcements and updates" />
        </div>

        {currentRoles?.includes(UserRole.ADMIN) && (
          <div className="flex justify-end">
            <Button
              onClick={() => navigate("/announcements/new")}
              className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
            >
              Add New Announcement
            </Button>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="text-slate-600">Loading announcements...</div>
      )}
      {error && <div className="text-red-600">{(error as Error).message}</div>}

      {!isLoading && !error && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                onClick={() => handleAnnouncementClick(announcement.id)}
              >
                <AnnouncementCard announcement={announcement} />
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
