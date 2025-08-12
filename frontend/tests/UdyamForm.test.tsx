import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UdyamForm from '../components/UdyamForm';

describe('UdyamForm', () => {
  const mockSubmit = vi.fn();

  beforeEach(() => {
    mockSubmit.mockClear();
  });

  it('validates Aadhaar number format', async () => {
    render(<UdyamForm onSubmit={mockSubmit} />);
    
    // Test invalid Aadhaar number
    const aadhaarInput = screen.getByLabelText(/aadhaar/i);
    fireEvent.change(aadhaarInput, { target: { value: '123' } });
    fireEvent.blur(aadhaarInput);
    
    expect(await screen.findByText(/12 digits/i)).toBeInTheDocument();
    
    // Test valid Aadhaar number
    fireEvent.change(aadhaarInput, { target: { value: '123456789012' } });
    fireEvent.blur(aadhaarInput);
    
    await waitFor(() => {
      expect(screen.queryByText(/12 digits/i)).not.toBeInTheDocument();
    });
  });

  it('validates PAN format', async () => {
    render(<UdyamForm onSubmit={mockSubmit} />);
    
    // Test invalid PAN
    const panInput = screen.getByLabelText(/pan/i);
    fireEvent.change(panInput, { target: { value: 'ABCD123' } });
    fireEvent.blur(panInput);
    
    expect(await screen.findByText(/invalid pan format/i)).toBeInTheDocument();
    
    // Test valid PAN
    fireEvent.change(panInput, { target: { value: 'ABCDE1234F' } });
    fireEvent.blur(panInput);
    
    await waitFor(() => {
      expect(screen.queryByText(/invalid pan format/i)).not.toBeInTheDocument();
    });
  });

  it('handles empty required fields', async () => {
    render(<UdyamForm onSubmit={mockSubmit} />);
    
    // Try to submit without filling required fields
    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);
    
    expect(await screen.findByText(/aadhaar.*required/i)).toBeInTheDocument();
    expect(await screen.findByText(/pan.*required/i)).toBeInTheDocument();
  });

  it('displays loading state during submission', async () => {
    mockSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    render(<UdyamForm onSubmit={mockSubmit} />);
    
    // Fill required fields
    fireEvent.change(screen.getByLabelText(/aadhaar/i), { 
      target: { value: '123456789012' } 
    });
    fireEvent.change(screen.getByLabelText(/pan/i), { 
      target: { value: 'ABCDE1234F' } 
    });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    expect(await screen.findByText(/processing/i)).toBeInTheDocument();
  });

  it('handles server errors gracefully', async () => {
    mockSubmit.mockRejectedValue(new Error('Server error'));
    render(<UdyamForm onSubmit={mockSubmit} />);
    
    // Fill and submit form
    fireEvent.change(screen.getByLabelText(/aadhaar/i), { 
      target: { value: '123456789012' } 
    });
    fireEvent.change(screen.getByLabelText(/pan/i), { 
      target: { value: 'ABCDE1234F' } 
    });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    expect(await screen.findByText(/error.*try again/i)).toBeInTheDocument();
  });
});
