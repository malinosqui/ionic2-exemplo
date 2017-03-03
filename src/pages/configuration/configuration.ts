import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { NavController, NavParams } from 'ionic-angular';

/*
  Generated class for the Configuration page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-configuration',
  templateUrl: 'configuration.html'
})
export class ConfigurationPage {

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public storage: Storage) { }

  refresh() {
    this.storage.clear();
  }

}
