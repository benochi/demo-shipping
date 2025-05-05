import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { rateId } = await request.json()

  const res = await fetch("https://api.goshippo.com/transactions/", {
    method: "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `ShippoToken ${process.env.SHIPPO_API_TOKEN}`,
    },
    body: JSON.stringify({
      rate:            rateId,
      label_file_type: "PDF",
      async:           false
    }),
  })

  if (!res.ok) {
    return NextResponse.json({ error: `Shippo ${res.status}` }, { status: 502 })
  }

  const txn = await res.json()
  return NextResponse.json({
    labelUrl:       txn.label_url,
    trackingNumber: txn.tracking_number
  })
}
