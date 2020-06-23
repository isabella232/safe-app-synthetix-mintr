import React from 'react';
import styled from 'styled-components';
import isEmpty from 'lodash/isEmpty';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { CRYPTO_CURRENCY_TO_KEY } from '../../constants/currency';
import { formatCurrency } from '../../helpers/formatters';
import IconText from '../IconText';
import { Text } from '@gnosis.pm/safe-react-components';

const StyledTableContainer = styled(TableContainer)`
  & .MuiTableCell-sizeSmall {
    padding: 6px 5px 6px 10px;
  }
`;

const StyledText = styled(Text)`
  & {
    text-align: right;
  }
`;

const TABLE_COLUMNS = ['SNX', 'sUSD', 'ETH', 'Synths', 'Debt'];
const AGGREGATED_COLUMNS = ['Synths', 'Debt'];

const getBalance = (column, walletBalancesWithRates, debtData, rates) => {
  if (!AGGREGATED_COLUMNS.includes(column)) {
    return walletBalancesWithRates[column];
  } else if (column === 'Synths') {
    return { ...walletBalancesWithRates.totalSynths, tooltip: 'synths' };
  } else {
    return {
      balance: debtData.debtBalance,
      valueUSD: debtData.debtBalance * rates[CRYPTO_CURRENCY_TO_KEY.sUSD]
    };
  }
};

const mapBalanceData = (
  waitingForData,
  walletBalancesWithRates,
  rates,
  debtData
) => {
  if (waitingForData) return [];
  return TABLE_COLUMNS.map(column => {
    return {
      name: column,
      icon: AGGREGATED_COLUMNS.includes(column) ? 'snx' : column,
      ...getBalance(column, walletBalancesWithRates, debtData, rates)
    };
  });
};

const BalanceTable = ({ walletBalancesWithRates, rates, debtData }) => {
  const waitingForData =
    isEmpty(walletBalancesWithRates) || isEmpty(rates) || isEmpty(debtData);
  const data = mapBalanceData(
    waitingForData,
    walletBalancesWithRates,
    rates,
    debtData
  );
  return (
    <StyledTableContainer component={Paper}>
      <Table size="small" aria-label="compact table">
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            <TableCell align="right">
              <StyledText size="sm">Balance</StyledText>
            </TableCell>
            <TableCell align="right">
              <StyledText size="sm">$ USD</StyledText>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((token, index) => (
            <TableRow key={index}>
              <TableCell component="th" scope="row">
                <IconText
                  iconSize="sm"
                  textSize="lg"
                  iconType={token.icon.toLowerCase()}
                  text={token.name}
                />
              </TableCell>
              <TableCell align="right">
                <StyledText size="sm">
                  {formatCurrency(token.balance)}
                </StyledText>
              </TableCell>
              <TableCell align="right">
                <StyledText size="sm">
                  {formatCurrency(token.valueUSD)}
                </StyledText>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </StyledTableContainer>
  );
};

export default BalanceTable;
