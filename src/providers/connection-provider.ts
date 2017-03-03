import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Storage } from '@ionic/storage';
import 'rxjs/add/operator/map';
import { Network } from 'ionic-native';
import { ToastController } from 'ionic-angular';
import * as moment from 'moment';

/*
  Generated class for the ConnectionProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/

const momentConstructor: (value?: any) => moment.Moment = (<any>moment).default || moment;

@Injectable()
export class ConnectionProvider {
  state: string;
  disconnectSubscription: any;
  connectSubscription: any;

  constructor(public http: Http, public toastCtrl: ToastController,
    public storage: Storage) {
    this.state = navigator.onLine ? 'on' : 'off';

    this.setState(this.state);

    this.disconnectSubscription = Network.onDisconnect();
    this.connectSubscription = Network.onConnect();

    this.disconnectSubscription.subscribe(() => {
      this.presentToast('Desconectado. As alterações não refletirão até você se conectar a internet.');
      this.setState('off');
      this.state = 'off';
    });

    this.connectSubscription.subscribe(() => {
      this.presentToast('Conectado com sucesso.');
      this.setState('on');
      this.state = 'on';
    });
  }

  setState(state) {
    this.storage.set('state', state);
  }

  getState() {
    return this.storage.get('state');
  }

  setLastSync(type) {
    this.storage.set(`lastSync_${type}`, moment().format('YYYY-MM-DD HH:mm'));
  }

  getLastSync(type) {
    return this.storage.get(`lastSync_${type}`);
  }

  private presentToast(message) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000
    });
    toast.present();
  }
}
