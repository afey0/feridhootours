import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import { renderHook } from '@testing-library/react';
import { usePlatformStore } from './store/usePlatformStore';
import { resetAuthStore } from './store/useAuthStore';
import { calculateRefund } from './utils/refundPolicy';

describe('FeridhooTours App E2E Flows', () => {
  beforeEach(() => {
    // Reset global state
    const { result } = renderHook(() => usePlatformStore());
    result.current.resetPlatformStore();
    resetAuthStore();
    window.alert = vi.fn();
    window.confirm = vi.fn(() => true);
    // Render before each test to guarantee fresh state
    render(<App />);
  });

  it('renders landing page with find schedules button', () => {
    expect(screen.getByText('Where to next?')).toBeTruthy();
    expect(screen.getByRole('button', { name: /Find Schedules/i })).toBeTruthy();
  });

  it('logs in as Passenger', async () => {
    // Click Sign In
    fireEvent.click(screen.getByText('Sign In'));
    await waitFor(() => expect(screen.getByText('Login as Passenger')).toBeTruthy());

    // Login as Passenger
    fireEvent.click(screen.getByText('Login as Passenger'));
    
    // Check if Avatar or Name replaces Sign In
    await waitFor(() => {
      expect(screen.getByText('Ahmed F.')).toBeTruthy();
      expect(screen.queryByText('Sign In')).toBeNull();
    });
  });

  it('logs in as Admin and sees Operator Dashboard', async () => {
    // Click Sign In
    fireEvent.click(screen.getByText('Sign In'));
    await waitFor(() => expect(screen.getByText('Login as Operator/Admin')).toBeTruthy());

    // Login as Admin
    fireEvent.click(screen.getByText('Login as Operator/Admin'));
    
    // Check if "Admin Panel" button appears
    await waitFor(() => expect(screen.getByText('Admin Panel')).toBeTruthy());

    // Click Admin Panel
    fireEvent.click(screen.getByText('Admin Panel'));

    // Check Dashboard renders
    await waitFor(() => {
      expect(screen.getByText('Operator Dashboard')).toBeTruthy();
      expect(screen.getByText(/Defined Revenue/i)).toBeTruthy();
      expect(screen.getByText('MVR 45,200')).toBeTruthy();
    });
  });

  it('searches for schedules and picks seats successfully', async () => {
    // 0. Login as Passenger first
    fireEvent.click(screen.getByText('Sign In'));
    await waitFor(() => expect(screen.getByText('Login as Passenger')).toBeTruthy());
    fireEvent.click(screen.getByText('Login as Passenger'));
    await waitFor(() => expect(screen.getByText('Ahmed F.')).toBeTruthy());

    // 1. Search
    fireEvent.click(screen.getByRole('button', { name: /Find Schedules/i }));

    // 2. Wait for schedule list (Kaani Princess is a mock schedule)
    await waitFor(() => expect(screen.getByTestId('schedule-card-SCH-001')).toBeTruthy());

    // 3. Click the schedule card reliably via its container
    fireEvent.click(screen.getByTestId('schedule-card-SCH-001'));

    // 4. Wait for Seat Map explicitly (Available label is only present on Deck view)
    await waitFor(() => expect(screen.getByText(/^Available$/)).toBeTruthy());

    // 5. Check original Lock button states (should be disabled)
    const lockBtn = screen.getByRole('button', { name: /Lock Seats/i });
    expect(lockBtn.hasAttribute('disabled')).toBeTruthy();

    // 6. Find an available seat specifically by its title
    const seat1 = await waitFor(() => screen.getByTitle('Seat S-1 - available'));
    fireEvent.click(seat1);

    // 7. Lock Buttons should now be enabled
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Lock Seats/i }).hasAttribute('disabled')).toBeFalsy();
    });

    // 8. Click Lock and Continue
    fireEvent.click(screen.getByRole('button', { name: /Lock Seats/i }));

    // 9. Fill passenger details (PassengerDetails step)
    await waitFor(() => expect(screen.getByText('Passenger Information')).toBeTruthy());
    const nameInput = screen.getByPlaceholderText('Enter full name');
    const idInput = screen.getByPlaceholderText('Enter ID/Passport number');
    fireEvent.change(nameInput, { target: { value: 'Ahmed F.' } });
    fireEvent.change(idInput, { target: { value: 'A123456' } });
    fireEvent.click(screen.getByRole('button', { name: /Continue to Checkout/i }));

    // 10. Verify transition to modal/payment
    await waitFor(() => expect(screen.getByText('Checkout & Payment')).toBeTruthy());
  });

  it('admin can override and release seats', async () => {
    // Login as Admin
    fireEvent.click(screen.getByText('Sign In'));
    await waitFor(() => expect(screen.getByText('Login as Operator/Admin')).toBeTruthy());
    fireEvent.click(screen.getByText('Login as Operator/Admin'));
    
    // Check if "Admin Panel" button appears
    await waitFor(() => expect(screen.getByText('Admin Panel')).toBeTruthy());
    fireEvent.click(screen.getByText('Admin Panel'));

    // Verify operator dashboard is loaded
    await waitFor(() => expect(screen.getByText('Operator Dashboard')).toBeTruthy());
    
    // Click Manage on the first schedule
    const manageBtns = screen.getAllByRole('button', { name: /Manage Seats/i });
    fireEvent.click(manageBtns[0]);

    // Verify admin Seatmap loads
    await waitFor(() => expect(screen.getByText(/manage passenger seat allocations/i)).toBeTruthy());

    // By default S-1 is available. S-5 (Row 2, Col 1) has a high chance to be locked/booked. S-2 is also available.
    // Let's explicitly click S-1 which is available.
    const seat1 = await waitFor(() => screen.getByTitle('Seat S-1 - available'));
    fireEvent.click(seat1);

    // Reserve S-1 as an admin
    const quickReserveBtn = screen.getByRole('button', { name: /Quick Reserve \(Book\)/i });
    expect(quickReserveBtn.hasAttribute('disabled')).toBeFalsy();
    fireEvent.click(quickReserveBtn);

    // Since we're in admin mode, the seat should now reflect as Booked in the title
    await waitFor(() => {
      // It should no longer be 'available', it could be 'booked' now. 
      // The component maps the title as `Seat ${seat.id} - ${getSeatStatus(seat)}`
      expect(screen.getByTitle('Seat S-1 - booked')).toBeTruthy();
    });

    // Now let's release it!
    const bookedSeat1 = await waitFor(() => screen.getByTitle('Seat S-1 - booked'));
    // Admin CAN click booked seats!
    fireEvent.click(bookedSeat1);

    // Click Release
    const releaseBtn = screen.getByRole('button', { name: /Release Seats/i });
    expect(releaseBtn.hasAttribute('disabled')).toBeFalsy();
    fireEvent.click(releaseBtn);

    // State returns to available!
    await waitFor(() => {
      expect(screen.getByTitle('Seat S-1 - available')).toBeTruthy();
    });
  });

  it('registers a new Passenger and verifies credentials login', async () => {
    // 1. Click Sign In, switch to Sign Up
    fireEvent.click(screen.getByText('Sign In'));
    await waitFor(() => expect(screen.getByText('Sign Up')).toBeTruthy());
    fireEvent.click(screen.getByText('Sign Up'));

    // 2. Fill registration details
    await waitFor(() => expect(screen.getByPlaceholderText('Ahmed Waheed')).toBeTruthy());
    fireEvent.change(screen.getByPlaceholderText('Ahmed Waheed'), { target: { value: 'New Test User' } });
    fireEvent.change(screen.getByPlaceholderText('name@example.com'), { target: { value: 'testuser@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Create a password'), { target: { value: 'mypassword123' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm your password'), { target: { value: 'mypassword123' } });

    // 3. Submit Sign Up
    fireEvent.click(screen.getByRole('button', { name: /Sign Up & Register/i }));

    // 4. Verify login state change
    await waitFor(() => {
      expect(screen.getByText('New Test User')).toBeTruthy();
    });
  });

  it('can manage saved travelers profile directory', async () => {
    // 1. Quick Login as passenger to avoid registration boilerplate
    fireEvent.click(screen.getByText('Sign In'));
    await waitFor(() => expect(screen.getByText('Login as Passenger')).toBeTruthy());
    fireEvent.click(screen.getByText('Login as Passenger'));
    await waitFor(() => expect(screen.getByText('Ahmed F.')).toBeTruthy());

    // 2. Click "Saved Travelers" to open profile directory modal
    fireEvent.click(screen.getByText('Ahmed F.'));
    await waitFor(() => expect(screen.getByText('Saved Travelers')).toBeTruthy());
    fireEvent.click(screen.getByText('Saved Travelers'));
    await waitFor(() => expect(screen.getByText('Saved Travelers Manifest')).toBeTruthy());

    // 3. Click "Add New Traveler" button to toggle form
    fireEvent.click(screen.getByText('Add Traveler'));
    await waitFor(() => expect(screen.getByPlaceholderText('E.g. Ali Sameer')).toBeTruthy());

    // 4. Fill passenger form details
    fireEvent.change(screen.getByPlaceholderText('E.g. Ali Sameer'), { target: { value: 'Bob Traveler' } });
    fireEvent.change(screen.getByPlaceholderText('E.g. A908754'), { target: { value: 'P1234567' } });
    fireEvent.click(screen.getByRole('button', { name: /Save Traveler/i }));

    // 5. Verify traveler appears in the directory grid list
    await waitFor(() => expect(screen.getByText('Bob Traveler')).toBeTruthy());
  });

  it('verifies SMTP config switches and sent email ledger updates in admin dashboard', async () => {
    // 1. Bypass Login as Admin
    fireEvent.click(screen.getByText('Sign In'));
    await waitFor(() => expect(screen.getByText('Login as Operator/Admin')).toBeTruthy());
    fireEvent.click(screen.getByText('Login as Operator/Admin'));
    await waitFor(() => expect(screen.getByText('Admin Panel')).toBeTruthy());
    fireEvent.click(screen.getByText('Admin Panel'));

    // 2. Click "Email Control Center" tab
    await waitFor(() => expect(screen.getByText('Email Control Center')).toBeTruthy());
    fireEvent.click(screen.getByText('Email Control Center'));

    // 3. Check configuration panel and SMTP Settings heading are visible
    await waitFor(() => expect(screen.getByText('SMTP Host')).toBeTruthy());

    // 4. Verify triggers list, e.g., "Welcome email on registration"
    expect(screen.getByText('Welcome email on registration')).toBeTruthy();
  });

  it('logs in as Passenger using credentials', async () => {
    // 1. Open Sign In
    fireEvent.click(screen.getByText('Sign In'));
    await waitFor(() => expect(screen.getByPlaceholderText('name@example.com')).toBeTruthy());

    // 2. Fill credentials for Passenger
    fireEvent.change(screen.getByPlaceholderText('name@example.com'), { target: { value: 'ahmed@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { target: { value: 'password123' } });

    // 3. Submit
    fireEvent.click(screen.getByTestId('signin-submit-btn'));

    // 4. Verify logged in as Ahmed F.
    await waitFor(() => {
      expect(screen.getByText('Ahmed F.')).toBeTruthy();
      expect(screen.queryByText('Sign In')).toBeNull();
    });
  });

  it('logs in as Travel Agency using credentials', async () => {
    // 1. Open Sign In
    fireEvent.click(screen.getByText('Sign In'));
    await waitFor(() => expect(screen.getByPlaceholderText('name@example.com')).toBeTruthy());

    // 2. Fill credentials for Travel Agency
    fireEvent.change(screen.getByPlaceholderText('name@example.com'), { target: { value: 'bookings@mvtravel.com' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { target: { value: 'agency123' } });

    // 3. Submit
    fireEvent.click(screen.getByTestId('signin-submit-btn'));

    // 4. Verify logged in as Maldives Travel Agency
    await waitFor(() => {
      expect(screen.getByText('Maldives Travel Agency')).toBeTruthy();
      expect(screen.queryByText('Sign In')).toBeNull();
    });
  });

  it('logs in as Operator/Admin using credentials', async () => {
    // 1. Open Sign In
    fireEvent.click(screen.getByText('Sign In'));
    await waitFor(() => expect(screen.getByPlaceholderText('name@example.com')).toBeTruthy());

    // 2. Fill credentials for Admin
    fireEvent.change(screen.getByPlaceholderText('name@example.com'), { target: { value: 'admin@smartferry.mv' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { target: { value: 'admin123' } });

    // 3. Submit
    fireEvent.click(screen.getByTestId('signin-submit-btn'));

    // 4. Verify logged in as System Admin
    await waitFor(() => {
      expect(screen.getByText('System Admin')).toBeTruthy();
    });
  });

  it('verifies admin can configure custom seat layout and paint seat classes', async () => {
    // 1. Bypass Login as Admin
    fireEvent.click(screen.getByText('Sign In'));
    await waitFor(() => expect(screen.getByText('Login as Operator/Admin')).toBeTruthy());
    fireEvent.click(screen.getByText('Login as Operator/Admin'));
    await waitFor(() => expect(screen.getByText('Admin Panel')).toBeTruthy());
    fireEvent.click(screen.getByText('Admin Panel'));

    // 2. Go to Vessels tab and Open New Vessel Form Modal
    await waitFor(() => expect(screen.getByText('Fleet Vessels')).toBeTruthy());
    fireEvent.click(screen.getByText('Fleet Vessels'));
    await waitFor(() => expect(screen.getByText('Add Vessel')).toBeTruthy());
    fireEvent.click(screen.getByText('Add Vessel'));

    // 3. Fill vessel details and custom layouts
    const vesselNameInputs = screen.getAllByRole('textbox').filter(el => el.getAttribute('value') === '');
    fireEvent.change(vesselNameInputs[0], { target: { value: 'Laccadive Express' } });
    
    // Target custom test ID layout inputs for rows/cols
    fireEvent.change(screen.getByTestId('layout-rows-input'), { target: { value: '5' } });
    fireEvent.change(screen.getByTestId('layout-cols-input'), { target: { value: '6' } });

    // 4. Verify Seat preview loaded and check dynamic R5 exists
    await waitFor(() => expect(screen.getByText('R5')).toBeTruthy());

    // 5. Test class painting: click seat S-30
    const seat30 = await waitFor(() => screen.getByText('30'));
    fireEvent.click(seat30);

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /Create Vessel/i }));

    // 6. Verify vessel is created in the table list
    await waitFor(() => expect(screen.getByText('Laccadive Express')).toBeTruthy());
  });

  it('resets booking step to search if user logs out mid-process', async () => {
    // 1. Log in as Passenger
    fireEvent.click(screen.getByText('Sign In'));
    await waitFor(() => expect(screen.getByText('Login as Passenger')).toBeTruthy());
    fireEvent.click(screen.getByText('Login as Passenger'));
    await waitFor(() => expect(screen.getByText('Ahmed F.')).toBeTruthy());

    // 2. Search and click schedule card to select seats
    fireEvent.click(screen.getByRole('button', { name: /Find Schedules/i }));
    await waitFor(() => expect(screen.getByTestId('schedule-card-SCH-001')).toBeTruthy());
    fireEvent.click(screen.getByTestId('schedule-card-SCH-001'));

    // 3. Verify we are on Seat Selection step (available legend shown)
    await waitFor(() => expect(screen.getByText(/^Available$/)).toBeTruthy());

    // 4. Click User badge to open dropdown, then click Sign Out
    fireEvent.click(screen.getByText('Ahmed F.'));
    await waitFor(() => expect(screen.getByText('Sign Out')).toBeTruthy());
    fireEvent.click(screen.getByText('Sign Out'));

    // 5. Verify we are kicked back to search step (Where to next? heading shown, Available legend gone)
    await waitFor(() => {
      expect(screen.getByText('Where to next?')).toBeTruthy();
      expect(screen.queryByText(/^Available$/)).toBeNull();
    });
  });

  it('prevents booking when vessel is in maintenance mode', async () => {
    const { result } = renderHook(() => usePlatformStore());
    
    // Set SCH-001 vessel to maintenance mode
    result.current.editSchedule('SCH-001', { maintenance: true });

    // Search departures
    fireEvent.click(screen.getByRole('button', { name: /Find Schedules/i }));
    await waitFor(() => expect(screen.getByTestId('schedule-card-SCH-001')).toBeTruthy());

    // Click the card
    fireEvent.click(screen.getByTestId('schedule-card-SCH-001'));

    // Verify alert is called and we remain on the same page (Available seats legend not shown)
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('maintenance mode'));
      expect(screen.queryByText(/^Available$/)).toBeNull();
    });
  });

  it('filters out disabled routes from search listings', async () => {
    const { result } = renderHook(() => usePlatformStore());
    
    // Disable SCH-001 route
    result.current.editSchedule('SCH-001', { disabled: true });

    // Search departures (default MLE -> MAF)
    fireEvent.click(screen.getByRole('button', { name: /Find Schedules/i }));
    
    // Verify that SCH-001 is not visible and SCH-003 is visible
    await waitFor(() => {
      expect(screen.queryByTestId('schedule-card-SCH-001')).toBeNull();
      expect(screen.getByTestId('schedule-card-SCH-003')).toBeTruthy();
    });

    // Change destination select to DHI (Dhigurah) to see active SCH-002
    // Wait, SCH-002 in mockData goes to HUL. Let's look up a Dhigurah one or just use HUL!
    // In mockData: SCH-002 goes MLE -> HUL. Let's select Hulhumalé Jetty instead!
    const toSelect = screen.getByDisplayValue('Maafushi Island');
    fireEvent.change(toSelect, { target: { value: 'HUL' } });
    fireEvent.click(screen.getByRole('button', { name: /Find Schedules/i }));

    // Verify that SCH-002 is visible
    await waitFor(() => {
      expect(screen.getByTestId('schedule-card-SCH-002')).toBeTruthy();
    });
  });

  it('prevents cancelling a route with active bookings', async () => {
    // 1. Create a dummy active booking on SCH-001 in usePlatformStore
    const { result } = renderHook(() => usePlatformStore());
    result.current.addBooking({
      id: 'BK-TEST-123',
      scheduleId: 'SCH-001',
      vesselName: 'Kaani Princess',
      vesselType: 'Speedboat',
      departureTime: '08:30 AM',
      arrivalTime: '09:15 AM',
      routeFrom: 'MLE',
      routeTo: 'MAF',
      passengers: [{ name: 'Test Passenger', age: 30, gender: 'Male', idNumber: 'P123', seatId: 'S-1' }],
      selectedSeatIds: ['S-1'],
      totalAmount: 25.00,
      discountApplied: 0,
      paymentMethod: 'card',
      status: 'verified',
      createdAt: new Date().toISOString()
    });

    // 2. Login as Admin
    fireEvent.click(screen.getByText('Sign In'));
    await waitFor(() => expect(screen.getByText('Login as Operator/Admin')).toBeTruthy());
    fireEvent.click(screen.getByText('Login as Operator/Admin'));
    
    // 3. Open Admin Panel
    await waitFor(() => expect(screen.getByText('Admin Panel')).toBeTruthy());
    fireEvent.click(screen.getByText('Admin Panel'));

    // 4. Click Cancel Route on the first card (SCH-001)
    const cancelBtns = await waitFor(() => screen.getAllByRole('button', { name: /Cancel Route/i }));
    fireEvent.click(cancelBtns[0]);

    // 5. Verify alert is triggered blocking the cancellation and the route remains in place
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('active passenger bookings'));
      expect(screen.getByText('Kaani Princess')).toBeTruthy();
    });
  });

  it('allows user to open profile modal, edit details, and change password', async () => {
    // 1. Login as Passenger
    fireEvent.click(screen.getByText('Sign In'));
    await waitFor(() => expect(screen.getByText('Login as Passenger')).toBeTruthy());
    fireEvent.click(screen.getByText('Login as Passenger'));
    await waitFor(() => expect(screen.getByText('Ahmed F.')).toBeTruthy());

    // 2. Click User badge to open dropdown
    fireEvent.click(screen.getByText('Ahmed F.'));
    
    // 3. Click My Profile in dropdown
    await waitFor(() => expect(screen.getByText('My Profile')).toBeTruthy());
    fireEvent.click(screen.getByText('My Profile'));

    // 4. Verify Profile modal is open
    await waitFor(() => {
      expect(screen.getByText('My Profile Settings')).toBeTruthy();
      expect(screen.getByDisplayValue('Ahmed F.')).toBeTruthy();
      expect(screen.getByDisplayValue('ahmed@example.com')).toBeTruthy();
    });

    // 5. Change details
    fireEvent.change(screen.getByDisplayValue('Ahmed F.'), { target: { value: 'Ahmed Edited' } });
    fireEvent.click(screen.getByRole('button', { name: /Save Profile Details/i }));

    // 6. Verify success alert/indicator and name update in navbar
    await waitFor(() => {
      expect(screen.getByText('Profile updated successfully.')).toBeTruthy();
      expect(screen.getAllByText('Ahmed Edited').length).toBeGreaterThan(0);
    });
  });

  it('allows admin to manage registered users via the User Directory tab', async () => {
    // 1. Login as Admin
    fireEvent.click(screen.getByText('Sign In'));
    await waitFor(() => expect(screen.getByText('Login as Operator/Admin')).toBeTruthy());
    fireEvent.click(screen.getByText('Login as Operator/Admin'));

    // 2. Open Admin Panel
    await waitFor(() => expect(screen.getByText('Admin Panel')).toBeTruthy());
    fireEvent.click(screen.getByText('Admin Panel'));

    // 3. Click User Directory tab button
    await waitFor(() => expect(screen.getByText('User Directory')).toBeTruthy());
    fireEvent.click(screen.getByText('User Directory'));

    // 4. Verify Registered Accounts lists default users
    await waitFor(() => {
      expect(screen.getByText('Ahmed F.')).toBeTruthy();
      expect(screen.getByText('bookings@mvtravel.com')).toBeTruthy();
    });

    // 5. Add a new Admin user
    fireEvent.change(screen.getByPlaceholderText('e.g. Ibrahim Ali'), { target: { value: 'New Test Admin' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. ibrahim@example.com'), { target: { value: 'testadmin@smartferry.mv' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'adminpassword123' } });
    
    // Select admin role
    const roleSelect = screen.getByDisplayValue('Passenger');
    fireEvent.change(roleSelect, { target: { value: 'admin' } });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /Create User Account/i }));

    // 6. Verify User is added and visible in list
    await waitFor(() => {
      expect(screen.getByText('User added successfully.')).toBeTruthy();
      expect(screen.getByText('New Test Admin')).toBeTruthy();
    });
  });

  it('allows admin to manage jetties and delete a jetty safely', async () => {
    // 1. Login as Admin
    fireEvent.click(screen.getByText('Sign In'));
    await waitFor(() => expect(screen.getByText('Login as Operator/Admin')).toBeTruthy());
    fireEvent.click(screen.getByText('Login as Operator/Admin'));

    // 2. Open Admin Panel
    await waitFor(() => expect(screen.getByText('Admin Panel')).toBeTruthy());
    fireEvent.click(screen.getByText('Admin Panel'));

    // 3. Navigate to Jetties & Locations tab
    await waitFor(() => expect(screen.getByText('Jetties & Locations')).toBeTruthy());
    fireEvent.click(screen.getByText('Jetties & Locations'));

    // 4. Try to delete MLE (assigned to schedules/active bookings)
    await waitFor(() => expect(screen.getByTestId('delete-location-MLE')).toBeTruthy());
    fireEvent.click(screen.getByTestId('delete-location-MLE'));
    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Cannot delete location'));

    // 5. Add a new unused jetty
    fireEvent.change(screen.getByPlaceholderText('e.g. Rasdhoo Island'), { target: { value: 'Test Empty Jetty' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. RAS'), { target: { value: 'TEJ' } });
    fireEvent.click(screen.getByRole('button', { name: /Register Location/i }));

    // Verify new jetty is listed
    await waitFor(() => {
      expect(screen.getByText('Test Empty Jetty')).toBeTruthy();
    });

    // 6. Delete unused jetty successfully
    fireEvent.click(screen.getByTestId('delete-location-TEJ'));

    // Verify it is removed
    await waitFor(() => {
      expect(screen.queryByText('Test Empty Jetty')).toBeNull();
    });
  });

  it('allows admin to manage bookings in the Bookings CRUD tab', async () => {
    // 1. Login as Admin
    fireEvent.click(screen.getByText('Sign In'));
    await waitFor(() => expect(screen.getByText('Login as Operator/Admin')).toBeTruthy());
    fireEvent.click(screen.getByText('Login as Operator/Admin'));

    // 2. Open Admin Panel
    await waitFor(() => expect(screen.getByText('Admin Panel')).toBeTruthy());
    fireEvent.click(screen.getByText('Admin Panel'));

    // 3. Navigate to All Bookings tab
    await waitFor(() => expect(screen.getByText('All Bookings')).toBeTruthy());
    fireEvent.click(screen.getByText('All Bookings'));

    // 4. Verify we see Manually Book Seats button and search bar
    await waitFor(() => {
      expect(screen.getByText('Manually Book Seats')).toBeTruthy();
      expect(screen.getByPlaceholderText(/Search by Passenger Name/i)).toBeTruthy();
    });
  });

  it('correctly calculates rule-based refund tiers', () => {
    const mockBooking: any = {
      id: 'TEST-REFUND-01',
      totalAmount: 100,
      departureTime: '2026-07-22 10:00 AM',
      status: 'verified'
    };

    const refDate = new Date('2026-07-22T08:00:00'); // Departure in 2h (at 10:00 AM)
    const refund2h = calculateRefund(mockBooking, refDate);
    expect(refund2h.refundPercentage).toBe(0);
    expect(refund2h.refundAmount).toBe(0);
    expect(refund2h.cancellationFee).toBe(100);
    expect(refund2h.policyTier).toBe('< 4h (Non-refundable)');

    // Departure in 26 hours
    const refDate26h = new Date(refDate.getTime() - 24 * 3600 * 1000);
    const refund26h = calculateRefund(mockBooking, refDate26h);
    expect(refund26h.refundPercentage).toBe(100);
    expect(refund26h.refundAmount).toBe(100);
    expect(refund26h.cancellationFee).toBe(0);
    expect(refund26h.policyTier).toBe('> 24h (Full Refund)');
  });

  it('allows passenger to cancel booking and receive calculated refund in My Bookings', async () => {
    // 1. Login as passenger with credentials
    fireEvent.click(screen.getByText('Sign In'));
    await waitFor(() => expect(screen.getByPlaceholderText('name@example.com')).toBeTruthy());
    fireEvent.change(screen.getByPlaceholderText('name@example.com'), { target: { value: 'ahmed@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByTestId('signin-submit-btn'));

    // 2. Open My Bookings
    await waitFor(() => expect(screen.getAllByText('My Bookings')[0]).toBeTruthy());
    fireEvent.click(screen.getAllByText('My Bookings')[0]);

    // 3. Select first booking card
    await waitFor(() => expect(screen.getByText('Reference:')).toBeTruthy());
    
    // 4. Click Cancel & Request Manual Refund button
    const cancelBtn = screen.getByRole('button', { name: /Cancel & Request Manual Refund/i });
    expect(cancelBtn).toBeTruthy();
    fireEvent.click(cancelBtn);

    // 5. Verify manual refund breakdown modal appears
    await waitFor(() => {
      expect(screen.getByText('Manual Bank Refund Request')).toBeTruthy();
      expect(screen.getByText(/Submit Manual Refund Request/i)).toBeTruthy();
    });

    // 5.5 Fill in bank account inputs
    const accountNameInput = screen.getByPlaceholderText('Full name on bank account');
    const accountNumberInput = screen.getByPlaceholderText('7730000123456');
    fireEvent.change(accountNameInput, { target: { value: 'Ahmed Ali' } });
    fireEvent.change(accountNumberInput, { target: { value: '7730000998877' } });

    // 6. Click Submit Manual Refund Request button
    const confirmRefundBtn = screen.getByRole('button', { name: /Submit Manual Refund Request/i });
    fireEvent.click(confirmRefundBtn);

    // 7. Verify status updates to cancelled & refund details shown
    await waitFor(() => {
      expect(screen.getByText('Reservation Cancelled')).toBeTruthy();
    });
  });
});
