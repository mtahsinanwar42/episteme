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
