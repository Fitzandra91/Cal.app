import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('renders calculator display with 0 on load', () => {
  render(<App />);
  expect(screen.getByTestId('display')).toHaveTextContent('0');
});

test('clicking a digit updates the display', () => {
  render(<App />);
  fireEvent.click(screen.getByText('5'));
  expect(screen.getByTestId('display')).toHaveTextContent('5');
});

test('addition: 3 + 4 = 7', () => {
  render(<App />);
  fireEvent.click(screen.getByText('3'));
  fireEvent.click(screen.getByText('+'));
  fireEvent.click(screen.getByText('4'));
  fireEvent.click(screen.getByText('='));
  expect(screen.getByTestId('display')).toHaveTextContent('7');
});

test('subtraction: 9 − 3 = 6', () => {
  render(<App />);
  fireEvent.click(screen.getByText('9'));
  fireEvent.click(screen.getByLabelText('−'));
  fireEvent.click(screen.getByText('3'));
  fireEvent.click(screen.getByText('='));
  expect(screen.getByTestId('display')).toHaveTextContent('6');
});

test('after equals, pressing a digit starts a new number', () => {
  render(<App />);
  fireEvent.click(screen.getByText('3'));
  fireEvent.click(screen.getByText('+'));
  fireEvent.click(screen.getByText('4'));
  fireEvent.click(screen.getByText('='));
  fireEvent.click(screen.getByText('5'));
  expect(screen.getByTestId('display')).toHaveTextContent('5');
});

test('AC clears the display', () => {
  render(<App />);
  fireEvent.click(screen.getByText('9'));
  fireEvent.click(screen.getByText('AC'));
  expect(screen.getByTestId('display')).toHaveTextContent('0');
});
