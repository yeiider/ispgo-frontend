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
"[project]/lib/graphql/queries/customers.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CREATE_CUSTOMER_MUTATION",
    ()=>CREATE_CUSTOMER_MUTATION,
    "CUSTOMERS_QUERY",
    ()=>CUSTOMERS_QUERY,
    "CUSTOMER_ADDRESSES_QUERY",
    ()=>CUSTOMER_ADDRESSES_QUERY,
    "CUSTOMER_DETAIL_QUERY",
    ()=>CUSTOMER_DETAIL_QUERY,
    "DELETE_CUSTOMER_MUTATION",
    ()=>DELETE_CUSTOMER_MUTATION,
    "UPDATE_CUSTOMER_MUTATION",
    ()=>UPDATE_CUSTOMER_MUTATION
]);
const CUSTOMERS_QUERY = `
  query GetCustomers(
    $first: Int!, 
    $page: Int,
    $search: String,
    $customer_status: String
  ) {
    customers(
      first: $first, 
      page: $page,
      search: $search,
      customer_status: $customer_status
    ) {
      data {
        id
        first_name
        last_name
        email_address
        phone_number
        identity_document
        document_type
        customer_status
        created_at
        updated_at
        router {
          id
          name
        }
        services {
          id
          service_status
          plan {
            name
            monthly_price
          }
        }
      }
      paginatorInfo {
        currentPage
        lastPage
        perPage
        total
        hasMorePages
      }
    }
  }
`;
const CUSTOMER_DETAIL_QUERY = `
  query GetCustomer($id: ID!) {
    customer(id: $id) {
      id
      first_name
      last_name
      email_address
      phone_number
      identity_document
      document_type
      customer_status
      created_at
      updated_at
      router {
        id
        name
      }
      addresses {
        id
        address
        city
        state_province
        postal_code
        country
        address_type
      }
      services {
        id
        service_ip
        service_status
        activation_date
        router {
          id
          name
        }
        plan {
          id
          name
          monthly_price
        }
      }
      invoices {
        id
        increment_id
        total
        status
        issue_date
        due_date
      }
    }
  }
`;
const CUSTOMER_ADDRESSES_QUERY = `
  query GetCustomerAddresses($id: ID!) {
    customer(id: $id) {
      id
      first_name
      last_name
      addresses {
        id
        address
        city
        state_province
        postal_code
        country
        address_type
      }
    }
  }
`;
const CREATE_CUSTOMER_MUTATION = `
  mutation CreateCustomer(
    $first_name: String!
    $last_name: String!
    $email_address: String
    $phone_number: String
    $identity_document: String!
    $document_type: String!
    $router_id: Int
  ) {
    createCustomer(
      first_name: $first_name
      last_name: $last_name
      email_address: $email_address
      phone_number: $phone_number
      identity_document: $identity_document
      document_type: $document_type
      router_id: $router_id
    ) {
      id
      first_name
      last_name
      document_type
      router {
        id
        name
      }
      created_at
    }
  }
`;
const UPDATE_CUSTOMER_MUTATION = `
  mutation UpdateCustomer(
    $id: ID!
    $first_name: String
    $last_name: String
    $email_address: String
    $phone_number: String
    $document_type: String
    $router_id: Int
  ) {
    updateCustomer(
      id: $id
      first_name: $first_name
      last_name: $last_name
      email_address: $email_address
      phone_number: $phone_number
      document_type: $document_type
      router_id: $router_id
    ) {
      id
      first_name
      last_name
      email_address
      phone_number
      document_type
      router {
        id
        name
      }
    }
  }
`;
const DELETE_CUSTOMER_MUTATION = `
  mutation DeleteCustomer($id: ID!) {
    deleteCustomer(id: $id) {
      id
      first_name
    }
  }
`;
}),
"[project]/app/actions/customers.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"401fef05a21161e6672d98c9d2430b153707f286a8":"updateCustomer","40747871697d316569c792fe7c0f8771a581f6abe5":"createCustomer","40ada8376a3f7177e95154bdb5e6b0027d1b776212":"getCustomerAddresses","40cfe44500cc76cad7cd13938eaa5a6f06facbc089":"deleteCustomer","40e13fd311c8ee8fe7a756e3430e29c73369408f24":"getCustomer","700d172a9f8850884b79914b83a7151cfcf72c219f":"getCustomers"},"",""] */ __turbopack_context__.s([
    "createCustomer",
    ()=>createCustomer,
    "deleteCustomer",
    ()=>deleteCustomer,
    "getCustomer",
    ()=>getCustomer,
    "getCustomerAddresses",
    ()=>getCustomerAddresses,
    "getCustomers",
    ()=>getCustomers,
    "updateCustomer",
    ()=>updateCustomer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.7_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/graphql/client.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$queries$2f$customers$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/graphql/queries/customers.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.7_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/cache.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.7_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
;
async function getCustomers(page = 1, perPage = 10, filters) {
    try {
        const variables = {
            first: perPage,
            page
        };
        // Use global search parameter - searches across first_name, last_name, identity_document, email_address with OR
        if (filters?.search) {
            variables.search = filters.search; // No % needed - API handles it
        }
        // Status filter can be combined with search
        if (filters?.customer_status && filters.customer_status !== "all") {
            variables.customer_status = filters.customer_status;
        }
        const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["graphqlRequest"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$queries$2f$customers$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CUSTOMERS_QUERY"], variables);
        return {
            success: true,
            data: data.customers
        };
    } catch (error) {
        console.error("Error fetching customers:", error);
        return {
            success: false,
            error: error.message
        };
    }
}
async function getCustomer(id) {
    try {
        const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["graphqlRequest"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$queries$2f$customers$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CUSTOMER_DETAIL_QUERY"], {
            id
        });
        return {
            success: true,
            data: data.customer
        };
    } catch (error) {
        console.error("Error fetching customer:", error);
        return {
            success: false,
            error: error.message
        };
    }
}
async function createCustomer(input) {
    try {
        const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["graphqlRequest"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$queries$2f$customers$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CREATE_CUSTOMER_MUTATION"], input);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/clients", "page");
        return {
            success: true,
            data: data.createCustomer
        };
    } catch (error) {
        console.error("Error creating customer:", error);
        return {
            success: false,
            error: error.message
        };
    }
}
async function updateCustomer(input) {
    try {
        const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["graphqlRequest"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$queries$2f$customers$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["UPDATE_CUSTOMER_MUTATION"], input);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/clients", "page");
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])(`/clients/${input.id}`, "page");
        return {
            success: true,
            data: data.updateCustomer
        };
    } catch (error) {
        console.error("Error updating customer:", error);
        return {
            success: false,
            error: error.message
        };
    }
}
async function deleteCustomer(id) {
    try {
        const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["graphqlRequest"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$queries$2f$customers$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["DELETE_CUSTOMER_MUTATION"], {
            id
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/clients", "page");
        return {
            success: true,
            data: data.deleteCustomer
        };
    } catch (error) {
        console.error("Error deleting customer:", error);
        return {
            success: false,
            error: error.message
        };
    }
}
async function getCustomerAddresses(id) {
    try {
        const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["graphqlRequest"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$queries$2f$customers$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CUSTOMER_ADDRESSES_QUERY"], {
            id
        });
        return {
            success: true,
            data: data.customer
        };
    } catch (error) {
        console.error("Error fetching customer addresses:", error);
        return {
            success: false,
            error: error.message
        };
    }
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    getCustomers,
    getCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerAddresses
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getCustomers, "700d172a9f8850884b79914b83a7151cfcf72c219f", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getCustomer, "40e13fd311c8ee8fe7a756e3430e29c73369408f24", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(createCustomer, "40747871697d316569c792fe7c0f8771a581f6abe5", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(updateCustomer, "401fef05a21161e6672d98c9d2430b153707f286a8", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(deleteCustomer, "40cfe44500cc76cad7cd13938eaa5a6f06facbc089", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getCustomerAddresses, "40ada8376a3f7177e95154bdb5e6b0027d1b776212", null);
}),
"[project]/lib/graphql/queries/services.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CREATE_SERVICE_MUTATION",
    ()=>CREATE_SERVICE_MUTATION,
    "SERVICES_QUERY",
    ()=>SERVICES_QUERY,
    "SERVICE_DETAIL_QUERY",
    ()=>SERVICE_DETAIL_QUERY,
    "UPDATE_SERVICE_MUTATION",
    ()=>UPDATE_SERVICE_MUTATION
]);
const SERVICES_QUERY = `
  query GetServices(
    $first: Int!, 
    $page: Int,
    $service_ip: String,
    $service_status: String,
    $sn: String
  ) {
    services(
      first: $first, 
      page: $page,
      service_ip: $service_ip,
      service_status: $service_status,
      sn: $sn
    ) {
      data {
        id
        service_ip
        service_status
        activation_date
        sn
        service_type
        installation_date
        created_at
        updated_at
        customer {
          id
          first_name
          last_name
          email_address
        }
        plan {
          id
          name
          monthly_price
        }
        router {
          id
          name
        }
        address {
          id
          address
          city
        }
      }
      paginatorInfo {
        currentPage
        lastPage
        perPage
        total
        hasMorePages
      }
    }
  }
`;
const SERVICE_DETAIL_QUERY = `
  query GetService($id: ID!) {
    service(id: $id) {
      id
      service_ip
      service_status
      activation_date
      service_location
      sn
      unu_longitude
      unu_latitude
      service_type
      installation_date
      created_at
      updated_at
      customer {
        id
        first_name
        last_name
        email_address
        phone_number
      }
      plan {
        id
        name
        monthly_price
        download_speed
        upload_speed
      }
      router {
        id
        name
      }
      address {
        id
        address
        city
        state_province
      }
      invoices {
        id
        increment_id
        total
        status
        issue_date
        due_date
      }
    }
  }
`;
const CREATE_SERVICE_MUTATION = `mutation CreateService($customer_id: Int!, $plan_id: Int!, $router_id: Int!, $service_ip: String!, $service_location: Int!, $service_status: String, $sn: String, $unu_longitude: String, $unu_latitude: String, $service_type: String, $activation_date: DateTime, $installation_date: DateTime) { createService(customer_id: $customer_id, plan_id: $plan_id, router_id: $router_id, service_ip: $service_ip, service_location: $service_location, service_status: $service_status, sn: $sn, unu_longitude: $unu_longitude, unu_latitude: $unu_latitude, service_type: $service_type, activation_date: $activation_date, installation_date: $installation_date) { id service_ip service_status sn service_type router { id name } customer { first_name } address { id address } } }`;
const UPDATE_SERVICE_MUTATION = `mutation UpdateService($id: ID!, $service_ip: String, $service_status: String, $plan_id: Int, $router_id: Int, $service_location: Int, $sn: String, $unu_longitude: String, $unu_latitude: String, $service_type: String, $activation_date: DateTime, $installation_date: DateTime) { updateService(id: $id, service_ip: $service_ip, service_status: $service_status, plan_id: $plan_id, router_id: $router_id, service_location: $service_location, sn: $sn, unu_longitude: $unu_longitude, unu_latitude: $unu_latitude, service_type: $service_type, activation_date: $activation_date, installation_date: $installation_date) { id service_ip service_status sn service_type router { id name } address { id address } } }`;
}),
"[project]/app/actions/services.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"400ce8cf7f8f4708ddd77ac4d1910f058b1e317cf3":"getService","4086a685f800246b7cde90f4797247977452194d60":"createService","40a4b0956f4e6b179140ade939e62df9723bc3f65d":"updateService","7092bd9b25cc6d0b12cf7c4eb437def3791abc625b":"getServices"},"",""] */ __turbopack_context__.s([
    "createService",
    ()=>createService,
    "getService",
    ()=>getService,
    "getServices",
    ()=>getServices,
    "updateService",
    ()=>updateService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.7_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/graphql/client.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$queries$2f$services$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/graphql/queries/services.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.7_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/cache.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.7_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
;
async function getServices(page = 1, perPage = 10, filters) {
    try {
        // Build variables object with search parameters
        const variables = {
            first: perPage,
            page
        };
        // Add search filters if provided - using "like" pattern for partial matching
        if (filters?.service_ip) {
            variables.service_ip = `%${filters.service_ip}%`;
        }
        if (filters?.sn) {
            variables.sn = `%${filters.sn}%`;
        }
        if (filters?.service_status && filters.service_status !== "all") {
            variables.service_status = filters.service_status;
        }
        const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["graphqlRequest"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$queries$2f$services$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SERVICES_QUERY"], variables);
        return {
            success: true,
            data: data.services
        };
    } catch (error) {
        console.error("Error fetching services:", error);
        return {
            success: false,
            error: error.message
        };
    }
}
async function getService(id) {
    try {
        const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["graphqlRequest"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$queries$2f$services$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SERVICE_DETAIL_QUERY"], {
            id
        });
        return {
            success: true,
            data: data.service
        };
    } catch (error) {
        console.error("Error fetching service:", error);
        return {
            success: false,
            error: error.message
        };
    }
}
async function createService(input) {
    try {
        const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["graphqlRequest"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$queries$2f$services$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CREATE_SERVICE_MUTATION"], input);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/services", "page");
        return {
            success: true,
            data: data.createService
        };
    } catch (error) {
        console.error("Error creating service:", error);
        return {
            success: false,
            error: error.message
        };
    }
}
async function updateService(input) {
    try {
        const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["graphqlRequest"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$queries$2f$services$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["UPDATE_SERVICE_MUTATION"], input);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/services", "page");
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])(`/services/${input.id}`, "page");
        return {
            success: true,
            data: data.updateService
        };
    } catch (error) {
        console.error("Error updating service:", error);
        return {
            success: false,
            error: error.message
        };
    }
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    getServices,
    getService,
    createService,
    updateService
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getServices, "7092bd9b25cc6d0b12cf7c4eb437def3791abc625b", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getService, "400ce8cf7f8f4708ddd77ac4d1910f058b1e317cf3", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(createService, "4086a685f800246b7cde90f4797247977452194d60", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(updateService, "40a4b0956f4e6b179140ade939e62df9723bc3f65d", null);
}),
"[project]/.next-internal/server/app/tickets/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/actions/auth.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE1 => \"[project]/app/actions/customers.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE2 => \"[project]/app/actions/services.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/actions/auth.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$customers$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/actions/customers.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$services$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/actions/services.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
;
}),
"[project]/.next-internal/server/app/tickets/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/actions/auth.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE1 => \"[project]/app/actions/customers.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE2 => \"[project]/app/actions/services.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
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
    "40a2857107dcfe738d2e704fa18ee9a4e72ca2e68d",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["login"],
    "700d172a9f8850884b79914b83a7151cfcf72c219f",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$customers$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getCustomers"],
    "7092bd9b25cc6d0b12cf7c4eb437def3791abc625b",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$services$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getServices"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$tickets$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$app$2f$actions$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE1__$3d3e$__$225b$project$5d2f$app$2f$actions$2f$customers$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE2__$3d3e$__$225b$project$5d2f$app$2f$actions$2f$services$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/tickets/page/actions.js { ACTIONS_MODULE0 => "[project]/app/actions/auth.ts [app-rsc] (ecmascript)", ACTIONS_MODULE1 => "[project]/app/actions/customers.ts [app-rsc] (ecmascript)", ACTIONS_MODULE2 => "[project]/app/actions/services.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/actions/auth.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$customers$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/actions/customers.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$services$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/actions/services.ts [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=_69ac6095._.js.map