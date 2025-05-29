'use client';

import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { LoadingSpinner } from '../ui/loading-spinner';
import { GetBlogResponse } from '@/types/blog';

export const BlogPrivate = () => {
    const { id } = useParams();
    const router = useRouter();

    const {
        data: res,
        isLoading,
        isError,
        error,
    } = useQuery<GetBlogResponse>({
        queryKey: [id],
        queryFn: async () => {
            const response = await fetch(`/api/blogs/me/${id}`, { method: 'GET' });
            const result = await response.json();

            if (response.status === 404) router.replace('/');
            if (!response.ok) throw new Error(result.error);

            return result;
        },
    });

    return (
        <div>
            {isLoading && <LoadingSpinner />}
            {isError && <p>Something Went Wrong: {error.message}</p>}

            {res && res.blog && (
                <div className="mx-0 mt-10 flex flex-col gap-4 sm:mx-0 md:mx-10 lg:mx-20 xl:mx-30">
                    <h1 className="text-3xl">{res.blog.title}</h1>
                    <h3 className="text-muted-foreground text-xl">{res.blog.description}</h3>
                    <div className="relative h-[20rem] w-full">
                        <Image
                            src={res.blog.imageUrl}
                            alt={res.blog.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            priority
                            quality={50}
                            className="rounded-xl object-cover"
                        />
                    </div>
                    <div className="prose prose-slate">
                        <div dangerouslySetInnerHTML={{ __html: res.blog.content }} />
                    </div>
                </div>
            )}
        </div>
    );
};
