import { theme } from '@gnosis.pm/safe-react-components';

type NewTheme = typeof theme & {
  icons: {
    size: {
      lg?: string;
    };
  };
};

const copyTheme: NewTheme = { ...theme };

copyTheme.colors.primary = '#727cff';
copyTheme.colors.primaryHover = '#00c58a';
copyTheme.colors.primaryLight = '#d5f6ed';

copyTheme.colors.secondary = '#56bb98';
copyTheme.colors.secondaryHover = '#8253dd';
copyTheme.colors.secondaryLight = 'ebe1fb';

copyTheme.icons.size = { ...copyTheme.icons.size, lg: '64' };

export type Theme = NewTheme;

export default copyTheme;
