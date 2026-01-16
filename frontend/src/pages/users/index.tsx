import { useUsers } from "@/hooks/useUsers";
import { Link } from "react-router-dom";

function Users() {
  const { data: users, isLoading, error } = useUsers();

  if (isLoading) {
    return (
      <div className="p-8 text-center" style={{ color: "var(--color-text)" }}>
        Loading users...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        Error: {(error as Error).message}
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1
        className="text-4xl font-bold mb-6"
        style={{ color: "var(--color-primary)" }}
      >
        Users
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users?.map((user) => (
          <Link
            key={user.id}
            to={`/users/${user.id}`}
            className="p-4 rounded shadow hover:shadow-lg transition"
            style={{
              backgroundColor: "var(--color-background)",
              color: "var(--color-text)",
              border: "1px solid var(--color-primary)",
            }}
          >
            <h2 className="text-xl font-bold mb-2">{user.name}</h2>
            <p className="text-sm">{user.email}</p>
            <p className="text-sm">{user.phone}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Users;
