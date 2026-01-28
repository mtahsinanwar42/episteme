export const serializeUser = (user, cvFilePath, photoFilePath) => {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    roles: user.roles,
    status: user.status,
    statusUpdateNotes: user.statusUpdateNotes,
    institution: user.institution,
    occupation: user.occupation,
    country: user.country,
    cvFilePath: cvFilePath,
    photoFilePath: photoFilePath,
    linkedinUrl: user.linkedinUrl,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const serializeConference = (conference, metadataFilePath) => {
  return {
    id: conference.id,
    title: conference.title,
    slug: conference.slug,
    startAt: conference.startAt,
    endAt: conference.endAt,
    submissionPeriodStartAt: conference.submissionPeriodStartAt,
    submissionPeriodEndAt: conference.submissionPeriodEndAt,
    status: conference.status,
    metadataFilePath: metadataFilePath,
    createdAt: conference.createdAt,
    updatedAt: conference.updatedAt,
  };
};

export const serializeTraining = (training, metadataFilePath) => {
  return {
    id: training.id,
    title: training.title,
    status: training.status,
    metadataFilePath: metadataFilePath,
    createdAt: training.createdAt,
    updatedAt: training.updatedAt,
  };
};

export const serializeAnnouncement = (announcement, metadataFilePath) => {
  return {
    id: announcement.id,
    title: announcement.title,
    status: announcement.status,
    metadataFilePath: metadataFilePath,
    createdAt: announcement.createdAt,
    updatedAt: announcement.updatedAt,
  };
};

export const serializeBlog = (blog, metadataFilePath) => {
  return {
    id: blog.id,
    title: blog.title,
    status: blog.status,
    metadataFilePath: metadataFilePath,
    createdAt: blog.createdAt,
    updatedAt: blog.updatedAt,
  };
};

export const serializeActivity = (activity, metadataFilePath) => {
  return {
    id: activity.id,
    title: activity.title,
    status: activity.status,
    metadataFilePath: metadataFilePath,
    createdAt: activity.createdAt,
    updatedAt: activity.updatedAt,
  };
};

export const serializeContentSubmission = (submission, version, contentFilePath) => {
  return {
    id: submission.id,
    title: submission.title,
    topics: submission.topics,
    status: submission.currentStatus,
    createdAt: submission.createdAt,
    updatedAt: submission.updatedAt,
    version: {
      id: version.id,
      changeLog: version.changeLog,
      filePath: contentFilePath,
      createdAt: version.createdAt,
      versionNo: version.versionNo,
    }
  };
};

export const serializeFile = (file) => {
  return {
    id: file.id,
    name: file.name,
    size: file.size,
    mimeType: file.mimeType,
    storageKey: file.storageKey,
    createdAt: file.createdAt,
  }
};
