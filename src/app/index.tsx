import React, { useEffect, useState } from 'react';
//import Web3 from "web3";
import { Card, Text, Loader } from '@gnosis.pm/safe-react-components';
import initSdk, { SafeInfo } from '@gnosis.pm/safe-apps-sdk';

// import { web3Provider } from "../config";

// const web3: any = new Web3(web3Provider);

const App = () => {
  const [appsSdk] = useState(initSdk());
  const [safeInfo, setSafeInfo] = useState<SafeInfo>();

  // config safe connector
  useEffect(() => {
    appsSdk.addListeners({
      onSafeInfo: setSafeInfo
    });

    return () => appsSdk.removeListeners();
  }, [appsSdk]);

  return (
    <Card>
      {safeInfo ? (
        <Text size="sm">JSON.stringify(safeInfo) </Text>
      ) : (
        <Loader size="md" />
      )}
    </Card>
  );
};

export default App;
