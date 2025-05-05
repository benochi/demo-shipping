import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { from, to, parcel } = await request.json()

  const res = await fetch("https://api.goshippo.com/shipments/", {
    method: "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `ShippoToken ${process.env.SHIPPO_API_TOKEN}`,
    },
    body: JSON.stringify({
      address_from:   from,
      address_to:     to,
      parcels:        [parcel],
      object_purpose: "QUOTE",
    }),
  })

  if (!res.ok) {
    return NextResponse.json(
      { error: `Shippo error ${res.status}` },
      { status: 502 }
    )
  }

  const shipment = await res.json()
  return NextResponse.json(shipment.rates)
}