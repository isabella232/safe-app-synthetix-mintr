import React from 'react';
import styled from 'styled-components';
import { Title, Text } from '@gnosis.pm/safe-react-components';

const Container = styled.div`
  text-align: center;
`;

const StyledTitle = styled(Title)`
  font-size: 1.8rem;
  margin: 10px;
  color: #333333;
`;

const StyledText = styled(Text)`
  font-size: .75rem;
  margin: 0 0 24px 0;
  color: #333333;
`;

type Props = {
  stat: string;
  description: string;
};

function Stat({ stat, description }: Props) {
  return (
    <Container>
      <StyledTitle size="md">{stat}</StyledTitle>
      <StyledText size="sm" center>
        {description}
      </StyledText>
    </Container>
  );
}

export default Stat;
