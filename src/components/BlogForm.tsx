'use client';

import { type BlogSchema } from '@/schemas/blog';
import Image from 'next/image';
import { type FieldValues, Path, UseFormReturn } from 'react-hook-form';
import Tiptap from './RichTextEditor/Tiptap';
import { Button } from './ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';

type BlogFormUpdateProps<T extends FieldValues> = {
    isEdit?: boolean;
    blog?: BlogSchema;
    form: UseFormReturn<T>;
    onSubmit: (form: T) => void;
    isPending: boolean;
};

const BlogForm = <T extends FieldValues>({ isEdit = false, blog, form, onSubmit, isPending }: BlogFormUpdateProps<T>) => {
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit((form) => onSubmit(form))} className="flex flex-col gap-y-2">
                <FormField
                    control={form.control}
                    name={'image' as Path<T>}
                    render={({ field: { value, onChange, ...fieldProps } }) => (
                        <FormItem>
                            <FormControl>
                                <div className="flex flex-col gap-2">
                                    {value ? (
                                        <div className="relative w-full h-[13rem]">
                                            <Image
                                                src={URL.createObjectURL(value)}
                                                alt={value.name}
                                                fill
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                priority
                                                quality={50}
                                                className="object-cover rounded-xl"
                                            />
                                        </div>
                                    ) : (
                                        isEdit &&
                                        blog && (
                                            <div className="relative w-full h-[13rem]">
                                                <Image
                                                    src={blog.imageUrl}
                                                    alt={blog.title}
                                                    fill
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                    priority
                                                    quality={50}
                                                    className="object-cover rounded-xl"
                                                />
                                            </div>
                                        )
                                    )}
                                    <Input type="file" className="h-[40px]" {...fieldProps} onChange={(e) => onChange(e.target.files?.[0])} />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name={'title' as Path<T>}
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Input placeholder="Your Blog Title" {...field} className="h-[40px]" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name={'description' as Path<T>}
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Textarea placeholder="Type Your Description Blog Here" {...field} className="h-[100px]" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name={'content' as Path<T>}
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Tiptap onChange={field.onChange} content={field.value} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button className="size-lg" disabled={isPending}>
                    {isEdit ? 'Update Blog' : 'Create Blog'}
                </Button>
            </form>
        </Form>
    );
};

export default BlogForm;
