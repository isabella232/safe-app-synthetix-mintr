import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Text, TextField } from '@gnosis.pm/safe-react-components';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import numbro from 'numbro';
import Section from '../../components/Section';
import Icon from '../../components/Icon';
import { bytesFormatter, bigNumberFormatter } from '../../helpers/formatters';
import IconText from '../../components/IconText';
import snxJSConnector from '../../helpers/snxJSConnector';
import { estimateCRatio, getStakingAmount } from './mint-helpers';
import Balance from '../Balance';

const StyledPaper = styled(Paper)`
  &.MuiPaper-root {
    padding: 16px;
  }
`;

const StyledGridItem = styled(Grid)`
    padding-right: 24px;
`;

const StyledButton = styled(Button)`
  &.MuiButton-root {
    background-color: ${({ theme }) => theme.colors.primary};
    color: #ffffff;
    font-size: 1rem;
    padding: 16px 24px;
    width: 100%;
  }

  &.MuiButton-root:hover {
    background-color: #8c94ff;
  }
`;

const MaxButton = styled(Button)`
  &.MuiButton-root {
    background-color: ${({ theme }) => theme.colors.primary};
    color: #ffffff;
    width: 100%;
  }

  &.MuiButton-root:hover {
    background-color: #8c94ff;
  }
`;

const StyledTextField = styled(TextField)`
  &.MuiTextField-root {
    width: 100%;
  }
`;

const StyledText = styled(Text)`
  margin-bottom: 0.5rem;
`;

const StyledIconText = styled(IconText)`
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.primaryLight};
  padding: 4px;
  border-radius: 4px 0 0 4px;
  width: 100%;
`;

const StyledGrid = styled(Grid)`
  margin-top: 20px !important;
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

function Mint({ address, appsSdk }: any) {
  const [mintAmount, setMintAmount] = useState('');
  const [error, setError] = useState('');

  const sUSDBytes = bytesFormatter('sUSD');
  const {
    issuableSynths,
    issuanceRatio,
    SNXPrice,
    debtBalance,
    snxBalance
  } = useGetIssuanceData(address, sUSDBytes);

  useEffect(() => {
    const parsedMintAmount = parseFloat(mintAmount);

    if (parsedMintAmount <= 0) {
      setError('Invalid amount');
    } else if (parsedMintAmount > issuableSynths) {
      setError('Cannot mint that much sUSD');
    } else {
      setError('');
    }
  }, [mintAmount, issuableSynths]);

  const handleMint = () => {
    const {
      // @ts-ignore
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
        // @ts-ignore
        snxJSConnector.utils.parseEther(parsedMintAmount.toString())
      ]);
    }

    const tx = {
      // @ts-ignore
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
        <Grid container spacing={2} alignItems="center" justify="flex-start">
          <Grid item sm={2}>
            <StyledIconText
              iconSize="sm"
              textSize="lg"
              iconType="susd"
              text="sUSD"
            />
          </Grid>
          <Grid item sm={7}>
            <StyledTextField
              label="Amount"
              value={mintAmount}
              placeholder="0.00"
              onChange={e => setMintAmount(e.target.value)}
              meta={{ error: error }}
            />
          </Grid>
          <Grid item sm={3}>
            <MaxButton
              variant="contained"
              onClick={() => setMintAmount(issuableSynths)}
            >
              MAX
            </MaxButton>
          </Grid>
        </Grid>
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

function MintPage({ address, appsSdk }: any) {
  return (
    <StyledGrid container>
      <StyledGridItem item sm={6}>
        <Balance />
      </StyledGridItem>
      <Grid item sm={6}>
        <Mint address={address} appsSdk={appsSdk} />
      </Grid>
    </StyledGrid>
  );
}

export default MintPage;
