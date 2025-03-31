import { bootstrapApplication } from '@angular/platform-browser';
 import { provideHttpClient } from '@angular/common/http';
 import { AppComponent } from './app/app.component';
 import { appConfig } from './app/app.config';
 import 'intersection-observer';
 
 bootstrapApplication(AppComponent, appConfig)
   .catch(err => console.error(err));
 bootstrapApplication(AppComponent,
   {
     providers: [
       provideHttpClient(), 
       ...appConfig.providers     
     ],
     
   }).catch(err => console.error(err));
