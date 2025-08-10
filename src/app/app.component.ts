import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'eskalate-meals';

  @ViewChild('addMealDialog') addMealDialog!: ElementRef<HTMLDialogElement>;

  openAddMealDialog() {
    this.addMealDialog.nativeElement.showModal();
  }

  closeAddMealDialog() {
    this.addMealDialog.nativeElement.close();
  }

  onSubmitMeal(event: Event) {
    event.preventDefault();
    // Handle form submission here
    console.log('Meal submitted!');
    this.closeAddMealDialog();
  }
}
