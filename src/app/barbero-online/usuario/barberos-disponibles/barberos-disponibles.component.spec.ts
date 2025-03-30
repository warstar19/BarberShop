import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarberosDisponiblesComponent } from './barberos-disponibles.component';

describe('BarberosDisponiblesComponent', () => {
  let component: BarberosDisponiblesComponent;
  let fixture: ComponentFixture<BarberosDisponiblesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarberosDisponiblesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BarberosDisponiblesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
