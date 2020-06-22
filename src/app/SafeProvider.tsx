import React, { createContext, useEffect, useState } from 'react';
import initSdk, { SafeInfo } from '@gnosis.pm/safe-apps-sdk';

type Context = {
  safeInfo: any;
  setSafeInfo: (safeInfo: any) => void;
  appsSdk: any;
};

export const SafeContext = createContext<Context | any>({});

type Props = {
  children: React.ReactNode;
};

function SafeContextProvider({ children }: Props) {
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
    <SafeContext.Provider value={{ safeInfo, setSafeInfo, appsSdk }}>
      {children}
    </SafeContext.Provider>
  );
}

export default SafeContextProvider;
