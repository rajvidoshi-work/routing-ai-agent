import axios from 'axios';

// Use environment variable for API base URL, fallback to localhost for development
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Enhanced Types for Complete Integration
export interface Patient {
  patient_id: string;
  name: string;
  primary_diagnosis: string;
  skilled_nursing_needed: string;
  equipment_needed: string;
  medication: string;
  insurance_coverage_status: string;
  gender?: string;
  age?: number;
  mrn?: string;
  address?: string;
  phone?: string;
  allergies?: string;
  prescriber_name?: string;
  nursing_visit_frequency?: string;
  type_of_nursing_care?: string;
}

export interface DataStatus {
  total_patients: number;
  data_directory: string;
  patients: Array<{
    id: string;
    name: string;
    diagnosis: string;
  }>;
  status: string;
  available_files: FileInfo[];
}

export interface FileInfo {
  filename: string;
  size: number;
  modified: string;
  path: string;
}

export interface CaregiverInput {
  patient_id: string;
  urgency_level: 'low' | 'medium' | 'high';
  primary_concern: string;
  requested_services: string[];
  additional_notes?: string;
}

export interface PatientData {
  patient_id: string;
  name: string;
  gender: string;
  primary_icu_diagnosis: string;
  secondary_diagnoses?: string;
  age?: number;
  mrn?: string;
  address?: string;
  phone?: string;
  allergies?: string;
  medication?: string;
  skilled_nursing_needed?: string;
  equipment_needed?: string;
  insurance_coverage_status?: string;
}

export interface RoutingRequest {
  patient_data: PatientData;
  caregiver_input: CaregiverInput;
}

export interface RoutingDecision {
  patient_id: string;
  recommended_agents: string[];
  reasoning: string;
  priority_score: number;
  estimated_timeline: string;
}

export interface AgentResponse {
  agent_type: string;
  recommendations: string[];
  next_steps: string[];
  forms: any[];
  external_referrals: string[];
  priority_level?: string;
  estimated_completion_time?: string;
}

export interface CompleteCase {
  routing_decision: RoutingDecision;
  agent_responses: AgentResponse[];
}

export interface AgentProcessingStatus {
  agent_type: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress?: number;
  message?: string;
}

// Enhanced API Functions with Full Backend Integration
export const dataAPI = {
  // Data Management
  getDataStatus: (): Promise<DataStatus> => 
    api.get('/data-status').then(res => res.data),
  
  getAvailableFiles: (): Promise<{ data_directory: string; files: FileInfo[] }> => 
    api.get('/available-files').then(res => res.data),
  
  loadFile: (filename: string): Promise<{ message: string; patient_count: number; filename: string }> => 
    api.post(`/load-file/${filename}`).then(res => res.data),
  
  refreshData: (): Promise<{ message: string; patient_count: number }> => 
    api.post('/refresh-data').then(res => res.data),
  
  setDataDirectory: (directory_path: string): Promise<{ message: string; directory: string }> =>
    api.post('/set-data-directory', { directory_path }).then(res => res.data),
  
  getPatients: (): Promise<{ patients: Patient[]; total: number }> => 
    api.get('/patients').then(res => res.data),
  
  getSampleData: (): Promise<any> => 
    api.get('/sample-data').then(res => res.data),
};

export const routingAPI = {
  // Core Routing Agent Functionality
  routePatient: (request: RoutingRequest): Promise<RoutingDecision> => 
    api.post('/route-patient', request).then(res => res.data),
  
  processCompleteCase: (request: RoutingRequest): Promise<CompleteCase> => 
    api.post('/process-complete-case', request).then(res => res.data),
  
  // Individual Agent Processing
  processNursingAgent: (request: RoutingRequest): Promise<AgentResponse> => 
    api.post('/process-nursing-agent', request).then(res => res.data),
  
  processDMEAgent: (request: RoutingRequest): Promise<AgentResponse> => 
    api.post('/process-dme-agent', request).then(res => res.data),
  
  processPharmacyAgent: (request: RoutingRequest): Promise<AgentResponse> => 
    api.post('/process-pharmacy-agent', request).then(res => res.data),
  
  processStateAgent: (request: RoutingRequest): Promise<AgentResponse> => 
    api.post('/process-state-agent', request).then(res => res.data),
};

// Utility Functions for Agent Integration
export const agentUtils = {
  getAgentDisplayName: (agentType: string): string => {
    const names: { [key: string]: string } = {
      'nursing': 'Home Health Nursing',
      'dme': 'Durable Medical Equipment',
      'pharmacy': 'Pharmacy Coordination',
      'state': 'Insurance & State Programs'
    };
    return names[agentType.toLowerCase()] || agentType.toUpperCase();
  },

  getAgentIcon: (agentType: string): string => {
    const icons: { [key: string]: string } = {
      'nursing': 'fas fa-user-nurse',
      'dme': 'fas fa-wheelchair',
      'pharmacy': 'fas fa-pills',
      'state': 'fas fa-file-medical'
    };
    return icons[agentType.toLowerCase()] || 'fas fa-user-cog';
  },

  getAgentColor: (agentType: string): string => {
    const colors: { [key: string]: string } = {
      'nursing': '#28a745',
      'dme': '#ffc107',
      'pharmacy': '#dc3545',
      'state': '#6f42c1'
    };
    return colors[agentType.toLowerCase()] || '#007bff';
  },

  getPriorityVariant: (score: number): 'success' | 'warning' | 'danger' => {
    if (score >= 8) return 'danger';
    if (score >= 6) return 'warning';
    return 'success';
  },

  getUrgencyColor: (urgency: string): string => {
    const colors: { [key: string]: string } = {
      'low': '#28a745',
      'medium': '#ffc107',
      'high': '#dc3545'
    };
    return colors[urgency.toLowerCase()] || '#6c757d';
  },

  formatTimeline: (timeline: string): string => {
    // Format timeline strings for better display
    return timeline.replace(/(\d+)-(\d+)\s*hours?/gi, '$1-$2 hours')
                  .replace(/within\s*(\d+)\s*hours?/gi, 'Within $1 hours')
                  .replace(/(\d+)\s*days?/gi, '$1 days');
  },

  processAgentRecommendations: (recommendations: string[]): string[] => {
    // Clean and format recommendations
    return recommendations.map(rec => 
      rec.trim()
         .replace(/^\d+\.\s*/, '') // Remove numbering
         .replace(/^-\s*/, '')     // Remove dashes
         .trim()
    ).filter(rec => rec.length > 0);
  }
};

// Error Handling Utilities
export const handleApiError = (error: any): string => {
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  }
  if (error.response?.status === 404) {
    return 'Resource not found';
  }
  if (error.response?.status === 500) {
    return 'Server error occurred';
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

// Request Interceptor for Error Handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default api;
