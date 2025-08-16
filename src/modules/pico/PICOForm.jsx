import { useEffect, useMemo, useRef, useState } from 'react'
import { storage } from '../../lib/storage.js'

const STORAGE_KEY = 'pct:v0:pico'

const initialState = {
  population: '',
  intervention: '',
  comparator: '',
  outcome: '',
  timeframe: '',
  fullQuestion: '',
  autoCompose: true
}

function composeQuestion({ population, intervention, comparator, outcome, timeframe }) {
  const segs = []
  segs.push(`In ${population || '[Population]'},`)
  segs.push(`does ${intervention || '[Intervention]'} compared with ${comparator || '[Comparator]'}`)
  segs.push(`improve ${outcome || '[Outcome]'}${timeframe ? ` over ${timeframe}` : ''}?`)
  return segs.join(' ').replace(/\s+/g, ' ').trim()
}

export default function PICOForm() {
  const [form, setForm] = useState(initialState)
  const [touched, setTouched] = useState({})
  const [saveStatus, setSaveStatus] = useState('idle') // idle | saving | saved | error
  const [message, setMessage] = useState('')
  const [aiPanel, setAiPanel] = useState(null) // { title, suggestions: [] }
  const saveTimer = useRef(null)

  // Load existing
  useEffect(() => {
    const loaded = storage.get(STORAGE_KEY)
    if (loaded) {
      setForm({ ...initialState, ...loaded })
    }
  }, [])

  // Auto-compose the question while enabled
  const composed = useMemo(() => composeQuestion(form), [form])
  useEffect(() => {
    if (form.autoCompose) {
      setForm((f) => ({ ...f, fullQuestion: composeQuestion(f) }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.population, form.intervention, form.comparator, form.outcome, form.timeframe, form.autoCompose])

  // Auto-save with small debounce
  useEffect(() => {
    setSaveStatus('saving')
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      try {
        storage.set(STORAGE_KEY, form)
        setSaveStatus('saved')
        setMessage('Autosaved')
        setTimeout(() => setMessage(''), 1200)
      } catch (e) {
        setSaveStatus('error')
        setMessage('Autosave failed')
      }
    }, 500)
    return () => clearTimeout(saveTimer.current)
  }, [form])

  const errors = useMemo(() => {
    const e = {}
    if (!form.population?.trim()) e.population = 'Population is required.'
    if (!form.intervention?.trim()) e.intervention = 'Intervention is required.'
    if (!form.comparator?.trim()) e.comparator = 'Comparator is required.'
    if (!form.outcome?.trim()) e.outcome = 'Outcome is required.'
    return e
  }, [form])

  const isValid = Object.keys(errors).length === 0

  function setField(name, value) {
    setForm((f) => ({ ...f, [name]: value }))
  }

  function onBlur(e) {
    setTouched((t) => ({ ...t, [e.target.name]: true }))
  }

  function onFullQuestionChange(value) {
    // If user edits the full question directly, turn off autoCompose
    setForm((f) => ({ ...f, fullQuestion: value, autoCompose: false }))
  }

  function handleSave(e) {
    e.preventDefault()
    if (!isValid) {
      setTouched({
        population: true,
        intervention: true,
        comparator: true,
        outcome: true,
        timeframe: touched.timeframe,
        fullQuestion: touched.fullQuestion
      })
      setMessage('Please resolve errors before saving.')
      setSaveStatus('error')
      return
    }
    try {
      storage.set(STORAGE_KEY, form)
      setSaveStatus('saved')
      setMessage('Saved.')
      setTimeout(() => setMessage(''), 1500)
    } catch (err) {
      setSaveStatus('error')
      setMessage('Save failed.')
    }
  }

  function handleReset() {
    setForm(initialState)
    storage.remove(STORAGE_KEY)
    setTouched({})
    setAiPanel(null)
    setMessage('Reset.')
    setSaveStatus('idle')
    setTimeout(() => setMessage(''), 1200)
  }

  // TODO: Replace with real API call. Keep signature stable.
  async function requestAIFeedback(payload) {
    // Mocked delay & suggestions
    await new Promise((r) => setTimeout(r, 300))
    return {
      title: 'Mocked AI Suggestions',
      suggestions: [
        `Clarify your Population: consider eligibility boundaries (e.g., age range, comorbidities). Current: "${payload.population || '—'}"`,
        `Outcome refinement: specify a measurable endpoint and window. Current: "${payload.outcome || '—'}"`,
        `If Comparator is usual care, briefly define usual care in your settings. Current: "${payload.comparator || '—'}"`,
        `Timeframe: add an operational interval (e.g., 90 days) to support data capture. Current: "${payload.timeframe || '—'}"`,
        `Full Question looks ${payload.fullQuestion?.length > 10 ? 'complete' : 'incomplete'}; ensure action verb ("improve", "reduce", etc.) is appropriate.`
      ]
    }
  }

  async function onAI() {
    const panel = await requestAIFeedback(form)
    setAiPanel(panel)
  }

  return (
    <form className="space-y-6" onSubmit={handleSave} noValidate>
      {/* Inline banners */}
      {message && (
        <div
          role="status"
          aria-live="polite"
          className={`rounded-lg px-3 py-2 text-sm ${
            saveStatus === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
          }`}
        >
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Population */}
        <div>
          <label htmlFor="population" className="block text-sm font-medium text-gray-700">
            Population <span className="text-red-600">*</span>
          </label>
          <textarea
            id="population"
            name="population"
            className={`mt-1 w-full rounded-xl border px-3 py-2 min-h-[70px] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              touched.population && errors.population ? 'border-red-400' : 'border-gray-300'
            }`}
            value={form.population}
            onChange={(e) => setField('population', e.target.value)}
            onBlur={onBlur}
            aria-invalid={touched.population && !!errors.population}
            aria-describedby={touched.population && errors.population ? 'population-error' : undefined}
            placeholder="e.g., Adults receiving in-center hemodialysis in Ontario"
          />
          {touched.population && errors.population && (
            <p id="population-error" className="mt-1 text-xs text-red-600">
              {errors.population}
            </p>
          )}
        </div>

        {/* Intervention */}
        <div>
          <label htmlFor="intervention" className="block text-sm font-medium text-gray-700">
            Intervention <span className="text-red-600">*</span>
          </label>
          <textarea
            id="intervention"
            name="intervention"
            className={`mt-1 w-full rounded-xl border px-3 py-2 min-h-[70px] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              touched.intervention && errors.intervention ? 'border-red-400' : 'border-gray-300'
            }`}
            value={form.intervention}
            onChange={(e) => setField('intervention', e.target.value)}
            onBlur={onBlur}
            aria-invalid={touched.intervention && !!errors.intervention}
            aria-describedby={touched.intervention && errors.intervention ? 'intervention-error' : undefined}
            placeholder="e.g., Higher dialysate magnesium concentration"
          />
          {touched.intervention && errors.intervention && (
            <p id="intervention-error" className="mt-1 text-xs text-red-600">
              {errors.intervention}
            </p>
          )}
        </div>

        {/* Comparator */}
        <div>
          <label htmlFor="comparator" className="block text-sm font-medium text-gray-700">
            Comparator <span className="text-red-600">*</span>
          </label>
          <textarea
            id="comparator"
            name="comparator"
            className={`mt-1 w-full rounded-xl border px-3 py-2 min-h-[70px] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              touched.comparator && errors.comparator ? 'border-red-400' : 'border-gray-300'
            }`}
            value={form.comparator}
            onChange={(e) => setField('comparator', e.target.value)}
            onBlur={onBlur}
            aria-invalid={touched.comparator && !!errors.comparator}
            aria-describedby={touched.comparator && errors.comparator ? 'comparator-error' : undefined}
            placeholder="e.g., Standard/lower dialysate magnesium concentration"
          />
          {touched.comparator && errors.comparator && (
            <p id="comparator-error" className="mt-1 text-xs text-red-600">
              {errors.comparator}
            </p>
          )}
        </div>

        {/* Outcome */}
        <div>
          <label htmlFor="outcome" className="block text-sm font-medium text-gray-700">
            Outcome <span className="text-red-600">*</span>
          </label>
          <textarea
            id="outcome"
            name="outcome"
            className={`mt-1 w-full rounded-xl border px-3 py-2 min-h-[70px] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              touched.outcome && errors.outcome ? 'border-red-400' : 'border-gray-300'
            }`}
            value={form.outcome}
            onChange={(e) => setField('outcome', e.target.value)}
            onBlur={onBlur}
            aria-invalid={touched.outcome && !!errors.outcome}
            aria-describedby={touched.outcome && errors.outcome ? 'outcome-error' : undefined}
            placeholder="e.g., Frequency/severity of intradialytic muscle cramps"
          />
          {touched.outcome && errors.outcome && (
            <p id="outcome-error" className="mt-1 text-xs text-red-600">
              {errors.outcome}
            </p>
          )}
        </div>

        {/* Timeframe (optional) */}
        <div className="sm:col-span-2">
          <label htmlFor="timeframe" className="block text-sm font-medium text-gray-700">
            Timeframe
          </label>
          <input
            id="timeframe"
            name="timeframe"
            type="text"
            className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            value={form.timeframe}
            onChange={(e) => setField('timeframe', e.target.value)}
            onBlur={onBlur}
            placeholder="e.g., over 90 days post-randomization"
          />
        </div>
      </div>

      {/* Full question */}
      <div>
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="fullQuestion" className="block text-sm font-medium text-gray-700">
            Full Question (editable)
          </label>
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-primary focus:ring-primary"
                checked={form.autoCompose}
                onChange={(e) => setField('autoCompose', e.target.checked)}
                aria-label="Toggle auto-compose from PICO-T fields"
              />
              Auto-compose
            </label>
            {!form.autoCompose && (
              <button
                type="button"
                className="text-sm underline underline-offset-2 text-secondary hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary rounded"
                onClick={() => setForm((f) => ({ ...f, fullQuestion: composed, autoCompose: true }))}
              >
                Recompose
              </button>
            )}
          </div>
        </div>
        <textarea
          id="fullQuestion"
          name="fullQuestion"
          className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 min-h-[90px] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          value={form.fullQuestion}
          onChange={(e) => onFullQuestionChange(e.target.value)}
          placeholder="In [Population], does [Intervention] compared with [Comparator] improve [Outcome] over [Timeframe]?"
        />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={!isValid}
          className={`inline-flex items-center px-4 py-2 rounded-xl font-medium shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
          ${isValid ? 'bg-primary text-white hover:opacity-90 focus-visible:ring-primary' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
          aria-disabled={!isValid}
        >
          Save
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center px-4 py-2 rounded-xl font-medium border-2 border-secondary text-secondary hover:bg-secondary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
        >
          Reset
        </button>

        <button
          type="button"
          onClick={onAI}
          className="ml-auto inline-flex items-center px-4 py-2 rounded-xl font-medium border-2 border-gray-300 text-gray-800 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-describedby="ai-help"
        >
          Get AI Feedback (mock)
        </button>
      </div>
      <p id="ai-help" className="text-xs text-gray-500">
        This calls a local stub now; replace <code>requestAIFeedback</code> with a real API later.
      </p>

      {/* AI panel */}
      {aiPanel && (
        <div className="mt-4 border rounded-xl p-4 bg-gray-50">
          <h3 className="text-base font-semibold text-gray-900">{aiPanel.title}</h3>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            {aiPanel.suggestions.map((s, idx) => (
              <li key={idx} className="text-sm text-gray-800">
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </form>
  )
}
