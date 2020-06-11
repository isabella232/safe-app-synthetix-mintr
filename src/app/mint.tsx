import React, { useEffect, useState, useContext } from 'react';
import styled from 'styled-components';
import { Divider, Text, TextField } from '@gnosis.pm/safe-react-components';
import LinearProgress from '@material-ui/core/LinearProgress';
import Button from '@material-ui/core/Button';
import { SynthetixJs } from 'synthetix-js';
import Stat from '../components/Stat';
import Icon from '../components/Icon';
import Grid from '@material-ui/core/Grid';
import Section from '../components/Section';
import { formatCurrency } from '../helpers/formatters';
import { RatesContext } from './RatesProvider';
import { BalancesContext } from './BalancesProvider';
import { CRYPTO_CURRENCY_TO_KEY } from '../constants/currency';
import BalanceTable from '../components/Table/BalanceTable';
import { getBalancesWithRates } from './balancesHelpers';
import IconText from '../components/IconText';

const Asset = styled.div``;
const StyledTotalSnx = styled(Grid)``;
const StyledLinearProgress = styled(LinearProgress)`
  &.MuiLinearProgress-root {
    height: 15px;
  }
`;
const StyledButton = styled(Button)`
  &.MuiButton-root {
    background-color: #727cff;
    color: #ffffff;
    font-size: 1rem;
    padding: 16px 24px;
  }

  &.MuiButton-root:hover {
    background-color: #8c94ff;
  }
`;

const StyledGrid = styled(Grid)``;

const TextContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 3rem;
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
        TOTAL SNX
      </Grid>
      <Grid item xs={6}>
        {formatCurrency(snxBalance) || 0} SNX
      </Grid>
      <Divider />
      <Grid item xs={6}>
        Locked: {formatCurrency(snxBalance - data?.debtData?.transferable || 0)}
      </Grid>
      <Grid item xs={6}>
        Transferable: {formatCurrency(data?.debtData?.transferable || 0)}
      </Grid>
      <Grid item xs={12}>
        <StyledLinearProgress
          variant="determinate"
          value={Math.max(
            (100 * (snxBalance - data?.debtData?.transferable)) /
              data?.debtData?.transferable,
            1
          )}
        />
      </Grid>
      <Grid item xs={6}>
        Staked: {formatCurrency(snxLocked)}
      </Grid>
      <Grid item xs={6}>
        Not staked: {formatCurrency(snxBalance - snxLocked || 0)}
      </Grid>
      <Grid item xs={12}>
        <StyledLinearProgress
          variant="determinate"
          value={Math.max((100 * snxLocked) / (snxBalance - snxLocked), 1)}
        />
      </Grid>
    </StyledTotalSnx>
  );
};

function Left() {
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
        <Grid
          item
          container
          xs={12}
          sm={6}
          direction="column"
          justify="center"
          alignItems="center"
        >
          {['SNX', 'ETH'].map((asset: any) => (
            <Asset key={asset}>
              <IconText
                iconSize="sm"
                textSize="lg"
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

      <BalanceTable
        rates={rates}
        debtData={data.debtData}
        walletBalancesWithRates={walletBalancesWithRates}
      />
    </>
  );
}

function Right() {
  return (
    <>
      <Section
        icon={<Icon size="sm" type="mint" />}
        name="Mint"
        description="Mint sUSD by staking your SNX. This gives you a Collateralization Rate and a debt, allowing you to earn staking rewards"
      />
      <div>
        <Text size="sm">Confirm or enter the amount to mint</Text>
        <Grid container>
          <Grid item>
            <Icon size="md" type="susd" />
            <Text size="lg">sUSD</Text>
            <TextField
              id="standard-name"
              label="Name"
              value="0.00"
              onChange={e => console.log(e.target.value)}
            />
            <Button variant="contained">MAX</Button>
          </Grid>
        </Grid>
        <TextContainer>
          <Text size="lg">Staking: 0 SNX</Text>
          <Text size="lg">Estimated C-Ratio: 5%</Text>
        </TextContainer>

        <Text size="lg">
          Ethereum network fees: $0 / 27 GWEI<a href="/">EDIT</a>
        </Text>
        <StyledButton variant="contained">Mint Now</StyledButton>
      </div>
    </>
  );
}

function Mint(props: any) {
  const [snxjs] = useState(new SynthetixJs({ networkId: 4 }));

  useEffect(() => {
    const load = async () => {
      const totalSUSD = await snxjs.sUSD.totalSupply();
      const totalSUSDSupply = snxjs.utils.formatEther(totalSUSD);
      console.log('sUSDTotalSupply', totalSUSDSupply);
    };

    load();
  }, [snxjs]);

  return (
    <StyledGrid container spacing={2}>
      <Grid item sm={6}>
        <Left />
      </Grid>
      <Grid item sm={6}>
        <Right />
      </Grid>
    </StyledGrid>
  );
}

export default Mint;
