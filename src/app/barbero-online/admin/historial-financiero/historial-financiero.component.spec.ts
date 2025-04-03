import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorialFinancieroComponent } from './historial-financiero.component';

describe('HistorialFinancieroComponent', () => {
  let component: HistorialFinancieroComponent;
  let fixture: ComponentFixture<HistorialFinancieroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistorialFinancieroComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistorialFinancieroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
