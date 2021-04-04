import { Component, OnInit } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { ToastController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
 
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  message = '';
  messages = [];
  currentUser = '';
  argumentos = null;

  constructor(private socket: Socket, private toastCtrl: ToastController, private activeRoute: ActivatedRoute) { }
 
  ngOnInit() {
    this.argumentos = this.activeRoute.snapshot.paramMap.get('id');

    this.socket.connect();
 
    let name = `user-${new Date().getTime()}`;
    this.currentUser = this.argumentos;
    
    this.socket.emit('set-name', this.argumentos);
 
    this.socket.fromEvent('users-changed').subscribe(data => {
      let user = data['user'];
      if (data['event'] === 'left') {
        this.showToast('User left: ' + user);
      } else {
        this.showToast('User joined: ' + user);
      }
    });
 
    this.socket.fromEvent('message').subscribe(message => {
      this.messages.push(message);
    });
  }
 
  sendMessage() {
    this.socket.emit('send-message', { text: this.message });
    this.message = '';
  }
  ionViewWillLeave() {
    this.socket.disconnect();
  }
 
  async showToast(msg) {
    let toast = await this.toastCtrl.create({
      message: msg,
      position: 'top',
      duration: 2000
    });
    toast.present();
  }
}