import { Component } from '@angular/core';

import { CompanyListPage } from '../company-list/company-list';
import { CustomerListPage } from '../customer-list/customer-list';
import { ConfigurationPage } from '../configuration/configuration';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  // this tells the tabs component which Pages
  // should be each tab's root Page
  tab1Root: any = CompanyListPage;
  // tab2Root: any = CustomerListPage;
  tab3Root: any = ConfigurationPage;

  constructor() {

  }
}
