import { NgModule, ErrorHandler } from '@angular/core';
import { Storage } from '@ionic/storage';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { CompanyFormPage } from '../pages/company-form/company-form';
import { CompanyListPage } from '../pages/company-list/company-list';
import { CustomerListPage } from '../pages/customer-list/customer-list';
import { ConfigurationPage } from '../pages/configuration/configuration';
import { ConnectionProvider } from '../providers/connection-provider';
import { CompanyProvider } from '../providers/company-provider';
import { CustomerProvider } from '../providers/customer-provider';
import { TabsPage } from '../pages/tabs/tabs';


@NgModule({
  declarations: [
    MyApp,
    CompanyFormPage,
    CompanyListPage,
    CustomerListPage,
    ConfigurationPage,
    TabsPage
  ],
  imports: [
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    CompanyFormPage,
    CompanyListPage,
    CustomerListPage,
    ConfigurationPage,
    TabsPage
  ],
  providers: [{ provide: ErrorHandler, useClass: IonicErrorHandler },
    ConnectionProvider, CompanyProvider, CustomerProvider, Storage]
})
export class AppModule { }
