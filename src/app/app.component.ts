import { Component, ViewChild, ElementRef, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MealsService, Meal, MealsResponse, CreateMealRequest } from './services/meals.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements AfterViewInit, OnInit {
  title = 'eskalate-meals';
  isEditMode = false;
  currentMealIndex = -1;
  currentPage = 1;
  limit = 10;
  searchTerm = '';
  totalPages = 0;
  isLoading = false;
  hasMoreMeals = true;

  @ViewChild('addMealDialog') addMealDialog!: ElementRef<HTMLDialogElement>;

  // Meals data from API
  meals: Meal[] = [];

  // Current meal being edited or added
  currentMeal: Meal = {
    id: 0,
    foodName: '',
    price: 0,
    rating: 0,
    imageUrl: '',
    restaurantName: '',
    restaurantLogo: '',
    restaurantStatus: 'Open'
  };

  constructor(private mealsService: MealsService) { }

  ngOnInit() {
    this.loadMeals();
  }

  // Load meals from API
  loadMeals(reset: boolean = true) {
    this.isLoading = true;

    if (reset) {
      this.currentPage = 1;
      this.meals = [];
    }

    this.mealsService.getMeals(this.currentPage, this.limit, this.searchTerm)
      .subscribe({
        next: (response: MealsResponse) => {
          if (reset) {
            this.meals = response.data;
          } else {
            this.meals = [...this.meals, ...response.data];
          }

          this.totalPages = response.totalPages;
          this.hasMoreMeals = this.currentPage < this.totalPages;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading meals:', error);
          this.isLoading = false;
          // Fallback to sample data if API fails
          if (this.meals.length === 0) {
            this.loadSampleData();
          }
        }
      });
  }

  // Load more meals (increase limit by 8)
  loadMoreMeals() {
    if (this.hasMoreMeals && !this.isLoading) {
      this.limit += 8;
      this.loadMeals(true); // Reset and reload with new limit
    }
  }

  // Search meals
  searchMeals(searchTerm: string) {
    this.searchTerm = searchTerm;
    this.loadMeals(true);
  }

  // Fallback sample data
  loadSampleData() {
    this.meals = [
      {
        id: 1,
        foodName: 'Bowl Lasagna',
        price: 2.99,
        rating: 4.5,
        imageUrl: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=400&h=250&fit=crop',
        restaurantName: 'Italian Bistro',
        restaurantLogo: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=50&h=50&fit=crop',
        restaurantStatus: 'Closed'
      },
      {
        id: 2,
        foodName: 'Mixed Avocado Smoothie',
        price: 5.99,
        rating: 2.0,
        imageUrl: 'https://images.unsplash.com/photo-1563379091339-03246963d946?w=400&h=250&fit=crop',
        restaurantName: 'Healthy Juice Bar',
        restaurantLogo: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=50&h=50&fit=crop',
        restaurantStatus: 'Closed'
      },
      {
        id: 3,
        foodName: 'Pancake',
        price: 3.99,
        rating: 2.0,
        imageUrl: 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=400&h=250&fit=crop',
        restaurantName: 'Morning Cafe',
        restaurantLogo: 'https://images.unsplash.com/photo-1572047286853-a9ea024b32e7?w=50&h=50&fit=crop',
        restaurantStatus: 'Open'
      },
      {
        id: 4,
        foodName: 'Cupcake',
        price: 1.99,
        rating: 0.0,
        imageUrl: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400&h=250&fit=crop',
        restaurantName: 'Sweet Bakery',
        restaurantLogo: 'https://images.unsplash.com/photo-1517433367423-c7e5b0f35086?w=50&h=50&fit=crop',
        restaurantStatus: 'Open'
      }
    ];
    this.hasMoreMeals = false;
  }

  ngAfterViewInit() {
    // Component initialization complete
  }

  openAddMealDialog() {
    this.isEditMode = false;
    this.currentMealIndex = -1;
    this.resetCurrentMeal();
    this.addMealDialog.nativeElement.showModal();
  }

  editMeal(index: number) {
    this.isEditMode = true;
    this.currentMealIndex = index;
    this.currentMeal = { ...this.meals[index] };
    this.addMealDialog.nativeElement.showModal();
  }

  closeAddMealDialog() {
    this.addMealDialog.nativeElement.close();
    this.resetCurrentMeal();
  }

  deleteMeal(index: number, event: Event) {
    event.stopPropagation(); // Prevent triggering the edit dialog
    if (confirm('Are you sure you want to delete this meal?')) {
      this.meals.splice(index, 1);
      console.log('Deleted meal at index:', index);
    }
  }

  onSubmitMeal(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    if (this.isEditMode && this.currentMealIndex >= 0) {
      // Update existing meal (local update for now)
      const mealData: Meal = {
        id: this.currentMeal.id,
        foodName: formData.get('foodName') as string,
        price: parseFloat(formData.get('price') as string) || 0,
        rating: parseFloat(formData.get('rating') as string),
        imageUrl: formData.get('imageUrl') as string,
        restaurantName: formData.get('restaurantName') as string,
        restaurantLogo: formData.get('restaurantLogo') as string,
        restaurantStatus: formData.get('restaurantStatus') as 'Open' | 'Closed'
      };

      this.meals[this.currentMealIndex] = mealData;
      console.log('Updated Meal:', mealData);
      this.closeAddMealDialog();
      form.reset();
    } else {
      // Create new meal via API
      const createMealData: CreateMealRequest = {
        foodName: formData.get('foodName') as string,
        rating: parseFloat(formData.get('rating') as string),
        imageUrl: formData.get('imageUrl') as string,
        restaurant: {
          name: formData.get('restaurantName') as string,
          logo: formData.get('restaurantLogo') as string,
          status: (formData.get('restaurantStatus') as string).toLowerCase() as 'open' | 'closed'
        }
      };

      this.isLoading = true;
      this.mealsService.createMeal(createMealData).subscribe({
        next: (newMeal: Meal) => {
          console.log('Created new meal:', newMeal);
          // Reload meals to get updated list from server
          this.loadMeals(true);
          this.closeAddMealDialog();
          form.reset();
        },
        error: (error) => {
          console.error('Error creating meal:', error);
          this.isLoading = false;
          alert('Failed to create meal. Please try again.');
        }
      });
    }
  }

  private resetCurrentMeal() {
    this.currentMeal = {
      id: 0,
      foodName: '',
      price: 0,
      rating: 0,
      imageUrl: '',
      restaurantName: '',
      restaurantLogo: '',
      restaurantStatus: 'Open'
    };
  }
}
