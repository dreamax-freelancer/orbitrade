import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const coachSchema = {
  eyebrow: 'string', title: 'string', summary: 'string', bullets: ['string'],
  stats: [{ label: 'string', value: 'string' }], tags: ['string'], caution: 'string',
}

const chartSchema = {
  trend: 'Bullish | Bearish | Neutral', bias: 'Long | Short | Wait', confidence: 'number 0-100',
  support: ['string'], resistance: ['string'], entry_zone: 'string', stop_loss: 'string',
  targets: ['string'], summary: 'string', checklist: ['string'], caution: 'string',
}

const systemPrompt = `You are Orbit, an expert crypto-market education coach. You are rigorous, calm, and risk-first.
Never promise profit, certainty, or a trade outcome. Treat every answer as educational—not financial advice.
Explain market structure, liquidity, volume, trend, multi-timeframe context, risk-reward, invalidation and position sizing precisely.
Do not make up chart values or claim to see data that was not supplied. If evidence is insufficient, recommend waiting.
Every response must be valid JSON only, matching the requested schema. No markdown and no text outside JSON.`

function jsonFromText(text: string) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1] ?? text
  const first = fenced.indexOf('{')
  const last = fenced.lastIndexOf('}')
  if (first < 0 || last < first) throw new Error('The AI did not return structured JSON.')
  return JSON.parse(fenced.slice(first, last + 1))
}

function toBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer)
  const chunkSize = 0x8000
  let binary = ''
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize))
  }
  return btoa(binary)
}

async function askGemini(prompt: string, image?: { mimeType: string; data: string }) {
  const apiKey = Deno.env.get('GEMINI_API_KEY')
  if (!apiKey) throw new Error('Gemini is not configured.')
  const model = Deno.env.get('GEMINI_MODEL') ?? 'gemini-2.5-flash'
  const parts: Array<Record<string, unknown>> = [{ text: prompt }]
  if (image) parts.push({ inlineData: { mimeType: image.mimeType, data: image.data } })
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.25 },
    }),
  })
  if (!response.ok) throw new Error(`Gemini request failed (${response.status}).`)
  const payload = await response.json()
  const text = payload.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text ?? '').join('')
  if (!text) throw new Error('Gemini returned no answer.')
  return jsonFromText(text)
}

async function askOpenRouter(prompt: string, image?: { mimeType: string; data: string }) {
  const apiKey = Deno.env.get('OPENROUTER_API_KEY')
  if (!apiKey) throw new Error('OpenRouter is not configured.')
  const content: Array<Record<string, unknown>> = [{ type: 'text', text: prompt }]
  if (image) content.push({ type: 'image_url', image_url: { url: `data:${image.mimeType};base64,${image.data}` } })
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: image ? (Deno.env.get('OPENROUTER_VISION_MODEL') ?? 'openrouter/free') : 'openrouter/free',
      messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content }],
      temperature: 0.25,
      response_format: { type: 'json_object' },
    }),
  })
  if (!response.ok) throw new Error(`OpenRouter fallback failed (${response.status}).`)
  const payload = await response.json()
  const text = payload.choices?.[0]?.message?.content
  if (!text) throw new Error('OpenRouter returned no answer.')
  return jsonFromText(text)
}

async function askAI(prompt: string, image?: { mimeType: string; data: string }) {
  try { return await askGemini(prompt, image) }
  catch (geminiError) {
    try { return await askOpenRouter(prompt, image) }
    catch (fallbackError) { throw new Error(`AI unavailable. ${geminiError.message} ${fallbackError.message}`) }
  }
}

function ensureAnswer(value: unknown, kind: 'coach' | 'chart') {
  if (!value || typeof value !== 'object') throw new Error('Invalid AI response.')
  const answer = value as Record<string, unknown>
  const required = kind === 'coach'
    ? ['eyebrow', 'title', 'summary', 'bullets', 'stats', 'tags', 'caution']
    : ['trend', 'bias', 'confidence', 'support', 'resistance', 'entry_zone', 'stop_loss', 'targets', 'summary', 'checklist', 'caution']
  if (required.some((key) => answer[key] === undefined)) throw new Error('AI response missed required fields.')
  return answer
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) throw new Error('Authentication is required.')
    const url = Deno.env.get('SUPABASE_URL')!
    const anon = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const authClient = createClient(url, anon, { global: { headers: { Authorization: authHeader } } })
    const { data: { user }, error: authError } = await authClient.auth.getUser()
    if (authError || !user) throw new Error('Invalid session.')
    const admin = createClient(url, serviceKey)
    const body = await request.json()

    if (body.kind === 'coach') {
      const question = String(body.question ?? '').trim()
      if (!question || question.length > 2000) throw new Error('Enter a trading question under 2,000 characters.')
      let conversationId = body.conversationId as string | undefined
      if (!conversationId) {
        const { data, error } = await admin.from('coach_conversations').insert({ user_id: user.id, title: question.slice(0, 72) }).select('id').single()
        if (error) throw error
        conversationId = data.id
      }
      const { data: history, error: historyError } = await admin.from('coach_messages')
        .select('role, content').eq('conversation_id', conversationId).eq('user_id', user.id).order('created_at', { ascending: false }).limit(8)
      if (historyError) throw historyError
      const context = (history ?? []).reverse().map((message) => `${message.role}: ${JSON.stringify(message.content)}`).join('\n')
      const prompt = `Return this coach schema: ${JSON.stringify(coachSchema)}.\nRecent conversation:\n${context}\n\nTrader question: ${question}`
      const { error: saveQuestionError } = await admin.from('coach_messages').insert({ conversation_id: conversationId, user_id: user.id, role: 'user', content: { text: question } })
      if (saveQuestionError) throw saveQuestionError
      const answer = ensureAnswer(await askAI(prompt), 'coach')
      const { error: saveAnswerError } = await admin.from('coach_messages').insert({ conversation_id: conversationId, user_id: user.id, role: 'assistant', content: answer })
      if (saveAnswerError) throw saveAnswerError
      await admin.from('coach_conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversationId).eq('user_id', user.id)
      return Response.json({ conversationId, answer }, { headers: corsHeaders })
    }

    if (body.kind === 'chart') {
      const storagePath = String(body.storagePath ?? '')
      if (!storagePath.startsWith(`${user.id}/`)) throw new Error('Invalid chart upload.')
      const { data: file, error: fileError } = await admin.storage.from('chart-uploads').download(storagePath)
      if (fileError || !file) throw new Error('Chart image could not be retrieved.')
      const image = { mimeType: file.type || 'image/png', data: toBase64(await file.arrayBuffer()) }
      const prompt = `Analyze the uploaded crypto chart image itself for education only. Return this chart schema: ${JSON.stringify(chartSchema)}.
Use only evidence visible in this image. Identify the actual symbol, timeframe, visible price labels, trend, market structure, support, resistance, entry area, invalidation, and targets. Never reuse demo BTC/USDT levels, never assume the image is BTC, and never invent price levels. If a symbol, timeframe, label, or level is unreadable or absent, return "Not visible". Explain whether the specific chart supports entering, waiting, or holding, and include the visual evidence in the summary and checklist.`
      const analysis = ensureAnswer(await askAI(prompt, image), 'chart')
      const { data, error } = await admin.from('chart_analyses').insert({ user_id: user.id, storage_path: storagePath, market: body.market ?? null, timeframe: body.timeframe ?? null, analysis }).select('id, created_at').single()
      if (error) throw error
      return Response.json({ analysisId: data.id, createdAt: data.created_at, analysis }, { headers: corsHeaders })
    }

    if (body.kind === 'history') {
      const [{ data: conversations }, { data: analyses }] = await Promise.all([
        admin.from('coach_conversations').select('id, title, updated_at').eq('user_id', user.id).order('updated_at', { ascending: false }).limit(20),
        admin.from('chart_analyses').select('id, market, timeframe, analysis, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
      ])
      return Response.json({ conversations: conversations ?? [], analyses: analyses ?? [] }, { headers: corsHeaders })
    }

    if (body.kind === 'profile') {
      if (body.action === 'get') {
        const { data, error } = await admin.from('profiles').select('display_name, preferences').eq('id', user.id).single()
        if (error) throw error
        return Response.json({ profile: data }, { headers: corsHeaders })
      }
      const preferences = body.preferences && typeof body.preferences === 'object' ? body.preferences : {}
      const { data, error } = await admin.from('profiles').update({ display_name: String(body.displayName ?? ''), preferences, updated_at: new Date().toISOString() }).eq('id', user.id).select('display_name, preferences').single()
      if (error) throw error
      return Response.json({ profile: data }, { headers: corsHeaders })
    }

    throw new Error('Unsupported request.')
  } catch (error) {
    return Response.json({ error: error.message ?? 'Request failed.' }, { status: 400, headers: corsHeaders })
  }
})
