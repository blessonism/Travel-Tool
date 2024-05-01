import { NextResponse } from "next/server";
import { itineraries, createItineraries } from "@/app/schema";
import { db } from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const json = await req.json();

    const createInput = createItineraries.parse(json);

    const { insertedId } = await db.collection("itinerary").insertOne({
      ...createInput,
    });

    const result = itineraries.parse({
      id: insertedId.toString(),
      ...createInput,
    });

    return NextResponse.json({
      result,
      ok: true,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "something went wrong", ok: false },
      { status: 500 }
    );
  }
}
