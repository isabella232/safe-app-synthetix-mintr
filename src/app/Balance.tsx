import React, { useContext } from 'react';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import LinearProgress from '@material-ui/core/LinearProgress';
import { Text, Divider } from '@gnosis.pm/safe-react-components';
import IconText from '../components/IconText';
import { BalancesContext } from './BalancesProvider';
import { RatesContext } from './RatesProvider';
import Stat from '../components/Stat';
import { getBalancesWithRates } from './balancesHelpers';
import { formatCurrency } from '../helpers/formatters';
import BalanceTable from '../components/Table/BalanceTable';
import { CRYPTO_CURRENCY_TO_KEY } from '../constants/currency';

const Asset = styled.div``;

const StyledTotalSnx = styled(Grid)``;

const StyledText = styled(Text)`
  font-size: .7em;

  @media screen and (max-width: 800px) {
    font-size: .65em;
  }
`;

const StyledLinearProgress = styled(LinearProgress)`
  &.MuiLinearProgress-root {
    height: 15px;
    margin-bottom: 10px;
    background-color: ${({ theme }) => theme.colors.primaryLight};
  }
  & .MuiLinearProgress-barColorPrimary {
    background-color: ${({ theme }) => theme.colors.secondary};
  }
`;

const TableContainer = styled.div`
  margin-top: 1rem;
`;

const TotalSnx = () => {
  const { balances = {}, data = {} }: any = useContext(BalancesContext);
  const snxBalance = balances[CRYPTO_CURRENCY_TO_KEY.SNX];
  const snxLocked =
    snxBalance &&
    data?.debtData?.currentCRatio &&
    data?.debtData?.targetCRatio &&
    snxBalance *
      Math.min(1, data?.debtData?.currentCRatio / data?.debtData?.targetCRatio);
  return (
    <StyledTotalSnx container>
      <Grid item xs={6}>
        <Text size="sm">TOTAL:</Text>
      </Grid>
      <Grid item xs={6}>
        <Text size="sm" strong>
          {formatCurrency(snxBalance) || 0} SNX
        </Text>
      </Grid>
      <Divider />
      <Grid item xs={6}>
        <StyledText size="sm">
          Locked:{' '}
          {formatCurrency(snxBalance - data?.debtData?.transferable || 0)}
        </StyledText>
      </Grid>
      <Grid item xs={6}>
        <StyledText size="sm">
          Transferable: {formatCurrency(data?.debtData?.transferable || 0)}
        </StyledText>
      </Grid>
      <Grid item xs={12}>
        <StyledLinearProgress
          variant="determinate"
          value={Math.max(
            (100 * (snxBalance - data?.debtData?.transferable)) / snxBalance,
            1
          )}
        />
      </Grid>
      <Grid item xs={6}>
        <StyledText size="sm">Staked: {formatCurrency(snxLocked)}</StyledText>
      </Grid>
      <Grid item xs={6}>
        <StyledText size="sm">
          Not staked: {formatCurrency(snxBalance - snxLocked || 0)}
        </StyledText>
      </Grid>
      <Grid item xs={12}>
        <StyledLinearProgress
          variant="determinate"
          color="primary"
          value={Math.max(100 * (snxLocked / snxBalance), 1)}
        />
      </Grid>
    </StyledTotalSnx>
  );
};

function Balance() {
  const rates: any = useContext(RatesContext);
  const { balances = {}, data = {} }: any = useContext(BalancesContext);
  const walletBalancesWithRates = getBalancesWithRates(rates, balances);
  const currentRatio = data?.debtData?.currentCRatio
    ? Math.round(100 / data?.debtData?.currentCRatio)
    : 0;
  const ratioTarget = data?.debtData?.targetCRatio
    ? Math.round(100 / data?.debtData?.targetCRatio)
    : 0;

  return (
    <>
      <Grid container>
        <Grid item xs={12} sm={6}>
          <Stat
            stat={`${currentRatio}%`}
            description="Current collateralization ratio"
          ></Stat>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Stat
            stat={`${ratioTarget}%`}
            description="Target collateralization ratio"
          ></Stat>
        </Grid>
      </Grid>

      <Grid container>
        <Grid item container xs={12} sm={6} direction="column" justify="center">
          {['SNX', 'ETH'].map((asset: any) => (
            <Asset key={asset}>
              <IconText
                iconSize="sm"
                textSize="sm"
                iconType={asset.toLocaleLowerCase()}
                text={`1 ${asset} = $
                  ${formatCurrency(rates[asset])} USD`}
              />
            </Asset>
          ))}
        </Grid>

        <Grid item xs={12} sm={6}>
          <TotalSnx />
        </Grid>
      </Grid>

      <TableContainer>
        <BalanceTable
          rates={rates}
          debtData={data.debtData}
          walletBalancesWithRates={walletBalancesWithRates}
        />
      </TableContainer>
    </>
  );
}

export default Balance;
