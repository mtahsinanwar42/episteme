import { useUsers } from "@/hooks/useUsers";
import type { User } from "@/models/user";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

const columns: ColumnDef<User>[] = [
  {
    id: "serial",
    header: "SL",
    cell: ({ row }) => <span className="text-sm">{row.index + 1}</span>,
  },
  {
    accessorKey: "firstName",
    header: "First Name",
    cell: ({ row }) => {
      const firstName = row.getValue("firstName") as string;
      return <span className="font-medium">{firstName}</span>;
    },
  },
  {
    accessorKey: "lastName",
    header: "Last Name",
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <span className="text-sm">{row.getValue("email")}</span>,
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => <span className="text-sm">{row.getValue("phone")}</span>,
  },
  {
    accessorKey: "roles",
    header: "Roles",
    cell: ({ row }) => {
      const roles = row.getValue("roles") as string[];
      return (
        <div className="flex gap-1 flex-wrap">
          {roles?.map((role) => (
            <Badge key={role} variant="outline" className="text-xs">
              {role}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as number;
      return (
        <Badge
          variant={status === 1 ? "default" : "destructive"}
          className="text-xs"
        >
          {status === 1 ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
];

export default function Users() {
  const { data: response, isLoading, error } = useUsers();
  const users = response?.data || [];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1
          className="text-4xl font-bold mb-2"
          style={{ color: "var(--color-primary)" }}
        >
          Users
        </h1>
        <p className="text-slate-600">View and manage all registered users</p>
      </div>
      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        error={error ? (error as Error).message : null}
        pageSize={10}
      />
    </div>
  );
}
