import React from 'react';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import { Text } from '@gnosis.pm/safe-react-components';

const Name = styled.span`
  text-transform: uppercase;
  font-size: 1.7rem;
  color: #008C73;
`;

const Description = styled(Text)`
  font-size: .9rem;
  color: #333333;
`;

type Props = {
  icon: any;
  name: string;
  description: string;
};

function Section({ icon, name, description }: Props) {
  return (
    <Grid container>
      <Grid item xs={6} sm={3}>
        {icon}
      </Grid>
      <Grid item xs={6} sm={3}>
        <Name>{name}</Name>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Description size="lg">{description}</Description>
      </Grid>
    </Grid>
  );
}

export default Section;
