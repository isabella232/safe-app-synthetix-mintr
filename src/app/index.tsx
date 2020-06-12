import React, { useEffect, useState } from 'react';
import initSdk, { SafeInfo } from '@gnosis.pm/safe-apps-sdk';
import Mint from './mint';
import RatesContextProvider from './RatesProvider';
import snxJSConnector from '../helpers/snxJSConnector';
import { ethers } from 'ethers';
import BalancesContextProvider from './BalancesProvider';

// import { web3Provider } from "../config";

// const web3: any = new Web3(web3Provider);

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
    snxJSConnector.setContractSettings({ networkId: 4 });
    setAppInitialized(true);
  }, []);

  return (
    <RatesContextProvider appInitialized={appInitialized}>
      <BalancesContextProvider address={safeInfo && safeInfo.safeAddress}>
        {safeInfo ? <Mint address={safeInfo && safeInfo.safeAddress} /> : null}
      </BalancesContextProvider>
    </RatesContextProvider>
  );
};

export default App;
