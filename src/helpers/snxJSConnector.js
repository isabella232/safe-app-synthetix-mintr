import { SynthetixJs } from 'synthetix-js';
import { ethers } from 'ethers';
import { synthSummary } from './contracts';

let snxJSConnector = {
  initialized: false,
  setContractSettings: function(contractSettings) {
    this.initialized = true;
    this.snxJS = new SynthetixJs(contractSettings);
    this.synths = this.snxJS.contractSettings.synths;
    this.provider = this.snxJS.contractSettings.provider;
    this.utils = this.snxJS.utils;
    this.ethersUtils = this.snxJS.ethers.utils;
    this.synthSummaryUtilContract = new ethers.Contract(
      synthSummary.addresses[contractSettings.networkId],
      synthSummary.abi,
      this.provider
    );
  }
};

export default snxJSConnector;
