import { SynthetixJs } from 'synthetix-js';
import { ethers } from 'ethers';
import { synthSummary } from './contracts';

type ContractSettings = {
  provider: any;
  networkId: number;
  network: string;
};

class SnxJSConnector {
  static init(contractSettings: ContractSettings) {
    const snxJS = new SynthetixJs(contractSettings);
    const snx = {
      snxJS,
      synths: snxJS.contractSettings.synths,
      provider: snxJS.contractSettings.provider,
      utils: snxJS.utils,
      ethersUtils: snxJS.ethers.utils,
      synthSummaryUtilContract: new ethers.Contract(
        synthSummary.addresses[contractSettings.networkId],
        synthSummary.abi,
        snxJS.contractSettings.provider
      )
    };

    snxJSConnector = snx;
  }
}

type snxConnectorType = {
  snxJS: any;
  synths: any;
  provider: any;
  utils: any;
  ethersUtils: any;
  synthSummaryUtilContract: any;
};

export let snxJSConnector: snxConnectorType;

export default SnxJSConnector;
