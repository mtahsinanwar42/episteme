import { useParams, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, User as UserIcon, Edit, X, Image } from "lucide-react";
import { UserStatus } from "@/models/user";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { fileService } from "@/services/fileService";
import { config } from "@/config/config";
import { useFileById } from "@/hooks/useFiles";

export default function AssetDetails() {
  const { fileId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useFileById(fileId);

  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    return data?.data ? { ...data.data } : {};
  });

  const handleDownload = async () => {
    if (!file?.storageKey) {
      console.error("No file path available for download");
      return;
    }

    try {
      await fileService.downloadFile(file.storageKey);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download file. Please try again.");
    }
  };

  useEffect(() => {
    if (data?.data) {
      setFormData({ ...data.data });
    }
  }, [data?.data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <div className="bg-destructive/10 text-destructive rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Error Loading User</h3>
            <p className="text-sm">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data?.data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <UserIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">User Not Found</h3>
          <p className="text-muted-foreground mb-4">
            The user you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate("/users")}>Back to Users</Button>
        </div>
      </div>
    );
  }

  const file = data.data;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl text-accent font-bold">Asset Details</h1>
      </div>

      <div className="">
        <div className="rounded-lg shadow-small">
          <div className="p-4 bg-accent/5 shadow-sm">
            <h3 className="text-accent text-lg font-semibold">Information</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-accent mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>

                  <p className="font-medium max-w-96 wrap-break-word">
                    {file.name}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-accent mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Storage Key</p>

                  <p className="font-medium max-w-96 break-all">
                    {file.storageKey}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-accent mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Created At</p>

                  <p className="font-medium max-w-96 overflow-clip">
                    {new Date(file.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Image className="w-5 h-5 text-accent mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Image</p>

                  <p className="font-medium">
                    <img
                      src={`${new URL(config.baseUrl).origin}/${file.storageKey}`}
                      alt="Asset Image"
                      crossOrigin="anonymous"
                      className="w-24 h-24 object-cover"
                    />
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-end mt-6">
              <div className="">
                <Button onClick={() => handleDownload()}>Download Asset</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
