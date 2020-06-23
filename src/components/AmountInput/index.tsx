import React from 'react';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import { TextField } from '@gnosis.pm/safe-react-components';
import IconText from '../IconText';

const StyledTextField = styled(TextField)`
  &.MuiTextField-root {
    width: 100%;
  }
  & .MuiFilledInput-root {
    background-color: ${({ theme }) => theme.colors.primaryLight};
    border-radius: 0;
    ${(props: { rounded?: string }) =>
      props.rounded === 'true'
        ? `border-top-right-radius: 4px; 
       border-bottom-right-radius: 4px`
        : ''}
  }
`;

const StyledButton = styled(Button)`
  &.MuiButton-root {
    background-color: ${({ theme }) => theme.colors.primary};
    color: #ffffff;
    width: 100%;
  }

  &.MuiButton-root:hover {
    background-color: #8c94ff;
  }
`;

const StyledIconText = styled(IconText)`
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.primaryLight};
  padding: 5px 2px 5px 5px;
  border-radius: 4px 0 0 4px;
  width: 100%;

  & p {
    margin-left: 0;
  }
`;

const InputGrid = styled(Grid)`
  &&.MuiGrid-item {
    padding: 4px 1px 4px 4px;
  }
`;

const ButtonGrid = styled(Grid)`
  background-color: ${({ theme }) => theme.colors.primaryLight};

  &&.MuiGrid-item {
    padding: 10px 5px;
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
  }
`;

type Props = {
  value: string;
  onValueChange: (value: string) => void;
  error: string;
  onButtonClick?: () => void;
  buttonLabel?: string;
};

function AmountInput({
  value,
  onValueChange,
  error,
  onButtonClick,
  buttonLabel
}: Props) {
  return (
    <Grid container spacing={1} alignItems="center" justify="flex-start">
      <Grid item xs={2}>
        <StyledIconText
          iconSize="sm"
          textSize="lg"
          iconType="susd"
          text="sUSD"
        />
      </Grid>
      <InputGrid item xs={buttonLabel ? 7 : 10}>
        <StyledTextField
          rounded={buttonLabel ? undefined : 'true'}
          label="Amount"
          value={value}
          placeholder="0.00"
          onChange={e => onValueChange(e.target.value)}
          meta={{ error: error }}
        />
      </InputGrid>
      {buttonLabel ? (
        <ButtonGrid item xs={3}>
          <StyledButton variant="contained" onClick={onButtonClick}>
            {buttonLabel}
          </StyledButton>
        </ButtonGrid>
      ) : null}
    </Grid>
  );
}

export default AmountInput;
