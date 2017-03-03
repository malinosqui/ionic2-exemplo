import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { CompanyFormPage } from '../company-form/company-form';
import { CompanyProvider } from '../../providers/company-provider';
import { LoadingController } from 'ionic-angular';
import * as moment from 'moment';

/*
  Generated class for the CompanyList page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/

const momentConstructor: (value?: any) => moment.Moment = (<any>moment).default || moment;

@Component({
  selector: 'page-company-list',
  templateUrl: 'company-list.html'
})
export class CompanyListPage {
  companies: any = [];
  lastSync: String;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public companyProvider: CompanyProvider, public loadingCtrl: LoadingController) {

    companyProvider.connectionProvider.connectSubscription.subscribe(() => {
      this.companyProvider.syncSavedLocal().then(() => {
        this.getCompanies();
      });
    });

    companyProvider.connectionProvider.disconnectSubscription.subscribe(() => {
      this.companyProvider.connectionProvider.getLastSync('company').then((lastSync) => {
        this.lastSync = moment(lastSync).format('DD/MM/YYYY HH:mm');
      });
    });
  }

  getCompanies() {
    let loader = this.loadingCtrl.create({
      content: "Sincronizando...",
    });

    loader.present();

    this.companyProvider.get().then((companies: Array<any>) => {

      // Filtra apenas empresas ativas
      this.companies = companies.filter((el) => {
        return el.status === 1 || el.unsync;
      });

      loader.dismiss();
    });
  }

  ionViewDidLoad() {
    this.companyProvider.syncSavedLocal().then(() => {
      this.getCompanies();
    });

    this.companyProvider.connectionProvider.getLastSync('company').then((lastSync) => {
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
    this.companyProvider.storage.remove('companies');
  }

}
