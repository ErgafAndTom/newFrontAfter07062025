// src/theme/theme.ts
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
    typography: {
        // fontFamily: '"inter", sans-serif',
        // // Застосування до всіх варіантів тексту
        // h1: { fontFamily: '"inter", sans-serif' },
        // h2: { fontFamily: '"inter", sans-serif' },
        // h3: { fontFamily: '"inter", sans-serif' },
        // h4: { fontFamily: '"inter", sans-serif' },
        // h5: { fontFamily: '"inter", sans-serif' },
        // h6: { fontFamily: '"inter", sans-serif' },
        // subtitle1: { fontFamily: '"inter", sans-serif' },
        // subtitle2: { fontFamily: '"inter", sans-serif' },
        // body1: { fontFamily: '"inter", sans-serif' },
        // body2: { fontFamily: '"inter", sans-serif' },
        // button: { fontFamily: '"inter", sans-serif' },
        // caption: { fontFamily: '"inter", sans-serif' },
        // overline: { fontFamily: '"inter", sans-serif' },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: `
        * {
        }
      `,
        },
    },
});
