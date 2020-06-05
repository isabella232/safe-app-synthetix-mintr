import React from 'react';
import styled from 'styled-components';
import { Theme } from '../../theme';

import apps from './images/apps';

const StyledIcon = styled.span<any>`
  .icon-color {
    fill: ${({ theme, color }) =>
      color ? theme.colors[color] : theme.colors.icon};
  }
`;

const icons = {
  apps
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
