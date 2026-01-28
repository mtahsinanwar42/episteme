import { useEffect, useState } from "react";
import { blogService } from "@/services/blogService";
import type { Blog } from "@/models/blog";

export default function HomeBlogSection() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await blogService.getBlogs({
          limit: 3,
          sort: "-createdAt",
        });
        setBlogs(response.data || []);
      } catch (error) {
        console.error("Failed to fetch blogs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <section className="mb-20">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Latest from Our Blog
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
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
          <p className="text-xl text-gray-600 dark:text-gray-300">
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
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Insights, updates, and stories from the world of open science
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {blogs.map((blog) => (
          <article
            key={blog.id}
            className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700 group"
          >
            {/* Image */}
            <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-900">
              <div className="w-full h-full flex items-center justify-center text-6xl">
                📝
              </div>
              <div className="absolute top-4 left-4">
                <span className="bg-slate-800 dark:bg-slate-700 text-white px-3 py-1 rounded-full text-xs font-semibold">
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
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {new Date(blog.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>

              <a
                href={`/blogs/${blog.id}`}
                className="text-gray-900 dark:text-gray-100 font-semibold hover:underline inline-flex items-center gap-1"
              >
                Read More
                <span>→</span>
              </a>
            </div>
          </article>
        ))}
      </div>

      {/* See More Button */}
      <div className="text-center">
        <a
          href="/blogs"
          className="inline-block bg-linear-to-r from-purple-600 to-pink-500 text-white px-8 py-4 rounded-lg font-semibold hover:shadow-lg transition-all"
        >
          See All Blogs
        </a>
      </div>
    </section>
  );
}
