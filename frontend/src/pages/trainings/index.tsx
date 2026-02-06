import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTrainings } from "@/hooks/useTrainings";
import { TrainingCard } from "@/components/training/TrainingCard";
import { Pagination } from "@/components/ui/pagination";
import { useSelector } from "react-redux";
import { UserRole } from "@/models/user";
import { Button } from "@/components/ui/button";
import type { RootState } from "@/stores/store";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import PageTitle from "@/components/common/PageTitle";
import PageSubTitle from "@/components/common/PageSubTitle";

export default function Trainings() {
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
  } = useTrainings({
    page,
    limit: pageSize,
    sort: "-createdAt",
    paginate: true,
    status: currentRoles?.includes(UserRole.ADMIN) ? undefined : 1,
  });

  const trainings = response?.data || [];
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

  const handleTrainingClick = (trainingId: string | number) => {
    navigate(`/trainings/${trainingId}`);
  };

  return (
    <div>
      <Breadcrumb items={[{ label: "Trainings", href: "/trainings" }]} />
      <div className="mb-6 flex justify-between items-end">
        <div>
          <PageTitle title="Trainings" />
          <PageSubTitle text="Professional development and training programs" />
        </div>

        {currentRoles?.includes(UserRole.ADMIN) && (
          <div className="flex justify-end">
            <Button
              onClick={() => navigate("/trainings/new")}
              className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
            >
              Add New Training
            </Button>
          </div>
        )}
      </div>

      {isLoading && <div className="text-slate-600">Loading trainings...</div>}
      {error && <div className="text-red-600">{(error as Error).message}</div>}

      {!isLoading && !error && trainings.length === 0 && (
        <div className="text-slate-600">No training found.</div>
      )}

      {!isLoading && !error && trainings.length > 0 && (
        <div className="flex flex-col items-center gap-6">
          <div className="w-full max-w-2/3 flex flex-col gap-12">
            {trainings?.map((training) => (
              <div
                key={training.id}
                onClick={() => handleTrainingClick(training.id)}
              >
                <TrainingCard training={training} />
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
