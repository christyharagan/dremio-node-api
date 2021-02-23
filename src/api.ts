import { raw, ClusterConfiguration } from './raw'
import { schema } from './schema'
import { parse } from './parser'

function poll(time: number) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, time)
  })
}

export type User = {
  userName: string,
  firstName: string,
  lastName: string,
  email: string,
  password: string
  createdAt?: Date
}

export type ExistingUser = User & {
  createdAt: Date
  modifiedAt: Date
}

function canonicaliseUser(user: User, password: string): User & { createdAt: number } {
  return Object.assign({
    password: password,
    createdAt: !user.createdAt ? new Date().getTime() : typeof user.createdAt === 'number' ? user.createdAt : typeof user.createdAt === 'string' ? parseInt(user.createdAt) : user.createdAt.getTime()
  }, user)
}

function convertRawUser(rawUser: schema.User): ExistingUser {
  const eu: ExistingUser = Object.assign({}, rawUser.userConfig) as any
  eu.createdAt = new Date(rawUser.userConfig.createdAt)
  eu.modifiedAt = new Date(rawUser.userConfig.modifiedAt)
  return eu
}

export type API = {
  token: string,

  user: {
    createUser(user: User, password: string): Promise<undefined>
    getUsers(filter?: string): Promise<ExistingUser[]>
    getUser(userName: string): Promise<ExistingUser>
    // TODO: Finish
  }

  catalog: {
    getAllTopLevelContainers(): Promise<schema.catalog.CatalogEntitySummary[]>
    getEntity(id: string): Promise<schema.catalog.CatalogEntity>
    createEntity(catalog: schema.catalog.CatalogEntity): Promise<undefined>
    // TODO: Finish
  },

  reflection: {
    // TODO
  },

  job: {
    getStatus(jobId: string): Promise<schema.JobStatus>
    getResults(jobId: string, offset?: number, limit?: number): Promise<schema.JobResults>
  }

  source: {
    getSources(): Promise<schema.source.Source[]>
    getSource(id: string): Promise<schema.source.Source>
    createSource(source: schema.source.Source): Promise<undefined>
    // TODO: Finish
  }

  sql: {
    runQuery(sql: string): Promise<string>
    runQueryAndGetResults(sql: string, pollTime?: number, offset?: number, limit?: number, _timeout?: number): Promise<schema.JobResults>
  }
}

export function createFirstUser(config: ClusterConfiguration, user: User, password: string) {
  return raw.makeRequest(config, 'put', '_dremionull', raw.FIRST_USER, null, null, null, JSON.stringify(canonicaliseUser(user, password)), null) //Buffer.from(JSON.stringify(canonicaliseUser(user, password))).toString('base64'))
}

export function getDatasetsFromSQL(sql: string): string[][] {
  function getTableReferences(ast: any) {
    let tableReferences: string[][] = []
    Object.keys(ast).forEach(k => {
      const v = ast[k]
      if (v !== null) {
        if (v['type'] && v['type'] === 'TableFactor') {
          const ref = v['value']['value'] as string
          let i = 0
          const refArr: string[] = []
          while (i < ref.length) {
            if (ref.charAt(i) === '"') {
              const secondQuote = ref.substring(i + 1).indexOf('"')
              refArr.push(ref.substr(i + 1, secondQuote))
              i += secondQuote + 3
            } else {
              const dot = ref.substring(i).indexOf('.')
              if (dot === -1) {
                refArr.push(ref.substr(i))
                i = ref.length
              } else {
                refArr.push(ref.substr(i, dot))
                i += dot + 1
              }
            }
          }

          tableReferences.push(refArr)
        } else if (Array.isArray(v)) {
          v.forEach(v => {
            tableReferences = tableReferences.concat(getTableReferences(v))
          })
        } else if (!(typeof v === 'string') && !(typeof v === 'boolean') && !(typeof v === 'number')) {
          tableReferences = tableReferences.concat(getTableReferences(v))
        }
      }
    })
    return tableReferences
  }

  const ast = parse(sql)
  return getTableReferences(ast)
}

export async function createAPI(config: ClusterConfiguration, login: schema.LoginBodyArgs): Promise<API> {
  const token = '_dremio' + (await raw.makeRequest(config, 'post', null, raw.LOGIN, null, null, null, login)).token

  const api: API = {
    token: token,

    user: {
      createUser(user: User, password: string) {
        return raw.makeRequest(config, 'put', token, raw.USER, encodeURIComponent(user.userName), null, null, JSON.stringify(canonicaliseUser(user, password)), null)
      },
      async getUsers(filter?: string) {
        const users = await (filter ?
          raw.makeRequest(config, 'get', token, raw.USERS, 'search', null, { filter: encodeURIComponent(filter) }, null) :
          raw.makeRequest(config, 'get', token, raw.USERS, 'all', null, null, null))

        return users.users.map(convertRawUser)
      },
      async getUser(userName: string) {
        return convertRawUser(await raw.makeRequest(config, 'get', token, raw.USER, userName, null, null, null))
      },
      // TODO: Finish
    },

    catalog: {
      async getAllTopLevelContainers() {
        return (await raw.makeRequest(config, 'get', token, raw.CATALOG, null, null, null, null)).data
      },
      getEntity(id: string) {
        return raw.makeRequest(config, 'get', token, raw.CATALOG, id, null, null, null)
      },
      createEntity(catalog: schema.catalog.CatalogEntity) {
        return raw.makeRequest(config, 'post', token, raw.CATALOG, null, null, null, catalog)
      }
      // TODO: Finish
    },

    reflection: {
      // TODO
    },

    job: {
      getStatus(jobId: string) {
        return raw.makeRequest(config, 'get', token, raw.JOB, jobId, null, null, null)
      },
      getResults(jobId: string, offset?: number, limit?: number) {
        return raw.makeRequest(config, 'get', token, raw.JOB, jobId, 'results', {
          offset: offset,
          limit: limit
        }, null)
      }
    },

    source: {
      async getSources() {
        return (await raw.makeRequest(config, 'get', token, raw.SOURCE, null, null, null, null)).data
      },
      getSource(id: string) {
        return raw.makeRequest(config, 'get', token, raw.SOURCE, id, null, null, null)
      },
      createSource(source: schema.source.Source) {
        return raw.makeRequest(config, 'post', token, raw.SOURCE, null, null, null, source)
      }
      // TODO: Finish
    },

    sql: {
      async runQuery(sql: string) {
        return (await raw.makeRequest(config, 'post', token, raw.SQL, null, null, null, {
          sql: sql
        })).id
      },

      async runQueryAndGetResults(sql: string, pollTime = 10, offset?: number, limit?: number, _timeout?: number) {
        const jobId = await api.sql.runQuery(sql)
        const start = new Date().getTime()
        const timeout = _timeout === undefined ? undefined : _timeout * 1000
        while (true) {
          await poll(pollTime)
          const status = await api.job.getStatus(jobId)

          if (status.jobState !== 'RUNNING') {
            if (status.jobState === 'COMPLETED') {
              return await api.job.getResults(jobId, offset, limit)
            } else {
              if (status.errorMessage && status.errorMessage !== '') {
                throw status.errorMessage
              }
            }
          } else if (timeout !== undefined) {
            if (new Date().getTime() > (start + timeout)) {
              throw `Query timed out after ${_timeout} seconds: ${sql}`
            }
          }
        }
      }
    }
  }

  return api
}
