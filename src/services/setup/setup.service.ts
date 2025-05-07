import path from 'path'
import fs from 'fs-extra'
import chalk from 'chalk'
import { Project, ts } from 'ts-morph'
import inquirer from 'inquirer'
import { Ora } from 'ora'
import { execSync } from 'child_process'
import editJsonFile from 'edit-json-file'
import { delay } from '../../utils/utils'

interface ISetupDbService {
  setup(): Promise<void>
}

export class SetupDbService implements ISetupDbService {
  protected spinner: Ora
  constructor(spinner: Ora) {
    this.spinner = spinner
  }

  async setup(): Promise<void> {
    if (await this.installPackages()) {
      await this.setupDbFolder()
      await this.setupDbConfig()
      await this.setupEnv()
      await this.setupScript()
      await this.setupModel()
      await this.importModule({})
    }
    return
  }

  protected async installPackages(packages?: string[]): Promise<boolean> {
    const installPackage = await inquirer.prompt([
      {
        type: 'confirm',
        message: `Want to install packages: ${packages.join(',')}`,
        name: 'choice',
      },
    ])

    if (!installPackage.choice) return false
    try {
      this.spinner.start('Install package: ')
      const command = `pnpm install ${packages.join(' ')}`
      execSync(command)
      this.spinner.stop()
      console.log(chalk.green('Installed packages successfully'))
      return true
    } catch (error) {
      throw new Error(chalk.red('Error went install package: ' + error))
    }
  }

  protected async setupEnv(variables?: string[]): Promise<void> {
    this.spinner.start('Looking env file...\n')
    await delay(500)
    try {
      const envPath = path.join(process.cwd(), '.env')

      if (!fs.existsSync(envPath)) {
        console.log(chalk.yellow('Not found .env'))
        // If not existed, cp from .env.example
        fs.cpSync(path.join(process.cwd(), '.env.example'), envPath)
        console.log(chalk.green('Created .env'))
      }

      let content = '\n\n'

      for (const variable of variables) {
        content += variable + '=\n'
      }

      fs.appendFileSync(envPath, content)
      this.spinner.stop()
      console.log(chalk.green('Updated .env'))
    } catch (error) {
      this.spinner.stop()
      console.error('Error when update env file: ', error)
    }
  }

  protected async setupDbFolder(sourceDir?: string): Promise<void> {
    this.spinner.start('Setup database folder...\n')
    await delay(500)
    try {
      const targetDir = path.join(process.cwd(), 'src/database')

      if (await fs.pathExists(targetDir)) {
        console.error(chalk.red(`Folder ${targetDir} existed!!`))
        process.exit(1)
      }

      await fs.copy(sourceDir, targetDir)

      // Change tail name: from .template to .ts
      const renameExtensions = async (dir) => {
        const entries = await fs.readdir(dir)
        for (const entry of entries) {
          const fullPath = path.join(dir, entry)
          const stats = await fs.stat(fullPath)
          if (stats.isDirectory()) {
            await renameExtensions(fullPath)
          } else if (entry.endsWith('.template')) {
            const newName = entry.replace(/\.template$/, '')
            await fs.rename(fullPath, path.join(dir, newName))
          }
        }
      }
      await renameExtensions(targetDir)

      this.spinner.stop()
      console.log(chalk.green('Updated ./src/database folder'))
    } catch (error) {
      this.spinner.stop()
      console.error('Error when update database folder: ', error)
    }
  }

  protected async setupScript(): Promise<void> {
    try {
      const file = editJsonFile(path.join(process.cwd(), 'package.json'))
      file.set('scripts.typeorm', 'ts-node ./node_modules/typeorm/cli')
      file.set(
        'scripts.migration:run',
        'npm run typeorm migration:run -- -d ./src/database/database.js',
      )
      file.set(
        'scripts.migration:rundev',
        'npm run typeorm migration:run -- -d ./src/database/database.ts',
      )
      file.set(
        'scripts.migration:generate',
        'npm run build && cross-var npm run typeorm -- -d ./src/database/database.ts migration:generate ./src/database/migrations/$npm_config_name',
      )
      file.set(
        'scripts.migration:create',
        'npm run typeorm -- migration:create ./src/database/migrations/$npm_config_name',
      )
      file.set(
        'scripts.migration:revert',
        'npm run typeorm -- -d ./src/database/database.js migration:revert',
      )
      file.set(
        'scripts.migration:revertdev',
        'npm run typeorm -- -d ./src/database/database.ts migration:revert',
      )

      file.save()
    } catch (error) {
      console.error('Error when setting up script: ', error)
    }
  }

  protected async setupDbConfig(configPath?: string): Promise<void> {
    this.spinner.start('Updating database.config.ts file...\n')
    await delay(500)
    try {
      const targetPath = path.join(
        process.cwd(),
        'src/config/database.config.ts',
      )

      const content = fs.readFileSync(configPath, { encoding: 'utf8' })

      fs.outputFileSync(targetPath, content)
      this.spinner.stop()
      console.log(chalk.green('Updated ./src/config/database.config.ts'))
    } catch (error) {
      this.spinner.stop()
      console.error('Error when updating database config file: ', error)
    }
  }

  // Import module to app module
  protected async importModule({
    moduleName,
    modulePath,
  }: {
    moduleName?: string
    modulePath?: string
  }): Promise<void> {
    try {
      const project = new Project({
        tsConfigFilePath: path.join(process.cwd(), 'tsconfig.json'),
      })

      const appModuleFile = project.addSourceFileAtPath(
        path.join(process.cwd(), 'src/app.module.ts'),
      )

      const decorators = appModuleFile
        ?.getClassOrThrow('AppModule')
        ?.getDecorator('Module')

      const arg = decorators.getFirstDescendantByKindOrThrow(
        ts.SyntaxKind.ObjectLiteralExpression,
      )

      const properties = arg.getProperty('imports')
      const importArray = properties.getFirstDescendantByKindOrThrow(
        ts.SyntaxKind.ArrayLiteralExpression,
      )

      // Add import syntax
      appModuleFile.addImportDeclaration({
        namedImports: [moduleName],
        moduleSpecifier: modulePath,
      })

      importArray.addElement(moduleName)
      project.saveSync()
    } catch (error) {
      throw new Error(chalk.red('Error when importing module: ' + error))
    }
  }

  protected async setupModel(
    destinationPath?: string,
    sourcePath?: string,
  ): Promise<void> {
    this.spinner.start(`Setting up ${destinationPath} ... \n`)
    await delay(500)
    try {
      const content = fs.readFileSync(sourcePath, { encoding: 'utf8' })
      fs.outputFileSync(path.join(process.cwd(), destinationPath), content)
      this.spinner.stop()
      console.log(chalk.green(`Updated ${destinationPath}`))
    } catch (error) {
      this.spinner.stop()
      console.error('Error when setting up model: ', error)
    }
  }
}
