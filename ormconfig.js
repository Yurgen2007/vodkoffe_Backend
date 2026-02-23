module.exports = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME ,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '123',
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  cli: {
    entitiesDir: 'src',
    migrationsDir: 'src/migrations',
  },
};
