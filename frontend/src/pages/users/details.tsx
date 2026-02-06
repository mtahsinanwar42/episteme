import { useParams, useNavigate } from "react-router-dom";
import {
  useCountries,
  useUserById,
  useUserDetailsMutation,
} from "@/hooks/useUsers";
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
  Notebook,
} from "lucide-react";
import { formatDateTime } from "@/utils/dateFormatter";
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
import { Breadcrumb } from "@/components/common/Breadcrumb";
import PageTitle from "@/components/common/PageTitle";
import { LoadingOverlay } from "@/components/common/LoadingOverlay";
import { FileUploadField } from "@/components/common/FileUploadField";
import { useSuccessToast } from "@/hooks/useSuccessToast";
import { Checkbox } from "@/components/ui/checkbox";
import { SearchableSelect } from "@/components/ui/searchable-select";

export default function UserDetails() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const { data: countriesData } = useCountries();

  const updateUserMutation = useUserDetailsMutation();
  const { data, isLoading, isError, error } = useUserById(userId);
  const { showSuccessToast } = useSuccessToast();

  const [isEdit, setIsEdit] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<number>(1);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [uploadedPhotoFile, setUploadedPhotoFile] = useState<{
    name: string;
    size: number;
    storageKey: string;
  } | null>(null);
  const [uploadedCvFile, setUploadedCvFile] = useState<{
    name: string;
    size: number;
    storageKey: string;
  } | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    return data?.data ? { ...data.data } : {};
  });

  const PHONE_REGEX = /^\+?[0-9][0-9\-\s]{6,20}$/;
  const LINKEDIN_REGEX =
    /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/;

  const isPhoneValid = !formData.phone || PHONE_REGEX.test(formData.phone);
  const isLinkedinValid =
    !formData.linkedinUrl || LINKEDIN_REGEX.test(formData.linkedinUrl);

  const isEditFormValid =
    (formData.firstName || "").trim() !== "" &&
    (formData.lastName || "").trim() !== "" &&
    isPhoneValid &&
    isLinkedinValid &&
    (formData.institution || "").trim() !== "" &&
    (formData.occupation || "").trim() !== "" &&
    (formData.country || "").trim() !== "" &&
    (formData.roles || []).length > 0;

  const handleRoleToggle = (role: string) => {
    setFormData((prev) => {
      const currentRoles = prev.roles || [];
      if (currentRoles.includes(role)) {
        return {
          ...prev,
          roles: currentRoles.filter((r: string) => r !== role),
        };
      }
      if (role === "ADMIN") {
        return { ...prev, roles: ["ADMIN"] };
      }
      return {
        ...prev,
        roles: [...currentRoles.filter((r: string) => r !== "ADMIN"), role],
      };
    });
  };

  const handleFileSelect = async (file: File | null, type: FileTypeEnum) => {
    if (!file) return;
    if (type === FileTypeEnum.PROFILE_PHOTOS) {
      setPhotoFile(file);
      try {
        const formData = new FormData();
        formData.append("file", file);

        const fileUploadResponse = await fileService.uploadFile(type, formData);

        if (
          fileUploadResponse.success &&
          fileUploadResponse.data.file.storageKey
        ) {
          setFormData((prev) => ({
            ...prev,
            photoFilePath: fileUploadResponse.data.file.storageKey,
          }));
          setUploadedPhotoFile({
            name: file.name,
            size: file.size,
            storageKey: fileUploadResponse.data.file.storageKey,
          });
        }
      } catch (error) {
        console.error("Photo upload error:", error);
        setPhotoFile(null);
        setUploadedPhotoFile(null);
        setFormData((prev) => ({
          ...prev,
          photoFilePath: "",
        }));
      }
      return;
    }

    setCvFile(file);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const fileUploadResponse = await fileService.uploadFile(type, formData);

      if (
        fileUploadResponse.success &&
        fileUploadResponse.data.file.storageKey
      ) {
        setFormData((prev) => ({
          ...prev,
          cvFilePath: fileUploadResponse.data.file.storageKey,
        }));
        setUploadedCvFile({
          name: file.name,
          size: file.size,
          storageKey: fileUploadResponse.data.file.storageKey,
        });
      }
    } catch (error) {
      console.error("CV upload error:", error);
      setCvFile(null);
      setUploadedCvFile(null);
      setFormData((prev) => ({
        ...prev,
        cvFilePath: "",
      }));
    }
  };

  const handleSave = () => {
    if (!isEditFormValid) return;

    updateUserMutation.mutate(
      {
        userId: userId as string,
        postData: { ...formData },
      },
      {
        onSuccess: () => {
          setIsEdit(false);
          showSuccessToast("User updated successfully.");
          console.log("User info updated successfully");
        },
        onError: (error) => {
          console.error("Error updating user info:", error);
        },
      },
    );
  };

  useEffect(() => {
    if (data?.data) {
      setFormData({ ...data.data });
      setSelectedStatus(data.data.status);
      if (data.data.photoFilePath) {
        const storageKey = data.data.photoFilePath;
        const name = storageKey.split("/").pop() || storageKey;
        setUploadedPhotoFile({ name, size: 0, storageKey });
      }
      if (data.data.cvFilePath) {
        const storageKey = data.data.cvFilePath;
        const name = storageKey.split("/").pop() || storageKey;
        setUploadedCvFile({ name, size: 0, storageKey });
      }
    }
  }, [data?.data]);

  if (isLoading) {
    return (
      <div className="relative min-h-[400px]">
        <LoadingOverlay visible />
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
          <UserIcon className="w-16 h-16  mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">User Not Found</h3>
          <p className=" mb-4">The user you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/users")}>Back to Users</Button>
        </div>
      </div>
    );
  }

  const user = data.data;

  const getStatusBadge = (status: number) => {
    switch (status) {
      case UserStatus.INACTIVE:
        return <Badge variant="disabled">{UserStatus[status]}</Badge>;
      case UserStatus.ACTIVE:
        return <Badge variant="default">{UserStatus[status]}</Badge>;
      case UserStatus.SUSPENDED:
        return <Badge variant="secondary">{UserStatus[status]}</Badge>;
      case UserStatus.DELETED:
        return <Badge variant="destructive">{UserStatus[status]}</Badge>;
      default:
        return <Badge variant="default">{UserStatus[status]}</Badge>;
    }
  };

  return (
    <div>
      <Breadcrumb
        items={[{ label: "Users", href: "/users" }, { label: `${user.email}` }]}
      />

      <div className="mb-6">
        <PageTitle title="User Details" />
      </div>

      <div className="relative">
        <LoadingOverlay visible={updateUserMutation.isPending} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="rounded-lg shadow-small p-4 pt-8 relative border border-border gradient-card flex flex-col justify-between">
            <div className="flex gap-4 z-0">
              {user.photoFilePath ? (
                <img
                  src={`${new URL(config.baseUrl).origin}/${user.photoFilePath}`}
                  alt={`${user.firstName}'s photo`}
                  crossOrigin="anonymous"
                  className="w-20 h-20 rounded-full object-cover border-4 border-border mb-4"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center border border-accent mb-4">
                  <UserIcon className="w-10 h-10 text-accent" />
                </div>
              )}

              <div className="w-fit flex flex-col justify-between gap-2">
                {isEdit ? (
                  <div>
                    <div className="mb-4">
                      <p className="text-sm mb-1">First Name *</p>

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

                    <div className="mb-4">
                      <p className="text-sm mb-1">Last Name *</p>{" "}
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
                  <h2 className="font-semibold">
                    {user.firstName} {user.lastName}
                  </h2>
                )}
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
                <>
                  <p className="text-sm ">LinkedIn URL</p>
                  <Input
                    type="text"
                    value={formData.linkedinUrl || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, linkedinUrl: e.target.value })
                    }
                  />
                  {formData.linkedinUrl && !isLinkedinValid && (
                    <p className="text-red-400 text-xs">
                      Please enter a valid LinkedIn URL.
                    </p>
                  )}
                </>
              ) : (
                <>
                  {user.linkedinUrl && (
                    <Button
                      size="sm"
                      className="w-full justify-start focus:outline-none! focus:ring-0!"
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
                  size="sm"
                  className="w-full justify-start focus:outline-none! focus:ring-0!"
                  onClick={() => fileService.downloadFile(user.cvFilePath!)}
                >
                  <FileText className="w-4 h-4" />
                  Download CV
                </Button>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-lg shadow-small border border-border">
              <div className="p-4 gradient-card shadow-sm flex justify-between items-center rounded-t-lg">
                <h3 className="font-semibold">Information</h3>

                {user.status !== UserStatus.DELETED && (
                  <>
                    {isEdit ? (
                      <X
                        onClick={() => {
                          setFormData(user);
                          setIsEdit(false);
                        }}
                        className="size-4 text-foreground hover:text-foreground/80 cursor-pointer"
                      />
                    ) : (
                      <Edit
                        onClick={() => setIsEdit(true)}
                        className="size-4 text-foreground hover:text-foreground/80 cursor-pointer"
                      />
                    )}
                  </>
                )}
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-accent mt-0.5" />
                    <div>
                      <p className="text-sm ">Email</p>

                      <p className="font-medium">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-accent mt-0.5" />
                    <div className="w-full">
                      <p className="text-sm ">Phone</p>

                      {isEdit ? (
                        <>
                          <Input
                            type="text"
                            value={formData.phone}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                phone: e.target.value,
                              })
                            }
                          />
                          {formData.phone && !isPhoneValid && (
                            <p className="text-red-400 text-xs">
                              Please enter a valid phone number.
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="font-medium">
                          {user.phone || "Not provided"}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Building2 className="w-5 h-5 text-accent mt-0.5" />
                    <div className="w-full">
                      <p className="text-sm ">Institution *</p>
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
                    <div className="w-full">
                      <p className="text-sm ">Occupation *</p>
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
                    <div className="w-full">
                      <p className="text-sm ">Country *</p>
                      {isEdit ? (
                        <SearchableSelect
                          value={formData.country}
                          onValueChange={(value) => {
                            setFormData({ ...formData, country: value });
                          }}
                          options={countriesData?.data || []}
                          placeholder="Select a country"
                          disabled={isLoading}
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
                    <div className="w-full">
                      <p className="text-sm ">Created At</p>
                      <p className="font-medium">
                        {formatDateTime(user.createdAt)}
                      </p>
                    </div>
                  </div>

                  {isEdit && (
                    <div className="flex gap-3">
                      <div>
                        <User className="w-5 h-5 text-accent mt-0.5" />
                      </div>

                      <div className="w-full">
                        <FileUploadField
                          label="Profile picture"
                          selectedFile={photoFile}
                          onFileSelect={(file) =>
                            handleFileSelect(file, FileTypeEnum.PROFILE_PHOTOS)
                          }
                          accept="image/*"
                          disabled={updateUserMutation.isPending}
                          helperText="Upload a profile photo (JPG, PNG)"
                          uploadedFile={uploadedPhotoFile}
                          maxNameLength={40}
                        />
                      </div>
                    </div>
                  )}

                  {isEdit && (
                    <div className="flex gap-3">
                      <div>
                        <FileText className="w-5 h-5 text-accent mt-0.5" />
                      </div>

                      <div className="w-full">
                        <FileUploadField
                          label="CV"
                          selectedFile={cvFile}
                          onFileSelect={(file) =>
                            handleFileSelect(file, FileTypeEnum.CVS)
                          }
                          accept=".pdf,.doc,.docx"
                          disabled={updateUserMutation.isPending}
                          helperText="Upload a CV (PDF, DOC, DOCX)"
                          uploadedFile={uploadedCvFile}
                          maxNameLength={40}
                        />
                      </div>
                    </div>
                  )}

                  {isEdit && (
                    <div className="flex gap-3">
                      <div>
                        <Shield className="w-5 h-5 text-accent mt-0.5" />
                      </div>

                      <div className="w-full">
                        <p className="text-sm ">Status *</p>
                        <div className="w-full">
                          <Select
                            value={selectedStatus.toString()}
                            onValueChange={(value) => {
                              setSelectedStatus(Number(value));
                              setFormData((prev) => {
                                return { ...prev, status: Number(value) };
                              });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem
                                value={UserStatus.INACTIVE.toString()}
                              >
                                Inactive
                              </SelectItem>
                              <SelectItem value={UserStatus.ACTIVE.toString()}>
                                Active
                              </SelectItem>
                              <SelectItem
                                value={UserStatus.SUSPENDED.toString()}
                              >
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

                  {isEdit && (
                    <div className="flex gap-3">
                      <div>
                        <Shield className="w-5 h-5 text-accent mt-0.5" />
                      </div>

                      <div className="w-full">
                        <p className="text-sm font-medium">Select Roles *</p>
                        <div className="space-y-3 mt-2">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              id="role-user"
                              checked={(formData.roles || []).includes("USER")}
                              onCheckedChange={() => handleRoleToggle("USER")}
                            />
                            <label
                              htmlFor="role-user"
                              className="text-sm cursor-pointer"
                            >
                              User
                            </label>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              id="role-reviewer"
                              checked={(formData.roles || []).includes(
                                "REVIEWER",
                              )}
                              onCheckedChange={() =>
                                handleRoleToggle("REVIEWER")
                              }
                            />
                            <label
                              htmlFor="role-reviewer"
                              className="text-sm cursor-pointer"
                            >
                              Reviewer
                            </label>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              id="role-admin"
                              checked={(formData.roles || []).includes("ADMIN")}
                              onCheckedChange={() => handleRoleToggle("ADMIN")}
                            />
                            <label
                              htmlFor="role-admin"
                              className="text-sm cursor-pointer"
                            >
                              Admin
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {user?.statusUpdateNotes && (
                    <div className="flex items-start gap-3">
                      <Notebook className="w-5 h-5 text-accent mt-0.5" />
                      <div className="w-full">
                        <p className="text-sm ">Status Update Notes</p>
                        {isEdit ? (
                          <Input
                            type="text"
                            value={formData.statusUpdateNotes}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                statusUpdateNotes: e.target.value,
                              })
                            }
                          />
                        ) : (
                          <p className="font-medium">
                            {user.statusUpdateNotes}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {isEdit && (
                <div className="flex gap-4 justify-end mt-6 pr-6 pb-6">
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
                  <div>
                    <Button
                      onClick={() => handleSave()}
                      disabled={
                        !isEditFormValid || updateUserMutation.isPending
                      }
                    >
                      Save
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
