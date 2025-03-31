import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContactoComponent } from './contacto.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';  // Si usas formularios
import { CommonModule } from '@angular/common';  // Si el componente depende de CommonModule

describe('ContactoComponent', () => {
  let component: ContactoComponent;
  let fixture: ComponentFixture<ContactoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule, ReactiveFormsModule],  // Agrega los módulos necesarios
      declarations: [ContactoComponent]  // Declara el componente
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();  // Verifica que el componente se haya creado correctamente
  });

  // Puedes agregar más pruebas específicas para funcionalidades del componente
});
