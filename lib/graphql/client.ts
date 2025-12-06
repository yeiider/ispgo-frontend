import { cookies } from "next/headers"

const BASE_URL = process.env.ISP_API_URL || "http://localhost"
// Ensure we remove trailing slash and add /graphql
const GRAPHQL_ENDPOINT = `${BASE_URL.replace(/\/$/, "")}/graphql`

const CLIENT_ID = process.env.ISP_CLIENT_ID || ""
const CLIENT_SECRET = process.env.ISP_CLIENT_SECRET || ""

interface GraphQLResponse<T> {
  data?: T
  errors?: Array<{
    message: string
    locations?: Array<{ line: number; column: number }>
    path?: string[]
    extensions?: Record<string, unknown>
  }>
}

interface PaginatorInfo {
  currentPage: number
  lastPage: number
  perPage: number
  total: number
  hasMorePages: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  paginatorInfo: PaginatorInfo
}

// Token cache for OAuth fallback
let cachedToken: string | null = null
let tokenExpiry: number | null = null

async function getAuthToken(): Promise<string> {
  // First try to get token from cookies (user session)
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("access_token")?.value

    if (accessToken) {
      console.log("[v0] Using access token from cookies")
      return accessToken
    }
  } catch (error) {
    console.log("[v0] Could not access cookies, falling back to OAuth:", error)
  }

  // Fallback to OAuth client_credentials flow
  return getOAuthToken()
}

// OAuth token endpoint - fallback for server-to-server calls
async function getOAuthToken(): Promise<string> {
  // Check if cached token is still valid (with 60s buffer)
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry - 60000) {
    console.log("[v0] Using cached OAuth token")
    return cachedToken
  }

  const tokenUrl = `${BASE_URL.replace(/\/$/, "")}/oauth/token`

  console.log("[v0] Fetching new OAuth token from:", tokenUrl)

  try {
    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
    })

    console.log("[v0] OAuth response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.log("[v0] OAuth error response:", errorText)
      throw new Error(`OAuth token request failed: ${response.status} ${errorText}`)
    }

    const data = await response.json()
    console.log("[v0] OAuth token obtained, expires_in:", data.expires_in)

    cachedToken = data.access_token
    // Set expiry time (expires_in is in seconds)
    tokenExpiry = Date.now() + (data.expires_in || 3600) * 1000

    return cachedToken
  } catch (error) {
    console.log("[v0] OAuth error:", error)
    throw error
  }
}

export async function graphqlRequest<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  console.log("[v0] GraphQL Request to:", GRAPHQL_ENDPOINT)

  const token = await getAuthToken()

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  }

  console.log("[v0] Request query:", query.substring(0, 100) + "...")
  console.log("[v0] Request variables:", JSON.stringify(variables))

  const body = JSON.stringify({
    query,
    variables: variables || {},
  })

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers,
      body,
      cache: "no-store",
    })

    console.log("[v0] Response status:", response.status, response.statusText)

    const rawText = await response.text()
    console.log("[v0] Raw response:", rawText.substring(0, 500))

    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.statusText}`)
    }

    const result: GraphQLResponse<T> = JSON.parse(rawText)

    if (result.errors && result.errors.length > 0) {
      console.log("[v0] GraphQL errors:", result.errors)
      throw new Error(result.errors[0].message)
    }

    if (!result.data) {
      throw new Error("No data returned from GraphQL")
    }

    return result.data
  } catch (error) {
    console.log("[v0] Fetch error:", error)
    throw error
  }
}

// Function to clear token cache (useful for logout or token refresh)
export function clearTokenCache() {
  cachedToken = null
  tokenExpiry = null
}

export const graphqlClient = {
  request: graphqlRequest,
}

export type { PaginatorInfo }
