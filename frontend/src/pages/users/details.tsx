import { useParams, useNavigate } from "react-router-dom";
import { useUserById } from "@/hooks/useUsers";
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
  ArrowLeft,
  User as UserIcon,
  Shield,
} from "lucide-react";
import { UserStatus } from "@/models/user";

export default function UserDetails() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useUserById(userId);

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
    // if (status === 1) {
    //   return <Badge variant="default">Active</Badge>;
    // }
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
          <div className="rounded-lg shadow-small p-4">
            <div className="flex gap-4 relative z-0">
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
                <h2 className="text-2xl text-accent font-bold">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-sm text-slate-600">ID: {user.id}</p>
                <div className="flex flex-wrap gap-2">
                  {user.roles.map((role) => (
                    <Badge key={role} variant="outline" className="gap-1">
                      {role}
                    </Badge>
                  ))}
                </div>
                <div className="absolute top-0 right-0 z-10">
                  {getStatusBadge(user.status)}
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-4">
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
              {user.cvFilePath && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
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
            <div className="p-4 bg-accent/5 shadow-sm">
              <h3 className="text-accent text-lg font-semibold">Information</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-accent mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-accent mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">
                      {user.phone || "Not provided"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-accent mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Institution</p>
                    <p className="font-medium">
                      {user.institution || "Not provided"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Briefcase className="w-5 h-5 text-accent mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Occupation</p>
                    <p className="font-medium">
                      {user.occupation || "Not provided"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-accent mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Country</p>
                    <p className="font-medium">
                      {user.country || "Not provided"}
                    </p>
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
