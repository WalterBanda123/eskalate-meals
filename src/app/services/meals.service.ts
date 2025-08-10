import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Restaurant {
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

export interface Meal {
  id: number;
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

  getMeals(page: number = 1, limit: number = 8, search: string = ''): Observable<MealsResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<MealsResponse>(this.apiUrl, { params });
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

  deleteMeal(mealId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${mealId}`);
  }

  getMealById(mealId: number): Observable<Meal> {
    return this.http.get<Meal>(`${this.apiUrl}/${mealId}`);
  }

  updateMeal(mealId: number, mealData: UpdateMealRequest): Observable<Meal> {
    return this.http.put<Meal>(`${this.apiUrl}/${mealId}`, mealData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
