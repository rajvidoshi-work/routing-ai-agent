"""
Enhanced Nursing Agent with RAG-based nurse recommendations.
Uses LLM to dynamically match patients with nurses based on comprehensive profiles.
"""

import pandas as pd
import numpy as np
import json
import os
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime, timedelta
import logging
from pathlib import Path
import google.generativeai as genai
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pickle
from dotenv import load_dotenv

# Load environment variables
# Load environment variables (optional for production)
try:
    load_dotenv()
except Exception as e:
    print(f"Note: .env file not found in enhanced_nursing_agent: {e}")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class NurseProfile:
    """Structured nurse profile for recommendations."""
    nurse_id: str
    name: str
    license_type: str
    certifications: List[str]
    specialties: List[str]
    years_experience: int
    languages: List[str]
    service_area_zip: str
    coverage_radius_miles: int
    shift_preferences: List[str]
    availability_slots: str
    employment_status: str
    payer_enrollment: List[str]
    covid_vaccination_status: str
    hourly_rate: float
    profile_summary: str
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            'nurse_id': self.nurse_id,
            'name': self.name,
            'license_type': self.license_type,
            'certifications': self.certifications,
            'specialties': self.specialties,
            'years_experience': self.years_experience,
            'languages': self.languages,
            'service_area_zip': self.service_area_zip,
            'coverage_radius_miles': self.coverage_radius_miles,
            'shift_preferences': self.shift_preferences,
            'availability_slots': self.availability_slots,
            'employment_status': self.employment_status,
            'payer_enrollment': self.payer_enrollment,
            'covid_vaccination_status': self.covid_vaccination_status,
            'hourly_rate': self.hourly_rate,
            'profile_summary': self.profile_summary
        }

@dataclass
class NurseRecommendation:
    """Nurse recommendation with scoring and rationale."""
    nurse_profile: NurseProfile
    match_score: float
    rationale: str
    key_strengths: List[str]
    potential_concerns: List[str]
    availability_match: str
    distance_estimate: str

class NurseRAGSystem:
    """RAG system for nurse profile retrieval and matching."""
    
    def __init__(self, roster_path: str = "nurse_roster.csv"):
        self.roster_path = roster_path
        self.nurse_profiles: List[NurseProfile] = []
        self.vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
        self.profile_vectors = None
        self.profile_texts = []
        self.last_updated = None
        
        # Initialize Google AI
        self.ai_client = None
        self._init_ai_client()
        
        # Load and index nurse profiles
        self.refresh_nurse_data()
    
    def _init_ai_client(self):
        """Initialize Google AI client."""
        google_api_key = os.getenv("GOOGLE_AI_API_KEY")
        if google_api_key:
            try:
                genai.configure(api_key=google_api_key)
                self.ai_client = genai.GenerativeModel('gemini-1.5-flash')
                logger.info("✅ Google AI client initialized successfully")
            except Exception as e:
                logger.error(f"❌ Failed to initialize Google AI: {e}")
                self.ai_client = None
        else:
            logger.warning("⚠️ No Google AI API key found")
    
    def refresh_nurse_data(self) -> bool:
        """Refresh nurse data from CSV/Excel file."""
        try:
            # Check if file exists
            if not os.path.exists(self.roster_path):
                logger.error(f"❌ Nurse roster file not found: {self.roster_path}")
                return False
            
            # Load data
            if self.roster_path.endswith('.xlsx'):
                df = pd.read_excel(self.roster_path)
            else:
                df = pd.read_csv(self.roster_path)
            
            # Parse nurse profiles
            self.nurse_profiles = []
            self.profile_texts = []
            
            for _, row in df.iterrows():
                try:
                    # Parse list fields
                    certifications = [cert.strip() for cert in str(row['certifications']).split(',') if cert.strip()]
                    specialties = [spec.strip() for spec in str(row['specialties']).split(',') if spec.strip()]
                    languages = [lang.strip() for lang in str(row['languages']).split(',') if lang.strip()]
                    shift_preferences = [shift.strip() for shift in str(row['shift_preferences']).split(',') if shift.strip()]
                    payer_enrollment = [payer.strip() for payer in str(row['payer_enrollment']).split(',') if payer.strip()]
                    
                    # Handle coverage radius - convert 'unlimited' to large number
                    coverage_radius = row['coverage_radius_miles']
                    if str(coverage_radius).lower() == 'unlimited':
                        coverage_radius = 999
                    else:
                        coverage_radius = int(coverage_radius)
                    
                    profile = NurseProfile(
                        nurse_id=str(row['nurse_id']),
                        name=str(row['name']),
                        license_type=str(row['license_type']),
                        certifications=certifications,
                        specialties=specialties,
                        years_experience=int(row['years_experience']),
                        languages=languages,
                        service_area_zip=str(row['service_area_zip']),
                        coverage_radius_miles=coverage_radius,
                        shift_preferences=shift_preferences,
                        availability_slots=str(row['availability_slots']),
                        employment_status=str(row['employment_status']),
                        payer_enrollment=payer_enrollment,
                        covid_vaccination_status=str(row['covid_vaccination_status']),
                        hourly_rate=float(row['hourly_rate']),
                        profile_summary=str(row['profile_summary'])
                    )
                    
                    self.nurse_profiles.append(profile)
                    
                    # Create searchable text for RAG
                    profile_text = f"""
                    {profile.name} - {profile.license_type} with {profile.years_experience} years experience.
                    Certifications: {', '.join(profile.certifications)}
                    Specialties: {', '.join(profile.specialties)}
                    Languages: {', '.join(profile.languages)}
                    Shift preferences: {', '.join(profile.shift_preferences)}
                    Service area: {profile.service_area_zip} ({profile.coverage_radius_miles} mile radius)
                    Payers: {', '.join(profile.payer_enrollment)}
                    Summary: {profile.profile_summary}
                    """
                    self.profile_texts.append(profile_text.strip())
                    
                except Exception as e:
                    logger.error(f"❌ Error parsing nurse profile {row.get('nurse_id', 'unknown')}: {e}")
                    continue
            
            # Create embeddings
            if self.profile_texts:
                self.profile_vectors = self.vectorizer.fit_transform(self.profile_texts)
                self.last_updated = datetime.now()
                logger.info(f"✅ Loaded {len(self.nurse_profiles)} nurse profiles and created embeddings")
                return True
            else:
                logger.error("❌ No valid nurse profiles found")
                return False
                
        except Exception as e:
            logger.error(f"❌ Error refreshing nurse data: {e}")
            return False
    
    def retrieve_candidates(self, patient_context: str, top_k: int = 10) -> List[NurseProfile]:
        """Retrieve top-K nurse candidates using semantic similarity."""
        if self.profile_vectors is None or not self.profile_texts:
            logger.error("❌ No nurse profiles loaded")
            return []
        
        try:
            # Create query vector
            query_vector = self.vectorizer.transform([patient_context])
            
            # Calculate similarities
            similarities = cosine_similarity(query_vector, self.profile_vectors).flatten()
            
            # Get top-K indices
            top_indices = np.argsort(similarities)[::-1][:top_k]
            
            # Return corresponding nurse profiles
            candidates = [self.nurse_profiles[i] for i in top_indices]
            
            logger.info(f"✅ Retrieved {len(candidates)} nurse candidates")
            return candidates
            
        except Exception as e:
            logger.error(f"❌ Error retrieving candidates: {e}")
            return []
    
    def apply_hard_filters(self, candidates: List[NurseProfile], filters: Dict[str, Any]) -> List[NurseProfile]:
        """Apply hard filters to candidate list - with preferred vs required distinction."""
        filtered = []
        
        for nurse in candidates:
            # License type filter (hard requirement)
            if filters.get('required_license'):
                if isinstance(filters['required_license'], list):
                    if nurse.license_type not in filters['required_license']:
                        continue
                else:
                    if nurse.license_type != filters['required_license']:
                        continue
            
            # Required certifications filter (hard requirement)
            if filters.get('required_certifications'):
                nurse_certs = [cert.upper() for cert in nurse.certifications]
                required_certs = filters['required_certifications']
                if isinstance(required_certs, str):
                    required_certs = [required_certs]
                required_certs = [cert.upper() for cert in required_certs]
                if not any(req_cert in nurse_certs for req_cert in required_certs):
                    continue
            
            # Language filter (hard requirement)
            if filters.get('required_language'):
                nurse_langs = [lang.lower() for lang in nurse.languages]
                if filters['required_language'].lower() not in nurse_langs:
                    continue
            
            # Required payer filter (hard requirement)
            if filters.get('required_payer'):
                nurse_payers = [payer.upper() for payer in nurse.payer_enrollment]
                if filters['required_payer'].upper() not in nurse_payers:
                    continue
            
            # Employment status filter (hard requirement)
            if filters.get('employment_status') and nurse.employment_status != filters['employment_status']:
                continue
            
            # COVID vaccination filter (hard requirement)
            if filters.get('covid_vaccination_required') and nurse.covid_vaccination_status != 'vaccinated':
                continue
            
            # Note: Preferred filters (preferred_certifications, preferred_payer) are handled in scoring
            filtered.append(nurse)
        
        logger.info(f"✅ Applied hard filters: {len(candidates)} → {len(filtered)} candidates")
        return filtered
    
    def get_nurse_recommendations(self, patient_context: Dict[str, Any], top_n: int = 5, top_k_retrieve: int = 15) -> List[NurseRecommendation]:
        """Get ranked nurse recommendations for a patient."""
        try:
            # Create patient context string for retrieval
            context_str = self._create_patient_context_string(patient_context)
            
            # Retrieve candidates
            candidates = self.retrieve_candidates(context_str, top_k_retrieve)
            
            if not candidates:
                logger.warning("⚠️ No nurse candidates retrieved")
                return []
            
            # Apply hard filters
            hard_filters = self._extract_hard_filters(patient_context)
            filtered_candidates = self.apply_hard_filters(candidates, hard_filters)
            
            if not filtered_candidates:
                logger.warning("⚠️ No candidates passed hard filters")
                return []
            
            # Get LLM recommendations
            recommendations = self._get_llm_recommendations(patient_context, filtered_candidates, top_n)
            
            return recommendations
            
        except Exception as e:
            logger.error(f"❌ Error getting nurse recommendations: {e}")
            return []
    
    def _create_patient_context_string(self, patient_context: Dict[str, Any]) -> str:
        """Create searchable string from patient context."""
        context_parts = []
        
        # Basic info
        if patient_context.get('age'):
            context_parts.append(f"Age: {patient_context['age']}")
        
        # Diagnoses
        if patient_context.get('primary_diagnosis'):
            context_parts.append(f"Primary diagnosis: {patient_context['primary_diagnosis']}")
        
        if patient_context.get('secondary_diagnoses'):
            context_parts.append(f"Secondary diagnoses: {patient_context['secondary_diagnoses']}")
        
        # Care needs
        if patient_context.get('skilled_nursing_needed'):
            context_parts.append(f"Nursing needs: {patient_context['skilled_nursing_needed']}")
        
        if patient_context.get('type_of_nursing_care'):
            context_parts.append(f"Care type: {patient_context['type_of_nursing_care']}")
        
        # Equipment
        if patient_context.get('equipment_needed'):
            context_parts.append(f"Equipment: {patient_context['equipment_needed']}")
        
        # Medications
        if patient_context.get('medication'):
            context_parts.append(f"Medications: {patient_context['medication']}")
        
        # Location
        if patient_context.get('address'):
            context_parts.append(f"Location: {patient_context['address']}")
        
        # Special requirements
        if patient_context.get('special_instructions'):
            context_parts.append(f"Special instructions: {patient_context['special_instructions']}")
        
        return " ".join(context_parts)
    
    def _extract_hard_filters(self, patient_context: Dict[str, Any]) -> Dict[str, Any]:
        """Extract hard filters from patient context - made less restrictive for more dynamic results."""
        filters = {}
        
        # License requirements based on complexity - more flexible
        if patient_context.get('skilled_nursing_needed'):
            nursing_needs = patient_context['skilled_nursing_needed'].lower()
            # Only require RN for very complex cases
            if any(term in nursing_needs for term in ['critical', 'icu', 'ventilator', 'central line', 'picc']):
                filters['required_license'] = ['RN']
            # Otherwise allow both RN and LPN
            else:
                filters['required_license'] = ['RN', 'LPN']
        
        # Certification requirements - make optional for broader matching
        preferred_certs = []
        if patient_context.get('type_of_nursing_care'):
            care_type = patient_context['type_of_nursing_care'].lower()
            if 'wound' in care_type:
                preferred_certs.extend(['WOCN', 'CWS', 'CWCN'])
            if 'cardiac' in care_type:
                preferred_certs.extend(['CCRN', 'ACLS'])
            if 'oncology' in care_type or 'cancer' in care_type:
                preferred_certs.extend(['OCN'])
            if 'diabetes' in care_type:
                preferred_certs.extend(['CDE', 'CDCES'])
        
        # Store as preferred rather than required for more flexibility
        if preferred_certs:
            filters['preferred_certifications'] = preferred_certs
        
        # Language requirements - only filter if explicitly specified
        if patient_context.get('preferred_language') and patient_context['preferred_language'].lower() not in ['english', 'en']:
            filters['required_language'] = patient_context['preferred_language']
        
        # Payer requirements - more flexible
        if patient_context.get('insurance_coverage_status'):
            insurance = patient_context['insurance_coverage_status'].lower()
            if 'medicare' in insurance:
                filters['preferred_payer'] = 'Medicare'
            elif 'medicaid' in insurance:
                filters['preferred_payer'] = 'Medicaid'
        
        # Employment status - keep as hard requirement
        filters['employment_status'] = 'active'
        
        # COVID vaccination - keep as hard requirement for healthcare
        filters['covid_vaccination_required'] = True
        
        return filters
    
    def _get_llm_recommendations(self, patient_context: Dict[str, Any], candidates: List[NurseProfile], top_n: int) -> List[NurseRecommendation]:
        """Use LLM to score and rank nurse candidates."""
        if not self.ai_client:
            logger.error("❌ No AI client available for recommendations")
            return self._fallback_recommendations(candidates, top_n, patient_context)
        
        try:
            # Prepare prompt
            prompt = self._create_recommendation_prompt(patient_context, candidates, top_n)
            
            # Get LLM response
            response = self.ai_client.generate_content(prompt)
            
            if not response or not response.text:
                logger.error("❌ Empty response from LLM")
                return self._fallback_recommendations(candidates, top_n, patient_context)
            
            # Parse LLM response
            recommendations = self._parse_llm_response(response.text, candidates)
            
            if not recommendations:
                logger.warning("⚠️ Failed to parse LLM response, using fallback")
                return self._fallback_recommendations(candidates, top_n, patient_context)
            
            return recommendations[:top_n]
            
        except Exception as e:
            logger.error(f"❌ Error getting LLM recommendations: {e}")
            return self._fallback_recommendations(candidates, top_n, patient_context)
    
    def _create_recommendation_prompt(self, patient_context: Dict[str, Any], candidates: List[NurseProfile], top_n: int) -> str:
        """Create prompt for LLM nurse recommendations."""
        
        # Patient summary
        patient_summary = f"""
        PATIENT PROFILE:
        - Name: {patient_context.get('name', 'Patient')}
        - Age: {patient_context.get('age', 'Unknown')}
        - Primary Diagnosis: {patient_context.get('primary_diagnosis', 'Not specified')}
        - Secondary Diagnoses: {patient_context.get('secondary_diagnoses', 'None')}
        - Skilled Nursing Needed: {patient_context.get('skilled_nursing_needed', 'Not specified')}
        - Type of Care: {patient_context.get('type_of_nursing_care', 'General')}
        - Equipment Needed: {patient_context.get('equipment_needed', 'None')}
        - Medications: {patient_context.get('medication', 'None specified')}
        - Location: {patient_context.get('address', 'Not specified')}
        - Insurance: {patient_context.get('insurance_coverage_status', 'Unknown')}
        - Special Instructions: {patient_context.get('special_instructions', 'None')}
        """
        
        # Candidate profiles
        candidate_profiles = ""
        for i, nurse in enumerate(candidates, 1):
            candidate_profiles += f"""
        NURSE {i}: {nurse.name} (ID: {nurse.nurse_id})
        - License: {nurse.license_type}
        - Experience: {nurse.years_experience} years
        - Certifications: {', '.join(nurse.certifications)}
        - Specialties: {', '.join(nurse.specialties)}
        - Languages: {', '.join(nurse.languages)}
        - Service Area: {nurse.service_area_zip} ({nurse.coverage_radius_miles} mile radius)
        - Shifts: {', '.join(nurse.shift_preferences)}
        - Availability: {nurse.availability_slots}
        - Payers: {', '.join(nurse.payer_enrollment)}
        - Rate: ${nurse.hourly_rate}/hour
        - Summary: {nurse.profile_summary}
        """
        
        prompt = f"""
        You are an expert healthcare staffing coordinator. Analyze the patient's needs and rank the most suitable nurses.

        {patient_summary}

        AVAILABLE NURSES:
        {candidate_profiles}

        TASK: Rank the top {top_n} nurses for this patient. For each recommendation, provide:
        1. Match score (0-100)
        2. Rationale explaining why this nurse is a good fit
        3. Key strengths that match patient needs
        4. Any potential concerns or gaps
        5. Availability assessment
        6. Distance/coverage assessment

        Consider these factors:
        - Clinical expertise match with patient's condition
        - Required certifications and specialties
        - Experience level appropriate for case complexity
        - Language and cultural considerations
        - Geographic accessibility
        - Schedule compatibility
        - Insurance/payer alignment
        - Cost-effectiveness

        IMPORTANT: Respond ONLY with valid JSON in this exact format:
        {{
            "recommendations": [
                {{
                    "nurse_id": "N001",
                    "match_score": 95,
                    "rationale": "Detailed explanation of why this nurse is recommended",
                    "key_strengths": ["strength 1", "strength 2", "strength 3"],
                    "potential_concerns": ["concern 1", "concern 2"],
                    "availability_match": "Excellent - available during required hours",
                    "distance_estimate": "Within 10 miles of patient location"
                }}
            ]
        }}
        """
        
        return prompt
    
    def _parse_llm_response(self, response_text: str, candidates: List[NurseProfile]) -> List[NurseRecommendation]:
        """Parse LLM response into structured recommendations."""
        try:
            # Extract JSON from response
            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1
            
            if json_start == -1 or json_end == 0:
                logger.error("❌ No JSON found in LLM response")
                return []
            
            json_str = response_text[json_start:json_end]
            data = json.loads(json_str)
            
            recommendations = []
            nurse_lookup = {nurse.nurse_id: nurse for nurse in candidates}
            
            for rec_data in data.get('recommendations', []):
                nurse_id = rec_data.get('nurse_id')
                if nurse_id not in nurse_lookup:
                    logger.warning(f"⚠️ Nurse ID {nurse_id} not found in candidates")
                    continue
                
                recommendation = NurseRecommendation(
                    nurse_profile=nurse_lookup[nurse_id],
                    match_score=float(rec_data.get('match_score', 0)),
                    rationale=rec_data.get('rationale', ''),
                    key_strengths=rec_data.get('key_strengths', []),
                    potential_concerns=rec_data.get('potential_concerns', []),
                    availability_match=rec_data.get('availability_match', ''),
                    distance_estimate=rec_data.get('distance_estimate', '')
                )
                
                recommendations.append(recommendation)
            
            logger.info(f"✅ Parsed {len(recommendations)} recommendations from LLM")
            return recommendations
            
        except Exception as e:
            logger.error(f"❌ Error parsing LLM response: {e}")
            return []
    
    def _fallback_recommendations(self, candidates: List[NurseProfile], top_n: int, patient_context: Dict[str, Any] = None) -> List[NurseRecommendation]:
        """Enhanced fallback recommendations that consider patient context for dynamic scoring."""
        recommendations = []
        
        for i, nurse in enumerate(candidates[:top_n]):
            # Base score from experience and certifications
            base_score = min(50 + (nurse.years_experience * 3) + (len(nurse.certifications) * 5), 100)
            
            # Dynamic scoring based on patient context
            context_bonus = 0
            key_strengths = [f"{nurse.years_experience} years experience", f"{nurse.license_type} license"]
            
            if patient_context:
                # Specialty matching bonus
                patient_diagnosis = patient_context.get('primary_diagnosis', '').lower()
                patient_care_type = patient_context.get('type_of_nursing_care', '').lower()
                patient_nursing_needs = patient_context.get('skilled_nursing_needed', '').lower()
                
                # Check for specialty matches
                nurse_specialties = [spec.lower() for spec in nurse.specialties]
                
                # Cardiac care matching
                if any(term in patient_diagnosis + patient_care_type + patient_nursing_needs 
                       for term in ['cardiac', 'heart', 'cardio']):
                    if any(term in nurse_specialties for term in ['cardiac', 'heart', 'critical care']):
                        context_bonus += 15
                        key_strengths.append("Cardiac care specialist")
                
                # Wound care matching
                if any(term in patient_diagnosis + patient_care_type + patient_nursing_needs 
                       for term in ['wound', 'surgical', 'post-op']):
                    if any(term in nurse_specialties for term in ['wound', 'surgical', 'post-surgical']):
                        context_bonus += 15
                        key_strengths.append("Wound care specialist")
                
                # Pediatric matching
                if patient_context.get('age') and int(patient_context.get('age', 100)) < 18:
                    if any(term in nurse_specialties for term in ['pediatric', 'child', 'neonatal']):
                        context_bonus += 20
                        key_strengths.append("Pediatric specialist")
                
                # Geriatric matching
                if patient_context.get('age') and int(patient_context.get('age', 0)) > 65:
                    if any(term in nurse_specialties for term in ['geriatric', 'elderly']):
                        context_bonus += 10
                        key_strengths.append("Geriatric experience")
                
                # Certification matching
                nurse_certs = [cert.upper() for cert in nurse.certifications]
                if 'WOCN' in nurse_certs or 'CWS' in nurse_certs:
                    if 'wound' in patient_diagnosis + patient_care_type:
                        context_bonus += 10
                        key_strengths.append("Wound care certified")
                
                if 'CCRN' in nurse_certs or 'ACLS' in nurse_certs:
                    if 'cardiac' in patient_diagnosis + patient_care_type:
                        context_bonus += 10
                        key_strengths.append("Critical care certified")
                
                # Language matching
                if patient_context.get('preferred_language', '').lower() not in ['english', 'en', '']:
                    nurse_langs = [lang.lower() for lang in nurse.languages]
                    if patient_context['preferred_language'].lower() in nurse_langs:
                        context_bonus += 15
                        key_strengths.append(f"Speaks {patient_context['preferred_language']}")
                
                # Insurance matching
                if patient_context.get('insurance_coverage_status'):
                    insurance = patient_context['insurance_coverage_status'].lower()
                    nurse_payers = [payer.lower() for payer in nurse.payer_enrollment]
                    if ('medicare' in insurance and 'medicare' in nurse_payers) or \
                       ('medicaid' in insurance and 'medicaid' in nurse_payers):
                        context_bonus += 5
                        key_strengths.append("Insurance compatible")
            
            # Final score with context bonus
            final_score = min(base_score + context_bonus, 100)
            
            # Generate contextual rationale
            if patient_context:
                rationale = f"Good match for {patient_context.get('primary_diagnosis', 'patient needs')} with {nurse.years_experience} years of experience. "
                if context_bonus > 0:
                    rationale += f"Strong specialty alignment and relevant certifications provide excellent care capability."
                else:
                    rationale += f"Solid general nursing background suitable for comprehensive patient care."
            else:
                rationale = f"Experienced {nurse.license_type} with {nurse.years_experience} years of experience and relevant certifications."
            
            recommendation = NurseRecommendation(
                nurse_profile=nurse,
                match_score=float(final_score),
                rationale=rationale,
                key_strengths=key_strengths,
                potential_concerns=["LLM analysis unavailable - enhanced matching used"],
                availability_match="Please verify availability directly",
                distance_estimate="Please verify coverage area"
            )
            
            recommendations.append(recommendation)
        
        # Sort by score (highest first)
        recommendations.sort(key=lambda x: x.match_score, reverse=True)
        
        logger.info(f"✅ Generated {len(recommendations)} enhanced fallback recommendations")
        return recommendations

# Global instance
nursing_rag_system = None

def get_nursing_rag_system() -> NurseRAGSystem:
    """Get or create the global nursing RAG system."""
    global nursing_rag_system
    if nursing_rag_system is None:
        nursing_rag_system = NurseRAGSystem()
    return nursing_rag_system

def get_nurse_recommendations_for_patient(patient_data: Dict[str, Any], top_n: int = 5) -> Dict[str, Any]:
    """Main function to get nurse recommendations for a patient."""
    try:
        rag_system = get_nursing_rag_system()
        
        # Get recommendations
        recommendations = rag_system.get_nurse_recommendations(patient_data, top_n)
        
        if not recommendations:
            return {
                "success": False,
                "message": "No suitable nurses found for this patient's needs",
                "recommendations": [],
                "remediation_notes": [
                    "Consider expanding geographic search radius",
                    "Review certification requirements - may need specialist referral",
                    "Check if patient needs can be met with available license types",
                    "Verify insurance coverage and payer enrollment"
                ]
            }
        
        # Format response
        formatted_recommendations = []
        for rec in recommendations:
            formatted_rec = {
                "nurse": rec.nurse_profile.to_dict(),
                "match_score": rec.match_score,
                "rationale": rec.rationale,
                "key_strengths": rec.key_strengths,
                "potential_concerns": rec.potential_concerns,
                "availability_match": rec.availability_match,
                "distance_estimate": rec.distance_estimate
            }
            formatted_recommendations.append(formatted_rec)
        
        return {
            "success": True,
            "message": f"Found {len(recommendations)} suitable nurse recommendations",
            "recommendations": formatted_recommendations,
            "total_candidates_reviewed": len(rag_system.nurse_profiles),
            "last_updated": rag_system.last_updated.isoformat() if rag_system.last_updated else None
        }
        
    except Exception as e:
        logger.error(f"❌ Error in get_nurse_recommendations_for_patient: {e}")
        return {
            "success": False,
            "message": f"Error generating recommendations: {str(e)}",
            "recommendations": []
        }

# Test cases for validation
def run_test_cases():
    """Run test cases to validate the system."""
    test_cases = [
        {
            "name": "Pediatric Trach Care - Night Shift",
            "patient": {
                "name": "Test Patient 1",
                "age": 8,
                "primary_diagnosis": "Tracheostomy care",
                "skilled_nursing_needed": "Tracheostomy care, ventilator management",
                "type_of_nursing_care": "pediatric respiratory care",
                "equipment_needed": "ventilator, suction equipment",
                "preferred_shift": "night",
                "insurance_coverage_status": "Medicaid"
            }
        },
        {
            "name": "Post-Op Wound Care - WOCN Required",
            "patient": {
                "name": "Test Patient 2",
                "age": 65,
                "primary_diagnosis": "Post-surgical wound",
                "skilled_nursing_needed": "Complex wound care",
                "type_of_nursing_care": "wound care management",
                "address": "10005 area",
                "insurance_coverage_status": "Medicare"
            }
        },
        {
            "name": "Cardiac Rehab - Spanish Speaking",
            "patient": {
                "name": "Test Patient 3",
                "age": 72,
                "primary_diagnosis": "Congestive heart failure",
                "skilled_nursing_needed": "Cardiac monitoring, medication management",
                "type_of_nursing_care": "cardiac care",
                "preferred_language": "Spanish",
                "insurance_coverage_status": "Medicare"
            }
        }
    ]
    
    print("🧪 Running Enhanced Nursing Agent Test Cases")
    print("=" * 60)
    
    for test_case in test_cases:
        print(f"\n📋 Test Case: {test_case['name']}")
        print("-" * 40)
        
        result = get_nurse_recommendations_for_patient(test_case['patient'], top_n=3)
        
        if result['success']:
            print(f"✅ Found {len(result['recommendations'])} recommendations")
            for i, rec in enumerate(result['recommendations'], 1):
                nurse = rec['nurse']
                print(f"\n{i}. {nurse['name']} ({nurse['nurse_id']})")
                print(f"   Score: {rec['match_score']}/100")
                print(f"   License: {nurse['license_type']}")
                print(f"   Specialties: {', '.join(nurse['specialties'])}")
                print(f"   Rationale: {rec['rationale'][:100]}...")
        else:
            print(f"❌ {result['message']}")
            if result.get('remediation_notes'):
                for note in result['remediation_notes']:
                    print(f"   💡 {note}")

if __name__ == "__main__":
    # Run test cases
    run_test_cases()
