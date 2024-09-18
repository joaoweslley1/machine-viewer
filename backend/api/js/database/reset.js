import Migration from './migration.js'

async function resetDatabase() {
    await Migration.down();
    await Migration.up();
}

resetDatabase();