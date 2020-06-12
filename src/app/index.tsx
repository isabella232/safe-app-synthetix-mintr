import React, { useEffect, useState } from 'react';
import initSdk, { SafeInfo } from '@gnosis.pm/safe-apps-sdk';
import { ethers } from 'ethers';
import Mint from './mint';
import RatesContextProvider from './RatesProvider';
import snxJSConnector from '../helpers/snxJSConnector';
import BalancesContextProvider from './BalancesProvider';

const App = () => {
  const [appsSdk] = useState(initSdk());
  const [safeInfo, setSafeInfo] = useState<SafeInfo>();
  const [appInitialized, setAppInitialized] = useState(false);

  // config safe connector
  useEffect(() => {
    appsSdk.addListeners({
      onSafeInfo: setSafeInfo
    });

    return () => appsSdk.removeListeners();
  }, [appsSdk]);

  useEffect(() => {
    if (process.env.REACT_APP_LOCAL_WEB3_PROVIDER) {
      const init = async function() {
        console.warn('SYNTHETIX APP: you are using a local web3 provider');
        let provider = new ethers.providers.Web3Provider(
          window.web3.currentProvider
        );
        const address = window.ethereum.selectedAddress;
        const balance = await provider.getBalance(address);
        setSafeInfo({
          safeAddress: address,
          network: 'rinkeby',
          ethBalance: balance.toString()
        });
      };
      init();
    }
  }, []);

  useEffect(() => {
    if (!safeInfo) {
      return;
    }
    const init = async () => {
      const provider = ethers.getDefaultProvider(safeInfo.network);
      const network = await provider.getNetwork();
      snxJSConnector.setContractSettings({
        networkId: network.chainId,
        network: network.name,
        provider
      });
      setAppInitialized(true);
      console.log(safeInfo);
    };

    init();
  }, [safeInfo]);

  return appInitialized ? (
    <RatesContextProvider>
      <BalancesContextProvider address={safeInfo!.safeAddress}>
        <Mint address={safeInfo!.safeAddress} />
      </BalancesContextProvider>
    </RatesContextProvider>
  ) : null;
};

export default App;
