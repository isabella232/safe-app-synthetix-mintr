import React from 'react';
import styled from 'styled-components';
import { Theme } from '../../theme';

import apps from './images/apps';
import mint from './images/mint';
import burn from './images/burn';
import claim from './images/claim';
import eth from './images/eth';
import snx from './images/snx';
import susd from './images/susd';

const StyledIcon = styled.span<any>`
  .icon-color {
    fill: ${({ theme, color }) =>
      color ? theme.colors[color] : theme.colors.icon};
  }
`;

const icons = {
  apps,
  mint,
  burn,
  claim,
  eth,
  snx,
  susd
};

export type IconType = typeof icons;

type Props = {
  type: keyof IconType;
  color?: keyof Theme['colors'];
  size: keyof Theme['icons']['size'];
};

/**
 * The `Icon` renders an icon, it can be one already defined specified by
 * the type props or custom one using the customUrl.
 */
function Icon({ type, size, color }: Props) {
  return <StyledIcon color={color}> {icons[type][size]}</StyledIcon>;
}

export default Icon;
