import throttle from 'lodash/throttle';
import invert from 'lodash/invert';

export const SUPPORTED_NETWORKS = {
  1: 'MAINNET',
  4: 'RINKEBY'
};

export const SUPPORTED_NETWORKS_MAP = invert(SUPPORTED_NETWORKS);

const INFURA_PROJECT_ID = process.env.REACT_APP_INFURA_PROJECT_ID;
const INFURA_ARCHIVE_PROJECT_ID =
  process.env.REACT_APP_INFURA_ARCHIVE_PROJECT_ID;

export const INFURA_JSON_RPC_URLS = {
  1: `https://mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
  4: `https://rinkeby.infura.io/v3/${INFURA_PROJECT_ID}`
};

export const INFURA_ARCHIVE_JSON_RPC_URL = `https://mainnet.infura.io/v3/${INFURA_ARCHIVE_PROJECT_ID}`;

export const SUPPORTED_WALLETS = ['Metamask'];

export const hasWeb3 = () => {
  return window.web3;
};

export async function getEthereumNetwork() {
  return await new Promise(function(resolve, reject) {
    if (!window.web3) resolve({ name: 'MAINNET', networkId: '1' });
    window.web3.version.getNetwork((err, networkId) => {
      if (err) {
        reject(err);
      } else {
        const name = SUPPORTED_NETWORKS[networkId];
        resolve({ name, networkId });
      }
    });
  });
}

export function onMetamaskAccountChange(cb) {
  if (!window.ethereum) return;
  const listener = throttle(cb, 1000);
  window.ethereum.on('accountsChanged', listener);
}

export function onMetamaskNetworkChange(cb) {
  if (!window.ethereum) return;
  const listener = throttle(cb, 1000);
  window.ethereum.on('networkChanged', listener);
}

export const isMainNet = networkId =>
  networkId === SUPPORTED_NETWORKS_MAP.MAINNET;
