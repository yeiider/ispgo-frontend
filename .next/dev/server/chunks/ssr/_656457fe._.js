module.exports = [
"[project]/lib/graphql/client.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clearTokenCache",
    ()=>clearTokenCache,
    "graphqlClient",
    ()=>graphqlClient,
    "graphqlRequest",
    ()=>graphqlRequest
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.7_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/headers.js [app-rsc] (ecmascript)");
;
const BASE_URL = process.env.ISP_API_URL || "http://localhost";
// Ensure we remove trailing slash and add /graphql
const GRAPHQL_ENDPOINT = `${BASE_URL.replace(/\/$/, "")}/graphql`;
const CLIENT_ID = process.env.ISP_CLIENT_ID || "";
const CLIENT_SECRET = process.env.ISP_CLIENT_SECRET || "";
// Token cache for OAuth fallback
let cachedToken = null;
let tokenExpiry = null;
async function getAuthToken() {
    // First try to get token from cookies (user session)
    try {
        const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cookies"])();
        const accessToken = cookieStore.get("access_token")?.value;
        if (accessToken) {
            console.log("[v0] Using access token from cookies");
            return accessToken;
        }
    } catch (error) {
        console.log("[v0] Could not access cookies, falling back to OAuth:", error);
    }
    // Fallback to OAuth client_credentials flow
    return getOAuthToken();
}
// OAuth token endpoint - fallback for server-to-server calls
async function getOAuthToken() {
    // Check if cached token is still valid (with 60s buffer)
    if (cachedToken && tokenExpiry && Date.now() < tokenExpiry - 60000) {
        console.log("[v0] Using cached OAuth token");
        return cachedToken;
    }
    const tokenUrl = `${BASE_URL.replace(/\/$/, "")}/oauth/token`;
    console.log("[v0] Fetching new OAuth token from:", tokenUrl);
    try {
        const response = await fetch(tokenUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Accept: "application/json"
            },
            body: new URLSearchParams({
                grant_type: "client_credentials",
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET
            })
        });
        console.log("[v0] OAuth response status:", response.status);
        if (!response.ok) {
            const errorText = await response.text();
            console.log("[v0] OAuth error response:", errorText);
            throw new Error(`OAuth token request failed: ${response.status} ${errorText}`);
        }
        const data = await response.json();
        console.log("[v0] OAuth token obtained, expires_in:", data.expires_in);
        cachedToken = data.access_token;
        // Set expiry time (expires_in is in seconds)
        tokenExpiry = Date.now() + (data.expires_in || 3600) * 1000;
        return cachedToken;
    } catch (error) {
        console.log("[v0] OAuth error:", error);
        throw error;
    }
}
async function graphqlRequest(query, variables) {
    console.log("[v0] GraphQL Request to:", GRAPHQL_ENDPOINT);
    const token = await getAuthToken();
    const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`
    };
    console.log("[v0] Request query:", query.substring(0, 100) + "...");
    console.log("[v0] Request variables:", JSON.stringify(variables));
    const body = JSON.stringify({
        query,
        variables: variables || {}
    });
    try {
        const response = await fetch(GRAPHQL_ENDPOINT, {
            method: "POST",
            headers,
            body,
            cache: "no-store"
        });
        console.log("[v0] Response status:", response.status, response.statusText);
        const rawText = await response.text();
        console.log("[v0] Raw response:", rawText.substring(0, 500));
        if (!response.ok) {
            throw new Error(`GraphQL request failed: ${response.statusText}`);
        }
        const result = JSON.parse(rawText);
        if (result.errors && result.errors.length > 0) {
            console.log("[v0] GraphQL errors:", result.errors);
            throw new Error(result.errors[0].message);
        }
        if (!result.data) {
            throw new Error("No data returned from GraphQL");
        }
        return result.data;
    } catch (error) {
        console.log("[v0] Fetch error:", error);
        throw error;
    }
}
function clearTokenCache() {
    cachedToken = null;
    tokenExpiry = null;
}
const graphqlClient = {
    request: graphqlRequest
};
}),
"[project]/lib/graphql/queries/config.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// GraphQL queries for configuration system
__turbopack_context__.s([
    "CONFIG_FIELDS_QUERY",
    ()=>CONFIG_FIELDS_QUERY,
    "CONFIG_SCHEMA_QUERY",
    ()=>CONFIG_SCHEMA_QUERY,
    "CONFIG_SEARCH_QUERY",
    ()=>CONFIG_SEARCH_QUERY,
    "CONFIG_VALUES_QUERY",
    ()=>CONFIG_VALUES_QUERY,
    "UPSERT_CONFIG_MUTATION",
    ()=>UPSERT_CONFIG_MUTATION
]);
const CONFIG_SCHEMA_QUERY = `
  query GetConfigSchema {
    configSchema {
      key
      label
      groups {
        key
        label
        fields {
          key
          label
          path
          type
          required
          default
          options {
            label
            value
          }
        }
      }
    }
  }
`;
const CONFIG_FIELDS_QUERY = `
  query GetConfigFields($scope_id: Int) {
    configFields(scope_id: $scope_id) {
      section
      group
      key
      path
      type
      label
      value
      required
      default
      options {
        label
        value
      }
    }
  }
`;
const CONFIG_VALUES_QUERY = `
  query GetConfigValues($paths: [String!]!, $scope_id: Int) {
    configValues(paths: $paths, scope_id: $scope_id) {
      path
      value
      type
      label
    }
  }
`;
const CONFIG_SEARCH_QUERY = `
  query SearchConfig($term: String!, $scope_id: Int) {
    configSearch(term: $term, scope_id: $scope_id) {
      path
      label
      type
      value
    }
  }
`;
const UPSERT_CONFIG_MUTATION = `
  mutation UpsertConfigValues($scope_id: Int, $items: [ConfigItemInput!]!) {
    upsertConfigValues(scope_id: $scope_id, items: $items) {
      path
      value
      type
      label
    }
  }
`;
}),
"[project]/app/actions/config.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"00dd78d1e262fd4fcf549bb7325d603acea943398e":"getConfigSchema","40f876ea8efdc30ada0500153830b44d56c1c9dd59":"getConfigFields","607f5b6578f0e64a4eef22fb021948bb227ca3b7fe":"saveConfigValues"},"",""] */ __turbopack_context__.s([
    "getConfigFields",
    ()=>getConfigFields,
    "getConfigSchema",
    ()=>getConfigSchema,
    "saveConfigValues",
    ()=>saveConfigValues
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.7_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/graphql/client.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$queries$2f$config$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/graphql/queries/config.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.7_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
async function getConfigSchema() {
    try {
        console.log("[v0] Fetching config schema...");
        const data = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["graphqlClient"].request(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$queries$2f$config$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CONFIG_SCHEMA_QUERY"]);
        console.log("[v0] Config schema received:", data.configSchema?.length, "sections");
        return {
            success: true,
            data: data.configSchema
        };
    } catch (error) {
        console.error("[v0] Error fetching config schema:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}
async function getConfigFields(scopeId = 0) {
    try {
        console.log("[v0] Fetching config fields for scope:", scopeId);
        const data = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["graphqlClient"].request(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$queries$2f$config$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CONFIG_FIELDS_QUERY"], {
            scope_id: scopeId
        });
        console.log("[v0] Config fields received:", data.configFields?.length, "fields");
        return {
            success: true,
            data: data.configFields
        };
    } catch (error) {
        console.error("[v0] Error fetching config fields:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}
async function saveConfigValues(items, scopeId = 0) {
    try {
        console.log("[v0] Saving config values for scope:", scopeId, "items:", items.length);
        const data = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["graphqlClient"].request(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$queries$2f$config$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["UPSERT_CONFIG_MUTATION"], {
            scope_id: scopeId,
            items
        });
        console.log("[v0] Config saved successfully");
        return {
            success: true,
            data: data.upsertConfigValues
        };
    } catch (error) {
        console.error("[v0] Error saving config values:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    getConfigSchema,
    getConfigFields,
    saveConfigValues
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getConfigSchema, "00dd78d1e262fd4fcf549bb7325d603acea943398e", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getConfigFields, "40f876ea8efdc30ada0500153830b44d56c1c9dd59", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(saveConfigValues, "607f5b6578f0e64a4eef22fb021948bb227ca3b7fe", null);
}),
"[project]/lib/graphql/queries/routers.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ALL_ROUTERS_QUERY",
    ()=>ALL_ROUTERS_QUERY,
    "CREATE_ROUTER_MUTATION",
    ()=>CREATE_ROUTER_MUTATION,
    "DELETE_ROUTER_MUTATION",
    ()=>DELETE_ROUTER_MUTATION,
    "ROUTERS_QUERY",
    ()=>ROUTERS_QUERY,
    "ROUTER_DETAIL_QUERY",
    ()=>ROUTER_DETAIL_QUERY,
    "UPDATE_ROUTER_MUTATION",
    ()=>UPDATE_ROUTER_MUTATION
]);
const ROUTERS_QUERY = `
  query GetRouters($first: Int!, $page: Int) {
    routers(first: $first, page: $page) {
      data {
        id
        name
      }
      paginatorInfo {
        count
        total
      }
    }
  }
`;
const ROUTER_DETAIL_QUERY = `
  query GetRouter($id: ID!) {
    router(id: $id) {
      id
      name
    }
  }
`;
const ALL_ROUTERS_QUERY = `
  query GetAllRouters {
    routers(first: 100) {
      data {
        id
        name
      }
    }
  }
`;
const CREATE_ROUTER_MUTATION = `
  mutation CreateRouter($name: String!) {
    createRouter(name: $name) {
      id
      name
    }
  }
`;
const UPDATE_ROUTER_MUTATION = `
  mutation UpdateRouter($id: ID!, $name: String) {
    updateRouter(id: $id, name: $name) {
      id
      name
    }
  }
`;
const DELETE_ROUTER_MUTATION = `
  mutation DeleteRouter($id: ID!) {
    deleteRouter(id: $id) {
      id
      name
    }
  }
`;
}),
"[project]/app/actions/routers.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"00fbfaa2273b1d800d4ca22aa0e92ebc574467b418":"getAllRouters","4008d58cdd5e5eab5497702887e14671200e288d89":"getRouter","402cb2bc9e7ed76d8a347c301d55b80d3f394e846f":"updateRouter","407e18af4369c42435866b1756e58d963ae595ee08":"createRouter","40a9923948d50831a9b05bde9111fc9e463dbcbc59":"deleteRouter","60b7ae16c33bd5937f46a1d39b6235859037176ca8":"getRouters"},"",""] */ __turbopack_context__.s([
    "createRouter",
    ()=>createRouter,
    "deleteRouter",
    ()=>deleteRouter,
    "getAllRouters",
    ()=>getAllRouters,
    "getRouter",
    ()=>getRouter,
    "getRouters",
    ()=>getRouters,
    "updateRouter",
    ()=>updateRouter
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.7_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/graphql/client.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$queries$2f$routers$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/graphql/queries/routers.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.7_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
async function getRouters(page = 1, perPage = 10) {
    try {
        const data = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["graphqlClient"].request(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$queries$2f$routers$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ROUTERS_QUERY"], {
            first: perPage,
            page
        });
        return {
            success: true,
            data: data.routers.data,
            paginatorInfo: data.routers.paginatorInfo
        };
    } catch (error) {
        console.error("Error fetching routers:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}
async function getRouter(id) {
    try {
        const data = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["graphqlClient"].request(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$queries$2f$routers$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ROUTER_DETAIL_QUERY"], {
            id
        });
        return {
            success: true,
            data: data.router
        };
    } catch (error) {
        console.error("Error fetching router:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}
async function getAllRouters() {
    try {
        const data = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["graphqlClient"].request(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$queries$2f$routers$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ALL_ROUTERS_QUERY"]);
        return {
            success: true,
            data: data.routers.data
        };
    } catch (error) {
        console.error("Error fetching all routers:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}
async function createRouter(input) {
    try {
        const data = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["graphqlClient"].request(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$queries$2f$routers$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CREATE_ROUTER_MUTATION"], input);
        return {
            success: true,
            data: data.createRouter
        };
    } catch (error) {
        console.error("Error creating router:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}
async function updateRouter(input) {
    try {
        const data = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["graphqlClient"].request(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$queries$2f$routers$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["UPDATE_ROUTER_MUTATION"], input);
        return {
            success: true,
            data: data.updateRouter
        };
    } catch (error) {
        console.error("Error updating router:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}
async function deleteRouter(id) {
    try {
        const data = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["graphqlClient"].request(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$queries$2f$routers$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["DELETE_ROUTER_MUTATION"], {
            id
        });
        return {
            success: true,
            data: data.deleteRouter
        };
    } catch (error) {
        console.error("Error deleting router:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    getRouters,
    getRouter,
    getAllRouters,
    createRouter,
    updateRouter,
    deleteRouter
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getRouters, "60b7ae16c33bd5937f46a1d39b6235859037176ca8", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getRouter, "4008d58cdd5e5eab5497702887e14671200e288d89", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getAllRouters, "00fbfaa2273b1d800d4ca22aa0e92ebc574467b418", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(createRouter, "407e18af4369c42435866b1756e58d963ae595ee08", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(updateRouter, "402cb2bc9e7ed76d8a347c301d55b80d3f394e846f", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(deleteRouter, "40a9923948d50831a9b05bde9111fc9e463dbcbc59", null);
}),
"[project]/.next-internal/server/app/settings/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/actions/auth.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE1 => \"[project]/app/actions/config.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE2 => \"[project]/app/actions/routers.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/actions/auth.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$config$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/actions/config.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$routers$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/actions/routers.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
}),
"[project]/.next-internal/server/app/settings/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/actions/auth.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE1 => \"[project]/app/actions/config.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE2 => \"[project]/app/actions/routers.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "00823ee83b33f7e22738876fb0d73fe9cdf556bf5d",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["logout"],
    "008947732681fd7425528ade1ff89eac88313df42f",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getCurrentUser"],
    "0094b4ed3ebc226f1ffa4e4379a8c7ce1a8dfb07d8",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getAccessToken"],
    "00c8ca9d9573e6bae0b213c801e92de5d4900241c1",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["refreshToken"],
    "00dd78d1e262fd4fcf549bb7325d603acea943398e",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$config$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getConfigSchema"],
    "00fbfaa2273b1d800d4ca22aa0e92ebc574467b418",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$routers$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getAllRouters"],
    "40a2857107dcfe738d2e704fa18ee9a4e72ca2e68d",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["login"],
    "40f876ea8efdc30ada0500153830b44d56c1c9dd59",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$config$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getConfigFields"],
    "607f5b6578f0e64a4eef22fb021948bb227ca3b7fe",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$config$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["saveConfigValues"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$settings$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$app$2f$actions$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE1__$3d3e$__$225b$project$5d2f$app$2f$actions$2f$config$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE2__$3d3e$__$225b$project$5d2f$app$2f$actions$2f$routers$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/settings/page/actions.js { ACTIONS_MODULE0 => "[project]/app/actions/auth.ts [app-rsc] (ecmascript)", ACTIONS_MODULE1 => "[project]/app/actions/config.ts [app-rsc] (ecmascript)", ACTIONS_MODULE2 => "[project]/app/actions/routers.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/actions/auth.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$config$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/actions/config.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$routers$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/actions/routers.ts [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=_656457fe._.js.map