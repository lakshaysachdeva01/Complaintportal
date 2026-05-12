/** Backend from OpenAPI (dev tunnel). */
export const API_BASE_URL = 'https://hhbs6tzt-8080.inc1.devtunnels.ms'

export type ApiIssueStatus = 'COMPLETED' | 'PENDING' | 'ASSIGNED' | 'IN_PROCESS' | 'REJECTED'

/** Issue row nested under GET /users/get (no reporter object). */
export type ApiUserEmbeddedIssue = {
  id: number
  message?: string
  location?: string
  imageTag?: string
  issueCategory?: string
  status?: string
  createdAt?: string
  updatedAt?: string
}

export const EMAIL_TO_USER_ID_KEY = 'emailToUserIdMap'

export function readEmailToUserIdMap(): Record<string, number> {
  try {
    const raw = localStorage.getItem(EMAIL_TO_USER_ID_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function rememberUserIdForEmail(email: string, id: number) {
  const map = readEmailToUserIdMap()
  map[email] = id
  localStorage.setItem(EMAIL_TO_USER_ID_KEY, JSON.stringify(map))
}

async function readErrorMessage(res: Response, data: unknown): Promise<string> {
  if (data && typeof data === 'object') {
    const o = data as Record<string, unknown>
    const msg = o.message ?? o.error ?? o.detail
    if (typeof msg === 'string') return msg
  }
  return res.statusText || 'Request failed'
}

export async function apiLogin(body: { email: string; password: string }) {
  const res = await fetch(`${API_BASE_URL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(await readErrorMessage(res, data)) as Error & { status: number }
    err.status = res.status
    throw err
  }
  return data
}

export async function apiGetUser(id: number) {
  const res = await fetch(`${API_BASE_URL}/users/get?id=${id}`)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(await readErrorMessage(res, data))
  return data as {
    id: number
    name?: string
    email?: string
    password?: string
    role?: string
    issues?: ApiUserEmbeddedIssue[]
  }
}

export async function apiCreateUser(body: {
  name: string
  email: string
  password: string
  role: string
  departmentId?: number
}) {
  const res = await fetch(`${API_BASE_URL}/users/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(await readErrorMessage(res, data))
  return data as {
    id: number
    name?: string
    email?: string
    role?: string
  }
}

export async function apiGetDepartments() {
  const res = await fetch(`${API_BASE_URL}/dept/all`)
  const data = await res.json().catch(() => [] as unknown[])
  if (!res.ok) throw new Error(typeof data === 'object' && data && 'message' in (data as object) ? String((data as { message?: string }).message) : res.statusText)
  return data as { id: number; name?: string; category?: string }[]
}

export async function apiUploadImage(file: File | Blob, filename = 'image.jpg') {
  const fd = new FormData()
  fd.append('file', file, filename)
  const res = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: fd,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(await readErrorMessage(res, data))
  if (typeof data === 'string') return data
  if (data && typeof data === 'object') {
    const o = data as Record<string, unknown>
    const tag =
      o.imageUrl ??
      o.imageTag ??
      o.url ??
      o.path ??
      o.fileName ??
      o.file
    if (typeof tag === 'string' && tag.length > 0) return tag
  }
  return null
}

export async function apiCreateIssue(body: {
  reporterId: number
  departmentId: number
  message: string
  location: string
  imageTag?: string | null
}) {
  const res = await fetch(`${API_BASE_URL}/issues/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(await readErrorMessage(res, data))
  return data as {
    id: number
    reporterId?: number
    reporterName?: string
    departmentId?: number
    departmentName?: string
    message?: string
    location?: string
    imageTag?: string
    status?: string
    createdAt?: string
    updatedAt?: string
  }
}

export async function apiUpdateIssueStatus(body: {
  userId: number
  id: number
  status: ApiIssueStatus
}) {
  const res = await fetch(`${API_BASE_URL}/issues/updateStatus`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(await readErrorMessage(res, data))
  return data
}

/** Shape returned by GET /issues (OpenAPI Issue). */
export type ApiIssueEntity = {
  id: number
  message?: string
  location?: string
  imageTag?: string
  status?: string
  createdAt?: string
  updatedAt?: string
  reporter?: { id?: number; name?: string; email?: string }
}

/** Normalized row for this app’s UI (admin + user issue lists). */
export type UiIssue = {
  id: number
  userId: number | null
  userName: string
  userEmail: string
  subject: string
  location: string
  description: string
  date: string
  image: string | null
  status: string
  createdAt: string
}

export async function apiGetIssues(status?: ApiIssueStatus): Promise<ApiIssueEntity[]> {
  const q = status != null ? `?status=${encodeURIComponent(status)}` : ''
  const res = await fetch(`${API_BASE_URL}/issues${q}`)
  const data = await res.json().catch(() => [])
  if (!res.ok) throw new Error(await readErrorMessage(res, data))
  return Array.isArray(data) ? (data as ApiIssueEntity[]) : []
}

function parseIssueMessageBody(message: string): { subject: string; description: string } {
  let subject = 'Issue'
  let description = message
  const subjectMatch = message.match(/^Subject:\s*([^\n]+)(?:\n\n([\s\S]*))?$/)
  if (subjectMatch) {
    subject = subjectMatch[1].trim()
    description = (subjectMatch[2] ?? '').trim()
  }
  return { subject, description }
}

function imageUrlFromImageTag(imageTag?: string | null): string | null {
  if (!imageTag) return null
  return imageTag.startsWith('http')
    ? imageTag
    : `${API_BASE_URL.replace(/\/$/, '')}/${String(imageTag).replace(/^\//, '')}`
}

export function mapEmbeddedIssueToUi(
  raw: ApiUserEmbeddedIssue,
  reporter: { id: number; name?: string; email?: string },
): UiIssue {
  const { subject, description } = parseIssueMessageBody(raw.message || '')
  const created = raw.createdAt || new Date().toISOString()
  return {
    id: raw.id,
    userId: reporter.id,
    userName: reporter.name || 'Unknown',
    userEmail: reporter.email || '',
    subject,
    location: raw.location || '',
    description,
    date: created.split('T')[0],
    image: imageUrlFromImageTag(raw.imageTag),
    status: apiStatusToUi(raw.status || 'PENDING'),
    createdAt: created,
  }
}

export function mapApiIssueToUi(raw: ApiIssueEntity): UiIssue {
  const { subject, description } = parseIssueMessageBody(raw.message || '')
  const created = raw.createdAt || new Date().toISOString()
  return {
    id: raw.id,
    userId: raw.reporter?.id ?? null,
    userName: raw.reporter?.name || 'Unknown',
    userEmail: raw.reporter?.email || '',
    subject,
    location: raw.location || '',
    description,
    date: created.split('T')[0],
    image: imageUrlFromImageTag(raw.imageTag),
    status: apiStatusToUi(raw.status || 'PENDING'),
    createdAt: created,
  }
}

/**
 * True if GET /issues?status=… returns the same id-sets as filtering the full list
 * (resolved = COMPLETED; pending tab = PENDING + IN_PROCESS).
 */
export async function verifyIssueStatusQueryWorks(fullRaw: ApiIssueEntity[]): Promise<boolean> {
  try {
    const [completedRaw, pendingRaw, inProcessRaw] = await Promise.all([
      apiGetIssues('COMPLETED'),
      apiGetIssues('PENDING'),
      apiGetIssues('IN_PROCESS'),
    ])

    const fullCompletedIds = new Set(
      fullRaw.filter((i) => i.status === 'COMPLETED').map((i) => i.id),
    )
    const paramCompletedIds = new Set(completedRaw.map((i) => i.id))
    const resolvedOk =
      fullCompletedIds.size === paramCompletedIds.size &&
      [...fullCompletedIds].every((id) => paramCompletedIds.has(id))

    const pendProcIds = new Set(
      fullRaw
        .filter((i) => i.status === 'PENDING' || i.status === 'IN_PROCESS')
        .map((i) => i.id),
    )
    const combinedParamIds = new Set(
      [...pendingRaw, ...inProcessRaw].map((i) => i.id),
    )
    const pendingOk =
      pendProcIds.size === combinedParamIds.size &&
      [...pendProcIds].every((id) => combinedParamIds.has(id))

    return resolvedOk && pendingOk
  } catch {
    return false
  }
}

/** Map admin UI statuses to OpenAPI enum. */
export function uiStatusToApi(status: string): ApiIssueStatus {
  switch (status) {
    case 'resolved':
      return 'COMPLETED'
    case 'in_progress':
      return 'IN_PROCESS'
    case 'pending':
      return 'PENDING'
    case 'new':
    default:
      return 'ASSIGNED'
  }
}

/** Map API status to UI labels used in this app. */
export function apiStatusToUi(status: string): string {
  switch (status) {
    case 'COMPLETED':
      return 'resolved'
    case 'IN_PROCESS':
      return 'in_progress'
    case 'PENDING':
      return 'pending'
    case 'ASSIGNED':
      return 'new'
    case 'REJECTED':
      return 'pending'
    default:
      return 'pending'
  }
}

export function dataUrlToBlob(dataUrl: string): Blob {
  const [meta, b64] = dataUrl.split(',')
  const mime = meta.match(/:(.*?);/)?.[1] || 'image/jpeg'
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type: mime })
}
