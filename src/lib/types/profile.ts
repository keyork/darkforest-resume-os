export interface Contact {
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  github?: string;
}

export interface Profile {
  id: string;
  name: string;
  title: string;
  summary: string;
  contact: Contact;
  createdAt: string;
  updatedAt: string;
}
