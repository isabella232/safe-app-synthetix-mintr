import React, { useEffect, useState, useContext } from 'react';
import styled from 'styled-components';
import { Text } from '@gnosis.pm/safe-react-components';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import numbro from 'numbro';
import Section from '../../components/Section';
import Icon from '../../components/Icon';
import AmountInput from '../../components/AmountInput';
import { bytesFormatter, bigNumberFormatter } from '../../helpers/formatters';
import { snxJSConnector } from '../../helpers/snxJSConnector';
import { estimateCRatio, getStakingAmount } from './mint-helpers';
import Balance from '../Balance';
import { SafeContext } from '../SafeProvider';

const StyledPaper = styled(Paper)`
  &.MuiPaper-root {
    padding: 24px 16px;
  }
`;

const StyledGridBalance = styled(Grid)`
  padding: 0 24px 0 6px;
`;

const StyledGridSNX = styled(Grid)`
  padding-right: 6px;
`;

const StyledButton = styled(Button)`
  &.MuiButton-root {
    background-color: ${({ theme }) => theme.colors.primary};
    color: #ffffff;
    font-size: 1rem;
    padding: 16px 24px;
  }

  @media screen and (max-width: 900px) {
    width: 100%;
  }

  &.MuiButton-root:hover {
    background-color: #8c94ff;
  }
`;

const StyledText = styled(Text)`
  margin-bottom: 0.5rem;
`;

const StyledGrid = styled(Grid)`
  margin-top: 5px !important;
`;

const TextContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 0.8rem 0 2rem 0;
`;

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

function Mint() {
  const { safeInfo, appsSdk } = useContext(SafeContext);
  const [mintAmount, setMintAmount] = useState('');
  const [error, setError] = useState('');

  const sUSDBytes = bytesFormatter('sUSD');
  const {
    issuableSynths,
    issuanceRatio,
    SNXPrice,
    debtBalance,
    snxBalance
  } = useGetIssuanceData(safeInfo.safeAddress, sUSDBytes);

  useEffect(() => {
    const parsedMintAmount = parseFloat(mintAmount);

    if (parsedMintAmount <= 0) {
      setError('Invalid amount');
    } else if (parsedMintAmount > issuableSynths) {
      setError('Not enough SNX');
    } else {
      setError('');
    }
  }, [mintAmount, issuableSynths]);

  const handleMint = () => {
    const {
      snxJS: { Synthetix }
    } = snxJSConnector;
    let data;
    const parsedMintAmount = numbro(mintAmount).value();
    if (!parsedMintAmount) {
      return;
    }
    if (parsedMintAmount === issuableSynths) {
      data = Synthetix.contract.interface.functions.issueMaxSynths.encode([]);
    } else {
      data = Synthetix.contract.interface.functions.issueSynths.encode([
        snxJSConnector.utils.parseEther(parsedMintAmount.toString())
      ]);
    }

    const tx = {
      to: snxJSConnector.utils.contractSettings.addressList.Synthetix,
      value: 0,
      data
    };

    appsSdk.sendTransactions([tx]);
  };

  return (
    <>
      <Section
        icon={<Icon size="md" type="mint" />}
        name="Mint"
        description="Mint sUSD by staking your SNX. This gives you a Collateralization Rate and a debt, allowing you to earn staking rewards."
      />
      <StyledPaper elevation={3}>
        <StyledText size="lg">Confirm or enter the amount to mint</StyledText>
        <AmountInput
          value={mintAmount}
          buttonLabel="MAX"
          error={error}
          onValueChange={value => setMintAmount(value)}
          onButtonClick={() => setMintAmount(issuableSynths)}
        />
        <TextContainer>
          <Text size="sm">
            Staking:{' '}
            {getStakingAmount({
              issuanceRatio,
              mintAmount,
              SNXPrice
            })}{' '}
            SNX
          </Text>
          <Text size="sm">
            Estimated C-Ratio:{' '}
            {estimateCRatio({ SNXPrice, debtBalance, snxBalance, mintAmount })}%
          </Text>
        </TextContainer>

        <StyledButton
          variant="contained"
          onClick={handleMint}
          disabled={!!error || !numbro(mintAmount).value()}
        >
          Mint Now
        </StyledButton>
      </StyledPaper>
    </>
  );
}

function MintPage() {
  return (
    <StyledGrid container>
      <StyledGridBalance item xs={5}>
        <Balance />
      </StyledGridBalance>
      <StyledGridSNX item xs={7}>
        <Mint />
      </StyledGridSNX>
    </StyledGrid>
  );
}

export default MintPage;
