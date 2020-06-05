import React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

type Props = {
  tokens: Array<{ icon: any; name: string; balance: string; usdPrice: string }>;
};

export default function TokensTable({ tokens }: Props) {
  return (
    <TableContainer component={Paper}>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            <TableCell align="right">Balance</TableCell>
            <TableCell align="right">$ USD</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tokens.map((token, index) => (
            <TableRow key={index}>
              <TableCell component="th" scope="row">
                {token.icon}
                {token.name}
              </TableCell>
              <TableCell align="right">{token.balance}</TableCell>
              <TableCell align="right">{token.usdPrice}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
