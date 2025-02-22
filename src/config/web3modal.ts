
import { createConfig } from 'wagmi';
import { amoy } from './chains';

export const config = createConfig({
  chains: [amoy],
  defaultChain: amoy,
  projectId: '3225e25c4d47b78232829662814a3d58'
});
