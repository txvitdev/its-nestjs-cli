import dataSource from '../database'

export async function seed() {
  await dataSource.initialize()

  const queryRunner = dataSource.createQueryRunner()
  await queryRunner.connect()

  await queryRunner.startTransaction()

  try {
    await queryRunner.commitTransaction()
  } catch (error) {
    console.log('Error seeder: ', error)
    await queryRunner.rollbackTransaction()
  } finally {
    await queryRunner.release()
  }
}

seed().catch(() => {
  process.exit(1)
})
