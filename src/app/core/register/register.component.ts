import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { SharedModule } from '../../module/shared/shared.module';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [SharedModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit{
 form: any;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form  = this.fb.group({
    firstName: ['', Validators.required],
    middleName: [''],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  });
  }

  onSubmit() {
    if (this.form.valid) {
      const formData = this.form.value;
      console.log('Form submitted:', formData);
    } else {
      console.log('Form is invalid');
    }
  }
}
