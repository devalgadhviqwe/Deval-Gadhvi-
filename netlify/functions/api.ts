import serverless from 'serverless-http';
import { createExpressApp } from '../../server/app';

const app = createExpressApp();
const serverlessHandler = serverless(app);

export const handler = async (event: any, context: any) => {
  // Strip /.netlify/functions/api prefix if called directly so Express routes match /api/*
  if (event.path && event.path.startsWith('/.netlify/functions/api')) {
    event.path = event.path.replace('/.netlify/functions/api', '/api');
  }
  return serverlessHandler(event, context);
};
