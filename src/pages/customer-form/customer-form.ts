import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { CustomerProvider } from '../../providers/customer-provider';
import { LoadingController } from 'ionic-angular';

/*
  Generated class for the CompanyForm page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-customer-form',
  templateUrl: 'customer-form.html'
})
export class CompanyFormPage {
  customer: any = { name: '', companyId: '' };


  constructor(public navCtrl: NavController, public navParams: NavParams,
    public customerProvider: CustomerProvider, public loadingCtrl: LoadingController) { }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CompanyFormPage');
  }

  save() {
    this.customerProvider.add(this.customer).then(() => {
      this.navCtrl.pop();
    });
  }

}
