import React, { useEffect, useState } from 'react';
import initSdk, { SafeInfo } from '@gnosis.pm/safe-apps-sdk';
import { Tab, TabItem } from '@gnosis.pm/safe-react-components';
import { ethers } from 'ethers';
import Mint from './mint';
import Burn from './burn';
import RatesContextProvider from './RatesProvider';
import snxJSConnector from '../helpers/snxJSConnector';
import BalancesContextProvider from './BalancesProvider';
import IconText from '../components/IconText';

const App = () => {
  const [appsSdk] = useState(initSdk());
  const [safeInfo, setSafeInfo] = useState<SafeInfo>();
  const [appInitialized, setAppInitialized] = useState(false);
  const [selected, setSelected] = useState('1');

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

  const renderSelectedTab = () => {
    switch (selected) {
      case '1':
        return <Mint address={safeInfo!.safeAddress} appsSdk={appsSdk} />;
      case '2':
        return <Burn address={safeInfo!.safeAddress} appsSdk={appsSdk} />;
      default:
        return null;
    }
  };

  const items: TabItem[] = [
    {
      id: '1',
      label: 'MINT',
      customContent: (
        <IconText
          iconSize="sm"
          iconType="mint"
          textSize="sm"
          color={selected === '2' ? 'primary' : 'text'}
          text="MINT"
        />
      )
    },
    {
      id: '2',
      label: 'BURN',
      customContent: (
        <IconText
          iconSize="sm"
          iconType="burn"
          textSize="sm"
          color={selected === '2' ? 'primary' : 'text'}
          text="BURN"
        />
      )
    },
    {
      id: '3',
      label: 'CLAIM',
      customContent: (
        <IconText
          iconSize="sm"
          iconType="claim"
          textSize="sm"
          color={selected === '3' ? 'primary' : 'text'}
          text="CLAIM"
        />
      )
    }
  ];

  return appInitialized ? (
    <RatesContextProvider>
      <BalancesContextProvider address={safeInfo!.safeAddress}>
        <Tab
          onChange={setSelected}
          selectedTab={selected}
          variant="contained"
          items={items}
          fullWidth
        />
        {renderSelectedTab()}
      </BalancesContextProvider>
    </RatesContextProvider>
  ) : null;
};

export default App;
