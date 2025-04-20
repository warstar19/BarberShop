import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionCitasBarberoComponent } from './gestion-citas-barbero.component';

describe('GestionCitasBarberoComponent', () => {
  let component: GestionCitasBarberoComponent;
  let fixture: ComponentFixture<GestionCitasBarberoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionCitasBarberoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionCitasBarberoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
