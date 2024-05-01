import { allBlogs } from "contentlayer/generated";
import { format } from "date-fns";
import Link from "next/link";

export default function Blogs() {
  allBlogs.map((blog) => blog.title);

  return (
    <main className="flex flex-col gap-20 max-w-2xl">
      <section className="flex flex-col gap-2">
        <h1 className="text-4xl lg:text-5xl font-bold mb-4">Blogs</h1>
        <p className="font-medium">
          Welcome to our AI-Powered Itinerary Generator Blog!
        </p>
        <p>
          Here, we delve into the fascinating world of travel planning enhanced
          by cutting-edge AI technology.
        </p>
        <p>
          Follow our blog to explore the magic behind personalized itineraries,
          insider tips, destination highlights, and travel stories. Let AI be
          your travel companion and embark on unforgettable adventures! Happy
          reading and happy travels!
        </p>
      </section>
      <section className="flex flex-col gap-8">
        {allBlogs.map((blog) => {
          return (
            <Link
              href={blog.url}
              key={blog._id}
              className="flex gap-8 flex-col sm:flex-row items-center md:items-start"
            >
              <div className="flex flex-col">
                <h2 className="text-xl font-medium overflow-hidden overflow-ellipsis line-clamp-2">
                  {blog.title}
                </h2>
                <p className="mb-1 text-gray-500 text-md">
                  {format(new Date(blog.date), "yyyy-MM-dd")}
                </p>
                <p className="overflow-hidden overflow-ellipsis line-clamp-3">
                  {blog.description}
                </p>
              </div>
            </Link>
          );
        })}
      </section>
    </main>
  );
}
