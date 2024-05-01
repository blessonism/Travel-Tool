import Image from "next/image";
import Link from "next/link";

type RedirectProps = {
  searchParams: {
    itineraryId: string;
  };
};

export default function Redirect({ searchParams }: RedirectProps) {
  return (
    <main className="flex flex-col gap-12 max-w-3xl">
      <div className="flex flex-col gap-8">
        <h1 className="text-4xl lg:text-5xl font-bold">
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-blue-500 to-indigo-500">
            Thank You{" "}
          </span>
          for your Purchase!
        </h1>
        <div className="max-w-md flex flex-col gap-4">
          <h2 className="text-lg font-bold">You will receive an email</h2>
          <p>
            Once your payment has been processesed, you will receive an email.
            After which you can access your Itinerary at any time on the
            following link
          </p>
          <Link
            href={`itinerary/${searchParams.itineraryId}`}
            className="text-indigo-700 font-medium overflow-ellipsis whitespace-nowrap overflow-hidden"
          >
            {process.env.URL}/itinerary/{searchParams.itineraryId}
          </Link>
          <p className="font-medium">
            You can then share this link with your travel companions and import
            it to your calendar at any time!
          </p>
        </div>
      </div>
      <div className="flex justify-end">
        <Image
          src="/success.svg"
          alt="success"
          width={400}
          height={400}
          priority
        />
      </div>
    </main>
  );
}
