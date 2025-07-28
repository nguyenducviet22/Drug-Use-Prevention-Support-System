import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AppointmentBooking from '../AppointmentBooking';
import { useAuth } from '../../../hooks/useAuth';
import useFetch from '../../../hooks/useFetch';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

// Mock dependencies
jest.mock('../../../hooks/useAuth');
jest.mock('../../../hooks/useFetch');
jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(),
}));
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));
jest.mock('@fullcalendar/react', () => {
  const React = require('react');
  return {
    default: jest.fn(({ events, eventClick, eventDidMount, datesSet }) => {
      React.useEffect(() => {
        datesSet && datesSet({
          start: new Date('2025-07-21T00:00:00Z'),
          end: new Date('2025-07-28T00:00:00Z'),
        });
      }, [datesSet]);
      return (
        <div data-testid="fullcalendar">
          {events.map((event, index) => {
            const el = { style: {} }; // Mock element
            eventDidMount && eventDidMount({ event, el });
            return (
              <div
                key={event.id || index}
                data-testid={`event-${event.id}`}
                onClick={() => eventClick && eventClick({ event })}
                style={{
                  backgroundColor: event.backgroundColor,
                  borderColor: event.borderColor,
                  color: event.textColor,
                  opacity: event.extendedProps?.isPast ? 0.3 : 1,
                }}
              >
                {event.title}
              </div>
            );
          })}
        </div>
      );
    }),
  };
});
jest.mock('../../../components/BackButton', () => () => <button data-testid="back-button">Back</button>);

jest.mock('react-bootstrap', () => {
  const React = require('react');
  return {
    Container: ({ children }) => <div className="container">{children}</div>,
    Row: ({ children }) => <div className="row">{children}</div>,
    Col: ({ children, ...props }) => <div className="col" {...props}>{children}</div>,
    Card: ({ children }) => <div className="card">{children}</div>,
    CardBody: ({ children }) => <div className="card-body">{children}</div>,
    Button: ({ children, ...props }) => <button {...props}>{children}</button>,
    Form: ({ children }) => <form>{children}</form>,
    FormControl: ({ as: Tag = 'input', ...props }) => <Tag {...props} />,
    FormGroup: ({ children }) => <div className="form-group">{children}</div>,
    FormLabel: ({ children }) => <label>{children}</label>,
    Modal: ({ children, show }) => (show ? <div className="modal">{children}</div> : null),
    ModalBody: ({ children }) => <div className="modal-body">{children}</div>,
    Dropdown: ({ children, show, onToggle }) => {
      const toggle = React.Children.toArray(children).find(
        child => child.type && (child.type.displayName === 'DropdownToggle' || child.type.name === 'DropdownToggle')
      );
      const menu = React.Children.toArray(children).find(
        child => child.type && (child.type.displayName === 'DropdownMenu' || child.type.name === 'DropdownMenu')
      );
      return (
        <div className="dropdown" data-testid="dropdown">
          {toggle && React.cloneElement(toggle, { onClick: () => onToggle && onToggle(!show) })}
          {show && menu && React.cloneElement(menu, { show })}
        </div>
      );
    },
    DropdownToggle: ({ children, onClick }) => (
      <button className="dropdown-toggle" data-testid="dropdown-toggle" onClick={onClick}>
        {children}
      </button>
    ),
    DropdownMenu: ({ children, show }) => (
      show ? <div className="dropdown-menu" data-testid="dropdown-menu">{children}</div> : null
    ),
  };
});

describe('AppointmentBooking Component', () => {
  const mockUser = { username: 'testuser' };
  const mockConsultants = [
    { username: 'consultant1', color: '#ff0000' },
    { username: 'consultant2', color: '#00ff00' },
  ];
  const mockT = jest.fn((key) => key);

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(new Date('2025-07-21T00:00:00Z'));
    useAuth.mockReturnValue({ user: mockUser });
    useTranslation.mockReturnValue({ t: mockT });
    useFetch
      .mockReturnValueOnce({
        loading: false,
        error: null,
        get: jest.fn().mockResolvedValue(mockConsultants),
      })
      .mockReturnValue({
        loading: false,
        error: null,
        get: jest.fn().mockResolvedValue([]),
        post: jest.fn(),
        put: jest.fn(),
      });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('renders AppointmentBooking component with consultant dropdown and calendar placeholder', async () => {
    render(<AppointmentBooking />);
    await waitFor(() => {
      expect(screen.getByText('header.title')).toBeInTheDocument();
      expect(screen.getByText('header.subtitle')).toBeInTheDocument();
      expect(screen.getByTestId('dropdown-toggle')).toBeInTheDocument();
      expect(screen.getByText('calendarSection.placeholderText')).toBeInTheDocument();
      expect(screen.getByTestId('back-button')).toBeInTheDocument();
    });
  });

  test('selects a consultant from the dropdown', async () => {
    render(<AppointmentBooking />);
    await waitFor(() => {
      expect(screen.getByTestId('dropdown-toggle')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByTestId('dropdown-toggle'));
    await waitFor(() => {
      const consultantItem = screen.getByText((content, element) => {
        return element?.className.includes('consultant-name') && content === 'consultant1';
      });
      userEvent.click(consultantItem);
    });
    await waitFor(() => {
      expect(screen.getByText('consultant1')).toBeInTheDocument();
    });
  });

  test('selects an available time slot and updates UI', async () => {
    useFetch
      .mockReturnValueOnce({
        loading: false,
        error: null,
        get: jest.fn().mockResolvedValue(mockConsultants),
      })
      .mockReturnValueOnce({
        loading: false,
        error: null,
        get: jest.fn().mockResolvedValue([]),
      })
      .mockReturnValueOnce({
        loading: false,
        error: null,
        get: jest.fn().mockResolvedValue([]),
      })
      .mockReturnValueOnce({
        loading: false,
        error: null,
        get: jest.fn().mockResolvedValue(['2025-07-22T09:00:00Z']),
      });

    render(<AppointmentBooking />);
    await userEvent.click(screen.getByTestId('dropdown-toggle'));
    await waitFor(() => {
      const consultantItem = screen.getByText((content, element) => {
        return element?.className.includes('consultant-name') && content === 'consultant1';
      });
      userEvent.click(consultantItem);
    });

    const mockEvent = {
      id: 'consultant1-available-2025-07-22T09:00:00Z',
      start: new Date('2025-07-22T09:00:00Z'),
      end: new Date('2025-07-22T10:00:00Z'),
      extendedProps: {
        consultantID: 'consultant1',
        type: 'available',
        isPast: false,
        originalTime: '2025-07-22T09:00:00Z',
      },
      setProp: jest.fn(),
    };
    const fullCalendarMockInstance = require('@fullcalendar/react').default.mock.calls[0][0];
    fullCalendarMockInstance.eventClick({ event: mockEvent });

    await waitFor(() => {
      expect(screen.getByText('appointmentInformation.cardTitle')).toBeInTheDocument();
      expect(screen.getByText('consultant1')).toBeInTheDocument();
      expect(screen.getByText(/Tuesday, July 22, 2025/)).toBeInTheDocument();
      expect(screen.getByText('9:00 AM')).toBeInTheDocument();
      const eventElement = screen.getByTestId(`event-${mockEvent.id}`);
      expect(eventElement).toHaveStyle({ backgroundColor: '#4285f4' });
    });
  });

  test('confirms a booking and calls API', async () => {
    const mockPost = jest.fn().mockResolvedValue({ success: true });
    useFetch
      .mockReturnValueOnce({
        loading: false,
        error: null,
        get: jest.fn().mockResolvedValue(mockConsultants),
      })
      .mockReturnValue({
        loading: false,
        error: null,
        get: jest.fn().mockResolvedValue([]),
        post: mockPost,
        put: jest.fn(),
      });

    render(<AppointmentBooking />);
    await userEvent.click(screen.getByTestId('dropdown-toggle'));
    await waitFor(() => {
      const consultantItem = screen.getByText((content, element) => {
        return element?.className.includes('consultant-name') && content === 'consultant1';
      });
      userEvent.click(consultantItem);
    });

    const mockEvent = {
      id: 'consultant1-available-2025-07-22T09:00:00Z',
      start: new Date('2025-07-22T09:00:00Z'),
      end: new Date('2025-07-22T10:00:00Z'),
      extendedProps: {
        consultantID: 'consultant1',
        type: 'available',
        isPast: false,
        originalTime: '2025-07-22T09:00:00Z',
      },
      setProp: jest.fn(),
    };
    const fullCalendarMockInstance = require('@fullcalendar/react').default.mock.calls[0][0];
    fullCalendarMockInstance.eventClick({ event: mockEvent });

    await waitFor(() => {
      const noteTextarea = screen.getByPlaceholderText('appointmentInformation.notePlaceholder');
      userEvent.type(noteTextarea, 'Test note');
      userEvent.click(screen.getByText('appointmentInformation.submitButton'));
    });

    await waitFor(() => {
      userEvent.click(screen.getByText('confirmationModal.confirmButton'));
    });

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(
        {
          consultantID: 'consultant1',
          appointmentDateTime: '2025-07-22T09:00:00Z',
          note: 'Test note',
        },
        {},
        'http://localhost:8080/api/appointment'
      );
      expect(toast.success).toHaveBeenCalledWith('calendarSection.toastMessages.bookingSuccess');
    });
  });

  test('cancels a scheduled appointment', async () => {
    const mockPut = jest.fn().mockResolvedValue({ success: true });
    useFetch
      .mockReturnValueOnce({
        loading: false,
        error: null,
        get: jest.fn().mockResolvedValue(mockConsultants),
      })
      .mockReturnValueOnce({
        loading: false,
        error: null,
        get: jest.fn().mockResolvedValue(['2025-07-22T09:00:00Z']),
      })
      .mockReturnValueOnce({
        loading: false,
        error: null,
        get: jest.fn().mockResolvedValue([]),
      })
      .mockReturnValueOnce({
        loading: false,
        error: null,
        get: jest.fn().mockResolvedValue([]),
      })
      .mockReturnValue({
        loading: false,
        error: null,
        put: mockPut,
      });

    render(<AppointmentBooking />);
    await userEvent.click(screen.getByTestId('dropdown-toggle'));
    await waitFor(() => {
      const consultantItem = screen.getByText((content, element) => {
        return element?.className.includes('consultant-name') && content === 'consultant1';
      });
      userEvent.click(consultantItem);
    });

    const mockEvent = {
      id: 'testuser-scheduled-2025-07-22T09:00:00Z',
      start: new Date('2025-07-22T09:00:00Z'),
      end: new Date('2025-07-22T10:00:00Z'),
      extendedProps: {
        consultantID: 'consultant1',
        type: 'scheduled',
        isPast: false,
        originalTime: '2025-07-22T09:00:00Z',
      },
      setProp: jest.fn(),
    };
    const fullCalendarMockInstance = require('@fullcalendar/react').default.mock.calls[0][0];
    fullCalendarMockInstance.eventClick({ event: mockEvent });

    await waitFor(() => {
      expect(screen.getByText('cancellationModal.title')).toBeInTheDocument();
      expect(screen.getByText(/Tuesday, July 22, 2025/)).toBeInTheDocument();
      expect(screen.getByText('9:00 AM')).toBeInTheDocument();
    });

    const reasonTextarea = screen.getByPlaceholderText('cancellationModal.reasonPlaceholder');
    await userEvent.type(reasonTextarea, 'No longer needed');
    await userEvent.click(screen.getByText('cancellationModal.confirmCancellationButton'));

    await waitFor(() => {
      expect(mockPut).toHaveBeenCalledWith(
        {
          appointmentDateTime: '2025-07-22T09:00:00Z',
          notes: 'No longer needed',
          status: 'CANCELLED',
        },
        {},
        'http://localhost:8080/api/appointment/cancel/CANCELLED'
      );
      expect(toast.success).toBeCalledWith('toasts.cancellationSuccess');
    });
  });
});