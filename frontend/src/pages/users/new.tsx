import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateUserMutation } from "@/hooks/useUsers";
import { UserStatus } from "@/models/user";
import { FileTypeEnum } from "@/models/file";
import { fileService } from "@/services/fileService";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import PageSubTitle from "@/components/common/PageSubTitle";
import PageTitle from "@/components/common/PageTitle";

export default function NewUser() {
  const navigate = useNavigate();
  const createUserMutation = useCreateUserMutation();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    institution: "",
    occupation: "",
    country: "",
    linkedinUrl: "",
    status: 1,
    photoFilePath: "",
    cvFilePath: "",
  });

  const [selectedRoles, setSelectedRoles] = useState<string[]>(["USER"]);
  const [error, setError] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleToggle = (role: string) => {
    setSelectedRoles((prev) => {
      if (prev.includes(role)) {
        // Don't allow deselecting if it's the only role
        // if (prev.length === 1) return prev;
        return prev.filter((r) => r !== role);
      }
      return [...prev, role];
    });
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: FileTypeEnum,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === FileTypeEnum.PROFILE_PHOTOS) {
        setPhotoFile(file);
        try {
          let formDataToUpload = new FormData();
          formDataToUpload.append("file", file);

          let fileUploadResponse = await fileService.uploadFile(
            type,
            formDataToUpload,
          );

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
          let formDataToUpload = new FormData();
          formDataToUpload.append("file", file);

          let fileUploadResponse = await fileService.uploadFile(
            type,
            formDataToUpload,
          );

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate required fields
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.password ||
      !formData.phone ||
      !formData.institution ||
      !formData.occupation ||
      !formData.country
    ) {
      setError("Please fill in all required fields");
      return;
    }

    createUserMutation.mutate(
      {
        ...formData,
        roles: selectedRoles,
      },
      {
        onSuccess: () => {
          navigate("/users");
        },
        onError: (error) => {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to create user";
          setError(errorMessage);
        },
      },
    );
  };

  return (
    <div>
      <Breadcrumb
        items={[{ label: "Users", href: "/users" }, { label: "New User" }]}
      />

      <div className="space-y-6">
        <div>
          <PageTitle title="Create New User" />
          <PageSubTitle text="Add a new user to the system" />
        </div>

        <div className="rounded-lg border border-border bg-card shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium">
                  First Name *
                </label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>

              <div className="flex flex-col space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium">
                  Last Name *
                </label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>

              <div className="flex flex-col space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email *
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="user@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="flex flex-col space-y-2">
                <label htmlFor="password" className="text-sm font-medium ">
                  Password *
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter a secure password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <div className="flex flex-col space-y-2">
                <label htmlFor="phone" className="text-sm font-medium ">
                  Phone *
                </label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+8801712345678"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="flex flex-col space-y-2">
                <label htmlFor="country" className="text-sm font-medium ">
                  Country *
                </label>
                <Input
                  id="country"
                  name="country"
                  type="text"
                  placeholder="Bangladesh"
                  value={formData.country}
                  onChange={handleChange}
                />
              </div>

              <div className="flex flex-col space-y-2">
                <label htmlFor="institution" className="text-sm font-medium ">
                  Institution *
                </label>
                <Input
                  id="institution"
                  name="institution"
                  type="text"
                  placeholder="University Name"
                  value={formData.institution}
                  onChange={handleChange}
                />
              </div>

              <div className="flex flex-col space-y-2">
                <label htmlFor="occupation" className="text-sm font-medium ">
                  Occupation *
                </label>
                <Input
                  id="occupation"
                  name="occupation"
                  type="text"
                  placeholder="Student"
                  value={formData.occupation}
                  onChange={handleChange}
                />
              </div>

              <div className="flex flex-col space-y-2">
                <label htmlFor="linkedinUrl" className="text-sm font-medium ">
                  LinkedIn URL
                </label>
                <Input
                  id="linkedinUrl"
                  name="linkedinUrl"
                  type="url"
                  placeholder="https://www.linkedin.com/in/yourprofile"
                  value={formData.linkedinUrl}
                  onChange={handleChange}
                />
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium ">Status *</label>
                <Select
                  value={formData.status.toString()}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, status: Number(value) }))
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

              <div className="flex flex-col space-y-3">
                <label className="text-sm text-muted-foreground">
                  Profile picture
                </label>
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
                    <p className="text-xs text-slate-500 mt-2">
                      Selected: {photoFile.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col space-y-3">
                <label className="text-sm text-muted-foreground">CV</label>
                <div>
                  <Input
                    id="cv"
                    name="cv"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileChange(e, FileTypeEnum.CVS)}
                    className="cursor-pointer"
                  />
                  {cvFile && (
                    <p className="text-xs text-slate-500 mt-2">
                      Selected: {cvFile.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-3">
              <label className="text-sm font-medium ">Select Roles</label>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="role-user"
                    checked={selectedRoles.includes("USER")}
                    onCheckedChange={() => handleRoleToggle("USER")}
                  />
                  <label
                    htmlFor="role-user"
                    className="text-sm  cursor-pointer"
                  >
                    User
                  </label>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="role-reviewer"
                    checked={selectedRoles.includes("REVIEWER")}
                    onCheckedChange={() => handleRoleToggle("REVIEWER")}
                  />
                  <label
                    htmlFor="role-reviewer"
                    className="text-sm  cursor-pointer"
                  >
                    Reviewer
                  </label>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Select at least one role for the user
              </p>
            </div>

            {error && (
              <div className="p-4 rounded-md text-sm border border-red-500/30 bg-red-500/10 text-red-800">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/users")}
                disabled={createUserMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={
                  createUserMutation.isPending ||
                  !formData.firstName.trim() ||
                  !formData.lastName.trim() ||
                  !formData.email.trim() ||
                  !formData.password.trim() ||
                  !formData.phone.trim() ||
                  !formData.institution.trim() ||
                  !formData.occupation.trim() ||
                  !formData.country.trim()
                }
              >
                {createUserMutation.isPending ? "Creating..." : "Create"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
