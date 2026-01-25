import { useParams, useNavigate } from "react-router-dom";
import { useUserDetailsMutation } from "@/hooks/useUsers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Phone,
  Building2,
  Briefcase,
  MapPin,
  Linkedin,
  FileText,
  Calendar,
  User as UserIcon,
  Shield,
  Edit,
  X,
  User,
  Image,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserStatus } from "@/models/user";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { FileTypeEnum } from "@/models/file";
import { fileService } from "@/services/fileService";
import { config } from "@/config/config";
import { useFileById } from "@/hooks/useFiles";

export default function AssetDetails() {
  const { fileId } = useParams();
  const navigate = useNavigate();
  const updateUserMutation = useUserDetailsMutation();
  const { data, isLoading, isError, error } = useFileById(fileId);

  const [isEdit, setIsEdit] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<number>(1);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    return data?.data ? { ...data.data } : {};
  });

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: FileTypeEnum,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === FileTypeEnum.PROFILE_PHOTOS) {
        setPhotoFile(file);
        try {
          let formData = new FormData();
          await formData.append("file", file);

          let fileUploadResponse = await fileService.uploadFile(type, formData);

          if (
            fileUploadResponse.success &&
            fileUploadResponse.data.file.storageKey
          ) {
            setFormData((prev) => ({
              ...prev,
              photoFilePath: fileUploadResponse.data.file.storageKey,
            }));
          }
        } catch (error) {
          console.error("Photo upload error:", error);
          setPhotoFile(null);
          setFormData((prev) => ({
            ...prev,
            photoFilePath: "",
          }));
        }
      } else {
        setCvFile(file);

        try {
          let formData = new FormData();
          await formData.append("file", file);

          let fileUploadResponse = await fileService.uploadFile(type, formData);

          if (
            fileUploadResponse.success &&
            fileUploadResponse.data.file.storageKey
          ) {
            setFormData((prev) => ({
              ...prev,
              cvFilePath: fileUploadResponse.data.file.storageKey,
            }));
          }
        } catch (error) {
          console.error("CV upload error:", error);
          setCvFile(null);
          setFormData((prev) => ({
            ...prev,
            cvFilePath: "",
          }));
        }
      }
    }
  };

  const handleSave = () => {
    updateUserMutation.mutate(
      {
        userId: fileId as string,
        postData: { ...formData },
      },
      {
        onSuccess: () => {
          setIsEdit(false);
          console.log("User info updated successfully");
        },
        onError: (error) => {
          console.error("Error updating user info:", error);
        },
      },
    );
    setIsEdit(false);
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

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return <Badge variant="destructive">{UserStatus[status]}</Badge>;
      case 1:
        return <Badge variant="default">{UserStatus[status]}</Badge>;
      case 2:
        return <Badge variant="secondary">{UserStatus[status]}</Badge>;
      case 9:
        return <Badge variant="disabled">{UserStatus[status]}</Badge>;
      default:
        return <Badge variant="default">{UserStatus[status]}</Badge>;
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl text-accent font-bold">Asset Details</h1>
      </div>

      <div className="">
        <div className="rounded-lg shadow-small">
          <div className="p-4 bg-accent/5 shadow-sm flex justify-between items-center">
            <h3 className="text-accent text-lg font-semibold">Information</h3>

            {isEdit ? (
              <X
                onClick={() => {
                  setFormData(file);
                  setIsEdit(false);
                }}
                className="size-4 text-gray-600 hover:text-gray-800 cursor-pointer"
              />
            ) : (
              <Edit
                onClick={() => setIsEdit(true)}
                className="size-4 text-gray-600 hover:text-gray-800 cursor-pointer"
              />
            )}
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-accent mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  {isEdit ? (
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  ) : (
                    <p className="font-medium">{file.name}</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-accent mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Storage Key</p>

                  {isEdit ? (
                    <Input
                      type="text"
                      value={formData.storageKey}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          storageKey: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <p
                      className="font-medium max-w-96 overflow-clip
                      "
                    >
                      {file.storageKey}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Image className="w-5 h-5 text-accent mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Image</p>

                  <p className="font-medium">
                    <img
                      src={`${new URL(config.baseUrl).origin}${file.storageKey}`}
                      alt="Asset Image"
                      crossOrigin="anonymous"
                      className="w-24 h-24 object-cover"
                    />
                  </p>
                </div>
              </div>

              {isEdit && (
                <div className="flex gap-3">
                  <div>
                    <User className="w-5 h-5 text-accent mt-0.5" />
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">
                      Profile picture
                    </p>
                    <div>
                      <Input
                        id="photo"
                        name="photo"
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleFileChange(e, FileTypeEnum.PROFILE_PHOTOS)
                        }
                        className="cursor-pointer"
                      />
                      {photoFile && (
                        <p className="text-xs text-slate-500">
                          Selected: {photoFile.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isEdit && (
        <div className="flex gap-4 justify-end mt-6">
          <div>
            <Button
              variant="outline"
              onClick={() => {
                setFormData(file);
                setIsEdit(false);
              }}
            >
              Cancel
            </Button>
          </div>
          <div className="">
            <Button onClick={() => handleSave()}>Save</Button>
          </div>
        </div>
      )}
    </div>
  );
}
