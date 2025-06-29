import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentNavComponent } from './component-nav.component';

describe('ComponentNavComponent', () => {
  let component: ComponentNavComponent;
  let fixture: ComponentFixture<ComponentNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentNavComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComponentNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
