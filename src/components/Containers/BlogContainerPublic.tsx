'use client';

import { BlogSchema } from '@/schemas/blog';
import { useInfiniteQuery } from '@tanstack/react-query';
import { BlogCardPublic } from '../Cards/BlogCardPublic';
import BlogCardLoading from '../Loading/BlogCardLoading';
import InfiniteScrollContainer from './InfiniteScrollContainer';
import { GetBlogsInfiniteResponse } from '@/types/blog';

const BlogContainerPublic = () => {
    const {
        data: res,
        isPending,
        isFetching,
        isError,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery<GetBlogsInfiniteResponse>({
        queryKey: ['blogs'],
        queryFn: async ({ pageParam }) => {
            const response = await fetch(`/api/blogs?${pageParam ? `cursor=${pageParam}` : ''}&limit=4`, { method: 'GET' });
            const result = await response.json();

            if (!response.ok) throw new Error(result.error);

            return result;
        },
        initialPageParam: undefined,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
    });

    const blogs = res && res.pages.flatMap((page) => page.blogs);

    return (
        <div>
            {isPending && <BlogCardLoading length={8} />}
            {blogs && blogs.length === 0 && !isPending && !isError && <p>No Blogs Found.</p>}

            {blogs && blogs.length > 0 && (
                <InfiniteScrollContainer
                    onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
                    className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                >
                    {blogs.map((post: BlogSchema, index: number) => {
                        return <BlogCardPublic key={post.id} {...post} isPriority={index < 4} />;
                    })}
                </InfiniteScrollContainer>
            )}

            {isFetchingNextPage && <BlogCardLoading length={8} />}
            {isError && <p>Something Went Wrong: {error.message}</p>}
        </div>
    );
};

export default BlogContainerPublic;
