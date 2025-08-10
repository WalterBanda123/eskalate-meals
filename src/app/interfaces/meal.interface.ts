export interface Meal {
  id: number;
  foodName: string;
  rating: number;
  imageUrl: string;
  restaurantName: string;
  restaurantLogo: string;
  restaurantStatus: 'Open' | 'Closed';
}
