import path from 'path'
import fs from 'fs-extra'
import { SetupDbService } from './setup.service'
import { Dirname } from '../../utils/utils'
import chalk from 'chalk'

export class SetupSqlService extends SetupDbService {
  async installPackages(): Promise<boolean> {
    return super.installPackages(['@nestjs/typeorm', 'typeorm', 'pg'])
  }
  async setupEnv(): Promise<void> {
    const variables = [
      'DB_HOST',
      'DB_USER',
      'DB_PASSWORD',
      'DB_DATABASE',
      'DB_PORT',
      'SSL',
    ]

    await super.setupEnv(variables)
  }

  async setupDbFolder(): Promise<void> {
    const sourceDir = path.join(Dirname, 'template/database/sql/database')
    await super.setupDbFolder(sourceDir)
  }

  async setupScript(): Promise<void> {
    await super.setupScript()
  }

  async setupDbConfig(): Promise<void> {
    await super.setupDbConfig(
      path.join(
        Dirname,
        'template/database/sql/config/database.config.ts.template',
      ),
    )
  }

  async setupModel(): Promise<void> {
    await super.setupModel(
      'src/modules/base.entity.ts',
      path.join(
        Dirname,
        'template/database/sql/entities/base.entity.ts.template',
      ),
    )
    await super.setupModel(
      'src/modules/user/entities/user.entity.ts',
      path.join(
        Dirname,
        'template/database/sql/entities/user.entity.ts.template',
      ),
    )
  }

  async importModule(): Promise<void> {
    await super.importModule({
      moduleName: 'DatabaseModule',
      modulePath: '@app/database/database.module',
    })
  }
}
