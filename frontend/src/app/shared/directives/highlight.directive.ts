import { Directive, ElementRef, Input, OnChanges, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appHighlightMatch]',
  standalone: true,
})
export class HighlightDirective implements OnChanges {
  @Input() appHighlightMatch = false;

  constructor(
    private readonly elementRef: ElementRef,
    private readonly renderer: Renderer2,
  ) {}

  ngOnChanges(): void {
    this.renderer.setStyle(
      this.elementRef.nativeElement,
      'backgroundColor',
      this.appHighlightMatch ? 'rgba(13, 110, 253, 0.08)' : 'transparent',
    );
  }
}
