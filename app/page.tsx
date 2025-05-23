"use client"

import { useState } from "react"
import Image from "next/image"

type Address = {
  name: string
  street1: string
  city: string
  state: string
  zip: string
  country: string
}
type Parcel = {
  length: string
  width: string
  height: string
  distance_unit: string
  weight: string
  mass_unit: string
}
type Rate = {
  object_id: string
  amount_local: string
  currency_local: string
  provider_image_75: string
  provider: string
  servicelevel: { name: string }
  estimated_days?: number
  duration_terms: string
  attributes: string[]
}

function LabelModal({
  url,
  tracking,
  onClose,
}: {
  url: string
  tracking: string
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl text-black">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Shipping Label</h2>
          <button onClick={onClose} className="text-black">Close</button>
        </div>
        <p className="mb-4 font-medium">Tracking #: {tracking}</p>
        <iframe
          src={url}
          className="w-full h-64 border"
          title="Shipping Label"
        />
      </div>
    </div>
  )
}

export default function Home() {
  const emptyAddr = { name: "", street1: "", city: "", state: "", zip: "", country: "US" }
  const defaultTo = {
    name: "Bilbo Baggins",
    street1: "9400 Ralston rd",
    city: "Arvada",
    state: "CO",
    zip: "80002",
    country: "US",
  }
  const defaultParcel = { length: "12", width: "12", height: "5", distance_unit: "in", weight: "5", mass_unit: "lb" }

  const [from, setFrom]               = useState<Address>(emptyAddr)
  const [to, setTo]                   = useState<Address>(defaultTo)
  const [parcel, setParcel]           = useState<Parcel>(defaultParcel)
  const [reqJson, setReqJson]         = useState("")
  const [resJson, setResJson]         = useState("")
  const [rates, setRates]             = useState<Rate[]>([])
  const [selectedRateId, setSelectedRateId] = useState<string | null>(null)
  const [labelReqJson, setLabelReqJson]     = useState("")
  const [labelResJson, setLabelResJson]     = useState("")
  const [labelUrl, setLabelUrl]             = useState<string | null>(null)
  const [trackingNumber, setTrackingNumber] = useState<string | null>(null)
  const [showModal, setShowModal]           = useState(false)

  async function getRates() {
    const body = { from, to, parcel }
    setReqJson(JSON.stringify(body, null, 2))
    const res = await fetch("/api/shipping/getRates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const data: Rate[] = await res.json()
    setResJson(JSON.stringify(data, null, 2))
    setRates(data)
    setSelectedRateId(null)
    setLabelReqJson("")
    setLabelResJson("")
    setLabelUrl(null)
    setTrackingNumber(null)
    setShowModal(false)
  }

  async function purchaseLabel() {
    if (!selectedRateId) return
    const reqBody = { rateId: selectedRateId }
    setLabelReqJson(JSON.stringify(reqBody, null, 2))
    const res = await fetch("/api/shipping/labels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reqBody),
    })
    const { labelUrl, trackingNumber } = await res.json()
    setLabelResJson(JSON.stringify({ labelUrl, trackingNumber }, null, 2))
    setLabelUrl(labelUrl)
    setTrackingNumber(trackingNumber)
    setShowModal(true)
  }

  return (
    <main className="p-6">
      <h1 className="text-xl font-bold mb-4">Shippo Test</h1>

      <form onSubmit={e => { e.preventDefault(); getRates() }} className="space-y-4 mb-6">
        <fieldset className="space-y-2">
          <legend className="font-semibold">From Address</legend>
          {Object.entries(from).map(([key, val]) => (
            <input
              key={key}
              placeholder={key}
              value={val}
              onChange={e => setFrom({ ...from, [key]: e.target.value })}
              className="border p-1 w-full"
            />
          ))}
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="font-semibold">To Address</legend>
          {Object.entries(to).map(([key, val]) => (
            <input
              key={key}
              placeholder={key}
              value={val}
              onChange={e => setTo({ ...to, [key]: e.target.value })}
              className="border p-1 w-full"
            />
          ))}
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="font-semibold">Parcel</legend>
          {Object.entries(parcel).map(([key, val]) => (
            <input
              key={key}
              placeholder={key}
              value={val}
              onChange={e => setParcel({ ...parcel, [key]: e.target.value })}
              className="border p-1 w-full"
            />
          ))}
        </fieldset>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Get Rates
        </button>
      </form>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h2 className="font-semibold">Request JSON</h2>
          <pre className="bg-gray-100 text-black p-2 h-100 overflow-auto">{reqJson}</pre>
        </div>
        <div>
          <h2 className="font-semibold">Response JSON</h2>
          <pre className="bg-gray-100 text-black p-2 h-100 overflow-auto">{resJson}</pre>
        </div>
      </div>

      {rates.length > 0 && (
        <>
          <ul className="space-y-4 mt-6">
            {rates.map(rate => {
              const isSelected = rate.object_id === selectedRateId
              return (
                <li
                  key={rate.object_id}
                  onClick={() => setSelectedRateId(rate.object_id)}
                  className={`flex items-start p-4 border rounded-lg cursor-pointer ${
                    isSelected
                      ? "border-blue-500 bg-blue-50 text-black"
                      : "text-gray-100"
                  }`}
                >
                  <Image
                    src={rate.provider_image_75}
                    alt={rate.provider}
                    width={32}
                    height={32}
                    className="mr-4 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <h2 className="text-md">{rate.provider}</h2>
                        <h3 className="font-semibold">{rate.servicelevel.name}</h3>
                      </div>
                      <span className="text-lg font-bold">
                        ${parseFloat(rate.amount_local).toFixed(2)}
                      </span>
                    </div>
                    <p className="text-sm mt-1">
                      {rate.estimated_days
                        ? `Est. ${rate.estimated_days} day${rate.estimated_days > 1 ? 's' : ''}`
                        : rate.duration_terms}
                    </p>
                    <div className="mt-2 space-x-1">
                      {rate.attributes.map(attr => (
                        <span
                          key={attr}
                          className={`px-2 py-0.5 text-xs font-medium rounded ${
                            attr === 'FASTEST'
                              ? 'bg-blue-100 text-blue-800'
                              : attr === 'CHEAPEST'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {attr}
                        </span>
                      ))}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>

          {selectedRateId && (
            <button
              onClick={purchaseLabel}
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
            >
              Purchase Label
            </button>
          )}
        </>
      )}
      {labelUrl && trackingNumber && !showModal && (
        <button
          onClick={() => setShowModal(true)}
          className="ml-4 mt-4 bg-gray-600 text-white px-4 py-2 rounded"
        >
          Show Label
        </button>
      )}

      {(labelReqJson || labelResJson) && (
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div>
            <h2 className="font-semibold">Label Request JSON</h2>
            <pre className="bg-gray-100 text-black p-2 h-100 overflow-auto">
              {labelReqJson}
            </pre>
          </div>
          <div>
            <h2 className="font-semibold">Label Response JSON</h2>
            <pre className="bg-gray-100 text-black p-2 h-100 overflow-auto">
              {labelResJson}
            </pre>
          </div>
        </div>
      )}

      {labelUrl && trackingNumber && showModal && (
        <LabelModal
          url={labelUrl}
          tracking={trackingNumber}
          onClose={() => setShowModal(false)}
        />
      )}

      
    </main>
  )
}
