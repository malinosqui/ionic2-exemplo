import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Storage } from '@ionic/storage';
import 'rxjs/add/operator/map';
import { ConnectionProvider } from './connection-provider';
import * as moment from 'moment';
import _ from 'lodash';

/*
  Generated class for the CustomerProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class CustomerProvider {
  API_ENDPOINT: String = 'http://192.168.1.103:3000/';
  headers: any = { 'Content-Type': 'application/json' };

  constructor(public http: Http, public connectionProvider: ConnectionProvider,
    public storage: Storage) { }

  // Salva cliente
  create(customer) {
    return new Promise(resolve => {
      this.http.post(this.API_ENDPOINT + 'customer', JSON.stringify(customer), { headers: this.headers })
        .map(res => res.json())
        .subscribe(data => {
          resolve(data);
        });
    });
  }

  // Salva multiplos clientes de uma única vez
  createBulk(customers) {
    return new Promise(resolve => {
      this.http.post(this.API_ENDPOINT + 'customerBulk', JSON.stringify(customers), { headers: this.headers })
        .map(res => res.json())
        .subscribe(data => {
          resolve(data);
        });
    });
  }

  // Busca clientes
  // Faz a lógica de buscar tanto localmente quanto remotamente
  get() {
    return new Promise((resolve) => {
      this.connectionProvider.getState().then((state) => {
        this.connectionProvider.getLastSync('customer').then((lastSync) => {

          // Verifica se já foi sincronizado alguma vez
          if (lastSync) {

            // Pega os dados da localStorage
            this.storage.get('customers').then((localCustomers) => {
              localCustomers = localCustomers ? JSON.parse(localCustomers) : [];

              // Verifica se conexão está online e se os dados locais são maiores que 0
              if (state === 'on' && localCustomers.length > 0) {

                // Pega dados do servidor filtrando pela última vez sincronizada
                this.getAllByLastSync(lastSync).then((remoteCustomers) => {

                  //Atualiza registros
                  localCustomers = _.pullAllBy(localCustomers, remoteCustomers, 'uid');

                  this.connectionProvider.setLastSync('customer');
                  this.saveListLocal(localCustomers, remoteCustomers);
                  resolve(_.unionBy(localCustomers, remoteCustomers, 'uid'));
                });

                // Verifica se conexão está online e se não tem dados locais
              } else if (state === 'on' && localCustomers.length <= 0) {
                this.getAll().then((remoteCustomers) => {
                  this.connectionProvider.setLastSync('customer');
                  this.saveListLocal(localCustomers, remoteCustomers);
                  resolve(remoteCustomers);
                });
              } else {
                resolve(localCustomers);
              }
            });
            // Caso não tenha sincronizado nenhuma vez ainda
          } else {
            this.getAll().then((customers) => {
              this.connectionProvider.setLastSync('customer');
              this.saveListLocal([], customers);
              resolve(customers);
            });
          }
        });
      });
    });
  }


  // Traz todas as clientes
  getAll() {
    return new Promise((resolve) => {
      this.http.get(this.API_ENDPOINT + 'customer/')
        .map(res => res.json())
        .subscribe(data => {
          resolve(data);
        });
    });
  }

  // Traz as clientes filtrando pela data de alteração
  getAllByLastSync(date) {
    return new Promise((resolve) => {
      this.http.get(`${this.API_ENDPOINT}customer/${date}`)
        .map(res => res.json())
        .subscribe(data => {
          resolve(data);
        });
    });
  }

  // Adiciona cliente
  // Faz a logica de salvar tanto localmente quanto remotamente
  add(customer) {
    return new Promise((resolve, err) => {
      // Gera identificador de registro
      customer.uid = this.guid();
      this.storage.get('customers').then((localCustomers) => {

        localCustomers = localCustomers ? JSON.parse(localCustomers) : [];
        localCustomers.push(customer);

        this.storage.set('customers', JSON.stringify(localCustomers)).then(() => {
          // Verifica se existe conexão
          if (this.connectionProvider.state === 'on') {
            this.create(customer).then(() => {
              resolve();
            }).catch(() => {
              // Pega registro que não subiu para o servidor e seta ele como pendente de sincronização
              var foundIndex = localCustomers.findIndex(x => x.uid == customer.uid);
              localCustomers.splice(foundIndex, 1);
              customer.unsync = true;
              localCustomers.push(customer);
              // Salva na localstorage
              this.storage.set('customers', JSON.stringify(localCustomers)).then(() => {
                resolve();
              });
            });
          } else {
            // Pega registro que não subiu para o servidor e seta ele como pendente de sincronização            
            var foundIndex = localCustomers.findIndex(x => x.uid == customer.uid);
            localCustomers.splice(foundIndex, 1);
            customer.unsync = true;
            localCustomers.push(customer);
            // Salva na localstorage
            this.storage.set('customers', JSON.stringify(localCustomers)).then(() => {
              resolve();
            });
          }
        });
      });
    });
  }

  // Atualiza lista de clientes na local storage
  saveListLocal(localCustomers, remoteCustomers) {
    if (localCustomers.length > 0) {
      remoteCustomers = _.unionBy(localCustomers, remoteCustomers, 'uid');
    }
    this.storage.set('customers', JSON.stringify(remoteCustomers));
  }

  // Sincroniza lista de clientes salvas com servidor remoto
  syncSavedLocal() {
    return new Promise((resolve) => {
      this.storage.get('customers').then((localCustomers) => {
        localCustomers = localCustomers ? JSON.parse(localCustomers) : [];

        let localOnly = localCustomers.filter((customer) => {
          return customer.unsync;
        });

        if (localOnly.length > 0) {
          this.createBulk(localOnly).then(() => {
            localCustomers = localCustomers.map((el) => {
              el.unsync = false;
              return el;
            });

            this.storage.set('customers', JSON.stringify(localCustomers)).then(() => {
              resolve();
            });
          });
        } else {
          resolve();
        }
      });
    });
  }

  // Algoritmo de guid
  s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }

  // Gera guid
  guid() {
    return this.s4() + this.s4() + '-' + this.s4() + '-' + this.s4() + '-' +
      this.s4() + '-' + this.s4() + this.s4() + this.s4();
  }


}
