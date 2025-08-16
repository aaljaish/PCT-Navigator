import React, { useState, useEffect } from 'react'
import { load, save } from '../../lib/storage.js'

const initialState = {
  population: '',
  intervention: '',
  comparison: '',
  outcome: '',
  time: '',
}

export default function PICOForm() {
  const [form, setForm] = useState(initialState)
  const [errors, setErrors] = useState({})
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    setForm(load('pct-wizard-form', initialState))
  }, [])

  useEffect(() => {
    save('pct-wizard-form', form)
  }, [form])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const validate = () => {
    const newErrors = {}
    if (!form.population) newErrors.population = 'Population is required'
    if (!form.intervention) newErrors.intervention = 'Intervention is required'
    if (!form.outcome) newErrors.outcome = 'Outcome is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    const result = await getFeedback(form)
    setFeedback(result.message)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <Field
        id="population"
        label="Population / Problem"
        value={form.population}
        onChange={handleChange}
        error={errors.population}
      />
      <Field
        id="intervention"
        label="Intervention"
        value={form.intervention}
        onChange={handleChange}
        error={errors.intervention}
      />
      <Field
        id="comparison"
        label="Comparison"
        value={form.comparison}
        onChange={handleChange}
      />
      <Field
        id="outcome"
        label="Outcome"
        value={form.outcome}
        onChange={handleChange}
        error={errors.outcome}
      />
      <Field
        id="time"
        label="Timeframe"
        value={form.time}
        onChange={handleChange}
      />
      <div className="flex items-center gap-4">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Get AI feedback
        </button>
        {feedback && <p className="text-sm text-gray-700">{feedback}</p>}
      </div>
    </form>
  )
}

function Field({ id, label, value, onChange, error }) {
  return (
    <div className="flex flex-col">
      <label htmlFor={id} className="font-medium">
        {label}
      </label>
      <textarea
        id={id}
        name={id}
        className="mt-1 p-2 border rounded w-full"
        value={value}
        onChange={onChange}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <p id={`${id}-error`} className="text-sm text-red-600 mt-1">
          {error}
        </p>
      )}
    </div>
  )
}

async function getFeedback() {
  return new Promise((resolve) =>
    setTimeout(() => resolve({ message: 'AI feedback stub.' }), 500)
  )
}
