import { api } from "./api";

export interface ContactSupportRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const contactService = {
  sendContactSupport: async (data: ContactSupportRequest): Promise<void> => {
    return api.post<void>("/contact-support", data, false);
  },
};
