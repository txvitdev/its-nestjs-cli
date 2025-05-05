#!/usr/bin/env node
import { Command } from 'commander'
import { initialization, test } from './commands/init.command'

const program = new Command()

program
  .name('its-nestjs-cli')
  .description('Its nestjs cli made by Jasper aka TXV0507')
  .version('1.0.0')

program.command('setup').action(async () => {
  await initialization()
})

program.command('test').action(async () => {
  await test()
})

program.parse(process.argv)
