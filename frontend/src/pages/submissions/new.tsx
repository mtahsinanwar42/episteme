import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import PageTitle from "@/components/common/PageTitle";
import PageSubTitle from "@/components/common/PageSubTitle";
import { LoadingOverlay } from "@/components/common/LoadingOverlay";
import { FileUploadField } from "@/components/common/FileUploadField";
import { MultiSelect } from "@/components/ui/multi-select";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { useConferences } from "@/hooks/useConferences";
import { useCreateSubmissionMutation } from "@/hooks/useSubmissions";
import { useSuccessToast } from "@/hooks/useSuccessToast";
import { fileService } from "@/services/fileService";
import { miscService } from "@/services/miscService";
import { FileTypeEnum } from "@/models/file";
import { ConferenceStatus } from "@/models/conference";

export default function NewSubmission() {
  const navigate = useNavigate();
  const createSubmissionMutation = useCreateSubmissionMutation();
  const { showSuccessToast } = useSuccessToast();

  const [formData, setFormData] = useState({
    title: "",
    conferenceId: "",
    topics: [] as string[],
    abstract: "",
    contentFilePath: "",
    message: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedSubmissionFile, setUploadedSubmissionFile] = useState<{
    name: string;
    size: number;
    storageKey: string;
  } | null>(null);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const {
    data: conferencesResponse,
    isLoading: conferencesLoading,
    error: conferencesError,
  } = useConferences({
    paginate: false,
    sort: "title",
    status: ConferenceStatus.ACTIVE,
    submissionStartAtTo: today,
    submissionEndAtFrom: today,
  });

  const {
    data: topicsResponse,
    isLoading: topicsLoading,
    error: topicsError,
  } = useQuery({
    queryKey: ["topics"],
    queryFn: () => miscService.getTopics(),
  });

  const conferences = conferencesResponse?.data || [];
  const topics = topicsResponse?.data || [];

  const isFormValid =
    formData.title.trim() !== "" &&
    formData.conferenceId !== "" &&
    formData.topics.length > 0 &&
    formData.abstract.replace(/<[^>]*>/g, "").trim() !== "" &&
    formData.contentFilePath !== "";

  const isLoading =
    createSubmissionMutation.isPending ||
    uploading ||
    conferencesLoading ||
    topicsLoading;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleConferenceChange = (value: string) => {
    setFormData((prev) => ({ ...prev, conferenceId: value }));
  };

  const handleSubmissionFileChange = async (file: File | null) => {
    if (!file) return;

    setSubmissionFile(file);
    setUploading(true);
    setError(null);

    try {
      const formDataToUpload = new FormData();
      formDataToUpload.append("file", file);

      const fileUploadResponse = await fileService.uploadFile(
        FileTypeEnum.SUBMISSIONS,
        formDataToUpload,
      );

      if (
        fileUploadResponse.success &&
        fileUploadResponse.data.file.storageKey
      ) {
        setFormData((prev) => ({
          ...prev,
          contentFilePath: fileUploadResponse.data.file.storageKey,
        }));
        setUploadedSubmissionFile({
          name: fileUploadResponse.data.file.name,
          size: fileUploadResponse.data.file.size,
          storageKey: fileUploadResponse.data.file.storageKey,
        });
      } else {
        setError("Failed to upload submission file");
        setSubmissionFile(null);
        setUploadedSubmissionFile(null);
        setFormData((prev) => ({
          ...prev,
          contentFilePath: "",
        }));
      }
    } catch (uploadError) {
      console.error("Submission file upload error:", uploadError);
      setError("Failed to upload submission file");
      setSubmissionFile(null);
      setUploadedSubmissionFile(null);
      setFormData((prev) => ({
        ...prev,
        contentFilePath: "",
      }));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }

    if (!formData.conferenceId) {
      setError("Conference is required");
      return;
    }

    if (!formData.contentFilePath) {
      setError("Submission file is required");
      return;
    }

    if (formData.topics.length === 0) {
      setError("At least one topic is required");
      return;
    }

    if (!formData.abstract.replace(/<[^>]*>/g, "").trim()) {
      setError("Abstract is required");
      return;
    }

    setError(null);

    const parsedConferenceId = Number(formData.conferenceId);
    const conferenceId = Number.isNaN(parsedConferenceId)
      ? formData.conferenceId
      : parsedConferenceId;

    createSubmissionMutation.mutate(
      {
        title: formData.title.trim(),
        conferenceId,
        topics: formData.topics,
        abstract: formData.abstract,
        contentFilePath: formData.contentFilePath,
        message: formData.message.trim() || undefined,
      },
      {
        onSuccess: () => {
          showSuccessToast("New submission added successfully.");
          navigate("/submissions");
        },
        onError: (err: unknown) => {
          setError(
            err instanceof Error ? err.message : "Failed to create submission",
          );
        },
      },
    );
  };

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Submissions", href: "/submissions" },
          { label: "New Submission" },
        ]}
      />

      <div className="mb-8">
        <PageTitle title="Create New Submission" />
        <PageSubTitle text="Submit a new paper to a conference" />
      </div>

      <div className="relative rounded-lg border border-border bg-card shadow-md p-6">
        <LoadingOverlay visible={isLoading} />
        <form
          onSubmit={handleSubmit}
          className="space-y-6 grid grid-cols-1 gap-6 lg:grid-cols-2"
        >
          {error && <div className="text-red-600">{error}</div>}
          {conferencesError && (
            <div className="text-red-600">
              {(conferencesError as Error).message}
            </div>
          )}
          {topicsError && (
            <div className="text-red-600">{(topicsError as Error).message}</div>
          )}

          <div className="lg:col-span-2">
            <label className="block text-sm font-medium mb-2 text-heading">
              Title *
            </label>
            <Input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Graph Theory Unleashed"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-heading">
              Conference *
            </label>
            <Select
              value={formData.conferenceId}
              onValueChange={handleConferenceChange}
              disabled={isLoading || conferences.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a conference" />
              </SelectTrigger>
              <SelectContent>
                {conferences.map((conference) => (
                  <SelectItem key={conference.id} value={String(conference.id)}>
                    {conference.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!conferencesLoading && conferences.length === 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                No conferences available.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-heading">
              Topics *
            </label>
            <MultiSelect
              options={topics.map((topic) => ({
                label: topic,
                value: topic,
              }))}
              value={formData.topics}
              onValueChange={(values) =>
                setFormData((prev) => ({ ...prev, topics: values }))
              }
              placeholder={
                topicsLoading ? "Loading topics..." : "Select topics"
              }
              disabled={isLoading || topicsLoading}
              searchable
              hideSelectAll
              emptyIndicator="No topics available."
            />
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm font-medium mb-2 text-heading">
              Abstract *
            </label>
            <RichTextEditor
              value={formData.abstract}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, abstract: value }))
              }
              placeholder="Enter your paper abstract..."
              disabled={isLoading}
            />
          </div>

          <div>
            <FileUploadField
              label="Submission File *"
              selectedFile={submissionFile}
              onFileSelect={handleSubmissionFileChange}
              disabled={isLoading}
              helperText="Upload your submission file"
              uploadedFile={uploadedSubmissionFile}
              accept=".docx,.pdf"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label htmlFor="message" className="text-sm font-medium">
              Message (Optional)
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              rows={4}
              className="w-full ps-3 pe-3 py-2.5 text-heading text-sm rounded-lg border border-accent focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 placeholder:text-body"
              placeholder="Add a short note for the editors"
              disabled={isLoading}
            ></textarea>
          </div>

          <div className="flex justify-end gap-3 lg:col-span-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/submissions")}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!isFormValid || isLoading}>
              {createSubmissionMutation.isPending ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
