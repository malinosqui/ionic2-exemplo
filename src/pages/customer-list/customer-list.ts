import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { CompanyFormPage } from '../company-form/company-form';
import { CustomerProvider } from '../../providers/customer-provider';
import { LoadingController } from 'ionic-angular';
import * as moment from 'moment';

/*
  Generated class for the CompanyList page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/

const momentConstructor: (value?: any) => moment.Moment = (<any>moment).default || moment;

@Component({
  selector: 'page-customer-list',
  templateUrl: 'customer-list.html'
})
export class CustomerListPage {
  customers: any = [];
  lastSync: String;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public customerProvider: CustomerProvider, public loadingCtrl: LoadingController) {

    customerProvider.connectionProvider.connectSubscription.subscribe(() => {
      this.customerProvider.syncSavedLocal().then(() => {
        this.getCompanies();
      });
    });

    customerProvider.connectionProvider.disconnectSubscription.subscribe(() => {
      this.customerProvider.connectionProvider.getLastSync('company').then((lastSync) => {
        this.lastSync = moment(lastSync).format('DD/MM/YYYY HH:mm');
      });
    });
  }

  getCompanies() {
    let loader = this.loadingCtrl.create({
      content: "Sincronizando...",
    });

    loader.present();

    this.customerProvider.get().then((customers: Array<any>) => {

      // Filtra apenas clientes ativos
      this.customers = customers.filter((el) => {
        return el.status === 1 || el.unsync;
      });

      loader.dismiss();
    });
  }

  ionViewDidLoad() {
    this.customerProvider.syncSavedLocal().then(() => {
      this.getCompanies();
    });

    this.customerProvider.connectionProvider.getLastSync('company').then((lastSync) => {
      this.lastSync = moment(lastSync).format('DD/MM/YYYY HH:mm');
    });
  }

  ionViewWillEnter() {
    this.getCompanies();
  }

  goToAdd() {
    this.navCtrl.push(CompanyFormPage);
  }

  refresh() {
    this.customerProvider.storage.remove('companies');
  }

}
