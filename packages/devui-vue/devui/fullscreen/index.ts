import type { App } from 'vue';
import Fullscreen from './src/fullscreen';

Fullscreen.install = function(app: App): void {
  app.component(Fullscreen.name, Fullscreen);
};

export { Fullscreen };

export default {
  title: 'Fullscreen 全屏',
  category: '通用',
  status: '100%',
  install(app: App): void {
    app.use(Fullscreen as any);
  }
};
