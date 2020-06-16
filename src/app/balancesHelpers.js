import orderBy from 'lodash/orderBy';
import isEmpty from 'lodash/isEmpty';
import { CRYPTO_CURRENCY_TO_KEY } from '../constants/currency';

export const getBalancesWithRates = (rates, balances) => {
  if (isEmpty(rates) || isEmpty(balances)) return {};
  let balancesWithRates = {};
  let synthBalancesWithRates = [];
  Object.keys(balances).forEach(type => {
    if (typeof balances[type] === 'number') {
      const balance = balances[type];
      const rate =
        type === 'totalSynths'
          ? rates[CRYPTO_CURRENCY_TO_KEY.sUSD]
          : type === 'ETH'
          ? rates['sETH']
          : rates[type];
      balancesWithRates[type] = {
        balance,
        valueUSD: balance * rate
      };
    } else if (
      typeof balances[type] === 'object' &&
      balances[type].length > 0
    ) {
      synthBalancesWithRates = balances[type].map(({ balance, name }) => {
        return {
          name,
          balance,
          valueUSD: balance * rates[name]
        };
      });
    }
  });
  return {
    ...balancesWithRates,
    synths: orderBy(synthBalancesWithRates, 'valueUSD', 'desc')
  };
};
