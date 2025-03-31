import { Directive, ElementRef, Renderer2, inject, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Directive({
  selector: '[appScrollVisibility]'
})
export class ScrollVisibilityDirective {
  private observer: IntersectionObserver;

  constructor(private el: ElementRef, private renderer: Renderer2) {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.renderer.addClass(this.el.nativeElement, 'mostrar');
          } else {
            this.renderer.removeClass(this.el.nativeElement, 'mostrar');
          }
        });
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.5, // 50% del elemento visible
      }
    );

    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
