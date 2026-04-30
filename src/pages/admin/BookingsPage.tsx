import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import AdminLayout from "@/components/admin/AdminLayout";
import { Search, Calendar, Eye, CheckCircle, XCircle, Clock, Mail, Phone, MapPin, Users, UtensilsCrossed, MessageSquare, X } from "lucide-react";
import { bookingService, dishService, packageService, type Booking, type Dish, type Package } from "@/lib/api";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const BookingsPage = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedDishDetails, setSelectedDishDetails] = useState<Dish[]>([]);
  const [selectedPackageDetails, setSelectedPackageDetails] = useState<Package | null>(null);

  useEffect(() => {
    document.title = "Bookings — Sampaguita & Saro Admin";
  }, []);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/admin/login");
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    filterBookings();
  }, [searchQuery, statusFilter, bookings]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const response = await bookingService.getAll();
      setBookings(response.data || []);
    } catch (error) {
      toast.error("Failed to load bookings");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = [...bookings];

    if (statusFilter !== "all") {
      filtered = filtered.filter((booking) => booking.status === statusFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (booking) =>
          booking.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          booking.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
          booking.packageName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredBookings(filtered);
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await bookingService.updateStatus(id, status);
      toast.success("Booking status updated");
      fetchBookings();
    } catch (error) {
      toast.error("Failed to update status");
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;

    try {
      await bookingService.delete(id);
      toast.success("Booking deleted successfully");
      fetchBookings();
    } catch (error) {
      toast.error("Failed to delete booking");
      console.error(error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500/10 text-yellow-500",
      confirmed: "bg-green-500/10 text-green-500",
      cancelled: "bg-red-500/10 text-red-500",
      completed: "bg-blue-500/10 text-blue-500",
    };
    return colors[status] || "bg-gray-500/10 text-gray-500";
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, JSX.Element> = {
      pending: <Clock className="w-4 h-4" />,
      confirmed: <CheckCircle className="w-4 h-4" />,
      cancelled: <XCircle className="w-4 h-4" />,
      completed: <CheckCircle className="w-4 h-4" />,
    };
    return icons[status] || <Clock className="w-4 h-4" />;
  };

  const handleViewDetails = async (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDetailDialogOpen(true);
    
    // Fetch package details to get pricing
    if (booking.packageId) {
      try {
        const packageResponse = await packageService.getById(booking.packageId);
        setSelectedPackageDetails(packageResponse.data);
      } catch (error) {
        console.error("Failed to fetch package details:", error);
        setSelectedPackageDetails(null);
      }
    } else {
      setSelectedPackageDetails(null);
    }
    
    // Fetch dish details if there are selected dishes
    if (booking.selectedDishes && booking.selectedDishes.length > 0) {
      try {
        const dishesResponse = await dishService.getAll();
        const allDishes = dishesResponse.data || [];
        const bookingDishes = allDishes.filter(dish => 
          booking.selectedDishes?.includes(dish.id)
        );
        setSelectedDishDetails(bookingDishes);
      } catch (error) {
        console.error("Failed to fetch dish details:", error);
        setSelectedDishDetails([]);
      }
    } else {
      setSelectedDishDetails([]);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString()}`;
  };

  if (loading || !isAuthenticated) return null;

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-medium text-foreground">
              Event <span className="italic font-light text-gradient-warm">Bookings</span>
            </h1>
            <p className="text-foreground/60 mt-1">
              Manage reservations and event schedules
            </p>
          </div>
          <div className="flex gap-3">
            <div className="flex gap-2 px-4 py-2 rounded-xl bg-card border border-border">
              <span className="text-sm text-foreground/60">Total:</span>
              <span className="text-sm font-medium text-foreground">{bookings.length}</span>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 shadow-card mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
              <p className="text-foreground/60">Loading bookings...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-foreground/20 mx-auto mb-4" />
              <p className="text-foreground/60">No bookings found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-mono text-xs tracking-[0.2em] uppercase text-foreground/60">
                      Customer
                    </th>
                    <th className="text-left py-3 px-4 font-mono text-xs tracking-[0.2em] uppercase text-foreground/60">
                      Package
                    </th>
                    <th className="text-left py-3 px-4 font-mono text-xs tracking-[0.2em] uppercase text-foreground/60">
                      Event Date
                    </th>
                    <th className="text-left py-3 px-4 font-mono text-xs tracking-[0.2em] uppercase text-foreground/60">
                      Guests
                    </th>
                    <th className="text-left py-3 px-4 font-mono text-xs tracking-[0.2em] uppercase text-foreground/60">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-mono text-xs tracking-[0.2em] uppercase text-foreground/60">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="border-b border-border/50 hover:bg-background/50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-foreground">{booking.customerName}</p>
                          <p className="text-sm text-foreground/60">{booking.customerEmail}</p>
                          <p className="text-xs text-foreground/50">{booking.customerPhone}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-foreground">{booking.packageName}</p>
                          <p className="text-sm text-foreground/60">{booking.tierName}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-foreground/70">
                        {new Date(booking.eventDate).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 text-foreground/70">
                        {booking.guestCount}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {getStatusIcon(booking.status)}
                          {booking.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewDetails(booking)}
                            className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <select
                            value={booking.status}
                            onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                            className="px-3 py-1 rounded-lg bg-foreground/5 hover:bg-foreground/10 text-foreground text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="completed">Completed</option>
                          </select>
                          <button
                            onClick={() => handleDelete(booking.id)}
                            className="p-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors"
                            title="Delete booking"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Booking Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display">Booking Details</DialogTitle>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-6 mt-4">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
                    selectedBooking.status
                  )}`}
                >
                  {getStatusIcon(selectedBooking.status)}
                  {selectedBooking.status.toUpperCase()}
                </span>
                <span className="text-sm text-muted-foreground">
                  Booking ID: #{selectedBooking.id}
                </span>
              </div>

              {/* Customer Information */}
              <div className="bg-muted/30 rounded-xl p-6 space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Customer Information
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                        Full Name
                      </p>
                      <p className="font-medium text-lg">{selectedBooking.customerName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                        Email Address
                      </p>
                      <a
                        href={`mailto:${selectedBooking.customerEmail}`}
                        className="flex items-center gap-2 text-primary hover:underline"
                      >
                        <Mail className="w-4 h-4" />
                        {selectedBooking.customerEmail}
                      </a>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                        Phone Number
                      </p>
                      <a
                        href={`tel:${selectedBooking.customerPhone}`}
                        className="flex items-center gap-2 text-primary hover:underline"
                      >
                        <Phone className="w-4 h-4" />
                        {selectedBooking.customerPhone}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Event Details */}
              <div className="bg-muted/30 rounded-xl p-6 space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Event Details
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Event Date
                    </p>
                    <p className="font-medium">
                      {new Date(selectedBooking.eventDate).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Number of Guests
                    </p>
                    <p className="font-medium text-lg">{selectedBooking.guestCount} guests</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Booking Date
                    </p>
                    <p className="font-medium text-sm">
                      {new Date(selectedBooking.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {selectedBooking.venue && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Venue / Location
                    </p>
                    <p className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-1 text-muted-foreground flex-shrink-0" />
                      <span>{selectedBooking.venue}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Package Information */}
              <div className="bg-muted/30 rounded-xl p-6 space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <UtensilsCrossed className="w-5 h-5 text-primary" />
                  Package & Tier
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Package Name
                    </p>
                    <p className="font-medium text-lg">{selectedBooking.packageName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Tier
                    </p>
                    <p className="font-medium">{selectedBooking.tierName}</p>
                  </div>
                </div>
                {selectedPackageDetails && (
                  <div className="pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Package Price
                    </p>
                    <p className="font-bold text-2xl text-primary">
                      ₱{selectedPackageDetails.estimatedPrice}
                    </p>
                    {selectedPackageDetails.goodForPax && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Good for {selectedPackageDetails.goodForPax} pax
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Selected Dishes */}
              {selectedBooking.selectedDishes && selectedBooking.selectedDishes.length > 0 && (
                <div className="bg-muted/30 rounded-xl p-6 space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <UtensilsCrossed className="w-5 h-5 text-primary" />
                    Selected Dishes ({selectedBooking.selectedDishes.length})
                  </h3>
                  
                  {selectedDishDetails.length > 0 ? (
                    <div className="space-y-4">
                      {/* Group dishes by category */}
                      {['appetizer', 'main_course', 'side_dish', 'dessert', 'beverage'].map(category => {
                        const categoryDishes = selectedDishDetails.filter(dish => dish.category === category);
                        if (categoryDishes.length === 0) return null;
                        
                        return (
                          <div key={category}>
                            <h4 className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">
                              {category.replace('_', ' ')} ({categoryDishes.length})
                            </h4>
                            <div className="grid md:grid-cols-2 gap-3">
                              {categoryDishes.map((dish) => (
                                <div
                                  key={dish.id}
                                  className="flex items-start gap-3 p-3 bg-background rounded-lg border border-border"
                                >
                                  {dish.image && (
                                    <img
                                      src={dish.image.startsWith('http') ? dish.image : `${import.meta.env.VITE_API_URL}${dish.image}`}
                                      alt={dish.name}
                                      className="w-12 h-12 rounded object-cover flex-shrink-0"
                                    />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium">{dish.name}</p>
                                    {dish.description && (
                                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                        {dish.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">Loading dish details...</p>
                    </div>
                  )}
                </div>
              )}

              {/* Notes / Special Requests */}
              {selectedBooking.notes && (
                <div className="bg-muted/30 rounded-xl p-6 space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    Notes / Special Requests
                  </h3>
                  <p className="text-foreground/80 whitespace-pre-wrap">
                    {selectedBooking.notes}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-border">
                <Button
                  onClick={() => window.open(`mailto:${selectedBooking.customerEmail}`, "_blank")}
                  className="flex-1"
                  variant="default"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email
                </Button>
                <Button
                  onClick={() => setIsDetailDialogOpen(false)}
                  variant="outline"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default BookingsPage;
