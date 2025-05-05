// app/api/shipping/rates/route.ts
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  // dynamically load the CJS Shippo factory
  const { default: shippoFactory } = await import("shippo")
  const shippo = shippoFactory({
    apiKeyHeader: process.env.SHIPPO_API_TOKEN!
  })

  const { from, to, parcel } = await request.json()
  const shipment = await shippo.shipments.create({
    address_from:   from,
    address_to:     to,
    parcels:        [parcel],
    object_purpose: "QUOTE",
  })

  return NextResponse.json(shipment.rates)
}
