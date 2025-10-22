declare module 'squareup' {
  export class Client {
    constructor(config: {
      accessToken: string
      environment: Environment
    })
    
    paymentsApi: any
  }

  export enum Environment {
    Sandbox = 'sandbox',
    Production = 'production'
  }
}
