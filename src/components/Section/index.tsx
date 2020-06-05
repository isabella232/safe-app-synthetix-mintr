import React from 'react';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';

const Name = styled.span`
  text-transform: uppercase;
  font-size: 1rem;
`;

type Props = {
  icon: any;
  name: string;
  description: string;
};

function Section({ icon, name, description }: Props) {
  return (
    <Grid container>
      <Grid item xs={6} sm={4}>
        {icon}
      </Grid>
      <Grid item xs={6} sm={4}>
        <Name>{name}</Name>
      </Grid>
      <Grid item xs={12} sm={4}>
        {description}
      </Grid>
    </Grid>
  );
}

export default Section;
