"use client"
import { useState } from "react"

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

export default function Home() {
  const emptyAddr = { name:"", street1:"", city:"", state:"", zip:"", country:"US" }
  const emptyParcel = { length:"", width:"", height:"", distance_unit:"in", weight:"", mass_unit:"lb" }

  const [from, setFrom] = useState<Address>(emptyAddr)
  const [to,   setTo]   = useState<Address>(emptyAddr)
  const [parcel, setParcel] = useState<Parcel>(emptyParcel)
  const [reqJson, setReqJson] = useState("")
  const [resJson, setResJson] = useState("")

  async function getRates() {
    const body = { from, to, parcel }
    setReqJson(JSON.stringify(body, null, 2))
    const res = await fetch("/api/shipping/getRates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    setResJson(JSON.stringify(data, null, 2))
  }

  return (
    <main className="p-6">
      <h1 className="text-xl font-bold mb-4">Shipping Rate Demo</h1>
      <form
        onSubmit={e => { e.preventDefault(); getRates() }}
        className="space-y-4 mb-6"
      >
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
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Get Rates
        </button>
      </form>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h2 className="font-semibold">Request JSON</h2>
          <pre className="bg-gray-100 text-black p-2 h-40 overflow-auto">
            {reqJson}
          </pre>
        </div>
        <div>
          <h2 className="font-semibold">Response JSON</h2>
          <pre className="bg-gray-100 text-black  p-2 h-40 overflow-auto">
            {resJson}
          </pre>
        </div>
      </div>
    </main>
  )
}
