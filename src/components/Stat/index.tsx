import React from 'react';
import styled from 'styled-components';
import { Title, Text } from '@gnosis.pm/safe-react-components';

const Container = styled.div`
  text-align: center;
`;

type Props = {
  stat: string;
  description: string;
};

function Stat({ stat, description }: Props) {
  return (
    <Container>
      <Title size="md">{stat}</Title>
      <Text size="sm" center>
        {description}
      </Text>
    </Container>
  );
}

export default Stat;
