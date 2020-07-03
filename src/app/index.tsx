import React, { useEffect, useState, useContext } from 'react';
import { Tab, TabItem, Loader } from '@gnosis.pm/safe-react-components';
import { ethers } from 'ethers';
import Mint from './mint';
import Burn from './burn';
import Claim from './claim';
import RatesContextProvider from './RatesProvider';
import SnxJSConnector from '../helpers/snxJSConnector';
import BalancesContextProvider from './BalancesProvider';
import IconText from '../components/IconText';
import { SafeContext } from './SafeProvider';

const getItems = (selectedItem: string): Array<TabItem> => {
  return [
    {
      id: '1',
      label: 'MINT',
      customContent: (
        <IconText
          iconSize="sm"
          iconType="mint"
          textSize="sm"
          color={selectedItem === '2' ? 'primary' : 'text'}
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
          color={selectedItem === '2' ? 'primary' : 'text'}
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
          color={selectedItem === '3' ? 'primary' : 'text'}
          text="CLAIM"
        />
      )
    }
  ];
};

const App = () => {
  const { safeInfo, setSafeInfo } = useContext(SafeContext);
  const [appInitialized, setAppInitialized] = useState(false);
  const [selected, setSelected] = useState('1');

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
          network: 'mainnet',
          ethBalance: balance.toString()
        });
      };
      init();
    }
  }, [setSafeInfo]);

  useEffect(() => {
    if (!safeInfo) {
      return;
    }
    const init = async () => {
      const provider = ethers.getDefaultProvider(safeInfo.network);
      const network = await provider.getNetwork();
      SnxJSConnector.init({
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
        return <Mint />;
      case '2':
        return <Burn />;
      case '3':
        return <Claim />;
      default:
        return null;
    }
  };

  return appInitialized ? (
    <RatesContextProvider>
      <BalancesContextProvider>
        <Tab
          onChange={setSelected}
          selectedTab={selected}
          variant="contained"
          items={getItems(selected)}
          fullWidth
        />
        {renderSelectedTab()}
      </BalancesContextProvider>
    </RatesContextProvider>
  ) : (
    <Loader size="lg" />
  );
};

export default App;
