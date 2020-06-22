import React, { createContext, useEffect, useReducer } from 'react';
import { parseBytes32String } from 'ethers/utils';
import snxJSConnector from '../helpers/snxJSConnector.js';
import { bytesFormatter, bigNumberFormatter } from '../helpers/formatters';
import { CRYPTO_CURRENCY_TO_KEY } from '../constants/currency';
import { fetchData } from './fetchData';

export const fetchBalances = async walletAddress => {
  if (!walletAddress) throw new Error('wallet address is needed');
  const {
    synthSummaryUtilContract,
    snxJS: { Synthetix },
    provider
  } = snxJSConnector;
  const [
    synthBalanceResults,
    totalSynthsBalanceResults,
    snxBalanceResults,
    ethBalanceResults
  ] = await Promise.all([
    synthSummaryUtilContract.synthsBalances(walletAddress),
    synthSummaryUtilContract.totalSynthsInKey(
      walletAddress,
      bytesFormatter(CRYPTO_CURRENCY_TO_KEY.sUSD)
    ),
    Synthetix.collateral(walletAddress),
    provider.getBalance(walletAddress)
  ]);

  const [synthsKeys, synthsBalances] = synthBalanceResults;

  const synths = synthsKeys
    .map((key, i) => {
      const synthName = parseBytes32String(key);
      return {
        name: synthName,
        balance: bigNumberFormatter(synthsBalances[i])
      };
    })
    .filter(synth => synth.balance);

  const sUSDBalance = synths.find(
    synth => synth.name === CRYPTO_CURRENCY_TO_KEY.sUSD
  );

  return {
    [CRYPTO_CURRENCY_TO_KEY.SNX]: bigNumberFormatter(snxBalanceResults),
    [CRYPTO_CURRENCY_TO_KEY.ETH]: bigNumberFormatter(ethBalanceResults),
    [CRYPTO_CURRENCY_TO_KEY.sUSD]: sUSDBalance ? sUSDBalance.balance : 0,
    synths,
    totalSynths: bigNumberFormatter(totalSynthsBalanceResults)
  };
};

function reducer(state, action) {
  switch (action.type) {
    case 'balancesReady':
      return { ...state, balances: { ...action.payload } };
    case 'dataReady':
      return { ...state, data: { ...action.payload } };
    default:
      throw new Error();
  }
}

export const BalancesContext = createContext({});

function BalancesContextProvider({ address, children }) {
  const [state, dispatch] = useReducer(reducer, {});

  useEffect(() => {
    if (!address) {
      return;
    }

    fetchBalances(address).then(balances => {
      dispatch({
        type: 'balancesReady',
        payload: balances
      });
    });

    fetchData(address).then(data => {
      dispatch({
        type: 'dataReady',
        payload: data
      });
    });
  }, [address]);

  return (
    <BalancesContext.Provider value={state}>
      {children}
    </BalancesContext.Provider>
  );
}

export default BalancesContextProvider;
