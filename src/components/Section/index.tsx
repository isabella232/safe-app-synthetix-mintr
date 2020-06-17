import React from 'react';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import { Text, Title } from '@gnosis.pm/safe-react-components';

const StyledGrid = styled(Grid)`
  margin-bottom: 3rem;
`;

const StyledTitle = styled(Title)`
  text-transform: uppercase;
  font-size: 1.6rem;
  color: ${({ theme }) => theme.colors.secondary};
  line-height: 25px;
  `;

const StyledText = styled(Text)`
  font-size: .8rem;
  color: #333333;
`;

type Props = {
  icon: any;
  name: string;
  description: string;
};

function Section({ icon, name, description }: Props) {
  return (
    <StyledGrid container>
      <Grid item container xs={6} sm={6} justify="center" alignItems="center">
        {icon}
      </Grid>
      <Grid item xs={6} sm={6} justify="center" alignItems="center">
        <StyledTitle size="lg">{name}</StyledTitle>
      </Grid>
      <Grid item xs={12} sm={12}>
        <StyledText size="lg">{description}</StyledText>
      </Grid>
    </StyledGrid>
  );
}

export default Section;
