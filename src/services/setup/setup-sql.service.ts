import path from 'path'
import { SetupDbService } from './setup.service'
import { Dirname } from '../../utils/utils'

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
    const scripts: Record<string, string> = {
      typeorm: 'ts-node ./node_modules/typeorm/cli',
      'migration:run':
        'npm run typeorm migration:run -- -d ./src/database/database.js',
      'migration:rundev':
        'npm run typeorm migration:run -- -d ./src/database/database.ts',
      'migration:generate':
        'npm run build && cross-var npm run typeorm -- -d ./src/database/database.ts migration:generate ./src/database/migrations/$npm_config_name',
      'migration:create':
        'npm run typeorm -- migration:create ./src/database/migrations/$npm_config_name',
      'migration:revert':
        'npm run typeorm -- -d ./src/database/database.js migration:revert',
      'migration:revertdev':
        'npm run typeorm -- -d ./src/database/database.ts migration:revert',
    }
    await super.setupScript(scripts)
  }

  async setupDbConfig(): Promise<void> {
    await super.setupDbConfig(
      path.join(
        Dirname,
        'template/database/sql/config/database.config.ts.template',
      ),
    )
  }

  async setupEntityFolder(): Promise<void> {
    await super.setupEntityFolder(
      'src/modules/shared/base',
      path.join(Dirname, 'template/database/sql/shared'),
    )
    await super.setupEntityFolder(
      'src/modules/user',
      path.join(Dirname, 'template/database/sql/user'),
    )
  }

  async importModule(): Promise<void> {
    await super.importModule({
      moduleName: 'DatabaseModule',
      modulePath: '@app/database/database.module',
    })
  }

  async setupDockerCompose(): Promise<void> {
    await super.setupDockerCompose(
      path.join(Dirname, 'template/database/sql/docker'),
    )
  }
}
