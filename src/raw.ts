import * as request from 'request-promise-native'
import { schema } from './schema'

export type ClusterConfiguration = {
  host: string
  port?: number
  ssl?: boolean
}

export namespace raw {
  function getUrl(config: ClusterConfiguration, suffix: string) {
    return (config.ssl ? 'https' : 'http') + '://' + config.host + ':' + (config.port || 9047) + '/' + suffix
  }

  export const LOGIN = 'apiv2/login'
  export const FIRST_USER = 'apiv2/bootstrap/firstuser'
  export const USER = 'apiv2/user'
  export const USERS = 'apiv2/users'
  export const SQL = 'api/v3/sql'
  export const JOB = 'api/v3/job'
  export const CATALOG = 'api/v3/catalog'
  export const SOURCE = 'api/v3/source'

  export type Schema<T extends [string, string, string | null, string | null]> =
    T extends ['post', typeof LOGIN, null, null] ? schema.Login :
    T extends ['put', typeof FIRST_USER, null, null] ? undefined :
    T extends ['put', typeof USER, string, string] ? undefined :
    T extends ['get', typeof USER, string, null] ? schema.User :
    T extends ['get', typeof USERS, 'all', null] ? schema.Users :
    T extends ['get', typeof USERS, 'search', null] ? schema.Users :
    T extends ['post', typeof SQL, null, null] ? schema.Sql :
    T extends ['get', typeof JOB, string, null] ? schema.JobStatus :
    T extends ['get', typeof CATALOG, null, null] ? schema.catalog.CatalogEntitiesSummary :
    T extends ['get', typeof CATALOG, string, null] ? schema.catalog.CatalogEntity :
    T extends ['post', typeof CATALOG, null, null] ? undefined :
    T extends ['get', typeof SOURCE, null, null] ? schema.source.Sources :
    T extends ['get', typeof SOURCE, string, null] ? schema.source.Source :
    T extends ['post', typeof SOURCE, null, null] ? undefined :
    never

  export type Body<T extends [string, string, string | null, string | null]> =
    T extends ['post', typeof LOGIN, null, null] ? schema.LoginBodyArgs :
    T extends ['put', typeof FIRST_USER, null, null] ? string :
    T extends ['put', typeof USER, string, null] ? string :
    T extends ['post', typeof SQL, null, null] ? schema.SqlBodyArgs :
    T extends ['post', typeof CATALOG, null, null] ? schema.catalog.CatalogEntity :
    T extends ['post', typeof SOURCE, null, null] ? schema.source.Source :
    null

  export type UrlArgs<T extends [string, string, string | null, string | null]> =
    T extends ['get', typeof USERS, 'search', null] ? schema.FilteredUsersUrlArgs :
    T extends ['get', typeof JOB, string, 'results'] ? schema.JobResultsUrlArgs :
    null

  function urlArgsToString(urlArgs: { [key: string]: any }) {
    let s = '?'
    Object.keys(urlArgs).forEach(key => {
      s += '&' + key + '=' + urlArgs[key]
    })
    return s
  }

  export async function makeRequest<method extends 'get' | 'put' | 'post' | 'delete', prefix extends string, id extends string | null, suffix extends string | null>(config: ClusterConfiguration, method: method, token: string | null, prefix: prefix, id: id, suffix: suffix, urlArgs: UrlArgs<[method, prefix, id, suffix]>, body: Body<[method, prefix, id, suffix]>, encoding?: any): Promise<Schema<[method, prefix, id, suffix]>> {
    const options: request.RequestPromiseOptions = {
      json: encoding !== null,
      method: method,
      headers: token === null ? undefined : {
        Authorization: token,
        'Content-type': 'application/json'
      },
      encoding: encoding,
      body: body
    }
    const url = getUrl(config, prefix + (id ? ('/' + id + (suffix ? ('/' + suffix) : '')) : '') + (urlArgs ? urlArgsToString(urlArgs as { [key: string]: any }) : ''))

    const response = await request[method](url, options)

    if (response.errorMessage) {
      throw response
    } else {
      return response
    }
  }
}
