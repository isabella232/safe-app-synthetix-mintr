import React, { createContext, useEffect, useReducer } from 'react';
import axios from 'axios';
import { parseBytes32String } from 'ethers/utils';
import snxJSConnector from '../helpers/snxJSConnector';
import { bytesFormatter } from '../helpers/formatters';
import { CRYPTO_CURRENCY_TO_KEY } from '../constants/currency';

const fetchUniswapSETHRate = async () => {
  const {
    snxJS: { sETH }
  } = snxJSConnector;
  const DEFAULT_RATE = 1;

  try {
    const sETHAddress = sETH.contract.address;
    const query = `query {
			exchanges(where: {tokenAddress:"${sETHAddress}"}) {
				price
			}
		}`;

    const response = await axios.post(
      'https://api.thegraph.com/subgraphs/name/graphprotocol/uniswap',
      JSON.stringify({ query, variables: null })
    );

    return (
      (response.data &&
        response.data.data &&
        response.data.data.exchanges &&
        response.data.data.exchanges[0] &&
        1 / response.data.data.exchanges[0].price) ||
      DEFAULT_RATE
    );
  } catch (e) {
    // if we can't get the sETH/ETH rate, then default it to 1:1
    return DEFAULT_RATE;
  }
};

export const fetchRates = async () => {
  const {
    synthSummaryUtilContract,
    snxJS: { ExchangeRates }
  } = snxJSConnector;
  const [synthsRates, snxRate, uniswapSETHRate] = await Promise.all([
    synthSummaryUtilContract.synthsRates(),
    ExchangeRates.rateForCurrency(bytesFormatter(CRYPTO_CURRENCY_TO_KEY.SNX)),
    fetchUniswapSETHRate()
  ]);

  let exchangeRates = {
    [CRYPTO_CURRENCY_TO_KEY.SNX]: snxRate / 1e18
  };

  const [keys, rates] = synthsRates;

  keys.forEach((key, i) => {
    const synthName = parseBytes32String(key);
    const rate = rates[i] / 1e18;
    if (synthName === CRYPTO_CURRENCY_TO_KEY.sUSD) {
      exchangeRates[CRYPTO_CURRENCY_TO_KEY.sUSD] = uniswapSETHRate;
    } else if (synthName === CRYPTO_CURRENCY_TO_KEY.sETH) {
      exchangeRates[CRYPTO_CURRENCY_TO_KEY.sETH] = rate;
      exchangeRates[CRYPTO_CURRENCY_TO_KEY.ETH] = rate;
    } else {
      exchangeRates[synthName] = rate;
    }
  });

  return exchangeRates;
};

function reducer(state, action) {
  switch (action.type) {
    case 'ratesReady':
      return { ...state, ...action.payload };
    default:
      throw new Error();
  }
}

export const RatesContext = createContext({});

function RatesContextProvider({ children }) {
  let [rates, dispatch] = useReducer(reducer, {});

  useEffect(() => {
    fetchRates().then(rates => {
      dispatch({
        type: 'ratesReady',
        payload: rates
      });
    });
  }, []);

  return (
    <RatesContext.Provider value={rates}>{children}</RatesContext.Provider>
  );
}

export default RatesContextProvider;
