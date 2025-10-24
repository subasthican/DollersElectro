import api from './api';

// Employee interface
export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  role: 'employee';
  department: string;
  position: string;
  employeeId: string;
  hireDate: string;
  salary?: number;
  isActive: boolean;
  isTemporaryPassword: boolean;
}

// Create employee data interface
export interface CreateEmployeeData {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  department: string;
  position: string;
  salary?: number;
}

// Update employee data interface
export interface UpdateEmployeeData {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  department: string;
  position: string;
  salary?: number;
  isActive: boolean;
}

// API response interfaces
export interface EmployeeResponse {
  success: boolean;
  message?: string;
  data: {
    employees?: Employee[];
    employee?: Employee;
    temporaryPassword?: string;
    total?: number;
  };
}

// API functions
export const employeesAPI = {
  // Get all employees
  getEmployees: async (): Promise<EmployeeResponse> => {
    const response = await api.get('/admin/employees');
    return response.data;
  },

  // Create new employee
  createEmployee: async (data: CreateEmployeeData): Promise<EmployeeResponse> => {
    const response = await api.post('/admin/employees', data);
    return response.data;
  },

  // Update employee
  updateEmployee: async (id: string, data: UpdateEmployeeData): Promise<EmployeeResponse> => {
    const response = await api.put(`/admin/employees/${id}`, data);
    return response.data;
  },

  // Delete employee (soft delete - deactivate)
  deleteEmployee: async (id: string): Promise<EmployeeResponse> => {
    const response = await api.delete(`/admin/employees/${id}`);
    return response.data;
  },

  // Toggle employee status
  toggleEmployeeStatus: async (id: string): Promise<EmployeeResponse> => {
    const response = await api.patch(`/admin/employees/${id}/status`);
    return response.data;
  }
};

// Helper functions for UI
export const employeeHelpers = {
  // Get full name
  getFullName: (employee: Employee): string => {
    return `${employee.firstName} ${employee.lastName}`;
  },

  // Get initials for avatar
  getInitials: (employee: Employee): string => {
    return `${employee.firstName[0]}${employee.lastName[0]}`;
  },

  // Format salary
  formatSalary: (salary: number | undefined | null): string => {
    if (salary === undefined || salary === null) {
      return 'N/A';
    }
    return `$${salary.toLocaleString()}`;
  },

  // Get status badge color
  getStatusColor: (isActive: boolean): { bg: string; text: string; dot: string } => {
    return isActive 
      ? { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' }
      : { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' };
  },

  // Get role badge color
  getRoleColor: (position: string): { bg: string; text: string } => {
    switch (position.toLowerCase()) {
      case 'manager':
        return { bg: 'bg-blue-100', text: 'text-blue-800' };
      case 'supervisor':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800' };
    }
  }
};
