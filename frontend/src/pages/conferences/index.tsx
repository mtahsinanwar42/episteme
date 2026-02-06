import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useConferences } from "@/hooks/useConferences";
import { ConferenceCard } from "@/components/conference/ConferenceCard";
import { Pagination } from "@/components/ui/pagination";
import { useSelector } from "react-redux";
import { UserRole } from "@/models/user";
import { Button } from "@/components/ui/button";
import type { RootState } from "@/stores/store";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import PageTitle from "@/components/common/PageTitle";
import PageSubTitle from "@/components/common/PageSubTitle";
import type { Conference } from "@/models/conference";
import { ConferenceStatusUpdateModal } from "@/components/conference/ConferenceStatusUpdateModal";

export default function Conferences() {
  const navigate = useNavigate();
  const currentRoles = useSelector(
    (state: RootState) => state?.auth?.user?.roles,
  );

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedConference, setSelectedConference] =
    useState<Conference | null>(null);

  const {
    data: response,
    isLoading,
    error,
  } = useConferences({
    page,
    limit: pageSize,
    sort: "-createdAt",
    paginate: true,
    statusIn: currentRoles?.includes(UserRole.ADMIN) ? undefined : "1,2",
  });

  const conferences = response?.data || [];

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

  const handleOpenStatusModal = (conference: Conference) => {
    setSelectedConference(conference);
    setIsStatusModalOpen(true);
  };

  const handleCloseStatusModal = () => {
    setSelectedConference(null);
    setIsStatusModalOpen(false);
  };

  return (
    <div>
      <Breadcrumb items={[{ label: "Conferences", href: "/conferences" }]} />
      <div className="mb-6 flex justify-between items-end">
        <div>
          <PageTitle title="Conferences" />
          <PageSubTitle text="Browse upcoming and past conferences" />
        </div>

        {currentRoles?.includes(UserRole.ADMIN) && (
          <div className="flex justify-end">
            <Button
              onClick={() => navigate("/conferences/new")}
              className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
            >
              Add New Conference
            </Button>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="text-slate-600">Loading conferences...</div>
      )}
      {error && <div className="text-red-600">{(error as Error).message}</div>}

      {!isLoading && !error && conferences?.length === 0 && (
        <div className="text-slate-600">No conference found.</div>
      )}

      {!isLoading && !error && conferences && conferences?.length > 0 && (
        <div className="flex flex-col items-center gap-6">
          <div className="w-full max-w-2/3 flex flex-col gap-12">
            {conferences?.map((conference) => (
              <ConferenceCard
                key={conference.id}
                conference={conference}
                onStatusUpdate={handleOpenStatusModal}
              />
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

      <ConferenceStatusUpdateModal
        open={isStatusModalOpen}
        onOpenChange={setIsStatusModalOpen}
        selectedConference={selectedConference}
        onClose={handleCloseStatusModal}
      />
    </div>
  );
}
