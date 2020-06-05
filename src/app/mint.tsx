import React from 'react';
import styled from 'styled-components';
import {
  Divider,
  Text,
  Card,
  TextField
} from '@gnosis.pm/safe-react-components';
import LinearProgress from '@material-ui/core/LinearProgress';
import Button from '@material-ui/core/Button';
import Stat from '../components/Stat';
import Icon from '../components/Icon';
import Grid from '@material-ui/core/Grid';
import TokensTable from '../components/Table';
import Section from '../components/Section';

const Value = styled.div``;
const StyledTotalSnx = styled(Grid)``;
const StyledLinearProgress = styled(LinearProgress)`
  &.MuiLinearProgress-root {
    height: 20px;
  }
`;

const TotalSnx = () => {
  return (
    <StyledTotalSnx container>
      <Grid item xs={6}>
        TOTAL SNX
      </Grid>
      <Grid item xs={6}>
        12 SNX
      </Grid>
      <Divider />
      <Grid item xs={6}>
        Locked: 0
      </Grid>
      <Grid item xs={6}>
        Transferable: 0
      </Grid>
      <Grid item xs={12}>
        <StyledLinearProgress variant="determinate" value={50} />
      </Grid>
      <Grid item xs={6}>
        Staked: 0
      </Grid>
      <Grid item xs={6}>
        Not staked: 0
      </Grid>
      <Grid item xs={12}>
        <StyledLinearProgress variant="determinate" value={50} />
      </Grid>
    </StyledTotalSnx>
  );
};

const tokens = [
  {
    icon: <Icon size="sm" type="apps" />,
    name: 'SNX',
    balance: '0.8',
    usdPrice: '$1.89'
  },
  {
    icon: <Icon size="sm" type="apps" />,
    name: 'sUSD',
    balance: '0.8',
    usdPrice: '$1.89'
  }
];

function Left() {
  return (
    <>
      <Grid container>
        <Grid item xs={12} sm={6}>
          <Stat stat="0%" description="Current collateralization ratio"></Stat>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Stat stat="800%" description="Target collateralization ratio"></Stat>
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
          <Value>
            <Icon size="sm" type="apps" /> 1 SNX = $0.78 USD
          </Value>
          <Value>
            <Icon size="sm" type="apps" /> 1 ETH = $238.87 USD
          </Value>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TotalSnx />
        </Grid>
      </Grid>

      <TokensTable tokens={tokens} />
    </>
  );
}

function Right() {
  return (
    <>
      <Section
        icon={<Icon size="lg" type="apps" />}
        name="Mint"
        description="Mint sUSD by staking your SNX. This gives you a Collateralization Rate and a debt, allowing you to earn staking rewards"
      />
      <div>
        <Text size="sm">Confirm or enter the amount to mint</Text>
        <Card>
          <Grid container>
            <Grid item>
              <Icon size="md" type="apps" />
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
        </Card>
        <span>Staking: 0 SNX</span> <span>Estimated C-Ratio: 5%</span>
        <p>
          <span>Ethereum network fees: $0 / 27 GWEI</span> <a href="/">EDIT</a>
        </p>
        <Button variant="contained">Mint Now</Button>
      </div>
    </>
  );
}

function Mint(props: any) {
  return (
    <Grid container>
      <Grid item sm={6}>
        <Left />
      </Grid>
      <Grid item sm={6}>
        <Right />
      </Grid>
    </Grid>
  );
}

export default Mint;
