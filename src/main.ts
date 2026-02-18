import './styles/courtHive.css';
import './styles/swipeList.css';
import './styles/icons.css';
import { init } from './transition/init';
import { router as enhancedRouter } from './router/enhancedRouter';

// PHASE 2: Set up enhanced router BEFORE init
// Router works alongside viewManager during transition period
(window as any).appRouter = enhancedRouter;

// Initialize app first
init();

// Start router after init completes - will restore from URL if needed
// Router will update URL as views change via viewManager
setTimeout(() => {
  enhancedRouter.start();
  // Router initialized - URL navigation enabled
}, 100);
