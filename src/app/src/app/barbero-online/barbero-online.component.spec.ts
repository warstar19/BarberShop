import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarberoOnlineComponent } from './barbero-online.component';

describe('BarberoOnlineComponent', () => {
  let component: BarberoOnlineComponent;
  let fixture: ComponentFixture<BarberoOnlineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarberoOnlineComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BarberoOnlineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
