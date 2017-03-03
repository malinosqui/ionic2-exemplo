import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController, NavParams } from 'ionic-angular';
import { CompanyProvider } from '../../providers/company-provider';
import { LoadingController } from 'ionic-angular';

/*
  Generated class for the CompanyForm page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-company-form',
  templateUrl: 'company-form.html'
})
export class CompanyFormPage {
  company: any = { name: '', document: '', maxUsers: '' };
  companyForm: any;
  submitAttempt: Boolean = false;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public companyProvider: CompanyProvider, public loadingCtrl: LoadingController,
    public formBuilder: FormBuilder) {

    this.companyForm = formBuilder.group({
      name: ['', Validators.compose([Validators.maxLength(50), Validators.pattern('[a-zA-Z ]*'), Validators.required])],
      document: ['', Validators.compose([Validators.maxLength(50), Validators.pattern('([0-9]{2}[\.]?[0-9]{3}[\.]?[0-9]{3}[\/]?[0-9]{4}[-]?[0-9]{2})|([0-9]{3}[\.]?[0-9]{3}[\.]?[0-9]{3}[-]?[0-9]{2})*'), Validators.required])],
      maxUsers: ['', Validators.compose([Validators.maxLength(50), Validators.pattern('[0-9]*'), Validators.required])]
    });

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CompanyFormPage');
  }

  save() {
    this.submitAttempt = true;

    if (this.companyForm.valid) {
      this.companyProvider.add(this.companyForm.value).then(() => {
        this.navCtrl.pop();
      });
    }
  }

}
