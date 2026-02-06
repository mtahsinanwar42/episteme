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
import { useCountries, useCreateUserMutation } from "@/hooks/useUsers";
import { UserStatus } from "@/models/user";
import { FileTypeEnum } from "@/models/file";
import { fileService } from "@/services/fileService";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import PageSubTitle from "@/components/common/PageSubTitle";
import PageTitle from "@/components/common/PageTitle";
import { LoadingOverlay } from "@/components/common/LoadingOverlay";
import { FileUploadField } from "@/components/common/FileUploadField";
import { useSuccessToast } from "@/hooks/useSuccessToast";
import {
  getPasswordStrength,
  PasswordInput,
} from "@/components/common/PasswordInput";
import { SearchableSelect } from "@/components/ui/searchable-select";

export default function NewUser() {
  const navigate = useNavigate();
  const createUserMutation = useCreateUserMutation();
  const { showSuccessToast } = useSuccessToast();

  const { data: countriesData } = useCountries();

  const EMAIL_REGEX =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
  const PHONE_REGEX = /^\+?[0-9][0-9\-\s]{6,20}$/;
  const LINKEDIN_REGEX =
    /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    institution: "",
    occupation: "",
    country: "Bangladesh",
    linkedinUrl: "",
    status: 1,
    photoFilePath: "",
    cvFilePath: "",
  });

  const [selectedRoles, setSelectedRoles] = useState<string[]>(["USER"]);
  const [error, setError] = useState("");
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

  const isEmailValid = EMAIL_REGEX.test(formData.email);
  const isPhoneValid = !formData.phone || PHONE_REGEX.test(formData.phone);
  const isLinkedinValid =
    !formData.linkedinUrl || LINKEDIN_REGEX.test(formData.linkedinUrl);
  const passwordStrength = getPasswordStrength(formData.password);
  const isPasswordStrong = passwordStrength.score >= 4;
  const doPasswordsMatch =
    formData.confirmPassword !== "" &&
    formData.password === formData.confirmPassword;

  const isFormValid =
    formData.firstName.trim() !== "" &&
    formData.lastName.trim() !== "" &&
    formData.email.trim() !== "" &&
    isEmailValid &&
    formData.password !== "" &&
    isPasswordStrong &&
    formData.confirmPassword !== "" &&
    doPasswordsMatch &&
    isPhoneValid &&
    isLinkedinValid &&
    formData.country !== "" &&
    formData.institution.trim() !== "" &&
    formData.occupation.trim() !== "" &&
    selectedRoles.length > 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleToggle = (role: string) => {
    setSelectedRoles((prev) => {
      if (prev.includes(role)) {
        return prev.filter((r) => r !== role);
      }
      if (role === "ADMIN") {
        return ["ADMIN"];
      }
      return [...prev.filter((r) => r !== "ADMIN"), role];
    });
  };

  const handleFileSelect = async (
    file: File | null,
    type: FileTypeEnum,
  ) => {
    if (!file) return;
    if (type === FileTypeEnum.PROFILE_PHOTOS) {
      setPhotoFile(file);
      try {
        const formDataToUpload = new FormData();
        formDataToUpload.append("file", file);

        const fileUploadResponse = await fileService.uploadFile(
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
      const formDataToUpload = new FormData();
      formDataToUpload.append("file", file);

      const fileUploadResponse = await fileService.uploadFile(
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setError("");

    const { confirmPassword: _, ...submitData } = formData;

    createUserMutation.mutate(
      {
        ...submitData,
        roles: selectedRoles,
      },
      {
        onSuccess: () => {
          showSuccessToast("User created successfully.");
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

        <div className="relative rounded-lg border border-border bg-card shadow-md p-6">
          <LoadingOverlay visible={createUserMutation.isPending} />
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
            </div>

            <div className="flex flex-col space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email *
              </label>
              <Input
                id="email"
                name="email"
                type="text"
                placeholder="user@example.com"
                value={formData.email}
                onChange={handleChange}
              />
              {formData.email && !isEmailValid && (
                <p className="text-red-400 text-xs">
                  Please enter a valid email address.
                </p>
              )}
            </div>

            <PasswordInput
              value={formData.password}
              onChange={handleChange}
              disabled={createUserMutation.isPending}
            />

            <div className="flex flex-col space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password *
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={createUserMutation.isPending}
              />
              {formData.confirmPassword && !doPasswordsMatch && (
                <p className="text-red-400 text-xs">Passwords do not match.</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  Phone
                </label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+8801712345678"
                  value={formData.phone}
                  onChange={handleChange}
                />
                {formData.phone && !isPhoneValid && (
                  <p className="text-red-400 text-xs">
                    Please enter a valid phone number.
                  </p>
                )}
              </div>

              <div className="flex flex-col space-y-2">
                <label htmlFor="country" className="text-sm font-medium">
                  Country *
                </label>
                <SearchableSelect
                  value={formData.country}
                  onValueChange={(value) => {
                    setFormData((prev) => ({ ...prev, country: value }));
                  }}
                  options={countriesData?.data || []}
                  placeholder="Select a country"
                  disabled={createUserMutation.isPending}
                />
              </div>

              <div className="flex flex-col space-y-2">
                <label htmlFor="institution" className="text-sm font-medium">
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
                <label htmlFor="occupation" className="text-sm font-medium">
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
                <label htmlFor="linkedinUrl" className="text-sm font-medium">
                  LinkedIn URL
                </label>
                <Input
                  id="linkedinUrl"
                  name="linkedinUrl"
                  type="text"
                  placeholder="https://www.linkedin.com/in/yourprofile"
                  value={formData.linkedinUrl}
                  onChange={handleChange}
                />
                {formData.linkedinUrl && !isLinkedinValid && (
                  <p className="text-red-400 text-xs">
                    Please enter a valid LinkedIn URL.
                  </p>
                )}
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium">Status *</label>
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
                  </SelectContent>
                </Select>
              </div>

              <FileUploadField
                label="Profile picture"
                selectedFile={photoFile}
                onFileSelect={(file) =>
                  handleFileSelect(file, FileTypeEnum.PROFILE_PHOTOS)
                }
                accept="image/*"
                disabled={createUserMutation.isPending}
                helperText="Upload a profile photo (JPG, PNG)"
                uploadedFile={uploadedPhotoFile}
                maxNameLength={40}
              />

              <FileUploadField
                label="CV"
                selectedFile={cvFile}
                onFileSelect={(file) =>
                  handleFileSelect(file, FileTypeEnum.CVS)
                }
                accept=".pdf,.doc,.docx"
                disabled={createUserMutation.isPending}
                helperText="Upload a CV (PDF, DOC, DOCX)"
                uploadedFile={uploadedCvFile}
                maxNameLength={40}
              />
            </div>

            <div className="flex flex-col space-y-3">
              <label className="text-sm font-medium">Select Roles *</label>
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
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="role-admin"
                    checked={selectedRoles.includes("ADMIN")}
                    onCheckedChange={() => handleRoleToggle("ADMIN")}
                  />
                  <label
                    htmlFor="role-admin"
                    className="text-sm  cursor-pointer"
                  >
                    Admin
                  </label>
                </div>
              </div>
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
                disabled={!isFormValid || createUserMutation.isPending}
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
