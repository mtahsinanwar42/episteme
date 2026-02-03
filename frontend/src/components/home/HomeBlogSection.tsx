import { useBlogs } from "@/hooks/useBlogs";
import type { Blog } from "@/models/blog";
import { config } from "@/config/config";
import { useMetadataFile } from "@/hooks/useMetadataFiles";
import { Link } from "react-router-dom";

export default function HomeBlogSection() {
  const { data: response, isLoading } = useBlogs({
    limit: 3,
    sort: "-createdAt",
  });

  const blogs = response?.data || [];

  if (isLoading) {
    return (
      <section className="mb-20">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Latest from Our Blog
            </h2>
            <p className="text-xl text-foreground/80">
              Insights, updates, and stories from the world of open science
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-gray-200 dark:bg-gray-700 rounded-xl h-96 animate-pulse"
            ></div>
          ))}
        </div>
      </section>
    );
  }

  if (blogs.length === 0) {
    return (
      <section className="mb-20">
        <div className="text-center py-12">
          <p className="text-xl text-foreground/80">
            No blogs available at the moment.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-20">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Latest from Our Blog
          </h2>
          <p className="text-xl text-foreground/80">
            Insights, updates, and stories from the world of open science
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {blogs.map((blog) => (
          <BlogCard key={blog.id} blog={blog} />
        ))}
      </div>

      {/* See More Button */}
      <div className="text-center">
        <Link
          to="/blogs"
          className="inline-block bg-linear-to-r from-purple-600 to-pink-500 text-white px-8 py-4 rounded-lg font-semibold hover:shadow-lg transition-all"
        >
          See All Blogs
        </Link>
      </div>
    </section>
  );
}

interface BlogCardProps {
  blog: Blog;
}

function BlogCard({ blog }: BlogCardProps) {
  const { data: metadata, isLoading } = useMetadataFile({
    filePath: blog.metadataFilePath || "",
    resourceId: blog.id,
  });

  const imageUrl = metadata?.heroImagePath
    ? `${new URL(config.baseUrl).origin}/${metadata.heroImagePath}`
    : null;

  return (
    <article className="gradient-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-gray-700 group">
      {/* Image */}
      <div className="relative h-48 overflow-hidden gradient-card">
        {!isLoading && imageUrl ? (
          <img
            src={imageUrl}
            alt={blog.title}
            crossOrigin="anonymous"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            📝
          </div>
        )}
        <div className="absolute top-4 left-4">
          <span className="gradient-card text-foreground px-3 py-1 rounded-full text-xs font-semibold">
            Blog
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="h-48 p-6 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-bold mb-3 line-clamp-2 transition-colors">
            {blog.title}
          </h3>

          {/* Meta */}
          <div className="text-sm text-foreground/80 mb-4">
            {new Date(blog.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        <Link
          to={`/blogs/${blog.id}`}
          className="text-foreground/80 font-semibold hover:underline inline-flex items-center gap-1"
        >
          Read More
          <span>→</span>
        </Link>
      </div>
    </article>
  );
}
