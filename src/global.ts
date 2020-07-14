import { createGlobalStyle } from 'styled-components';
import avertaFont from "@gnosis.pm/safe-react-components/dist/fonts/averta-normal.woff2";
import avertaBoldFont from "@gnosis.pm/safe-react-components/dist/fonts/averta-bold.woff2";

const GlobalStyle = createGlobalStyle`
    html {
        height: 100%
    }

    body {
       height: 100%;
       margin: 0px;
       padding: 0px;
    }

    #root {
        height: 100%;
        margin: 8px 0 0 8px;
    }

    @font-face {
        font-family: 'Averta';
        src: local('Averta'), local('Averta Bold'),
        url(${avertaFont}) format('woff2'),
        url(${avertaBoldFont}) format('woff');
    }
`;

export default GlobalStyle;
