import path from 'path'
import { SetupDbService } from './setup.service'
import { Dirname } from '../../utils/utils'

export class SetupNoSqlService extends SetupDbService {
  async installPackages(): Promise<boolean> {
    return super.installPackages(['@nestjs/mongoose', 'mongoose'])
  }

  async setupEnv(): Promise<void> {
    const variables = ['DB_URL']
    await super.setupEnv(variables)
  }

  async setupDbConfig(): Promise<void> {
    const configPath = path.join(
      Dirname,
      'template/database/nosql/config/database.config.ts.template',
    )

    await super.setupDbConfig(configPath)
  }

  async setupDbModule(): Promise<void> {
    const modulePath = path.join(
      Dirname,
      'template/database/nosql/database/database.module.ts.template',
    )

    await super.setupDbModule(modulePath)
  }
}
