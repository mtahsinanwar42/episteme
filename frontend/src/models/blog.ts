export interface Blog {
  userId: number;
  id: number;
  title: string;
  body: string;
  author?: string;
  published_at?: string | number | Date | any;
}
