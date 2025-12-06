// GraphQL queries for configuration system

export const CONFIG_SCHEMA_QUERY = `
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
`

export const CONFIG_FIELDS_QUERY = `
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
`

export const CONFIG_VALUES_QUERY = `
  query GetConfigValues($paths: [String!]!, $scope_id: Int) {
    configValues(paths: $paths, scope_id: $scope_id) {
      path
      value
      type
      label
    }
  }
`

export const CONFIG_SEARCH_QUERY = `
  query SearchConfig($term: String!, $scope_id: Int) {
    configSearch(term: $term, scope_id: $scope_id) {
      path
      label
      type
      value
    }
  }
`

export const UPSERT_CONFIG_MUTATION = `
  mutation UpsertConfigValues($scope_id: Int, $items: [ConfigItemInput!]!) {
    upsertConfigValues(scope_id: $scope_id, items: $items) {
      path
      value
      type
      label
    }
  }
`
