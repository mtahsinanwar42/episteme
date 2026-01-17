import { useBlogs } from "@/hooks/useBlogs";

export default function Blogs() {
  const { data: blogs, isLoading, error } = useBlogs();

  if (isLoading) {
    return (
      <div className="p-8 text-center" style={{ color: "var(--color-text)" }}>
        Loading blogs...
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
    <div className="mx-auto p-6">
      <h1 className="text-4xl font-bold mb-6">Blogs</h1>
      <div>
        <table className="table-auto w-full mb-6 border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2">Title</th>
              <th className="border border-gray-300 px-4 py-2">Description</th>
              <th className="border border-gray-300 px-4 py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {blogs?.map((blog) => (
              <tr key={blog.id} className="border border-gray-300">
                <td className="border border-gray-300 px-4 py-2">
                  {blog.title}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {blog.body}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {" "}
                  By {blog?.author} on{" "}
                  {new Date(blog?.published_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
