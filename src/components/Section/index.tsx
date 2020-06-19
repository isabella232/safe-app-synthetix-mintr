import React from 'react';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import { Text, Title } from '@gnosis.pm/safe-react-components';

const StyledGrid = styled(Grid)`
  margin-bottom: 2rem;
`;

const StyledTitle = styled(Title)`
  text-transform: uppercase;
  font-size: 1.6rem;
  color: ${({ theme }) => theme.colors.secondary};
  line-height: 25px;
  letter-spacing: 2px;
`;

const StyledText = styled(Text)`
  font-size: 0.8rem;
  color: #333333;
`;

type Props = {
  icon: any;
  name: string;
  description: string;
};

function Section({ icon, name, description }: Props) {
  return (
    <StyledGrid container justify="center" alignItems="center">
      <Grid item xs={3} sm={3}>
        {icon}
      </Grid>
      <Grid item xs={3} sm={3}>
        <StyledTitle size="lg">{name}</StyledTitle>
      </Grid>
      <Grid item xs={12} sm={12}>
        <StyledText size="lg">{description}</StyledText>
      </Grid>
    </StyledGrid>
  );
}

export default Section;
