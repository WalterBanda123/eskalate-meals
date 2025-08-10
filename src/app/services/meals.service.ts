import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Restaurant {
  _id?: string;
  name: string;
  logo: string;
  status: 'open' | 'closed';
}

export interface UpdateMealRequest {
  foodName: string;
  rating: number;
}

export interface CreateMealRequest {
  foodName: string;
  rating: number;
  imageUrl: string;
  restaurant: Restaurant;
}

// API Response structure
export interface ApiMealResponse {
  _id: string;
  foodName: string;
  rating: number;
  imageUrl: string;
  restaurant: Restaurant;
  __v?: number;
}

// UI Meal interface (flattened for easier use in templates)
export interface Meal {
  id: string;
  foodName: string;
  price?: number;
  rating: number;
  imageUrl: string;
  restaurantName: string;
  restaurantLogo: string;
  restaurantStatus: 'Open' | 'Closed';
}

export interface MealsResponse {
  data: Meal[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class MealsService {
  private apiUrl = 'http://localhost:3000/api/version-01/meals';

  constructor(private http: HttpClient) { }

  // Transform API response to UI format
  private transformApiMeal(apiMeal: ApiMealResponse): Meal {
    return {
      id: apiMeal._id,
      foodName: apiMeal.foodName,
      rating: apiMeal.rating,
      imageUrl: apiMeal.imageUrl,
      restaurantName: apiMeal.restaurant.name,
      restaurantLogo: apiMeal.restaurant.logo,
      restaurantStatus: apiMeal.restaurant.status === 'open' ? 'Open' : 'Closed',
      price: 0 // Default price since API doesn't return it
    };
  }

  getMeals(page: number = 1, limit: number = 8, search: string = ''): Observable<MealsResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<{
      message: string;
      data: ApiMealResponse[];
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    }>(this.apiUrl, { params }).pipe(
      map(response => ({
        data: response.data.map(apiMeal => this.transformApiMeal(apiMeal)),
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages
      }))
    );
  }

  searchMeals(searchTerm: string, page: number = 1, limit: number = 8): Observable<MealsResponse> {
    return this.getMeals(page, limit, searchTerm);
  }

  createMeal(mealData: CreateMealRequest): Observable<Meal> {
    return this.http.post<Meal>(this.apiUrl, mealData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  deleteMeal(mealId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${mealId}`);
  }

  getMealById(mealId: string): Observable<Meal> {
    return this.http.get<{ message: string; data: ApiMealResponse }>(`${this.apiUrl}/${mealId}`)
      .pipe(
        map((response: { message: string; data: ApiMealResponse }) => this.transformApiMeal(response.data))
      );
  }

  updateMeal(mealId: string, mealData: UpdateMealRequest): Observable<Meal> {
    return this.http.put<{ message: string; data: ApiMealResponse }>(`${this.apiUrl}/${mealId}`, mealData, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).pipe(
      map((response: { message: string; data: ApiMealResponse }) => this.transformApiMeal(response.data))
    );
  }
}
