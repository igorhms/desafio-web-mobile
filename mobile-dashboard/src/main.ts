import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

import { AppModule } from './app/app.module';

registerLocaleData(localePt);
dayjs.locale('pt-br');

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.log(err));
