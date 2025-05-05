import path from 'path'
import { SetupDbService } from './setup.service'
import { Dirname } from '../../utils/utils'

export class SetupSqlService extends SetupDbService {
  async installPackages(): Promise<boolean> {
    return super.installPackages(['@nestjs/typeorm', 'typeorm'])
  }
  async setupEnv(): Promise<void> {
    const variables = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_PORT', 'SSL']

    await super.setupEnv(variables)
  }

  async setupDbConfig(): Promise<void> {
    const configPath = path.join(
      Dirname,
      'template/database/sql/config/database.config.ts.template',
    )

    await super.setupDbConfig(configPath)
  }

  async setupDbModule(): Promise<void> {
    const modulePath = path.join(
      Dirname,
      'template/database/sql/database/database.module.ts.template',
    )

    await super.setupDbModule(modulePath)
  }
}
