import { useParams, useNavigate } from "react-router-dom";
import { useUserById, useUserDetailsMutation } from "@/hooks/useUsers";
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

export default function UserDetails() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const updateUserMutation = useUserDetailsMutation();
  const { data, isLoading, isError, error } = useUserById(userId);

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
        userId: userId as string,
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

  const user = data.data;

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
        <h1 className="text-3xl text-accent font-bold">User Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <div className="rounded-lg shadow-small p-4 pt-8 relative">
            <div className="flex gap-4 z-0">
              {user.photoFilePath ? (
                <img
                  src={user.photoFilePath}
                  alt={`${user.firstName}'s photo`}
                  className="w-20 h-20 rounded-full object-cover border-4 border-border mb-4"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center border border-accent mb-4">
                  <UserIcon className="w-10 h-10 text-accent" />
                </div>
              )}

              <div className="flex flex-col gap-2">
                {isEdit ? (
                  <div>
                    <div className="mb-2">
                      <p className="text-sm text-muted-foreground">
                        First name
                      </p>

                      <Input
                        type="text"
                        value={formData.firstName || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            firstName: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Last name</p>{" "}
                      <Input
                        type="text"
                        value={formData.lastName || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            lastName: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                ) : (
                  <h2 className="text-2xl text-accent font-bold">
                    {user.firstName} {user.lastName}
                  </h2>
                )}
                <p className="text-sm text-slate-600">ID: {user.id}</p>
                <div className="flex flex-wrap gap-2">
                  {user.roles.map((role) => (
                    <Badge key={role} variant="outline" className="gap-1">
                      {role}
                    </Badge>
                  ))}
                </div>
                <div className="absolute top-2 right-2 z-10">
                  {getStatusBadge(user.status)}
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              {isEdit ? (
                <Input
                  type="text"
                  value={formData.linkedinUrl || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, linkedinUrl: e.target.value })
                  }
                />
              ) : (
                <>
                  {user.linkedinUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-none! text-accent! justify-start focus:outline-none! focus:ring-0!"
                      onClick={() => window.open(user.linkedinUrl, "_blank")}
                    >
                      <Linkedin className="w-4 h-4" />
                      View LinkedIn
                    </Button>
                  )}
                </>
              )}

              {user.cvFilePath && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-none! text-accent! justify-start focus:outline-none! focus:ring-0!"
                  onClick={() => window.open(user.cvFilePath, "_blank")}
                >
                  <FileText className="w-4 h-4" />
                  Download CV
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-lg shadow-small">
            <div className="p-4 bg-accent/5 shadow-sm flex justify-between items-center">
              <h3 className="text-accent text-lg font-semibold">Information</h3>

              {isEdit ? (
                <X
                  onClick={() => {
                    setFormData(user);
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
                    <p className="text-sm text-muted-foreground">Email</p>
                    {isEdit ? (
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                      />
                    ) : (
                      <p className="font-medium">{user.email}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-accent mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>

                    {isEdit ? (
                      <Input
                        type="text"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                      />
                    ) : (
                      <p className="font-medium">
                        {user.phone || "Not provided"}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-accent mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Institution</p>
                    {isEdit ? (
                      <Input
                        type="text"
                        value={formData.institution}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            institution: e.target.value,
                          })
                        }
                      />
                    ) : (
                      <p className="font-medium">
                        {user.institution || "Not provided"}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Briefcase className="w-5 h-5 text-accent mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Occupation</p>
                    {isEdit ? (
                      <Input
                        type="text"
                        value={formData.occupation}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            occupation: e.target.value,
                          })
                        }
                      />
                    ) : (
                      <p className="font-medium">
                        {user.occupation || "Not provided"}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-accent mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Country</p>
                    {isEdit ? (
                      <Input
                        type="text"
                        value={formData.country}
                        onChange={(e) =>
                          setFormData({ ...formData, country: e.target.value })
                        }
                      />
                    ) : (
                      <p className="font-medium">
                        {user.country || "Not provided"}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-accent mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Created At</p>
                    <p className="font-medium">
                      {new Date(user.createdAt).toLocaleString()}
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

                {isEdit && (
                  <div className="flex gap-3">
                    <div>
                      <FileText className="w-5 h-5 text-accent mt-0.5" />
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">CV</p>
                      <div>
                        <Input
                          id="cv"
                          name="cv"
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) =>
                            handleFileChange(e, FileTypeEnum.CVS)
                          }
                          className="cursor-pointer"
                        />
                        {cvFile && (
                          <p className="text-xs text-slate-500">
                            Selected: {cvFile.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {isEdit && (
                  <div className="flex gap-3">
                    <div>
                      <Shield className="w-5 h-5 text-accent mt-0.5" />
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <div className="w-46">
                        <Select
                          value={selectedStatus.toString()}
                          onValueChange={(value) =>
                            setFormData((prev) => {
                              return { ...prev, status: Number(value) };
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={UserStatus.INACTIVE.toString()}>
                              Inactive
                            </SelectItem>
                            <SelectItem value={UserStatus.ACTIVE.toString()}>
                              Active
                            </SelectItem>
                            <SelectItem value={UserStatus.SUSPENDED.toString()}>
                              Suspended
                            </SelectItem>
                            <SelectItem value={UserStatus.DELETED.toString()}>
                              Deleted
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
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
                setFormData(user);
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
