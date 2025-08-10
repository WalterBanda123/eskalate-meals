import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Meal {
  id: number;
  foodName: string;
  rating: number;
  price: number;
  imageUrl: string;
  restaurantName: string;
  restaurantLogo: string;
  restaurantStatus: 'Open' | 'Closed';
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements AfterViewInit {
  title = 'eskalate-meals';
  isEditMode = false;
  currentMealIndex = -1;

  @ViewChild('addMealDialog') addMealDialog!: ElementRef<HTMLDialogElement>;

  // Sample meals data
  meals: Meal[] = [
    {
      id: 1,
      foodName: 'Bowl Lasagna',
      rating: 4.5,
      price: 2.99,
      imageUrl: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=400&h=250&fit=crop',
      restaurantName: 'Italian Bistro',
      restaurantLogo: '🍝',
      restaurantStatus: 'Closed'
    },
    {
      id: 2,
      foodName: 'Mixed Avocado Smoothie',
      rating: 2.0,
      price: 5.99,
      imageUrl: 'https://images.unsplash.com/photo-1563379091339-03246963d946?w=400&h=250&fit=crop',
      restaurantName: 'Healthy Juice Bar',
      restaurantLogo: '🥤',
      restaurantStatus: 'Closed'
    },
    {
      id: 3,
      foodName: 'Pancake',
      rating: 2.0,
      price: 3.99,
      imageUrl: 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=400&h=250&fit=crop',
      restaurantName: 'Morning Café',
      restaurantLogo: '🥞',
      restaurantStatus: 'Open'
    },
    {
      id: 4,
      foodName: 'Cupcake',
      rating: 0.0,
      price: 1.99,
      imageUrl: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400&h=250&fit=crop',
      restaurantName: 'Sweet Bakery',
      restaurantLogo: '🧁',
      restaurantStatus: 'Open'
    },
    {
      id: 5,
      foodName: 'Creamy Steak',
      rating: 4.5,
      price: 12.99,
      imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=250&fit=crop',
      restaurantName: 'Grill Master',
      restaurantLogo: '🥩',
      restaurantStatus: 'Open'
    },
    {
      id: 6,
      foodName: 'Steak with Potatoes',
      rating: 5.0,
      price: 15.99,
      imageUrl: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&h=250&fit=crop',
      restaurantName: 'KFC Restaurant',
      restaurantLogo: 'KFC',
      restaurantStatus: 'Open'
    },
    {
      id: 7,
      foodName: 'Indian Spicy Soup',
      rating: 4.5,
      price: 9.99,
      imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=250&fit=crop',
      restaurantName: 'Spice Garden',
      restaurantLogo: '🍛',
      restaurantStatus: 'Open'
    },
    {
      id: 8,
      foodName: 'Steak Omlet',
      rating: 4.9,
      price: 11.99,
      imageUrl: 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=400&h=250&fit=crop',
      restaurantName: 'Breakfast Bell',
      restaurantLogo: '🍳',
      restaurantStatus: 'Open'
    }
  ];

  // Current meal being edited or added
  currentMeal: Meal = {
    id: 0,
    foodName: '',
    rating: 0,
    price: 0,
    imageUrl: '',
    restaurantName: '',
    restaurantLogo: '',
    restaurantStatus: 'Open'
  };

  ngAfterViewInit() {
    // Set up image preview functionality
    this.setupImagePreview();
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

    // Update image preview if meal has imageUrl
    setTimeout(() => {
      if (this.currentMeal.imageUrl) {
        this.updateImagePreview(this.currentMeal.imageUrl);
      }
    }, 100);
  }

  closeAddMealDialog() {
    this.addMealDialog.nativeElement.close();
    this.resetCurrentMeal();
  }

  onSubmitMeal(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    const mealData: Meal = {
      id: this.isEditMode ? this.currentMeal.id : Date.now(),
      foodName: formData.get('foodName') as string,
      rating: parseFloat(formData.get('rating') as string),
      price: parseFloat(formData.get('price') as string),
      imageUrl: formData.get('imageUrl') as string,
      restaurantName: formData.get('restaurantName') as string,
      restaurantLogo: formData.get('restaurantLogo') as string,
      restaurantStatus: formData.get('restaurantStatus') as 'Open' | 'Closed'
    };

    if (this.isEditMode && this.currentMealIndex >= 0) {
      // Update existing meal
      this.meals[this.currentMealIndex] = mealData;
      console.log('Updated Meal:', mealData);
    } else {
      // Add new meal
      this.meals.push(mealData);
      console.log('Added New Meal:', mealData);
    }

    // Close dialog and reset form
    this.closeAddMealDialog();
    form.reset();

    // Hide image preview
    const preview = document.getElementById('imagePreview');
    if (preview) {
      preview.classList.add('hidden');
    }
  }

  private resetCurrentMeal() {
    this.currentMeal = {
      id: 0,
      foodName: '',
      rating: 0,
      price: 0,
      imageUrl: '',
      restaurantName: '',
      restaurantLogo: '',
      restaurantStatus: 'Open'
    };
  }

  private setupImagePreview() {
    const imageUrlInput = document.querySelector('input[name="imageUrl"]') as HTMLInputElement;

    if (imageUrlInput) {
      imageUrlInput.addEventListener('input', (e) => {
        const url = (e.target as HTMLInputElement).value;
        this.updateImagePreview(url);
      });
    }
  }

  private updateImagePreview(url: string) {
    const preview = document.getElementById('imagePreview');
    const previewImg = preview?.querySelector('img');

    if (preview && previewImg) {
      if (url) {
        previewImg.src = url;
        preview.classList.remove('hidden');

        // Handle image load error
        previewImg.onerror = () => {
          preview.classList.add('hidden');
        };
      } else {
        preview.classList.add('hidden');
      }
    }
  }
}
