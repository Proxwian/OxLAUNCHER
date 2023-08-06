module.exports = {
  palette: {
    common: {
      black: '#000',
      white: '#fff'
    },
    primary: {
      light: '#5a8e91',
      main: '#6D4D52',
      dark: '#2a5d66'
    },
    secondary: {
      light: '#546d6b',
      main: '#283332',
      dark: '#161B1C'
    },
    error: {
      light: '#DE6967',
      main: '#D64441',
      dark: '#952f2d'
    },
    grey: {
      50: '#b6c6c1',
      100: '#a2b5b0',
      200: '#8fa39f',
      300: '#7b918e',
      400: '#677f7c',
      500: '#546d6b',
      600: '#3C4C4A',
      700: '#283332',
      800: '#161B1C',
      900: '#161B1C'
    },
    colors: {
      red: '#D64441',
      yellow: '#FAB849',
      lavander: '#BB6BD9',
      green: '#27AE60',
      blue: '#3FA7D6',
      lightBlue: '#345995',
      liberty: '#6761a8',
      jungleGreen: '#43aa8b',
      maximumRed: '#d62828',
      darkYellow: '#f18805',
      orange: '#f26430'
    },
    text: {
      disabled: 'rgba(255, 255, 255, 0.38)',
      hint: 'rgba(255, 255, 255, 0.38)',
      primary: '#E1E2E4',
      secondary: '#fffff3',
      third: '#D2D4D5',
      icon: '#F0F0F1'
    },
    type: 'dark'
  },
  action: {
    hover: 'rgba(255, 255, 255, 0.1)',
    selected: 'rgba(255, 255, 255, 0.2)'
  },
  duration: {
    longer: 0.3,
    main: 0.2,
    shorter: 0.1
  },
  shape: { borderRadius: '4px' },
  spacing: factor => [0, 4, 8, 16, 32, 64][factor],
  sizes: {
    width: {
      sidebar: 172
    },
    height: {
      systemNavbar: 45
    }
  }
};
