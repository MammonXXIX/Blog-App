'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useDebounce } from '@/utils/UseDebounce';
import { useQuery } from '@tanstack/react-query';
import { BlogSchema } from '@/schemas/blog';
import { BlogSearchCardPublic } from './Cards/BlogSearchCardPublic';
import { GetBlogsSearchResponse } from '@/types/blog';
import { LoadingSpinner } from './ui/loading-spinner';

export const BlogSearch = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const debounceSearchTerm = useDebounce(searchTerm, 500);

    const {
        data: res,
        isLoading,
        isError,
        error,
    } = useQuery<GetBlogsSearchResponse>({
        queryKey: ['blogs', 'search', debounceSearchTerm],
        queryFn: async () => {
            const response = await fetch(`/api/blogs/search?search=${debounceSearchTerm}&limit=6`, { method: 'GET' });
            const result = await response.json();

            if (!response.ok) throw new Error(result.error);

            return result;
        },
        enabled: !!debounceSearchTerm,
    });

    return (
        <div className="relative mb-4 flex flex-col">
            <div className="flex">
                <Input
                    type="text"
                    placeholder="Search Blog ..."
                    className="rounded-r-none"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                    }}
                />
                <Button className="rounded-l-none" onClick={() => setSearchTerm('')}>
                    Clear
                </Button>
            </div>

            {isLoading && (
                <div className="bg-primary-foreground absolute top-full right-0 left-0 z-50 mt-2 h-[20rem] rounded p-2">
                    <LoadingSpinner />
                </div>
            )}
            {isError && (
                <div className="bg-primary-foreground absolute top-full right-0 left-0 z-50 mt-2 rounded p-2">
                    Something Went Wrong: {error.message}
                </div>
            )}
            {res && res.blogs.length === 0 && !isLoading && !isError && (
                <div className="bg-primary-foreground absolute top-full right-0 left-0 z-50 mt-2 rounded p-2">No Blogs Found</div>
            )}

            {res && res.blogs && res.blogs.length > 0 && (
                <div className="bg-primary-foreground absolute top-full right-0 left-0 z-50 mt-2 rounded p-2">
                    {res.blogs.map((blog: BlogSchema, index) => (
                        <BlogSearchCardPublic key={index} {...blog} isPriority={true} />
                    ))}
                </div>
            )}
        </div>
    );
};
