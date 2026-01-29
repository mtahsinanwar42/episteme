import ErrorResponse from "../utils/ErrorResponse.js";
import { BLOG_STATUS } from "../utils/constants.js";
import { serializeBlog } from "../utils/serializers.js";
import { isEmpty, isNotEmpty } from "../utils/string.js";

export function createBlogService({ Blog, fileService }) {
  if (!Blog) {
    throw new Error("createBlogService requires { Blog } model");
  }

  if (!fileService) {
    throw new Error("createBlogService requires { fileService }");
  }

  async function getBlogById(id) {
    const blog = await Blog.findByPk(id);

    if (!blog) {
      throw new ErrorResponse(404, "Blog not found");
    }

    const metadataFilePath = await fileService.getFilePathById(blog.metadataFileId);
    return serializeBlog(blog, metadataFilePath);
  }

  async function createBlog(payload) {
    const { title, metadataFilePath, status } = payload;

    if (isEmpty(title) || isEmpty(metadataFilePath)) {
      throw new ErrorResponse(400, "Please provide a title and a metadataFilePath");
    }

    if (!Object.values(BLOG_STATUS).includes(status)) {
      throw new ErrorResponse(400, "Invalid blog status");
    }

    const metadataFileId = await fileService.getFileIdByPath(metadataFilePath, { fieldName: "metadataFilePath" });

    const [blog] = await Blog.bulkCreate([{
      title,
      metadataFileId,
      status,
    }], { individualHooks: true, returning: true });

    return serializeBlog(blog, metadataFilePath);
  }

  async function updateBlogById(id, payload) {
    const { title, metadataFilePath, status } = payload;

    const blog = await Blog.findByPk(id);
    if (!blog) {
      throw new ErrorResponse(404, "Blog not found");
    }

    if (blog.status === BLOG_STATUS.DELETED) {
      throw new ErrorResponse(400, "Cannot update DELETED resource");
    }

    const updates = {};

    if (isNotEmpty(title)) {
      updates.title = title;
    }

    if (Number.isInteger(status)) {
      if (!Object.values(BLOG_STATUS).includes(status)) {
        throw new ErrorResponse(400, "Invalid blog status");
      }

      updates.status = status;
    }

    if (isNotEmpty(metadataFilePath)) {
      const metadataFileId = await fileService.getFileIdByPath(metadataFilePath, { fieldName: "metadataFilePath" });
      updates.metadataFileId = metadataFileId;
    }

    await blog.update(updates);

    return serializeBlog(blog, metadataFilePath);
  }

  return {
    getBlogById,
    createBlog,
    updateBlogById,
  };
}
