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
    await this.setupDbSourceOptionsFile()
  }

  async setupDbSourceOptionsFile(): Promise<void> {
    try {
      const dbDestinationPath = path.join(
        process.cwd(),
        'src/database/database.ts',
      )

      const contentTemplate = fs.readFileSync(
        path.join(
          Dirname,
          'template/database/sql/database/database.ts.template',
        ),
        {
          encoding: 'utf8',
        },
      )

      fs.outputFileSync(dbDestinationPath, contentTemplate)
      console.log(chalk.green('Created database.ts file successfully'))
    } catch (error) {
      console.error(chalk.red('Error when create database.ts file: ' + error))
    }
  }

  async setupModel(destinationPath: string): Promise<void> {
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
