import { GetBlogResponse, GetBlogsInfiniteResponse, GetBlogsPaginationResponse, GetBlogsSearchResponse } from '@/types/blog';
import { createClient } from '@/utils/supabase/server';
import { PrismaClient } from '@prisma/client';
import { Hono } from 'hono';
import { v4 as uuidv4 } from 'uuid';
import { AuthenticationContext } from '../types/hono';

const blogRoute = new Hono();

blogRoute.post('/', async (c) => {
    const supabase = await createClient();
    const prisma = new PrismaClient();

    try {
        const body = await c.req.formData();

        const title = body.get('title') as string;
        const description = body.get('description') as string;
        const content = body.get('content') as string;
        const image = body.get('image') as File;

        const uuid = uuidv4();

        const fileExtension = image.name.split('.').pop();
        const fileName = `${uuid}.${fileExtension}`;
        const filePath = `${uuid}/${fileName}`;

        const fileBuffer = await image.arrayBuffer();

        const { error: storageError, data: storageData } = await supabase.storage.from('post').upload(filePath, fileBuffer);
        const { error: authError, data: authData } = await supabase.auth.getUser();

        if (storageError || authError) throw storageError || authError;

        if (storageData.fullPath && authData.user) {
            await prisma.post.create({
                data: {
                    id: uuid,
                    title: title,
                    description: description,
                    content: content,
                    view: 0,
                    imageUrl: `${process.env.SUPABASE_STORAGE_URL}${storageData.fullPath}`,
                    userId: authData.user.id,
                },
            });
        }

        return c.json({ message: 'Blog Created Successfully' }, 200);
    } catch (err) {
        return c.json(
            {
                errors: err instanceof Error ? err.message : 'Unknown Error',
                message: 'Server Internal Error',
            },
            500
        );
    } finally {
        await prisma.$disconnect();
    }
});

blogRoute.get('/', async (c) => {
    const supabase = await createClient();
    const prisma = new PrismaClient();

    try {
        const { error: authError, data: authData } = await supabase.auth.getUser();
        if (authError) throw authError;

        const cursor = c.req.query('cursor');
        const limit = 8;

        if (authData.user) {
            const posts = await prisma.post.findMany({
                take: limit + 1,
                cursor: cursor ? { id: cursor } : undefined,
                orderBy: { createdAt: 'desc' },
            });

            const nextCursor = posts.length > limit ? posts[limit].id : undefined;

            const response: GetBlogsInfiniteResponse = {
                message: 'Get All Posts Successfully',
                blogs: posts.slice(0, limit),
                nextCursor: nextCursor,
            };

            return c.json(response, 200);
        }
    } catch (error) {
        return c.json(
            {
                error: error instanceof Error ? error.message : 'Server Internal Error',
            },
            500
        );
    } finally {
        await prisma.$disconnect();
    }
});

blogRoute.get('/search', async (c) => {
    const supabase = await createClient();
    const prisma = new PrismaClient();

    try {
        const { error: authError, data: authData } = await supabase.auth.getUser();
        if (authError) throw authError;

        const searchQuery = c.req.query('search');
        const limit = 4;

        if (authData.user) {
            const posts = await prisma.post.findMany({
                where: {
                    title: {
                        contains: searchQuery,
                        mode: 'insensitive',
                    },
                },
                take: limit,
                orderBy: { createdAt: 'desc' },
            });

            const response: GetBlogsSearchResponse = {
                message: 'Get All Posts Successfully',
                blogs: posts,
            };

            return c.json(response, 200);
        }
    } catch (error) {
        return c.json(
            {
                error: error instanceof Error ? error.message : 'Server Internal Error',
            },
            500
        );
    } finally {
        await prisma.$disconnect();
    }
});

blogRoute.get('/me', async (c) => {
    const supabase = await createClient();
    const prisma = new PrismaClient();

    try {
        const { error: authError, data: authData } = await supabase.auth.getUser();
        if (authError) throw authError;

        const page = Number(c.req.query('page') ?? 1);
        const limit = 8;
        const skip = (page - 1) * limit;

        if (authData.user) {
            const [posts, total] = await Promise.all([
                prisma.post.findMany({
                    where: { userId: authData.user.id },
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                }),
                prisma.post.count({
                    where: { userId: authData.user.id },
                }),
            ]);

            const response: GetBlogsPaginationResponse = {
                message: 'Get User Posts Successfully',
                blogs: posts,
                page: page,
                limit: limit,
                total: total,
                totalPages: Math.ceil(total / limit),
            };

            return c.json(response, 200);
        }
    } catch (error) {
        return c.json(
            {
                error: error instanceof Error ? error.message : 'Server Internal Error',
            },
            500
        );
    } finally {
        await prisma.$disconnect();
    }
});

blogRoute.get('/:id', async (c) => {
    const id = c.req.param('id');

    const supabase = await createClient();
    const prisma = new PrismaClient();

    try {
        const { error: authError, data: authData } = await supabase.auth.getUser();
        if (authError) throw authError;

        if (authData.user) {
            const post = await prisma.post.findUnique({
                where: {
                    id: id,
                },
            });

            const response: GetBlogResponse = {
                message: 'Get User Post Successfully',
                blog: post!,
            };

            return c.json(response, 200);
        }
    } catch (error) {
        return c.json(
            {
                error: error instanceof Error ? error.message : 'Server Internal Error',
            },
            500
        );
    } finally {
        await prisma.$disconnect();
    }
});

blogRoute.get('/me/:id', async (c: AuthenticationContext) => {
    const user = c.get('user');
    const id = c.req.param('id');

    const prisma = new PrismaClient();

    try {
        if (user) {
            const post = await prisma.post.findUnique({
                where: { id: id, userId: user.id },
            });

            if (!post) return c.json({ message: 'Post Not Found' }, 404);
            const response: GetBlogResponse = { message: 'Get User Post Successfully', blog: post };

            return c.json(response, 200);
        }
    } catch (error) {
        return c.json({ error: error instanceof Error ? error.message : 'Server Internal Error' }, 500);
    } finally {
        await prisma.$disconnect();
    }
});

blogRoute.patch('/:id', async (c) => {
    const { id } = c.req.param();

    const supabase = await createClient();
    const prisma = new PrismaClient();

    try {
        const body = await c.req.formData();

        const title = body.get('title') as string;
        const description = body.get('description') as string;
        const content = body.get('content') as string;
        const oldImage = body.get('oldImage') as string;
        const newImage = body.get('newImage') as File;

        let fullPath;

        if (newImage) {
            const fileExtension = newImage.name.split('.').pop();
            const fileName = `${id}.${fileExtension}`;
            const timeStamp = new Date().toISOString();
            const filePath = `${id}/${fileName}-${timeStamp}`;

            const fileBuffer = await newImage.arrayBuffer();

            const { error: storageRemoveError, data: storageRemoveData } = await supabase.storage
                .from('post')
                .remove([oldImage.split('supabase.co/storage/v1/object/public/post/')[1]]);
            if (storageRemoveError) throw storageRemoveError;

            console.log(storageRemoveData);

            const { error: storageError, data: storageData } = await supabase.storage.from('post').upload(filePath, fileBuffer);
            if (storageError) throw storageError;

            fullPath = storageData.fullPath;
        }

        const { error: authError, data: authData } = await supabase.auth.getUser();
        if (authError) throw authError;

        if (authData.user) {
            await prisma.post.update({
                where: {
                    id: id,
                },
                data: {
                    title: title,
                    description: description,
                    content: content,
                    ...(fullPath && {
                        imageUrl: `${process.env.SUPABASE_STORAGE_URL}${fullPath}`,
                    }),
                },
            });
        }

        return c.json({ message: 'Blog Update Successfully' }, 200);
    } catch (err) {
        return c.json(
            {
                errors: err instanceof Error ? err.message : 'Unknown Error',
                message: 'Server Internal Error',
            },
            500
        );
    } finally {
        await prisma.$disconnect();
    }
});

blogRoute.delete('/:id', async (c) => {
    const { id } = c.req.param();

    const supabase = await createClient();
    const prisma = new PrismaClient();

    try {
        const { error: authError, data: authData } = await supabase.auth.getUser();
        if (authError) throw authError;

        if (authData.user) {
            const post = await prisma.post.findUnique({
                where: {
                    id: id,
                    userId: authData.user.id,
                },
            });

            if (post) {
                const { error: storageRemoveError, data: storageRemoveData } = await supabase.storage
                    .from('post')
                    .remove([post.imageUrl.split('supabase.co/storage/v1/object/public/post/')[1]]);
                if (storageRemoveError) throw storageRemoveError;

                console.log(storageRemoveData);

                await prisma.post.delete({
                    where: {
                        id: id,
                        userId: authData.user.id,
                    },
                });
            }

            return c.json({ message: 'Blog Delete Successfully' }, 200);
        }
    } catch (err) {
        console.log(err);
        return c.json(
            {
                errors: err instanceof Error ? err.message : 'Unknown Error',
                message: 'Server Internal Error',
            },
            500
        );
    } finally {
        await prisma.$disconnect();
    }
});

export default blogRoute;
