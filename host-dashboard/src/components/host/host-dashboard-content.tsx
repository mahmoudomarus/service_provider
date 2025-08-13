'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building, 
  Calendar, 
  DollarSign, 
  Plus,
  Eye,
  Edit,
  MoreHorizontal
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { ModalProviders } from '@/providers/modal-providers';
import { useModal } from '@/hooks/use-modal-store';

// This will connect to the real backend API endpoints
// GET /api/v1/rental/properties/my-properties
// GET /api/v1/rental/bookings/requests/my-bookings
// GET /api/v1/rental/properties/analytics

interface Property {
  id: string;
  title: string;
  property_type: 'short_term' | 'long_term';
  price_per_night?: number;
  price_per_month?: number;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  is_active: boolean;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
  };
  created_at: string;
  updated_at: string;
}

interface BookingRequest {
  id: string;
  property_id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  start_date: string;
  end_date: string;
  total_amount: number;
  created_at: string;
}

interface DashboardStats {
  total_properties: number;
  active_bookings: number;
  monthly_revenue: number;
  total_views: number;
}

export function HostDashboardContent() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total_properties: 0,
    active_bookings: 0,
    monthly_revenue: 0,
    total_views: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user, session } = useAuth();
  const { onOpen } = useModal();

  // Fetch real data from backend
  useEffect(() => {
    const fetchHostData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch user's properties from real API
        const propertiesResponse = await fetch('/api/v1/rental/properties/my-properties', {
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!propertiesResponse.ok) {
          throw new Error(`Failed to fetch properties: ${propertiesResponse.statusText}`);
        }

        const propertiesData = await propertiesResponse.json();
        setProperties(propertiesData.data || []);

        // Fetch user's bookings from real API
        const bookingsResponse = await fetch('/api/v1/rental/bookings/requests/my-bookings', {
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!bookingsResponse.ok) {
          throw new Error(`Failed to fetch bookings: ${bookingsResponse.statusText}`);
        }

        const bookingsData = await bookingsResponse.json();
        setBookings(bookingsData.data || []);

        // Calculate real stats
        const totalProperties = propertiesData.data?.length || 0;
        const activeBookings = bookingsData.data?.filter((b: BookingRequest) => 
          b.status === 'approved' || b.status === 'pending'
        ).length || 0;
        
        const monthlyRevenue = bookingsData.data?.reduce((sum: number, booking: BookingRequest) => {
          const bookingMonth = new Date(booking.created_at).getMonth();
          const currentMonth = new Date().getMonth();
          return bookingMonth === currentMonth ? sum + booking.total_amount : sum;
        }, 0) || 0;

        setStats({
          total_properties: totalProperties,
          active_bookings: activeBookings,
          monthly_revenue: monthlyRevenue,
          total_views: 0 // Would need analytics endpoint
        });

      } catch (err) {
        console.error('Error fetching host data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHostData();
      }, [user, session]);

  const handleAddProperty = () => {
    onOpen('create-property');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="container mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-64"></div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="container mx-auto">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Error Loading Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{error}</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="mt-4"
                variant="outline"
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <ModalProviders>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Host Dashboard</h1>
              <p className="text-muted-foreground text-lg">
                Manage your Dubai property listings
              </p>
            </div>
            <Button size="lg" onClick={handleAddProperty} className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add Property
            </Button>
          </div>

          {/* Stats Overview */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_properties}</div>
                <p className="text-xs text-muted-foreground">
                  Active listings on the platform
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.active_bookings}</div>
                <p className="text-xs text-muted-foreground">
                  Current reservations
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">AED {stats.monthly_revenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  This month&apos;s earnings
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Property Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_views}</div>
                <p className="text-xs text-muted-foreground">
                  Total views this month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Properties List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Your Properties</h2>
              <Button onClick={handleAddProperty} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </Button>
            </div>

            {properties.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Building className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Properties Yet</h3>
                  <p className="text-muted-foreground text-center mb-6">
                    Start earning by adding your first property to the platform
                  </p>
                  <Button onClick={handleAddProperty} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Your First Property
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {properties.map((property) => (
                  <Card key={property.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg line-clamp-2">{property.title}</CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <Building className="h-3 w-3" />
                            {property.address.street}, {property.address.city}
                          </CardDescription>
                        </div>
                        <Badge variant={property.is_active ? "default" : "secondary"}>
                          {property.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Property Details */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{property.bedrooms} bed</span>
                        <span>{property.bathrooms} bath</span>
                        <span>{property.square_feet} sqft</span>
                      </div>

                      {/* Pricing */}
                      <div className="text-lg font-semibold">
                        {property.property_type === 'short_term' 
                          ? `AED ${property.price_per_night}/night`
                          : `AED ${property.price_per_month}/month`
                        }
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Recent Bookings */}
          {bookings.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">Recent Bookings</h2>
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {bookings.slice(0, 5).map((booking) => (
                      <div key={booking.id} className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium">Booking #{booking.id.slice(0, 8)}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">AED {booking.total_amount.toLocaleString()}</p>
                          <Badge variant={
                            booking.status === 'approved' ? 'default' :
                            booking.status === 'pending' ? 'secondary' :
                            'destructive'
                          }>
                            {booking.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </ModalProviders>
  );
}
