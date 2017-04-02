import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Storage } from '@ionic/storage';
import 'rxjs/add/operator/map';
import { ConnectionProvider } from './connection-provider';
import * as moment from 'moment';
import _ from 'lodash';

/*
  Generated class for the CompanyProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/

// under systemjs, moment is actually exported as the default export, so we account for that
const momentConstructor: (value?: any) => moment.Moment = (<any>moment).default || moment;

@Injectable()
export class CompanyProvider {
  API_ENDPOINT: String = 'http://192.168.0.106:3000/';
  headers: any = { 'Content-Type': 'application/json' };

  constructor(public http: Http, public connectionProvider: ConnectionProvider,
    public storage: Storage) { }

  // Salva empresa
  create(company) {
    return new Promise(resolve => {
      this.http.post(this.API_ENDPOINT + 'company', JSON.stringify(company), { headers: this.headers })
        .map(res => res.json())
        .subscribe(data => {
          resolve(data);
        });
    });
  }

  // Salva multiplas empresas de uma única vez
  createBulk(companies) {
    return new Promise(resolve => {
      this.http.post(this.API_ENDPOINT + 'companyBulk', JSON.stringify(companies), { headers: this.headers })
        .map(res => res.json())
        .subscribe(data => {
          resolve(data);
        });
    });
  }

  // Busca empresas
  // Faz a lógica de buscar tanto localmente quanto remotamente
  get() {
    return new Promise((resolve) => {
      this.connectionProvider.getState().then((state) => {
        this.connectionProvider.getLastSync('company').then((lastSync) => {

          // Verifica se já foi sincronizado alguma vez
          if (lastSync) {

            // Pega os dados da localStorage
            this.storage.get('companies').then((localCompanies) => {
              localCompanies = localCompanies ? JSON.parse(localCompanies) : [];

              // Verifica se conexão está online e se os dados locais são maiores que 0
              if (state === 'on' && localCompanies.length > 0) {

                // Pega dados do servidor filtrando pela última vez sincronizada
                this.getAllByLastSync(lastSync).then((remoteCompanies) => {

                  //Atualiza registros
                  localCompanies = _.pullAllBy(localCompanies, remoteCompanies, 'uid');

                  this.connectionProvider.setLastSync('company');
                  this.saveListLocal(localCompanies, remoteCompanies);
                  resolve(_.unionBy(localCompanies, remoteCompanies, 'uid'));
                });

                // Verifica se conexão está online e se não tem dados locais
              } else if (state === 'on' && localCompanies.length <= 0) {
                this.getAll().then((remoteCompanies) => {
                  this.connectionProvider.setLastSync('company');
                  this.saveListLocal(localCompanies, remoteCompanies);
                  resolve(remoteCompanies);
                });
              } else {
                resolve(localCompanies);
              }
            });
            // Caso não tenha sincronizado nenhuma vez ainda
          } else {
            this.getAll().then((companies) => {
              this.connectionProvider.setLastSync('company');
              this.saveListLocal([], companies);
              resolve(companies);
            });
          }
        });
      });
    });
  }


  // Traz todas as empresas
  getAll() {
    return new Promise((resolve) => {
      this.http.get(this.API_ENDPOINT + 'company/')
        .map(res => res.json())
        .subscribe(data => {
          resolve(data);
        });
    });
  }

  // Traz as empresas filtrando pela data de alteração
  getAllByLastSync(date) {
    return new Promise((resolve) => {
      this.http.get(`${this.API_ENDPOINT}company/${date}`)
        .map(res => res.json())
        .subscribe(data => {
          resolve(data);
        });
    });
  }

  // Adiciona empresa
  // Faz a logica de salvar tanto localmente quanto remotamente
  add(company) {
    return new Promise((resolve, err) => {
      // Gera identificador de registro
      company.uid = this.guid();
      this.storage.get('companies').then((localCompanies) => {

        localCompanies = localCompanies ? JSON.parse(localCompanies) : [];
        localCompanies.push(company);

        this.storage.set('companies', JSON.stringify(localCompanies)).then(() => {
          // Verifica se existe conexão
          if (this.connectionProvider.state === 'on') {
            this.create(company).then(() => {
              resolve();
            }).catch(() => {
              // Pega registro que não subiu para o servidor e seta ele como pendente de sincronização
              var foundIndex = localCompanies.findIndex(x => x.uid == company.uid);
              localCompanies.splice(foundIndex, 1);
              company.unsync = true;
              localCompanies.push(company);
              // Salva na localstorage
              this.storage.set('companies', JSON.stringify(localCompanies)).then(() => {
                resolve();
              });
            });
          } else {
            // Pega registro que não subiu para o servidor e seta ele como pendente de sincronização            
            var foundIndex = localCompanies.findIndex(x => x.uid == company.uid);
            localCompanies.splice(foundIndex, 1);
            company.unsync = true;
            localCompanies.push(company);
            // Salva na localstorage
            this.storage.set('companies', JSON.stringify(localCompanies)).then(() => {
              resolve();
            });
          }
        });
      });
    });
  }

  // Atualiza lista de empresas na local storage
  saveListLocal(localCompanies, remoteCompanies) {
    if (localCompanies.length > 0) {
      remoteCompanies = _.unionBy(localCompanies, remoteCompanies, 'uid');
    }
    this.storage.set('companies', JSON.stringify(remoteCompanies));
  }

  // Sincroniza lista de empresas salvas com servidor remoto
  syncSavedLocal() {
    return new Promise((resolve) => {
      this.storage.get('companies').then((localCompanies) => {
        localCompanies = localCompanies ? JSON.parse(localCompanies) : [];

        let localOnly = localCompanies.filter((company) => {
          return company.unsync;
        });

        if (localOnly.length > 0) {
          this.createBulk(localOnly).then(() => {
            localCompanies = localCompanies.map((el) => {
              el.unsync = false;
              return el;
            });

            this.storage.set('companies', JSON.stringify(localCompanies)).then(() => {
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
