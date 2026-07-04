import { syncKemendagData } from '../src/utils/syncKemendag';
import 'dotenv/config';

async function run() {
  console.log('Starting manual sync from Kemendag database...');
  try {
    const res = await syncKemendagData();
    console.log('Sync from Kemendag finished successfully:', res);
    process.exit(0);
  } catch (e) {
    console.error('Sync from Kemendag failed:', e);
    process.exit(1);
  }
}

run();
