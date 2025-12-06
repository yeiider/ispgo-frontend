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
"[project]/lib/graphql/queries/tickets.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ADD_TICKET_COMMENT_MUTATION",
    ()=>ADD_TICKET_COMMENT_MUTATION,
    "ADD_TICKET_LABEL_MUTATION",
    ()=>ADD_TICKET_LABEL_MUTATION,
    "ASSIGN_USERS_TO_TICKET_MUTATION",
    ()=>ASSIGN_USERS_TO_TICKET_MUTATION,
    "CREATE_TICKET_MUTATION",
    ()=>CREATE_TICKET_MUTATION,
    "DELETE_TICKET_MUTATION",
    ()=>DELETE_TICKET_MUTATION,
    "MY_TICKETS_QUERY",
    ()=>MY_TICKETS_QUERY,
    "REMOVE_TICKET_LABEL_MUTATION",
    ()=>REMOVE_TICKET_LABEL_MUTATION,
    "TICKETS_QUERY",
    ()=>TICKETS_QUERY,
    "TICKET_QUERY",
    ()=>TICKET_QUERY,
    "UPDATE_TICKET_MUTATION",
    ()=>UPDATE_TICKET_MUTATION
]);
const TICKETS_QUERY = `
  query GetTickets(
    $status: String, 
    $priority: String, 
    $customerId: ID, 
    $serviceId: ID, 
    $title: String,
    $first: Int,
    $page: Int
  ) {
    tickets(
      status: $status
      priority: $priority
      customer_id: $customerId
      service_id: $serviceId
      title: $title
      first: $first
      page: $page
    ) {
      paginatorInfo {
        count
        currentPage
        total
        lastPage
        hasMorePages
      }
      data {
        id
        title
        description
        status
        priority
        issue_type
        contact_method
        closed_at
        created_at
        updated_at
        customer {
          id
          first_name
          last_name
          email_address
        }
        service {
          id
          service_ip
          service_status
        }
        users {
          id
          name
          email
        }
        labels {
          name
          color
        }
        comments {
          id
          comment
          is_internal
          created_at
          user {
            id
            name
          }
        }
        attachments {
          id
          file_name
          file_path
          file_type
          file_size
          created_at
          user {
            id
            name
          }
        }
      }
    }
  }
`;
const TICKET_QUERY = `
  query GetTicket($id: ID!) {
    ticket(id: $id) {
      id
      title
      description
      status
      priority
      issue_type
      contact_method
      resolution_notes
      closed_at
      created_at
      updated_at
      customer {
        id
        first_name
        last_name
        email_address
        phone_number
      }
      service {
        id
        service_ip
        service_status
        plan {
          name
        }
      }
      users {
        id
        name
        email
        roles {
          id
          name
        }
      }
      labels {
        name
        color
      }
      comments {
        id
        comment
        is_internal
        created_at
        user {
          id
          name
        }
      }
      attachments {
        id
        file_name
        file_path
        file_type
        file_size
        created_at
        user {
          id
          name
        }
      }
    }
  }
`;
const MY_TICKETS_QUERY = `
  query GetMyTickets {
    myTickets {
      id
      title
      description
      status
      priority
      issue_type
      created_at
      customer {
        id
        first_name
        last_name
      }
      service {
        id
        service_ip
      }
      labels {
        name
        color
      }
    }
  }
`;
const CREATE_TICKET_MUTATION = `
  mutation CreateTicket(
    $customer_id: ID
    $service_id: ID
    $issue_type: String!
    $priority: String!
    $status: String
    $title: String!
    $description: String!
    $contact_method: String
    $user_ids: [ID!]
  ) {
    createTicket(
      customer_id: $customer_id
      service_id: $service_id
      issue_type: $issue_type
      priority: $priority
      status: $status
      title: $title
      description: $description
      contact_method: $contact_method
      user_ids: $user_ids
    ) {
      id
      title
      description
      status
      priority
      issue_type
      created_at
      customer {
        id
        first_name
        last_name
      }
      service {
        id
        service_ip
      }
      users {
        id
        name
        email
      }
      labels {
        name
        color
      }
    }
  }
`;
const UPDATE_TICKET_MUTATION = `
  mutation UpdateTicket(
    $id: ID!
    $customer_id: ID
    $service_id: ID
    $issue_type: String
    $priority: String
    $status: String
    $title: String
    $description: String
    $contact_method: String
    $resolution_notes: String
  ) {
    updateTicket(
      id: $id
      customer_id: $customer_id
      service_id: $service_id
      issue_type: $issue_type
      priority: $priority
      status: $status
      title: $title
      description: $description
      contact_method: $contact_method
      resolution_notes: $resolution_notes
    ) {
      id
      title
      description
      status
      priority
      resolution_notes
      updated_at
    }
  }
`;
const DELETE_TICKET_MUTATION = `
  mutation DeleteTicket($id: ID!) {
    deleteTicket(id: $id) {
      success
      message
    }
  }
`;
const ASSIGN_USERS_TO_TICKET_MUTATION = `
  mutation AssignUsersToTicket($ticketId: ID!, $userIds: [ID!]!) {
    assignUsersToTicket(ticket_id: $ticketId, user_ids: $userIds) {
      id
      title
      users {
        id
        name
        email
        roles {
          id
          name
        }
      }
    }
  }
`;
const ADD_TICKET_COMMENT_MUTATION = `
  mutation AddTicketComment($ticketId: ID!, $comment: String!, $isInternal: Boolean) {
    addTicketComment(
      ticket_id: $ticketId
      comment: $comment
      is_internal: $isInternal
    ) {
      id
      comment
      is_internal
      created_at
      user {
        id
        name
        email
      }
    }
  }
`;
const ADD_TICKET_LABEL_MUTATION = `
  mutation AddTicketLabel($ticketId: ID!, $name: String!, $color: String) {
    addTicketLabel(ticket_id: $ticketId, name: $name, color: $color) {
      id
      labels {
        name
        color
      }
    }
  }
`;
const REMOVE_TICKET_LABEL_MUTATION = `
  mutation RemoveTicketLabel($ticketId: ID!, $name: String!) {
    removeTicketLabel(ticket_id: $ticketId, name: $name) {
      id
      labels {
        name
        color
      }
    }
  }
`;
}),
"[project]/app/actions/tickets.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"401d2871882af463a59d5be1e18f34188390fea492":"getTicket","40970332c3be0011726a40c25ae368df1638847277":"deleteTicket","40b9353f639b2c54a2232b77110347ac03a9eed89c":"createTicket","40ef2c326d2bdc4c88174167422aae44465da5133d":"updateTicket","60b1fbcc9806da18cd92f69e264e35283b445cfe9c":"removeTicketLabel","60f259e0fed6ae9c84676f4e561c616983bd7fdb47":"assignUsersToTicket","7022a1faf39e03459e0b617b419264c1f7fc336d0a":"getTickets","70923d44b7ab37ea2a622cfbba165f86f0021b12a2":"addTicketComment","7092eb34981abd6a47c0613057b538716cd08c4fdc":"addTicketLabel"},"",""] */ __turbopack_context__.s([
    "addTicketComment",
    ()=>addTicketComment,
    "addTicketLabel",
    ()=>addTicketLabel,
    "assignUsersToTicket",
    ()=>assignUsersToTicket,
    "createTicket",
    ()=>createTicket,
    "deleteTicket",
    ()=>deleteTicket,
    "getTicket",
    ()=>getTicket,
    "getTickets",
    ()=>getTickets,
    "removeTicketLabel",
    ()=>removeTicketLabel,
    "updateTicket",
    ()=>updateTicket
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.7_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/graphql/client.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$queries$2f$tickets$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/graphql/queries/tickets.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.7_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
async function getTickets(page = 1, perPage = 50, filters) {
    const variables = {
        first: perPage,
        page
    };
    if (filters?.status) {
        variables.status = filters.status;
    }
    if (filters?.priority) {
        variables.priority = filters.priority;
    }
    if (filters?.customer_id) {
        variables.customerId = filters.customer_id;
    }
    if (filters?.service_id) {
        variables.serviceId = filters.service_id;
    }
    if (filters?.title) {
        variables.title = `%${filters.title}%`;
    }
    const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["graphqlRequest"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$queries$2f$tickets$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["TICKETS_QUERY"], variables);
    return response.tickets;
}
async function getTicket(id) {
    const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["graphqlRequest"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$queries$2f$tickets$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["TICKET_QUERY"], {
        id
    });
    return response.ticket;
}
async function createTicket(input) {
    const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["graphqlRequest"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$queries$2f$tickets$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CREATE_TICKET_MUTATION"], {
        customer_id: input.customer_id || null,
        service_id: input.service_id || null,
        issue_type: input.issue_type,
        priority: input.priority,
        status: input.status || "open",
        title: input.title,
        description: input.description,
        contact_method: input.contact_method || null,
        user_ids: input.user_ids || []
    });
    return response.createTicket;
}
async function updateTicket(input) {
    const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["graphqlRequest"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$queries$2f$tickets$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["UPDATE_TICKET_MUTATION"], {
        id: input.id,
        customer_id: input.customer_id,
        service_id: input.service_id,
        issue_type: input.issue_type,
        priority: input.priority,
        status: input.status,
        title: input.title,
        description: input.description,
        contact_method: input.contact_method,
        resolution_notes: input.resolution_notes
    });
    return response.updateTicket;
}
async function deleteTicket(id) {
    const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["graphqlRequest"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$queries$2f$tickets$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["DELETE_TICKET_MUTATION"], {
        id
    });
    return response.deleteTicket;
}
async function addTicketComment(ticketId, comment, isInternal = false) {
    const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["graphqlRequest"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$queries$2f$tickets$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ADD_TICKET_COMMENT_MUTATION"], {
        ticketId,
        comment,
        isInternal
    });
    return response.addTicketComment;
}
async function addTicketLabel(ticketId, name, color = "#3498db") {
    const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["graphqlRequest"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$queries$2f$tickets$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ADD_TICKET_LABEL_MUTATION"], {
        ticketId,
        name,
        color
    });
    return response.addTicketLabel;
}
async function removeTicketLabel(ticketId, name) {
    const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["graphqlRequest"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$queries$2f$tickets$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["REMOVE_TICKET_LABEL_MUTATION"], {
        ticketId,
        name
    });
    return response.removeTicketLabel;
}
async function assignUsersToTicket(ticketId, userIds) {
    const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["graphqlRequest"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$queries$2f$tickets$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ASSIGN_USERS_TO_TICKET_MUTATION"], {
        ticketId,
        userIds
    });
    return response.assignUsersToTicket;
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    getTickets,
    getTicket,
    createTicket,
    updateTicket,
    deleteTicket,
    addTicketComment,
    addTicketLabel,
    removeTicketLabel,
    assignUsersToTicket
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getTickets, "7022a1faf39e03459e0b617b419264c1f7fc336d0a", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getTicket, "401d2871882af463a59d5be1e18f34188390fea492", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(createTicket, "40b9353f639b2c54a2232b77110347ac03a9eed89c", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(updateTicket, "40ef2c326d2bdc4c88174167422aae44465da5133d", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(deleteTicket, "40970332c3be0011726a40c25ae368df1638847277", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(addTicketComment, "70923d44b7ab37ea2a622cfbba165f86f0021b12a2", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(addTicketLabel, "7092eb34981abd6a47c0613057b538716cd08c4fdc", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(removeTicketLabel, "60b1fbcc9806da18cd92f69e264e35283b445cfe9c", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(assignUsersToTicket, "60f259e0fed6ae9c84676f4e561c616983bd7fdb47", null);
}),
"[project]/lib/graphql/queries/users.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Users, Roles, and Permissions GraphQL Queries and Mutations
// ==================== USERS ====================
__turbopack_context__.s([
    "ASSIGN_PERMISSION_TO_ROLE_MUTATION",
    ()=>ASSIGN_PERMISSION_TO_ROLE_MUTATION,
    "ASSIGN_PERMISSION_TO_USER_MUTATION",
    ()=>ASSIGN_PERMISSION_TO_USER_MUTATION,
    "ASSIGN_ROLE_TO_USER_MUTATION",
    ()=>ASSIGN_ROLE_TO_USER_MUTATION,
    "CREATE_PERMISSION_MUTATION",
    ()=>CREATE_PERMISSION_MUTATION,
    "CREATE_ROLE_MUTATION",
    ()=>CREATE_ROLE_MUTATION,
    "CREATE_USER_MUTATION",
    ()=>CREATE_USER_MUTATION,
    "DELETE_PERMISSION_MUTATION",
    ()=>DELETE_PERMISSION_MUTATION,
    "DELETE_ROLE_MUTATION",
    ()=>DELETE_ROLE_MUTATION,
    "DELETE_USER_MUTATION",
    ()=>DELETE_USER_MUTATION,
    "PERMISSIONS_QUERY",
    ()=>PERMISSIONS_QUERY,
    "PERMISSION_DETAIL_QUERY",
    ()=>PERMISSION_DETAIL_QUERY,
    "REMOVE_PERMISSION_FROM_ROLE_MUTATION",
    ()=>REMOVE_PERMISSION_FROM_ROLE_MUTATION,
    "REMOVE_PERMISSION_FROM_USER_MUTATION",
    ()=>REMOVE_PERMISSION_FROM_USER_MUTATION,
    "REMOVE_ROLE_FROM_USER_MUTATION",
    ()=>REMOVE_ROLE_FROM_USER_MUTATION,
    "ROLES_QUERY",
    ()=>ROLES_QUERY,
    "ROLE_DETAIL_QUERY",
    ()=>ROLE_DETAIL_QUERY,
    "SYNC_PERMISSIONS_TO_ROLE_MUTATION",
    ()=>SYNC_PERMISSIONS_TO_ROLE_MUTATION,
    "SYNC_PERMISSIONS_TO_USER_MUTATION",
    ()=>SYNC_PERMISSIONS_TO_USER_MUTATION,
    "SYNC_ROLES_TO_USER_MUTATION",
    ()=>SYNC_ROLES_TO_USER_MUTATION,
    "UPDATE_PERMISSION_MUTATION",
    ()=>UPDATE_PERMISSION_MUTATION,
    "UPDATE_ROLE_MUTATION",
    ()=>UPDATE_ROLE_MUTATION,
    "UPDATE_USER_MUTATION",
    ()=>UPDATE_USER_MUTATION,
    "USERS_QUERY",
    ()=>USERS_QUERY,
    "USERS_SIMPLE_QUERY",
    ()=>USERS_SIMPLE_QUERY,
    "USER_DETAIL_QUERY",
    ()=>USER_DETAIL_QUERY
]);
const USERS_SIMPLE_QUERY = `
  query GetUsersSimple($first: Int!, $page: Int, $name: String) {
    users(first: $first, page: $page, name: $name) {
      data {
        id
        name
        email
        telephone
      }
      paginatorInfo {
        count
        currentPage
        hasMorePages
        total
        lastPage
        perPage
      }
    }
  }
`;
const USERS_QUERY = `
  query GetUsers($first: Int!, $page: Int, $name: String) {
    users(first: $first, page: $page, name: $name) {
      data {
        id
        name
        email
        telephone
        router_id
        created_at
        updated_at
        roles {
          id
          name
        }
        permissions {
          id
          name
        }
        allPermissions {
          id
          name
        }
      }
      paginatorInfo {
        count
        currentPage
        hasMorePages
        total
        lastPage
        perPage
      }
    }
  }
`;
const USER_DETAIL_QUERY = `
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      name
      email
      telephone
      router_id
      created_at
      updated_at
      roles {
        id
        name
        permissions {
          id
          name
        }
      }
      permissions {
        id
        name
      }
      allPermissions {
        id
        name
      }
    }
  }
`;
const CREATE_USER_MUTATION = `
  mutation CreateUser(
    $name: String!
    $email: String!
    $password: String!
    $telephone: String
    $router_id: Int
  ) {
    createUser(
      name: $name
      email: $email
      password: $password
      telephone: $telephone
      router_id: $router_id
    ) {
      id
      name
      email
      telephone
      created_at
    }
  }
`;
const UPDATE_USER_MUTATION = `
  mutation UpdateUser(
    $id: ID!
    $name: String
    $email: String
    $telephone: String
  ) {
    updateUser(
      id: $id
      name: $name
      email: $email
      telephone: $telephone
    ) {
      id
      name
      email
      telephone
      updated_at
    }
  }
`;
const DELETE_USER_MUTATION = `
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id) {
      success
      message
    }
  }
`;
const ROLES_QUERY = `
  query GetRoles {
    roles {
      id
      name
      guard_name
      created_at
      permissions {
        id
        name
      }
      users {
        id
        name
        email
      }
    }
  }
`;
const ROLE_DETAIL_QUERY = `
  query GetRole($id: ID!) {
    role(id: $id) {
      id
      name
      guard_name
      created_at
      permissions {
        id
        name
      }
      users {
        id
        name
        email
      }
    }
  }
`;
const CREATE_ROLE_MUTATION = `
  mutation CreateRole($name: String!, $guard_name: String) {
    createRole(name: $name, guard_name: $guard_name) {
      id
      name
      guard_name
      created_at
    }
  }
`;
const UPDATE_ROLE_MUTATION = `
  mutation UpdateRole($id: ID!, $name: String!) {
    updateRole(id: $id, name: $name) {
      id
      name
      updated_at
    }
  }
`;
const DELETE_ROLE_MUTATION = `
  mutation DeleteRole($id: ID!) {
    deleteRole(id: $id) {
      success
      message
    }
  }
`;
const PERMISSIONS_QUERY = `
  query GetPermissions {
    permissions {
      id
      name
      guard_name
      created_at
      roles {
        id
        name
      }
    }
  }
`;
const PERMISSION_DETAIL_QUERY = `
  query GetPermission($id: ID!) {
    permission(id: $id) {
      id
      name
      guard_name
      created_at
      roles {
        id
        name
      }
      users {
        id
        name
      }
    }
  }
`;
const CREATE_PERMISSION_MUTATION = `
  mutation CreatePermission($name: String!, $guard_name: String) {
    createPermission(name: $name, guard_name: $guard_name) {
      id
      name
      guard_name
      created_at
    }
  }
`;
const UPDATE_PERMISSION_MUTATION = `
  mutation UpdatePermission($id: ID!, $name: String!) {
    updatePermission(id: $id, name: $name) {
      id
      name
      updated_at
    }
  }
`;
const DELETE_PERMISSION_MUTATION = `
  mutation DeletePermission($id: ID!) {
    deletePermission(id: $id) {
      success
      message
    }
  }
`;
const ASSIGN_ROLE_TO_USER_MUTATION = `
  mutation AssignRoleToUser($user_id: ID!, $role_id: ID!) {
    assignRoleToUser(user_id: $user_id, role_id: $role_id) {
      id
      name
      roles {
        id
        name
      }
    }
  }
`;
const REMOVE_ROLE_FROM_USER_MUTATION = `
  mutation RemoveRoleFromUser($user_id: ID!, $role_id: ID!) {
    removeRoleFromUser(user_id: $user_id, role_id: $role_id) {
      id
      name
      roles {
        id
        name
      }
    }
  }
`;
const SYNC_ROLES_TO_USER_MUTATION = `
  mutation SyncRolesToUser($user_id: ID!, $role_ids: [ID!]!) {
    syncRolesToUser(user_id: $user_id, role_ids: $role_ids) {
      id
      name
      roles {
        id
        name
      }
    }
  }
`;
const ASSIGN_PERMISSION_TO_ROLE_MUTATION = `
  mutation AssignPermissionToRole($role_id: ID!, $permission_id: ID!) {
    assignPermissionToRole(role_id: $role_id, permission_id: $permission_id) {
      id
      name
      permissions {
        id
        name
      }
    }
  }
`;
const REMOVE_PERMISSION_FROM_ROLE_MUTATION = `
  mutation RemovePermissionFromRole($role_id: ID!, $permission_id: ID!) {
    removePermissionFromRole(role_id: $role_id, permission_id: $permission_id) {
      id
      name
      permissions {
        id
        name
      }
    }
  }
`;
const SYNC_PERMISSIONS_TO_ROLE_MUTATION = `
  mutation SyncPermissionsToRole($role_id: ID!, $permission_ids: [ID!]!) {
    syncPermissionsToRole(role_id: $role_id, permission_ids: $permission_ids) {
      id
      name
      permissions {
        id
        name
      }
    }
  }
`;
const ASSIGN_PERMISSION_TO_USER_MUTATION = `
  mutation AssignPermissionToUser($user_id: ID!, $permission_id: ID!) {
    assignPermissionToUser(user_id: $user_id, permission_id: $permission_id) {
      id
      name
      permissions {
        id
        name
      }
      allPermissions {
        id
        name
      }
    }
  }
`;
const REMOVE_PERMISSION_FROM_USER_MUTATION = `
  mutation RemovePermissionFromUser($user_id: ID!, $permission_id: ID!) {
    removePermissionFromUser(user_id: $user_id, permission_id: $permission_id) {
      id
      name
      permissions {
        id
        name
      }
    }
  }
`;
const SYNC_PERMISSIONS_TO_USER_MUTATION = `
  mutation SyncPermissionsToUser($user_id: ID!, $permission_ids: [ID!]!) {
    syncPermissionsToUser(user_id: $user_id, permission_ids: $permission_ids) {
      id
      name
      permissions {
        id
        name
      }
      allPermissions {
        id
        name
      }
    }
  }
`;
}),
"[project]/app/actions/users.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"0002f25808714b760c9a86784115f4075b82b5b8e5":"getRoles","001f285ce015deed39afed4ed46b99481dd9ecc1dc":"getPermissions","400931e33fe2d0a45188c92b740299bf40579eec8b":"getRole","40146ff183514b9721221850d15a9affe9a5013274":"createPermission","4021c844cabe673dee2d9b1829bc5c8647e02923fa":"deletePermission","4047e0fff46c59c69fa5202ecf51b5108002261883":"deleteRole","4063e95c24439012a4f734f729332c107c6cd0abe9":"getUser","4070fae9c52425b3b754580e6d91ced8ed28a5fce2":"updateUser","40862407a9512956308d95d1fc5af44816473464a0":"updatePermission","4093e28cd6638832e0d07e4d5c6558e49721e74d8a":"createRole","40ac504d6eb813488bdc9e76c9a5d9606f6c36d547":"deleteUser","40d067d85e34dcdc662834d243e75d86bbe5c656dd":"updateRole","40e2d7476414478f62b8bd5b041992aa0fb36ee71a":"createUser","602fb63a1886c99453414ba0df5bb06bb6dbdc912b":"assignPermissionToUser","604ede92800ec85df7ef6570110bc2d00c382b4bb0":"removePermissionFromUser","606961978d522ce87766fda67f0b6ed5c85a70fd10":"assignRoleToUser","60778638c90ec98d9dbbad786aa2dffe527649fb3a":"syncPermissionsToRole","609fa73be3ea01e40f94ed7c0eccb81032e86f6bb9":"syncRolesToUser","60bb84214f417ef1c433a4c6d4feffd3dda7cb7898":"removeRoleFromUser","60e94126a80a008dd017a25bf8e59a35c7c4e97051":"syncPermissionsToUser","60ee7cb1f21f25bccf767f055fd7c58be0e4c70713":"assignPermissionToRole","60fb27157cf4c8fdf6daea2a1862d607aab482aac3":"removePermissionFromRole","7036156a894bb1538a4228dffd1aa32d059ab3d4c7":"getUsersSimple","70b220f8bae6e5674eb68452d92b43b48d027bf950":"getUsers"},"",""] */ __turbopack_context__.s([
    "assignPermissionToRole",
    ()=>assignPermissionToRole,
    "assignPermissionToUser",
    ()=>assignPermissionToUser,
    "assignRoleToUser",
    ()=>assignRoleToUser,
    "createPermission",
    ()=>createPermission,
    "createRole",
    ()=>createRole,
    "createUser",
    ()=>createUser,
    "deletePermission",
    ()=>deletePermission,
    "deleteRole",
    ()=>deleteRole,
    "deleteUser",
    ()=>deleteUser,
    "getPermissions",
    ()=>getPermissions,
    "getRole",
    ()=>getRole,
    "getRoles",
    ()=>getRoles,
    "getUser",
    ()=>getUser,
    "getUsers",
    ()=>getUsers,
    "getUsersSimple",
    ()=>getUsersSimple,
    "removePermissionFromRole",
    ()=>removePermissionFromRole,
    "removePermissionFromUser",
    ()=>removePermissionFromUser,
    "removeRoleFromUser",
    ()=>removeRoleFromUser,
    "syncPermissionsToRole",
    ()=>syncPermissionsToRole,
    "syncPermissionsToUser",
    ()=>syncPermissionsToUser,
    "syncRolesToUser",
    ()=>syncRolesToUser,
    "updatePermission",
    ()=>updatePermission,
    "updateRole",
    ()=>updateRole,
    "updateUser",
    ()=>updateUser
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.7_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/graphql/client.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$queries$2f$users$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/graphql/queries/users.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.7_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/cache.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.7_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
;
async function getUsers(page = 1, perPage = 10, filters) {
    try {
        const variables = {
            first: perPage,
            page
        };
        if (filters?.search) {
            variables.name = `%${filters.search}%`;
        }
        const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["graphqlRequest"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$queries$2f$users$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["USERS_QUERY"], variables);
        return {
            success: true,
            data: data.users
        };
    } catch (error) {
        console.error("Error fetching users:", error);
        return {
            success: false,
            error: error.message
        };
    }
}
async function getUsersSimple(page = 1, perPage = 50, search) {
    try {
        const variables = {
            first: perPage,
            page
        };
        if (search) {
            variables.name = `%${search}%`;
        }
        const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["graphqlRequest"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$queries$2f$users$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["USERS_SIMPLE_QUERY"], variables);
        return {
            success: true,
            data: data.users
        };
    } catch (error) {
        console.error("Error fetching users (simple):", error);
        return {
            success: false,
            error: error.message
        };
    }
}
async function getUser(id) {
    try {
        const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["graphqlRequest"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$queries$2f$users$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["USER_DETAIL_QUERY"], {
            id
        });
        return {
            success: true,
            data: data.user
        };
    } catch (error) {
        console.error("Error fetching user:", error);
        return {
            success: false,
            error: error.message
        };
    }
}
async function createUser(input) {
    try {
        const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["graphqlRequest"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$queries$2f$users$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CREATE_USER_MUTATION"], input);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/users", "page");
        return {
            success: true,
            data: data.createUser
        };
    } catch (error) {
        console.error("Error creating user:", error);
        return {
            success: false,
            error: error.message
        };
    }
}
async function updateUser(input) {
    try {
        const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["graphqlRequest"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$queries$2f$users$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["UPDATE_USER_MUTATION"], input);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/users", "page");
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])(`/users/${input.id}`, "page");
        return {
            success: true,
            data: data.updateUser
        };
    } catch (error) {
        console.error("Error updating user:", error);
        return {
            success: false,
            error: error.message
        };
    }
}
async function deleteUser(id) {
    try {
        const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["graphqlRequest"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$queries$2f$users$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["DELETE_USER_MUTATION"], {
            id
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/users", "page");
        return {
            success: true,
            data: data.deleteUser
        };
    } catch (error) {
        console.error("Error deleting user:", error);
        return {
            success: false,
            error: error.message
        };
    }
}
async function getRoles() {
    try {
        const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["graphqlRequest"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$queries$2f$users$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ROLES_QUERY"]);
        return {
            success: true,
            data: data.roles
        };
    } catch (error) {
        console.error("Error fetching roles:", error);
        return {
            success: false,
            error: error.message
        };
    }
}
async function getRole(id) {
    try {
        const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["graphqlRequest"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$queries$2f$users$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ROLE_DETAIL_QUERY"], {
            id
        });
        return {
            success: true,
            data: data.role
        };
    } catch (error) {
        console.error("Error fetching role:", error);
        return {
            success: false,
            error: error.message
        };
    }
}
async function createRole(input) {
    try {
        const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["graphqlRequest"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$queries$2f$users$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CREATE_ROLE_MUTATION"], {
            ...input,
            guard_name: input.guard_name || "web"
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/users/roles", "page");
        return {
            success: true,
            data: data.createRole
        };
    } catch (error) {
        console.error("Error creating role:", error);
        return {
            success: false,
            error: error.message
        };
    }
}
async function updateRole(input) {
    try {
        const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["graphqlRequest"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$queries$2f$users$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["UPDATE_ROLE_MUTATION"], input);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/users/roles", "page");
        return {
            success: true,
            data: data.updateRole
        };
    } catch (error) {
        console.error("Error updating role:", error);
        return {
            success: false,
            error: error.message
        };
    }
}
async function deleteRole(id) {
    try {
        const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["graphqlRequest"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$queries$2f$users$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["DELETE_ROLE_MUTATION"], {
            id
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/users/roles", "page");
        return {
            success: true,
            data: data.deleteRole
        };
    } catch (error) {
        console.error("Error deleting role:", error);
        return {
            success: false,
            error: error.message
        };
    }
}
async function getPermissions() {
    try {
        const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["graphqlRequest"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$queries$2f$users$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PERMISSIONS_QUERY"]);
        return {
            success: true,
            data: data.permissions
        };
    } catch (error) {
        console.error("Error fetching permissions:", error);
        return {
            success: false,
            error: error.message
        };
    }
}
async function createPermission(input) {
    try {
        const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["graphqlRequest"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$queries$2f$users$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CREATE_PERMISSION_MUTATION"], {
            ...input,
            guard_name: input.guard_name || "web"
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/users/roles", "page");
        return {
            success: true,
            data: data.createPermission
        };
    } catch (error) {
        console.error("Error creating permission:", error);
        return {
            success: false,
            error: error.message
        };
    }
}
async function updatePermission(input) {
    try {
        const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["graphqlRequest"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$queries$2f$users$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["UPDATE_PERMISSION_MUTATION"], input);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/users/roles", "page");
        return {
            success: true,
            data: data.updatePermission
        };
    } catch (error) {
        console.error("Error updating permission:", error);
        return {
            success: false,
            error: error.message
        };
    }
}
async function deletePermission(id) {
    try {
        const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["graphqlRequest"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$queries$2f$users$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["DELETE_PERMISSION_MUTATION"], {
            id
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/users/roles", "page");
        return {
            success: true,
            data: data.deletePermission
        };
    } catch (error) {
        console.error("Error deleting permission:", error);
        return {
            success: false,
            error: error.message
        };
    }
}
async function assignRoleToUser(userId, roleId) {
    try {
        const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["graphqlRequest"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$queries$2f$users$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ASSIGN_ROLE_TO_USER_MUTATION"], {
            user_id: userId,
            role_id: roleId
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/users", "page");
        return {
            success: true,
            data: data.assignRoleToUser
        };
    } catch (error) {
        console.error("Error assigning role to user:", error);
        return {
            success: false,
            error: error.message
        };
    }
}
async function removeRoleFromUser(userId, roleId) {
    try {
        const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["graphqlRequest"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$queries$2f$users$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["REMOVE_ROLE_FROM_USER_MUTATION"], {
            user_id: userId,
            role_id: roleId
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/users", "page");
        return {
            success: true,
            data: data.removeRoleFromUser
        };
    } catch (error) {
        console.error("Error removing role from user:", error);
        return {
            success: false,
            error: error.message
        };
    }
}
async function syncRolesToUser(userId, roleIds) {
    try {
        const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["graphqlRequest"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$queries$2f$users$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SYNC_ROLES_TO_USER_MUTATION"], {
            user_id: userId,
            role_ids: roleIds
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/users", "page");
        return {
            success: true,
            data: data.syncRolesToUser
        };
    } catch (error) {
        console.error("Error syncing roles to user:", error);
        return {
            success: false,
            error: error.message
        };
    }
}
async function assignPermissionToRole(roleId, permissionId) {
    try {
        const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["graphqlRequest"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$queries$2f$users$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ASSIGN_PERMISSION_TO_ROLE_MUTATION"], {
            role_id: roleId,
            permission_id: permissionId
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/users/roles", "page");
        return {
            success: true,
            data: data.assignPermissionToRole
        };
    } catch (error) {
        console.error("Error assigning permission to role:", error);
        return {
            success: false,
            error: error.message
        };
    }
}
async function removePermissionFromRole(roleId, permissionId) {
    try {
        const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["graphqlRequest"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$queries$2f$users$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["REMOVE_PERMISSION_FROM_ROLE_MUTATION"], {
            role_id: roleId,
            permission_id: permissionId
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/users/roles", "page");
        return {
            success: true,
            data: data.removePermissionFromRole
        };
    } catch (error) {
        console.error("Error removing permission from role:", error);
        return {
            success: false,
            error: error.message
        };
    }
}
async function syncPermissionsToRole(roleId, permissionIds) {
    try {
        const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["graphqlRequest"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$queries$2f$users$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SYNC_PERMISSIONS_TO_ROLE_MUTATION"], {
            role_id: roleId,
            permission_ids: permissionIds
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/users/roles", "page");
        return {
            success: true,
            data: data.syncPermissionsToRole
        };
    } catch (error) {
        console.error("Error syncing permissions to role:", error);
        return {
            success: false,
            error: error.message
        };
    }
}
async function assignPermissionToUser(userId, permissionId) {
    try {
        const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["graphqlRequest"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$queries$2f$users$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ASSIGN_PERMISSION_TO_USER_MUTATION"], {
            user_id: userId,
            permission_id: permissionId
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/users", "page");
        return {
            success: true,
            data: data.assignPermissionToUser
        };
    } catch (error) {
        console.error("Error assigning permission to user:", error);
        return {
            success: false,
            error: error.message
        };
    }
}
async function removePermissionFromUser(userId, permissionId) {
    try {
        const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["graphqlRequest"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$queries$2f$users$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["REMOVE_PERMISSION_FROM_USER_MUTATION"], {
            user_id: userId,
            permission_id: permissionId
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/users", "page");
        return {
            success: true,
            data: data.removePermissionFromUser
        };
    } catch (error) {
        console.error("Error removing permission from user:", error);
        return {
            success: false,
            error: error.message
        };
    }
}
async function syncPermissionsToUser(userId, permissionIds) {
    try {
        const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["graphqlRequest"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$graphql$2f$queries$2f$users$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SYNC_PERMISSIONS_TO_USER_MUTATION"], {
            user_id: userId,
            permission_ids: permissionIds
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/users", "page");
        return {
            success: true,
            data: data.syncPermissionsToUser
        };
    } catch (error) {
        console.error("Error syncing permissions to user:", error);
        return {
            success: false,
            error: error.message
        };
    }
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    getUsers,
    getUsersSimple,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    getRoles,
    getRole,
    createRole,
    updateRole,
    deleteRole,
    getPermissions,
    createPermission,
    updatePermission,
    deletePermission,
    assignRoleToUser,
    removeRoleFromUser,
    syncRolesToUser,
    assignPermissionToRole,
    removePermissionFromRole,
    syncPermissionsToRole,
    assignPermissionToUser,
    removePermissionFromUser,
    syncPermissionsToUser
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getUsers, "70b220f8bae6e5674eb68452d92b43b48d027bf950", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getUsersSimple, "7036156a894bb1538a4228dffd1aa32d059ab3d4c7", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getUser, "4063e95c24439012a4f734f729332c107c6cd0abe9", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(createUser, "40e2d7476414478f62b8bd5b041992aa0fb36ee71a", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(updateUser, "4070fae9c52425b3b754580e6d91ced8ed28a5fce2", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(deleteUser, "40ac504d6eb813488bdc9e76c9a5d9606f6c36d547", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getRoles, "0002f25808714b760c9a86784115f4075b82b5b8e5", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getRole, "400931e33fe2d0a45188c92b740299bf40579eec8b", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(createRole, "4093e28cd6638832e0d07e4d5c6558e49721e74d8a", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(updateRole, "40d067d85e34dcdc662834d243e75d86bbe5c656dd", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(deleteRole, "4047e0fff46c59c69fa5202ecf51b5108002261883", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getPermissions, "001f285ce015deed39afed4ed46b99481dd9ecc1dc", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(createPermission, "40146ff183514b9721221850d15a9affe9a5013274", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(updatePermission, "40862407a9512956308d95d1fc5af44816473464a0", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(deletePermission, "4021c844cabe673dee2d9b1829bc5c8647e02923fa", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(assignRoleToUser, "606961978d522ce87766fda67f0b6ed5c85a70fd10", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(removeRoleFromUser, "60bb84214f417ef1c433a4c6d4feffd3dda7cb7898", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(syncRolesToUser, "609fa73be3ea01e40f94ed7c0eccb81032e86f6bb9", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(assignPermissionToRole, "60ee7cb1f21f25bccf767f055fd7c58be0e4c70713", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(removePermissionFromRole, "60fb27157cf4c8fdf6daea2a1862d607aab482aac3", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(syncPermissionsToRole, "60778638c90ec98d9dbbad786aa2dffe527649fb3a", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(assignPermissionToUser, "602fb63a1886c99453414ba0df5bb06bb6dbdc912b", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(removePermissionFromUser, "604ede92800ec85df7ef6570110bc2d00c382b4bb0", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(syncPermissionsToUser, "60e94126a80a008dd017a25bf8e59a35c7c4e97051", null);
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
"[project]/.next-internal/server/app/tickets/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/actions/auth.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE1 => \"[project]/app/actions/tickets.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE2 => \"[project]/app/actions/users.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE3 => \"[project]/app/actions/customers.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE4 => \"[project]/app/actions/services.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/actions/auth.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$tickets$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/actions/tickets.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$users$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/actions/users.ts [app-rsc] (ecmascript)");
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
;
;
;
;
;
;
;
;
}),
"[project]/.next-internal/server/app/tickets/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/actions/auth.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE1 => \"[project]/app/actions/tickets.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE2 => \"[project]/app/actions/users.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE3 => \"[project]/app/actions/customers.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE4 => \"[project]/app/actions/services.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
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
    "40b9353f639b2c54a2232b77110347ac03a9eed89c",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$tickets$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createTicket"],
    "40ef2c326d2bdc4c88174167422aae44465da5133d",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$tickets$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["updateTicket"],
    "60b1fbcc9806da18cd92f69e264e35283b445cfe9c",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$tickets$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["removeTicketLabel"],
    "60f259e0fed6ae9c84676f4e561c616983bd7fdb47",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$tickets$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["assignUsersToTicket"],
    "700d172a9f8850884b79914b83a7151cfcf72c219f",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$customers$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getCustomers"],
    "7022a1faf39e03459e0b617b419264c1f7fc336d0a",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$tickets$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getTickets"],
    "7036156a894bb1538a4228dffd1aa32d059ab3d4c7",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$users$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getUsersSimple"],
    "70923d44b7ab37ea2a622cfbba165f86f0021b12a2",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$tickets$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["addTicketComment"],
    "7092bd9b25cc6d0b12cf7c4eb437def3791abc625b",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$services$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getServices"],
    "7092eb34981abd6a47c0613057b538716cd08c4fdc",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$tickets$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["addTicketLabel"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$tickets$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$app$2f$actions$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE1__$3d3e$__$225b$project$5d2f$app$2f$actions$2f$tickets$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE2__$3d3e$__$225b$project$5d2f$app$2f$actions$2f$users$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE3__$3d3e$__$225b$project$5d2f$app$2f$actions$2f$customers$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE4__$3d3e$__$225b$project$5d2f$app$2f$actions$2f$services$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/tickets/page/actions.js { ACTIONS_MODULE0 => "[project]/app/actions/auth.ts [app-rsc] (ecmascript)", ACTIONS_MODULE1 => "[project]/app/actions/tickets.ts [app-rsc] (ecmascript)", ACTIONS_MODULE2 => "[project]/app/actions/users.ts [app-rsc] (ecmascript)", ACTIONS_MODULE3 => "[project]/app/actions/customers.ts [app-rsc] (ecmascript)", ACTIONS_MODULE4 => "[project]/app/actions/services.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/actions/auth.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$tickets$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/actions/tickets.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$users$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/actions/users.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$customers$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/actions/customers.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$services$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/actions/services.ts [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=_ef3630b1._.js.map