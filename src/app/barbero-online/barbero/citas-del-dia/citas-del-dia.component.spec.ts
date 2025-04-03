import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CitasDelDiaComponent } from './citas-del-dia.component';

describe('CitasDelDiaComponent', () => {
  let component: CitasDelDiaComponent;
  let fixture: ComponentFixture<CitasDelDiaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CitasDelDiaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CitasDelDiaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
