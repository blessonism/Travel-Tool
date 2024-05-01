import { format } from "date-fns";
import { notFound } from "next/navigation";
import { allBlogs } from "contentlayer/generated";

import { Metadata } from "next";
import Link from "next/link";

interface BlogProps {
  params: {
    slug: string;
  };
}

async function getBlogFromParams(params: BlogProps["params"]) {
  const blog = allBlogs.find((blog) => blog.slug === params.slug);

  if (!blog) {
    null;
  }

  return blog;
}

export async function generateMetadata({
  params,
}: BlogProps): Promise<Metadata> {
  const blog = await getBlogFromParams(params);

  if (!blog) {
    return {};
  }

  return {
    title: blog.title,
    description: blog.description,
  };
}

export default async function Blog({ params }: BlogProps) {
  const blog = await getBlogFromParams(params);

  if (!blog) {
    notFound();
  }

  return (
    <main className="flex flex-col gap-12">
      <article className="flex flex-col gap-4 max-w-2xl">
        <h1 className="text-4xl font-bold">{blog.title}</h1>
        <p className="text-lg">{blog.description}</p>
        <p className="text-md text-gray-500">
          {format(new Date(blog.date), "yyyy-MM-dd")}
        </p>
        <hr className="my-4 border w-full border-gray-200 mx-auto" />
        <div
          className="flex flex-col gap-4"
          dangerouslySetInnerHTML={{ __html: blog?.body.html }}
        ></div>
      </article>
      <div className="flex flex-col gap-4 items-start">
        <p>
          Generate an itinerary for your upcoming trip, completely for free!
        </p>
        <Link
          href="/"
          className="px-6 py-2 bg-indigo-500 text-white rounded font-medium"
        >
          Try now!
        </Link>
      </div>
    </main>
  );
}
