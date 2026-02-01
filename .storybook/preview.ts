import type { Preview } from '@storybook/html-vite';

// Import application styles
import 'bulma/css/bulma.css';
import 'animate.css/animate.css';
import '../src/transition/css/courtHive.css';
import '../src/transition/css/swipeList.css';
import '../src/transition/css/icons.css';
import '../src/styles/default.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
