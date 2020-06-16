import React, { useEffect, useState, useContext } from 'react';
import styled from 'styled-components';
import { Divider, Text, TextField } from '@gnosis.pm/safe-react-components';
import LinearProgress from '@material-ui/core/LinearProgress';
import Button from '@material-ui/core/Button';
import Stat from '../components/Stat';
import Icon from '../components/Icon';
import Grid from '@material-ui/core/Grid';
import Section from '../components/Section';
import {
  formatCurrency,
  bytesFormatter,
  bigNumberFormatter
} from '../helpers/formatters';
import { RatesContext } from './RatesProvider';
import { BalancesContext } from './BalancesProvider';
import { CRYPTO_CURRENCY_TO_KEY } from '../constants/currency';
import BalanceTable from '../components/Table/BalanceTable';
import { getBalancesWithRates } from './balancesHelpers';
import IconText from '../components/IconText';
import snxJSConnector from '../helpers/snxJSConnector';
import { addBufferToGasLimit } from '../helpers/networkHelper';
import { estimateCRatio, getStakingAmount } from './mint-helpers';

const Asset = styled.div``;
const StyledTotalSnx = styled(Grid)``;
const StyledLinearProgress = styled(LinearProgress)`
  &.MuiLinearProgress-root {
    height: 15px;
    margin-bottom: 10px;

    &.MuiLinearProgress-barColorPrimary {
      background-color: #008c73;
    }
  }
  &.MuiLinearProgress-colorPrimary {
    background-color: #cecece;
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
        <Text size="sm">TOTAL:</Text>
      </Grid>
      <Grid item xs={6}>
        <Text size="sm" strong>
          {formatCurrency(snxBalance) || 0} SNX
        </Text>
      </Grid>
      <Divider />
      <Grid item xs={6}>
        <Text size="sm">
          Locked:{' '}
          {formatCurrency(snxBalance - data?.debtData?.transferable || 0)}
        </Text>
      </Grid>
      <Grid item xs={6}>
        <Text size="sm">
          Transferable: {formatCurrency(data?.debtData?.transferable || 0)}
        </Text>
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
        <Text size="sm">Staked: {formatCurrency(snxLocked)}</Text>
      </Grid>
      <Grid item xs={6}>
        <Text size="sm">
          Not staked: {formatCurrency(snxBalance - snxLocked || 0)}
        </Text>
      </Grid>
      <Grid item xs={12}>
        <StyledLinearProgress
          variant="determinate"
          value={Math.max(100 * (snxLocked / snxBalance), 1)}
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

type Data = {
  issuableSynths: any;
  issuanceRatio: any;
  SNXPrice: any;
  debtBalance: any;
  snxBalance: any;
};

const useGetIssuanceData = (walletAddress: string, sUSDBytes: any): Data => {
  const [data, setData] = useState({
    issuableSynths: 0,
    issuanceRatio: 0,
    SNXPrice: 0,
    debtBalance: 0,
    snxBalance: 0
  });
  const SNXBytes = bytesFormatter('SNX');

  // @ts-ignore
  const snxJS = snxJSConnector.snxJS;

  useEffect(() => {
    const getIssuanceData = async () => {
      try {
        const results = await Promise.all([
          snxJS.Synthetix.maxIssuableSynths(walletAddress, sUSDBytes),
          snxJS.Synthetix.debtBalanceOf(walletAddress, sUSDBytes),
          snxJS.SynthetixState.issuanceRatio(),
          snxJS.ExchangeRates.rateForCurrency(SNXBytes),
          snxJS.Synthetix.collateral(walletAddress)
        ]);
        const [
          maxIssuableSynths,
          debtBalance,
          issuanceRatio,
          SNXPrice,
          snxBalance
        ] = results.map(bigNumberFormatter);
        const issuableSynths = Math.max(0, maxIssuableSynths - debtBalance);
        setData({
          issuableSynths,
          debtBalance,
          issuanceRatio,
          SNXPrice,
          snxBalance
        });
      } catch (e) {
        console.log(e);
      }
    };
    getIssuanceData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress]);

  return data;
};

const useGetGasEstimate = (
  mintAmount: string,
  issuableSynths: number,
  setGasLimit: (gasLimit: number) => void
) => {
  const [error, setError] = useState(null);
  useEffect(() => {
    if (!mintAmount) return;
    const getGasEstimate = async () => {
      setError(null);
      let gasEstimate;
      try {
        const {
          snxJS: { Synthetix }
        } = snxJSConnector as any;
        const parsedMintAmount = parseFloat(mintAmount);
        if (!parsedMintAmount) throw new Error('Invalid amount');
        if (parsedMintAmount <= 0 || parsedMintAmount > issuableSynths)
          throw new Error('You cannot currently mint that much sUSD');
        if (parsedMintAmount === issuableSynths) {
          gasEstimate = await Synthetix.contract.estimate.issueMaxSynths();
        } else {
          gasEstimate = await Synthetix.contract.estimate.issueSynths(
            // @ts-ignore
            snxJSConnector.utils.parseEther(mintAmount.toString())
          );
        }
        setGasLimit(addBufferToGasLimit(gasEstimate));
      } catch (e) {
        console.log(e);
        const errorMessage = e && e.message;
        setError(errorMessage);
      }
    };
    getGasEstimate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mintAmount]);
  return error;
};

function Mint({ address }: any) {
  const [mintAmount, setMintAmount] = useState('');

  const sUSDBytes = bytesFormatter('sUSD');
  const {
    issuanceRatio,
    SNXPrice,
    debtBalance,
    snxBalance
  } = useGetIssuanceData(address, sUSDBytes);

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
              label=""
              value={mintAmount}
              placeholder="0.00"
              onChange={e => setMintAmount(e.target.value)}
            />
            <Button variant="contained">MAX</Button>
          </Grid>
        </Grid>
        <TextContainer>
          <Text size="lg">
            Staking:{' '}
            {getStakingAmount({
              issuanceRatio,
              mintAmount,
              SNXPrice
            })}{' '}
            SNX
          </Text>
          <Text size="lg">
            Estimated C-Ratio:{' '}
            {estimateCRatio({ SNXPrice, debtBalance, snxBalance, mintAmount })}%
          </Text>
        </TextContainer>

        <StyledButton variant="contained">Mint Now</StyledButton>
      </div>
    </>
  );
}

function MintPage({ address }: any) {
  return (
    <StyledGrid container spacing={2}>
      <Grid item sm={6}>
        <Left />
      </Grid>
      <Grid item sm={6}>
        <Mint address={address} />
      </Grid>
    </StyledGrid>
  );
}

export default MintPage;
