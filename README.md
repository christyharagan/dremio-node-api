Dremio Node API
===

Overview
--

As of version 2, Dremio (www.dremio.com) comes with a comprehensive REST API. This is TypesScript/JavaScript NodeJS based API for idiomatic consumption of this REST API.

Usage
--

Install:

```
npm i dremio-node-api
```

Basic usage:

```ts
import { API, ExistingUser, createAPI, createFirstUser, schema, ClusterConfiguration, getDatasetsFromSQL } from 'dremio-node-api'

async function useDremio(userName: string, password: string) {
  const clusterConfig = {
    host: 'localhost'
  }

  await createFirstUser(clusterConfig, userName, password)

  const api = await createAPI(clusterConfig, {
    userName: userName,
    password: password
  })

  const results = await api.sql.runQueryAndGetResults('SELECT * FROM someSpace.SomeDataSet')

  results.forEach(row=>{
    // Do something awesome
  })
}
```