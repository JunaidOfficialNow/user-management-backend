import { User } from 'src/user/entities/user.entity';
import { DataSource } from 'typeorm';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: 'jithu@123',
        database: 'crud',
        entities: [User],
        synchronize: true,
      });

      return dataSource.initialize();
    },
  },
];
