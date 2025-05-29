import { BlogSchema } from '@/schemas/blog';

export type GetBlogsInfiniteResponse = {
    message: string;
    blogs: BlogSchema[];
    nextCursor?: string;
};

export type GetBlogsPaginationResponse = {
    message: string;
    blogs: BlogSchema[];
    page: number;
    limit: number;
    totalBlogs: number;
    totalPages: number;
};

export type GetBlogsSearchResponse = {
    message: string;
    blogs: BlogSchema[];
};

export type GetBlogResponse = {
    message: string;
    blog: BlogSchema;
};
