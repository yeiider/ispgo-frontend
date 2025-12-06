"use server"

import { cookies } from "next/headers"
import type { AuthTokens, User, LoginCredentials } from "@/lib/auth"

const API_BASE_URL = process.env.ISP_API_URL || "https://ispgo-staging.up.railway.app"
const CLIENT_ID = process.env.ISP_CLIENT_ID || "9dcc6e83-7678-4820-ab52-05c7d3cfb3c1"
const CLIENT_SECRET = process.env.ISP_CLIENT_SECRET || "yeq44rNbhVUyaFmSLPPhbYjGSQDHV5TZoGCsVgnT"

export async function login(credentials: LoginCredentials): Promise<{
  success: boolean
  tokens?: AuthTokens
  user?: User
  error?: string
}> {
  try {
    const requestBody = {
      username: credentials.username,
      password: credentials.password,
      grant_type: "password",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }

    // 1. Obtener tokens de OAuth
    const tokenResponse = await fetch(`${API_BASE_URL}/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    const responseData = await tokenResponse.json().catch(() => ({}))

    if (!tokenResponse.ok) {
      return {
        success: false,
        error: responseData.message || responseData.error_description || responseData.error || "Credenciales inválidas",
      }
    }

    const tokens: AuthTokens = responseData

    // 2. Obtener datos del usuario con el token
    const userResponse = await fetch(`${API_BASE_URL}/api/user`, {
      method: "GET",
      headers: {
        Authorization: `${tokens.token_type} ${tokens.access_token}`,
        Accept: "application/json",
      },
    })

    if (!userResponse.ok) {
      return {
        success: false,
        error: "No se pudieron obtener los datos del usuario",
      }
    }

    const userData = await userResponse.json()

    const user: User = {
      ...userData,
      role: userData.role || userData.roles?.[0]?.name || "admin",
    }

    // 3. Guardar tokens en cookies seguras
    const cookieStore = await cookies()

    cookieStore.set("access_token", tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: tokens.expires_in,
      path: "/",
    })

    cookieStore.set("refresh_token", tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    })

    cookieStore.set("user", JSON.stringify(user), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: tokens.expires_in,
      path: "/",
    })

    return { success: true, tokens, user }
  } catch (error) {
    console.error("[v0] Login error:", error)
    return {
      success: false,
      error: "Error de conexión con el servidor",
    }
  }
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete("access_token")
  cookieStore.delete("refresh_token")
  cookieStore.delete("user")
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const userCookie = cookieStore.get("user")

    if (!userCookie?.value) {
      return null
    }

    return JSON.parse(userCookie.value) as User
  } catch {
    return null
  }
}

export async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get("access_token")?.value || null
}

export async function refreshToken(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const refresh = cookieStore.get("refresh_token")?.value

    if (!refresh) {
      return false
    }

    const response = await fetch(`${API_BASE_URL}/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grant_type: "refresh_token",
        refresh_token: refresh,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
    })

    if (!response.ok) {
      return false
    }

    const tokens: AuthTokens = await response.json()

    cookieStore.set("access_token", tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: tokens.expires_in,
      path: "/",
    })

    cookieStore.set("refresh_token", tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    })

    return true
  } catch {
    return false
  }
}
