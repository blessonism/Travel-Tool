import Image from "next/image";
import Link from "next/link";

export default function Page() {
  return (
    <main className="flex flex-col gap-6 max-w-2xl">
      <section className="flex flex-col gap-4  items-start">
        <h1 className="text-4xl lg:text-5xl font-bold">About us</h1>
        <p className="font-medium">Welcome to Travel Ai Tool!</p>
        <p>
          We are passionate about crafting extraordinary travel experiences
          tailored specifically for you. With AI-powered planning, we offer
          personalized itineraries, ensuring you a unique journey.
        </p>
        <p>
          Tell us your destination, travel dates, and interests, and our AI will
          create a comprehensive itinerary just for you. Adventure seeker or
          culture enthusiast, we have got you covered.
        </p>
        <p>
          Start exploring with Travel Ai Tool and let us bring your dream
          journey to life.
        </p>
        <p>Happy travels!</p>
        <Link
          href="/"
          className="px-6 py-2 bg-indigo-500 text-white rounded font-medium"
        >
          Try now!
        </Link>
      </section>
      <section>
        <Image
          src="/traveling.svg"
          alt="traveling"
          width={700}
          height={700}
          priority
        ></Image>
      </section>
    </main>
  );
}
