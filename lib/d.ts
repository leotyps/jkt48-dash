import { Client } from 'pg';

const client = new Client({
  connectionString: 'postgresql://dashboard:wZCyQgMUCcOw3ppdNT7Wlg@dashboard-4236.jxf.gcp-asia-southeast1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full',
});

client.connect();

export default client;
