export namespace schema {
  export type LoginBodyArgs = {
    userName: string,
    password: string
  }
  
  export type Login = {
    token: string
  }
  
  export type User = {
    resourcePath: string
    userName: string
    userConfig: {
      uid: {
        id: string
      }
      userName: string
      firstName: string
      lastName: string
      email: string
      createdAt: number
      modifiedAt: number
      version: number
    }
    name: string
    id: string
    links: { [name: string]: string }
  }
  
  export type FilteredUsersUrlArgs = {
    filter: string
  }
  
  export type Users = {
    users: User[]
  }
  
  export type SqlBodyArgs = {
    sql: string
    context?: string
  }
  
  export type Sql = {
    id: string
  }
  
  export type FieldSchema = {
    name: string
    type: {
      name: 'STRUCT' | 'LIST' | 'UNION' | 'INTEGER' | 'BIGINT' | 'FLOAT' | 'DOUBLE' | 'VARCHAR' | 'VARBINARY' | 'BOOLEAN' | 'DECIMAL' | 'TIME' | 'DATE' | 'TIMESTAMP' | 'INTERVAL DAY TO SECOND' | 'INTERVAL YEAR TO MONTH'
      subSchema?: FieldSchema[]
      precision?: number
      scale?: number
    }
  }
  
  export namespace datasetFormat {
    export type DatasetFormat = Text | JSON | Parquet | Excel | XLS | Avro
  
    export type Text = {
      type: 'Text'
      fieldDelimiter: string
      lineDelimiter: string
      quote: string
      comment: string
      escape: string
      skipFirstLine: boolean
      extractHeader: boolean
      trimHeader: boolean
      autoGenerateColumnNames: boolean
    }
  
    export type JSON = {
      type: 'JSON'
  
    }
  
    export type Parquet = {
      type: 'Parquet'
    }
  
    export type Excel = {
      type: 'Excel'
      sheetName: string
      extractHeader: boolean
      hasMergedCells: boolean
    }
  
    export type XLS = {
      type: 'XLS'
      sheetName: string
      extractHeader: boolean
      hasMergedCells: boolean
    }
  
    export type Avro = {
      type: 'Avro'
    }
  }
  
  export type JobStatus = {
    jobState: 'NOT_SUBMITTED' | 'STARTING' | 'RUNNING' | 'COMPLETED' | 'CANCELED' | 'FAILED' | 'CANCELLATION_REQUESTED' | 'ENQUEUED'
    queryType: 'UI_RUN' | 'UI_PREVIEW' | 'UI_INTERNAL_PREVIEW' | 'UI_INTERNAL_RUN' | 'UI_EXPORT' | 'ODBC' | 'JDBC' | 'REST' | 'ACCELERATOR_CREATE' | 'ACCELERATOR_DROP' | 'UNKNOWN' | 'PREPARE_INTERNAL' | 'ACCELERATOR_EXPLAIN' | 'UI_INITIAL_PREVIEW'
    startedAt: string
    endedAt: string
    rowCount?: number
    acceleration?: {
      relationships: {
        reflectionId: string
        datasetId: string
        relationship: 'CONSIDERED' | 'MATCHED' | 'CHOSEN'
      }[]
    }
    errorMessage?: string
  }
  
  export type JobResultsUrlArgs = {
    offset?: number
    limit?: number
  }
  
  export type JobResults = {
    rowCount: number
    schema: FieldSchema[]
    rows: object[]
  }
  
  export namespace reflection {
    export type Reflection = RawReflection | AggregationReflection
  
    export type ReflectionField = {
      name: string
    }
  
    export type ReflectionFieldWithGranularity = ReflectionField & {
      granularity: 'NORMAL' | 'DATE'
    }
  
    export type AbstractReflection = {
      entityType: 'reflection'
      id: string
      tag: string
      name: string
      enabled: boolean
      createdAt: string
      updatedAt: string
      datasetId: string
      currentSizeBytes: number
      totalSizeBytes: number
      status: {
        config: 'OK' | 'INVALID'
        refresh: 'SCHEDULED' | 'RUNNING' | 'GIVEN_UP'
        availability: 'NONE' | 'INCOMPLETE' | 'EXPIRED' | 'AVAILABLE'
        failureCount: number
        lastRefresh: string
        expiresAt: string
      }
      distributionFields?: ReflectionField[]
      partitionFields?: ReflectionField[]
      sortFields?: ReflectionField[]
      partitionDistributionStrategy: 'CONSOLIDATED' | 'STRIPED'
    }
  
    export type RawReflection = AbstractReflection & {
      type: 'RAW'
      displayFields?: ReflectionField[]
    }
  
    export type AggregationReflection = AbstractReflection & {
      type: 'AGGREGATION'
      dimensionFields: ReflectionFieldWithGranularity[]
      measureFields: ReflectionField[]
    }
  }
  
  
  
  export namespace catalog {
    export type CatalogEntity = File | Folder | Home | Space | Dataset
  
    export type CatalogEntitiesSummary = {
      data: CatalogEntitySummary[]
    }
  
    export type CatalogEntitySummary = {
      id: string
      path: string[]
      tag: string
      type: 'DATASET' | 'CONTAINER' | 'FILE'
      datasetType?: 'VIRTUAL' | 'PROMOTED' | 'DIRECT'
      containerType?: 'SPACE' | 'SOURCE' | 'FOLDER' | 'HOME'
    }
  
    export type Dataset = {
      entityType: 'dataset'
      id: string
      path: string[]
      tag: string
      type: 'PHYSICAL_DATASET' | 'VIRTUAL_DATASET'
      fields: FieldSchema[]
      createdAt: string
      accelerationRefreshPolicy?: {
        refreshPeriodMs: number
        gracePeriodMs: number
        method: 'FULL' | 'INCREMENTAL'
        refreshField?: string
      }
      sql?: string
      sqlContext?: string[]
      format?: datasetFormat.DatasetFormat
    }
  
    export type File = {
      entityType: 'file'
      id: string
      path: string[]
    }
  
    export type Folder = {
      entityType: 'folder'
      id: string
      path: string[]
      tag: string
      children?: CatalogEntitySummary[]
    }
  
    export type Home = {
      entityType: 'home'
      id: string
      name: string
      tag: string
      children?: CatalogEntitySummary[]
    }
  
    export type Space = {
      entityType: 'space'
      id: string
      name: string
      tag: string
      createdAt: string
      children?: CatalogEntitySummary[]
    }
  }
  
  export namespace source {
    export type Source = ADL | NAS | HDFS | MAPRFS | S3 | MONGO | ELASTIC | ORACLE | MYSQL | MSSQL | POSTGRES | REDSHIFT | HBASE | HIVE | DB2
  
    export type Sources = {
      data: Source[]
    }
  
    export type AbstractSource = {
      entityType: 'source'
      id: string
      name: string
      description: string
      tag: string
      createdAt: string
      metadataPolicy: {
        authTTLMs: number
        datasetRefreshAfterMs: number
        datasetExpireAfterMs: number
        namesRefreshMs: number
        datasetUpdateMode: 'PREFETCH' | 'PREFETCH_QUERIED' | 'INLINE'
      }
      state: {
        status: 'good' | 'bad' | 'warn'
        messages: {
          level: 'INFO' | 'WARN' | 'ERROR'
          message: string
        }[]
      }
      accelerationRefreshPeriodMs: number
      accelerationGracePeriodMs: number
    }
  
    export type PropertyList = {
      name: string
      value: string
    }[]
  
    export type ADL = AbstractSource & {
      type: 'ADL'
      config: {
        mode: 'CLIENT_KEY'
        accountName: string
        clientId: string
        clientKeyRefreshUrl: string
        clientKeyPassword: string
      }
    }
  
    export type NAS = AbstractSource & {
      type: 'NAS'
      config: {
        path: string
      }
    }
  
    export type HDFS = AbstractSource & {
      type: 'HDFS'
      config: {
        enableImpersonation: boolean
        hostname: string
        port: number
        rootPath: string
        propertyList: PropertyList
      }
    }
  
    export type MAPRFS = AbstractSource & {
      type: 'MAPRFS'
      config: {
        clusterName: string
        enableImpersonation: boolean
        secure: boolean
        rootPath: string
        propertyList: PropertyList
      }
    }
  
    export type S3 = AbstractSource & {
      type: 'S3'
      config: {
        accessKey: string
        accessSecret: string
        secure: boolean
        externalBucketList: string[]
        propertyList: PropertyList
      }
    }
  
    export type MONGO = AbstractSource & {
      type: 'MONGO'
      config: {
        username: string
        password: string
        hostList: {
          hostname: string
          port: number
        }[]
        useSsl: boolean
        authenticationType: 'ANONYMOUS' | 'MASTER'
        authdatabase: string
        authenticationTimeoutMillis: number
        secondaryReadsOnly: boolean
        subpartitionSize: number
        propertyList: PropertyList
      }
    }
  
    export type ELASTIC = AbstractSource & {
      type: 'ELASTIC'
      config: {
        username: string
        password: string
        hostList: {
          hostname: string
          port: number
        }[]
        authenticationType: 'ANONYMOUS' | 'MASTER'
        scriptsEnabled?: boolean
        showHiddenIndices?: boolean
        sslEnabled?: boolean
        showIdColumn?: boolean
        readTimeoutMillis: number
        scrollTimeoutMillis: number
        usePainless?: boolean
        useWhitelist?: boolean
        scrollSize?: number
      }
    }
  
    export type ORACLE = AbstractSource & {
      type: 'ORACLE'
      config: {
        username: string
        password: string
        instance: string
        hostname: string
        port: string
        authenticationType: 'ANONYMOUS' | 'MASTER'
        fetchSize: number
      }
    }
  
    export type MYSQL = AbstractSource & {
      type: 'MYSQL'
      config: {
        username: string
        password: string
        hostname: string
        port: string
        authenticationType: 'ANONYMOUS' | 'MASTER'
        fetchSize: number
      }
    }
  
    export type MSSQL = AbstractSource & {
      type: 'MSSQL'
      config: {
        username: string
        password: string
        hostname: string
        port: string
        authenticationType: 'ANONYMOUS' | 'MASTER'
        fetchSize: number
        database?: string
        showOnlyConnectiondatabase?: boolean
      }
    }
  
    export type POSTGRES = AbstractSource & {
      type: 'POSTGRES'
      config: {
        username: string
        password: string
        hostname: string
        port: string
        authenticationType: 'ANONYMOUS' | 'MASTER'
        fetchSize: number
        databaseName: string
      }
    }
  
    export type REDSHIFT = AbstractSource & {
      type: 'REDSHIFT'
      config: {
        username: string
        password: string
        authenticationType: 'ANONYMOUS' | 'MASTER'
        fetchSize: number
        connectionString: string
      }
    }
  
    export type HBASE = AbstractSource & {
      type: 'HBASE'
      config: {
        zkQuorum: string
        port: number
        isSizeCalcEnabled: boolean
        propertyList: PropertyList
      }
    }
  
    export type HIVE = AbstractSource & {
      type: 'HIVE'
      config: {
        hostname: string
        port: string
        kerberosPrincipal: string
        enableSasl?: boolean
        propertyList: PropertyList
      }
  
    }
  
    export type DB2 = AbstractSource & {
      type: 'DB2'
      config: {
        username: string
        password: string
        hostname: string
        port: string
        databaseName: string
        authenticationType: 'ANONYMOUS' | 'MASTER'
        fetchSize: number
      }
    }
  }
}
