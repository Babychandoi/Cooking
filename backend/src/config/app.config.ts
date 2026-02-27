import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.APP_PORT || '8080', 10),
  env: process.env.NODE_ENV || 'development',
}));
