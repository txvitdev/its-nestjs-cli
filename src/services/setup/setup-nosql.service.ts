import path from 'path'
import { SetupDbService } from './setup.service'
import { Dirname } from '../../utils/utils'

export class SetupNoSqlService extends SetupDbService {
  async installPackages(): Promise<boolean> {
    return super.installPackages(['@nestjs/mongoose', 'mongoose'])
  }

  async setupEnv(): Promise<void> {
    const variables = [
      'MONGO_HOST',
      'MONGO_PORT',
      'MONGO_USERNAME',
      'MONGO_PASSWORD',
      'MONGO_DATABASE',
    ]
    await super.setupEnv(variables)
  }

  async setupDbFolder(): Promise<void> {
    const sourceDir = path.join(Dirname, 'template/database/nosql/database')
    await super.setupDbFolder(sourceDir)
  }

  async setupScript(): Promise<void> {
    await super.setupScript()
  }

  async setupDbConfig(): Promise<void> {
    const configPath = path.join(
      Dirname,
      'template/database/nosql/config/database.config.ts.template',
    )

    await super.setupDbConfig(configPath)
  }

  async importModule(): Promise<void> {
    await super.importModule({
      moduleName: 'DatabaseModule',
      modulePath: '@app/database/database.module',
    })
  }

  async setupDockerCompose(): Promise<void> {
    await super.setupDockerCompose(
      path.join(Dirname, 'template/database/nosql/docker'),
    )
  }

  async setupEntityFolder(): Promise<void> {
    await super.setupEntityFolder(
      'src/modules/shared/base',
      path.join(Dirname, 'template/database/nosql/shared'),
    )
    await super.setupEntityFolder(
      'src/modules/user',
      path.join(Dirname, 'template/database/nosql/user'),
    )
  }
}
