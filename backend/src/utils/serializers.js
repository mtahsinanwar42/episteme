export const serializeUser = (user, cvFilePath, photoFilePath) => {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    roles: user.roles,
    status: user.status,
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
