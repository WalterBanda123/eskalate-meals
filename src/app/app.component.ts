import { Component, ViewChild, ElementRef, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MealsService, Meal, MealsResponse, CreateMealRequest, UpdateMealRequest } from './services/meals.service';

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

  // Delete confirmation modal
  showDeleteModal = false;
  mealToDelete: Meal | null = null;
  mealToDeleteIndex = -1;

  @ViewChild('addMealDialog') addMealDialog!: ElementRef<HTMLDialogElement>;

  // Meals data from API
  meals: Meal[] = [];

  // Current meal being edited or added
  currentMeal: Meal = {
    id: '',
    foodName: '',
    price: 0,
    rating: 0,
    imageUrl: '',
    restaurantName: '',
    restaurantLogo: '',
    restaurantStatus: 'Open'
  };

  constructor(private mealsService: MealsService) { }

  // Helper method to generate random review count for demo purposes
  getRandomReviewCount(): number {
    return Math.floor(Math.random() * 100) + 10;
  }

  ngOnInit() {
    this.loadMeals();
    // this.loadSampleData()

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
          console.log('API Response:', response);
          console.log('First meal structure:', response.data[0]);

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
        id: '1',
        foodName: 'Bowl Lasagna',
        price: 2.99,
        rating: 4.5,
        imageUrl: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=400&h=250&fit=crop',
        restaurantName: 'Italian Bistro',
        restaurantLogo: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=50&h=50&fit=crop',
        restaurantStatus: 'Closed'
      },
      {
        id: '2',
        foodName: 'Mixed Avocado Smoothie',
        price: 5.99,
        rating: 2.0,
        imageUrl: 'https://images.unsplash.com/photo-1563379091339-03246963d946?w=400&h=250&fit=crop',
        restaurantName: 'Healthy Juice Bar',
        restaurantLogo: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=50&h=50&fit=crop',
        restaurantStatus: 'Closed'
      },
      {
        id: '3',
        foodName: 'Pancake',
        price: 3.99,
        rating: 2.0,
        imageUrl: 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=400&h=250&fit=crop',
        restaurantName: 'Morning Cafe',
        restaurantLogo: 'https://images.unsplash.com/photo-1572047286853-a9ea024b32e7?w=50&h=50&fit=crop',
        restaurantStatus: 'Open'
      },
      {
        id: '4',
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
    const meal = this.meals[index];

    // Try to get the meal ID - check for different possible ID fields
    const mealId = meal.id || (meal as any)._id || (meal as any).mealId;

    console.log('Editing meal:', meal);
    console.log('Meal ID found:', mealId);

    // If we don't have a valid ID, use local data directly
    if (!mealId || mealId === 'undefined') {
      console.warn('No valid meal ID found, using local data');
      this.currentMeal = { ...meal };
      this.addMealDialog.nativeElement.showModal();
      return;
    }

    // Show loading state
    this.isLoading = true;
    this.addMealDialog.nativeElement.showModal();

    // Fetch fresh meal data from API
    this.mealsService.getMealById(mealId).subscribe({
      next: (meal: Meal) => {
        this.currentMeal = { ...meal };
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching meal details:', error);
        // Fallback to local data
        this.currentMeal = { ...this.meals[index] };
        this.isLoading = false;
      }
    });
  }

  closeAddMealDialog() {
    this.addMealDialog.nativeElement.close();
    this.resetCurrentMeal();
  }

  deleteMeal(index: number, event: Event) {
    event.stopPropagation(); // Prevent triggering the edit dialog
    this.mealToDelete = this.meals[index];
    this.mealToDeleteIndex = index;
    this.showDeleteModal = true;
  }

  confirmDelete() {
    if (this.mealToDelete && this.mealToDeleteIndex !== -1) {
      // Try to get the meal ID - check for different possible ID fields
      const mealId = this.mealToDelete.id || (this.mealToDelete as any)._id || (this.mealToDelete as any).mealId;

      if (!mealId || mealId === 'undefined') {
        console.warn('No valid meal ID found for deletion, removing from local array only');
        this.meals.splice(this.mealToDeleteIndex, 1);
        this.cancelDelete();
        return;
      }

      this.isLoading = true;
      this.mealsService.deleteMeal(mealId).subscribe({
        next: () => {
          console.log('Meal deleted successfully');
          // Remove from local array
          this.meals.splice(this.mealToDeleteIndex, 1);
          this.cancelDelete();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error deleting meal:', error);
          this.isLoading = false;
          alert('Failed to delete meal. Please try again.');
          this.cancelDelete();
        }
      });
    }
  }

  cancelDelete() {
    this.showDeleteModal = false;
    this.mealToDelete = null;
    this.mealToDeleteIndex = -1;
  }

  onSubmitMeal(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    if (this.isEditMode && this.currentMealIndex >= 0) {
      // Update existing meal via API
      const updateMealData: UpdateMealRequest = {
        foodName: formData.get('foodName') as string,
        rating: parseFloat(formData.get('rating') as string)
      };

      this.isLoading = true;
      this.mealsService.updateMeal(this.currentMeal.id, updateMealData).subscribe({
        next: (updatedMeal: Meal) => {
          console.log('Updated meal:', updatedMeal);
          // Update the local array with the response from server
          this.meals[this.currentMealIndex] = updatedMeal;
          this.closeAddMealDialog();
          form.reset();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error updating meal:', error);
          this.isLoading = false;
          alert('Failed to update meal. Please try again.');
        }
      });
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
      id: '',
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
