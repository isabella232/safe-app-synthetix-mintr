import React, { useEffect, useState, useCallback, useContext } from 'react';
import styled from 'styled-components';
import { Text } from '@gnosis.pm/safe-react-components';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import numbro from 'numbro';
import Section from '../../components/Section';
import Icon from '../../components/Icon';
import {
  bytesFormatter,
  bigNumberFormatter,
  formatCurrency,
  secondsToTime
} from '../../helpers/formatters';
import { snxJSConnector } from '../../helpers/snxJSConnector';
import Balance from '../Balance';
import { differenceInSeconds, addSeconds } from 'date-fns';
import { SafeContext } from '../SafeProvider';
import AmountInput from '../../components/AmountInput';

const StyledPaper = styled(Paper)`
  &.MuiPaper-root {
    padding: 24px 16px;
  }
`;

const StyledGridBalance = styled(Grid)`
  padding-right: 24px;
`;

const StyledGridSNX = styled(Grid)`
  padding-right: 6px;
`;

const BurnButton = styled(Button)`
  &.MuiButton-root {
    background-color: ${({ theme }) => theme.colors.primary};
    color: #ffffff;
    font-size: 1rem;
    padding: 16px 24px;
    margin-top: 4rem;
  }

  @media screen and (max-width: 900px) {
    width: 100%;
  }

  &.MuiButton-root:hover {
    background-color: #8c94ff;
  }
`;

const StyledButton = styled(Button)`
  &.MuiButton-root {
    background-color: ${({ theme }) => theme.colors.primary};
    color: #ffffff;
  }

  &.MuiButton-root:hover {
    background-color: #8c94ff;
  }

  @media screen and (max-width: 900px) {
    &.MuiButton-root {
      font-size: 0.7rem;
      padding: 4px;
    }
  }
`;

const StyledGrid = styled(Grid)`
  margin-top: 5px !important;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 0.5rem 0;
`;

const TextContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

type Data = {
  issuanceRatio: any;
  sUSDBalance: any;
  maxBurnAmount: any;
  maxBurnAmountBN: any;
  SNXPrice: any;
  burnAmountToFixCRatio: any;
  debtEscrow: any;
};

const useGetDebtData = (walletAddress: string, sUSDBytes: any): Data => {
  const [data, setData] = useState({
    issuanceRatio: 0,
    sUSDBalance: 0,
    maxBurnAmount: 0,
    maxBurnAmountBN: 0,
    SNXPrice: 0,
    burnAmountToFixCRatio: 0,
    debtEscrow: 0
  });
  const SNXBytes = bytesFormatter('SNX');
  const snxJS = snxJSConnector.snxJS;

  useEffect(() => {
    const getDebtData = async () => {
      try {
        const results = await Promise.all([
          snxJS.Synthetix.debtBalanceOf(walletAddress, sUSDBytes),
          snxJS.sUSD.balanceOf(walletAddress),
          snxJS.SynthetixState.issuanceRatio(),
          snxJS.ExchangeRates.rateForCurrency(SNXBytes),
          snxJS.RewardEscrow.totalEscrowedAccountBalance(walletAddress),
          snxJS.SynthetixEscrow.balanceOf(walletAddress),
          snxJS.Synthetix.maxIssuableSynths(walletAddress)
        ]);
        const [
          debt,
          sUSDBalance,
          issuanceRatio,
          SNXPrice,
          totalRewardEscrow,
          totalTokenSaleEscrow,
          issuableSynths
        ] = results.map(bigNumberFormatter);
        let maxBurnAmount, maxBurnAmountBN;
        if (debt > sUSDBalance) {
          maxBurnAmount = sUSDBalance;
          maxBurnAmountBN = results[1];
        } else {
          maxBurnAmount = debt;
          maxBurnAmountBN = results[0];
        }
        const escrowBalance = totalRewardEscrow + totalTokenSaleEscrow;
        setData({
          issuanceRatio,
          sUSDBalance,
          maxBurnAmount,
          maxBurnAmountBN,
          SNXPrice,
          burnAmountToFixCRatio: Math.max(debt - issuableSynths, 0),
          debtEscrow: Math.max(
            escrowBalance * SNXPrice * issuanceRatio + debt - issuableSynths,
            0
          )
        });
      } catch (e) {
        console.log(e);
      }
    };
    getDebtData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress]);
  return data;
};

function Burn() {
  const { safeInfo, appsSdk } = useContext(SafeContext);
  const [burnAmount, setBurnAmount] = useState('');
  const [waitingPeriod, setWaitingPeriod] = useState(0);
  const [issuanceDelay, setIssuanceDelay] = useState(0);
  const [error, setError] = useState('');

  const sUSDBytes = bytesFormatter('sUSD');
  const {
    maxBurnAmount,
    //maxBurnAmountBN,
    sUSDBalance,
    //issuanceRatio,
    //SNXPrice,
    burnAmountToFixCRatio
    //debtEscrow
  } = useGetDebtData(safeInfo.safeAddress, sUSDBytes);

  const getMaxSecsLeftInWaitingPeriod = useCallback(async () => {
    const {
      snxJS: { Exchanger }
    } = snxJSConnector;
    try {
      const maxSecsLeftInWaitingPeriod = await Exchanger.maxSecsLeftInWaitingPeriod(
        safeInfo.safeAddress,
        bytesFormatter('sUSD')
      );
      setWaitingPeriod(Number(maxSecsLeftInWaitingPeriod));
    } catch (e) {
      console.log(e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getIssuanceDelay = useCallback(async () => {
    const {
      snxJS: { Issuer }
    } = snxJSConnector;
    try {
      const [
        canBurnSynths,
        lastIssueEvent,
        minimumStakeTime
      ] = await Promise.all([
        Issuer.canBurnSynths(safeInfo.safeAddress),
        Issuer.lastIssueEvent(safeInfo.safeAddress),
        Issuer.minimumStakeTime()
      ]);

      if (Number(lastIssueEvent) && Number(minimumStakeTime)) {
        const burnUnlockDate = addSeconds(
          Number(lastIssueEvent) * 1000,
          Number(minimumStakeTime)
        );
        const issuanceDelayInSeconds = differenceInSeconds(
          burnUnlockDate,
          new Date()
        );
        setIssuanceDelay(
          issuanceDelayInSeconds > 0
            ? issuanceDelayInSeconds
            : canBurnSynths
            ? 0
            : 1
        );
      }
    } catch (e) {
      console.log(e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getMaxSecsLeftInWaitingPeriod();
    getIssuanceDelay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getMaxSecsLeftInWaitingPeriod, getIssuanceDelay]);

  useEffect(() => {
    const parsedBurnAmount = parseFloat(burnAmount);

    if (parsedBurnAmount <= 0) {
      setError('Invalid amount');
    } else if (parsedBurnAmount > maxBurnAmount) {
      setError('Not enough sUSD to burn');
    } else {
      setError('');
    }
  }, [burnAmount, maxBurnAmount]);

  const handleBurn = async () => {
    const {
      snxJS: { Synthetix, Issuer }
    } = snxJSConnector;
    let data;
    const parsedBurnAmount = numbro(burnAmount).value();
    if (!parsedBurnAmount) {
      return;
    }

    try {
      if (await Synthetix.isWaitingPeriod(bytesFormatter('sUSD')))
        throw new Error('Waiting period for sUSD is still ongoing');

      if (!(await Issuer.canBurnSynths(safeInfo.safeAddress)))
        throw new Error('Waiting period to burn is still ongoing');

      data = Synthetix.contract.interface.functions.burnSynths.encode([
        snxJSConnector.utils.parseEther(parsedBurnAmount.toString())
      ]);
    } catch (error) {
      console.error(error);
      setError(error.message);
    }

    const tx = {
      to: snxJSConnector.utils.contractSettings.addressList.Synthetix,
      value: 0,
      data
    };

    appsSdk.sendTransactions([tx]);
  };

  const renderSubmitButton = () => {
    if (issuanceDelay) {
      return (
        <>
          <BurnButton onClick={getIssuanceDelay}>Retry</BurnButton>
          <Text size="sm">
            There is a waiting period after minting before you can burn. Please
            wait {secondsToTime(issuanceDelay)} before attempting to burn sUSD.
          </Text>
        </>
      );
    } else if (waitingPeriod) {
      return (
        <>
          <BurnButton onClick={getMaxSecsLeftInWaitingPeriod}>Retry</BurnButton>
          <Text size="sm">
            There is a waiting period after completing a trade. Please wait{' '}
            {secondsToTime(waitingPeriod)} before attempting to burn sUSD.
          </Text>
        </>
      );
    } else {
      return (
        <BurnButton
          variant="contained"
          onClick={handleBurn}
          disabled={!!error || !numbro(burnAmount).value() || sUSDBalance === 0}
        >
          Burn Now
        </BurnButton>
      );
    }
  };

  return (
    <>
      <Section
        icon={<Icon size="md" type="burn" />}
        name="Burn"
        description="Burn sUSD to unlock your staked SNX. This increases your Collateralization Ratio and reduces your debt, allowing you to transfer your non-escrowed SNX."
      />
      <StyledPaper elevation={3}>
        <Text size="lg">Confirm or enter the amount to burn</Text>
        <ButtonContainer>
          <StyledButton
            variant="contained"
            onClick={() => setBurnAmount(maxBurnAmount)}
          >
            Burn Max
          </StyledButton>
          <StyledButton
            variant="contained"
            onClick={() => setBurnAmount(burnAmountToFixCRatio)}
          >
            Fix your Collateralization Ratio
          </StyledButton>
        </ButtonContainer>
        <TextContainer>
          <Text size="sm">${formatCurrency(maxBurnAmount)}</Text>
          <Text size="sm">${formatCurrency(burnAmountToFixCRatio)}</Text>
        </TextContainer>
        <AmountInput
          value={burnAmount}
          error={error}
          onValueChange={value => setBurnAmount(value)}
        />
        {renderSubmitButton()}
      </StyledPaper>
    </>
  );
}

function BurnPage() {
  return (
    <StyledGrid container>
      <StyledGridBalance item sm={5}>
        <Balance />
      </StyledGridBalance>
      <StyledGridSNX item sm={7}>
        <Burn />
      </StyledGridSNX>
    </StyledGrid>
  );
}

export default BurnPage;
