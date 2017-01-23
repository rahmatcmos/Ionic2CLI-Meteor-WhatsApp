import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement, ErrorHandler } from '@angular/core';
import { ChatsOptionsComponent } from '../../src/pages/chats/chats-options';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { IonicModule, IonicErrorHandler, NavController, ViewController, NavControllerBase } from 'ionic-angular';
import { MyApp } from '../../src/app/app.component';
import { PictureService } from '../../src/services/picture';
import { PhoneService } from '../../src/services/phone';
import { MomentModule } from 'angular2-moment';
import { ViewControllerMock } from '../__mocks__/ionic/view-controller';
import { NavControllerMock } from '../__mocks__/ionic/nav-controller';

describe('ChatsOptionsComponent', () => {
  let comp: ChatsOptionsComponent;
  let fixture: ComponentFixture<ChatsOptionsComponent>;
  let de: DebugElement;
  let el: HTMLElement;

  beforeEach(() => {
    TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting()).configureTestingModule({
      declarations: [
        MyApp,
        ChatsOptionsComponent
      ],
      imports: [
        MomentModule,
        IonicModule.forRoot(MyApp)
      ],
      providers: [
        {provide: ErrorHandler, useClass: IonicErrorHandler},
        PhoneService,
        PictureService,
        {provide: NavController, useClass: NavControllerMock },
        {provide: ViewController, useClass: ViewControllerMock }
      ]
    });

    fixture = TestBed.createComponent(ChatsOptionsComponent);
    comp = fixture.componentInstance;
    de = fixture.debugElement;
    el = de.nativeElement;
  });

  it('test', () => {
    console.log(el);
  });
});
