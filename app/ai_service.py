import json
import os
from typing import List, Dict, Any
from openai import OpenAI
import google.generativeai as genai
from app.models import (
    PatientData, CaregiverInput, RoutingDecision, 
    AgentResponse, AgentType, EditableForm, FormField
)

class AIService:
    def __init__(self):
        # Try to initialize Google AI Studio first, then OpenAI as fallback
        self.ai_provider = None
        self.client = None
        
        # Check for Google AI Studio API key
        google_api_key = os.getenv("GOOGLE_AI_API_KEY")
        if google_api_key:
            try:
                genai.configure(api_key=google_api_key)
                self.client = genai.GenerativeModel('gemini-1.5-flash')
                self.ai_provider = "google"
                print("✅ Using Google AI Studio (Gemini) for AI features")
            except Exception as e:
                print(f"⚠️  Google AI Studio initialization failed: {e}")
        
        # Fallback to OpenAI if Google AI not available
        if not self.client:
            openai_api_key = os.getenv("OPENAI_API_KEY")
            if openai_api_key:
                try:
                    self.client = OpenAI(api_key=openai_api_key)
                    self.ai_provider = "openai"
                    print("✅ Using OpenAI for AI features")
                except Exception as e:
                    print(f"⚠️  OpenAI initialization failed: {e}")
        
        # If neither API is available
        if not self.client:
            self.ai_provider = None
            print("⚠️  Warning: No AI API key configured. Using fallback logic.")
            print("   Set GOOGLE_AI_API_KEY or OPENAI_API_KEY for full AI features.")
    
    async def route_patient(self, patient_data, caregiver_input: CaregiverInput) -> RoutingDecision:
        """Use AI to determine which agents should handle this patient case."""
        
        prompt = f"""
        You are a DISCHARGE PLANNING coordinator AI. Your ONLY role is coordinating the logistics of transitioning patients from hospital to home/community care.
        
        CRITICAL: Focus ONLY on discharge logistics and coordination - NOT ongoing clinical management.
        
        Patient Discharge Profile:
        - ID: {patient_data.patient_id}
        - Name: {patient_data.name}
        - Primary Diagnosis: {patient_data.primary_icu_diagnosis}
        - Discharge Date: {patient_data.icu_discharge_date or 'Pending'}
        - Insurance Status: {patient_data.insurance_coverage_status or 'Unknown'}
        
        DISCHARGE COORDINATION NEEDS:
        Home Health Setup:
        - Skilled Nursing Required: {patient_data.skilled_nursing_needed or 'Not specified'}
        - Visit Schedule: {patient_data.nursing_visit_frequency or 'Not specified'}
        - Care Coordination: {patient_data.type_of_nursing_care or 'Not specified'}
        
        Equipment Delivery:
        - Equipment for Home: {patient_data.equipment_needed or 'None'}
        - Delivery Timeline: {patient_data.equipment_delivery_date or 'Not scheduled'}
        
        Medication Handoff:
        - Discharge Medication: {patient_data.medication or 'None'}
        - Prescriber: {patient_data.prescriber_name or 'Not specified'}
        
        Discharge Planner Input: {caregiver_input.primary_concern}
        Urgency: {caregiver_input.urgency_level}
        
        ROUTING DECISION CRITERIA (Discharge Logistics Only):
        - NURSING: Home health referral, 485 plan setup, discharge education coordination
        - DME: Equipment delivery scheduling, insurance authorization, home setup coordination  
        - PHARMACY: eRx handoff, prescription transfer, pickup/delivery coordination
        - STATE: Prior authorization, insurance verification, Medicaid coordination
        
        FOCUS ON DISCHARGE LOGISTICS ONLY:
        ✅ Equipment delivery coordination
        ✅ Home health referral setup
        ✅ Prescription transfer logistics
        ✅ Insurance authorization processing
        ✅ Discharge education scheduling
        ✅ Follow-up appointment coordination
        
        ❌ DO NOT MENTION:
        ❌ Ongoing clinical monitoring
        ❌ Weekly vital signs
        ❌ IV administration schedules
        ❌ Wound care protocols
        ❌ Medication titration
        ❌ Clinical assessments
        
        IMPORTANT: Respond ONLY with a valid JSON object focused on DISCHARGE COORDINATION:
        {{
            "recommended_agents": ["nursing", "dme", "pharmacy", "state"],
            "reasoning": "Discharge coordination explanation focusing ONLY on logistics: equipment delivery, referral setup, prescription handoff, and authorization processing",
            "priority_score": 7,
            "estimated_timeline": "before discharge"
        }}
        
        Focus ONLY on discharge logistics coordination, NOT clinical care management.
        """
        
        try:
            response = await self._call_ai(prompt)
            print(f"🤖 AI Response received: {response[:200]}...")  # Debug log
            
            # Clean the response to extract JSON
            cleaned_response = response.strip()
            if cleaned_response.startswith('```json'):
                cleaned_response = cleaned_response[7:]
            if cleaned_response.endswith('```'):
                cleaned_response = cleaned_response[:-3]
            cleaned_response = cleaned_response.strip()
            
            result = json.loads(cleaned_response)
            
            # Validate required fields
            if not all(key in result for key in ["recommended_agents", "reasoning", "priority_score", "estimated_timeline"]):
                raise ValueError("Missing required fields in AI response")
            
            print(f"✅ AI routing successful: {result['recommended_agents']}")
            
            return RoutingDecision(
                patient_id=patient_data.patient_id,
                recommended_agents=[AgentType(agent.lower()) for agent in result["recommended_agents"]],
                reasoning=result["reasoning"],
                priority_score=result["priority_score"],
                estimated_timeline=result["estimated_timeline"]
            )
        except json.JSONDecodeError as e:
            print(f"❌ JSON parsing error: {e}")
            print(f"Raw AI response: {response}")
            # Use improved fallback routing logic
            return self._fallback_routing(patient_data, caregiver_input)
        except Exception as e:
            print(f"❌ AI routing error: {e}")
            # Use improved fallback routing logic
            return self._fallback_routing(patient_data, caregiver_input)
    
    async def process_nursing_agent(self, patient_data, caregiver_input: CaregiverInput) -> AgentResponse:
        """Process patient case through nursing agent."""
        
        prompt = f"""
        You are a HOME HEALTH NURSING coordination agent for hospital discharge planning. 
        
        SCOPE: ONLY hospital-to-home transition nursing needs. NO inpatient management.
        
        Patient Discharge Profile:
        - Patient: {patient_data.name} (ID: {patient_data.patient_id})
        - Primary Diagnosis: {patient_data.primary_icu_diagnosis}
        - Secondary Diagnoses: {patient_data.secondary_diagnoses or 'None'}
        - Discharge Date: {patient_data.icu_discharge_date or 'Not specified'}
        - Allergies: {patient_data.allergies or 'None'}
        
        HOME NURSING REQUIREMENTS:
        - Skilled Nursing Needed: {patient_data.skilled_nursing_needed or 'Not specified'}
        - Visit Frequency: {patient_data.nursing_visit_frequency or 'Not specified'}
        - Care Type: {patient_data.type_of_nursing_care or 'Not specified'}
        - Emergency Procedures: {patient_data.emergency_contact_procedure or 'None specified'}
        
        MEDICATION TRANSITION:
        - Current Medication: {patient_data.medication or 'None'}
        - Route: {patient_data.route or 'Not specified'}
        - Vascular Access: {patient_data.vascular_access or 'None'}
        
        DISCHARGE PLANNING CONCERN: {caregiver_input.primary_concern}
        
        FOCUS AREAS (0-14 days post-discharge):
        1. Home health nursing referrals (485/plan of care)
        2. Wound care protocols for home setting
        3. Vital signs monitoring schedule
        4. Caregiver education and training
        5. Follow-up appointment coordination
        
        EXCLUDE: Inpatient procedures, hospital medication titration, ICU workflows
        
        IMPORTANT: Respond ONLY with a valid JSON object for HOME HEALTH TRANSITION:
        {{
            "structured_data": {{
                "home_health_referral": true,
                "visit_frequency": "weekly",
                "care_plan_485_required": true,
                "wound_care_protocol": false,
                "vital_signs_monitoring": true,
                "caregiver_education_needed": true,
                "first_visit_target": "within 24 hours of discharge"
            }},
            "recommendations": [
                "Initiate home health nursing referral with 485 plan of care",
                "Schedule first nursing visit within 24 hours of discharge",
                "Provide caregiver education on medication administration"
            ],
            "next_steps": [
                "Complete home health agency referral form",
                "Schedule follow-up appointment with primary care physician",
                "Coordinate with discharge planner for timing"
            ],
            "external_referrals": ["Home Health Agency", "Primary Care Physician"]
        }}
        
        Focus ONLY on hospital-to-home transition. No inpatient recommendations.
        """
        
        try:
            response = await self._call_ai(prompt)
            result = json.loads(response)
        except (json.JSONDecodeError, Exception) as e:
            print(f"Nursing agent error: {e}")
            # Create discharge-focused fallback response
            result = {
                "structured_data": {
                    "home_health_referral": True,
                    "visit_frequency": getattr(patient_data, 'nursing_visit_frequency', 'weekly') or 'weekly',
                    "care_plan_485_required": True,
                    "wound_care_protocol": "wound" in caregiver_input.primary_concern.lower(),
                    "vital_signs_monitoring": True,
                    "caregiver_education_needed": True,
                    "first_visit_target": "within 24 hours of discharge"
                },
                "recommendations": [
                    "Initiate home health nursing referral with 485 plan of care",
                    "Schedule first nursing visit within 24 hours of discharge",
                    "Coordinate wound care protocol for home setting" if "wound" in caregiver_input.primary_concern.lower() else "Provide medication administration training for home care",
                    "Establish caregiver education plan for discharge transition"
                ],
                "next_steps": [
                    "Complete home health agency referral form before discharge",
                    "Schedule follow-up appointment with primary care physician within 7 days",
                    "Coordinate discharge timing with nursing agency",
                    "Provide emergency contact procedures to family"
                ],
                "external_referrals": ["Home Health Agency", "Primary Care Physician"]
            }
        
        # Generate editable form for nursing partners
        form_data = self._generate_nursing_form(patient_data, result)
        
        return AgentResponse(
            agent_type=AgentType.NURSING,
            patient_id=patient_data.patient_id,
            structured_data=result.get("structured_data", {}),
            form_data=form_data,
            recommendations=result.get("recommendations", []),
            next_steps=result.get("next_steps", []),
            external_referrals=result.get("external_referrals", [])
        )
    
    async def process_dme_agent(self, patient_data, caregiver_input: CaregiverInput) -> AgentResponse:
        """Process patient case through DME agent."""
        
        prompt = f"""
        You are a DME (Durable Medical Equipment) coordination agent for hospital discharge planning.
        
        SCOPE: ONLY home medical equipment orders and fulfillment. NO inpatient equipment.
        
        Patient Discharge Profile:
        - Patient: {patient_data.name} (ID: {patient_data.patient_id})
        - Primary Diagnosis: {patient_data.primary_icu_diagnosis}
        - Secondary Diagnoses: {patient_data.secondary_diagnoses or 'None'}
        - Discharge Date: {patient_data.icu_discharge_date or 'Not specified'}
        
        HOME EQUIPMENT REQUIREMENTS:
        - Equipment Needed: {patient_data.equipment_needed or 'None specified'}
        - Current DME Supplier: {patient_data.dme_supplier or 'Not assigned'}
        - Delivery Date: {patient_data.equipment_delivery_date or 'Not scheduled'}
        
        MEDICAL NECESSITY:
        - Primary Diagnosis Code: {patient_data.primary_icu_diagnosis}
        - Prescriber: {patient_data.prescriber_name or 'Not specified'}
        - NPI Number: {patient_data.npi_number or 'Not available'}
        
        INSURANCE & AUTHORIZATION:
        - Coverage Status: {patient_data.insurance_coverage_status or 'Unknown'}
        
        DISCHARGE PLANNING CONCERN: {caregiver_input.primary_concern}
        
        FOCUS AREAS (home equipment only):
        1. DME orders with diagnosis codes and medical necessity
        2. Equipment delivery coordination before discharge
        3. Insurance prior authorization/pre-certification
        4. Home setup and patient/caregiver training
        5. Duration of need and follow-up requirements
        
        EXCLUDE: Hospital equipment, inpatient device management, ICU monitoring equipment
        
        IMPORTANT: Respond ONLY with a valid JSON object for HOME DME COORDINATION:
        {{
            "structured_data": {{
                "equipment_category": "respiratory",
                "medical_necessity_documented": true,
                "insurance_authorization_required": true,
                "delivery_timeline": "before discharge",
                "setup_training_needed": true,
                "duration_of_need": "ongoing",
                "physician_order_required": true
            }},
            "recommendations": [
                "Obtain physician order with diagnosis code and medical necessity",
                "Submit insurance prior authorization for home oxygen equipment",
                "Schedule equipment delivery 24 hours before discharge"
            ],
            "next_steps": [
                "Contact DME supplier for equipment availability",
                "Submit prior authorization to insurance",
                "Schedule home setup and training appointment"
            ],
            "external_referrals": ["DME Supplier", "Insurance Authorization Department"]
        }}
        
        Focus ONLY on home equipment needs. No hospital equipment recommendations.
        """
        
        try:
            response = await self._call_ai(prompt)
            result = json.loads(response)
        except (json.JSONDecodeError, Exception) as e:
            print(f"DME agent error: {e}")
            # Create discharge-focused fallback response
            equipment_needed = getattr(patient_data, 'equipment_needed', '') or 'mobility equipment'
            result = {
                "structured_data": {
                    "equipment_category": "mobility" if "wheelchair" in equipment_needed.lower() else "respiratory" if "oxygen" in equipment_needed.lower() else "general",
                    "medical_necessity_documented": True,
                    "insurance_authorization_required": True,
                    "delivery_timeline": "before discharge",
                    "setup_training_needed": True,
                    "duration_of_need": "ongoing",
                    "physician_order_required": True
                },
                "recommendations": [
                    f"Obtain physician order for {equipment_needed} with diagnosis code and medical necessity",
                    "Submit insurance prior authorization for home medical equipment",
                    "Schedule equipment delivery 24-48 hours before discharge",
                    "Arrange setup and training appointment for patient/caregiver"
                ],
                "next_steps": [
                    "Contact DME supplier for equipment availability and delivery scheduling",
                    "Submit prior authorization to insurance with medical necessity documentation",
                    "Schedule home setup and training appointment",
                    "Coordinate delivery timing with discharge planning team"
                ],
                "external_referrals": ["DME Supplier", "Insurance Authorization Department"]
            }
        
        # Generate editable form for DME suppliers
        form_data = self._generate_dme_form(patient_data, result)
        
        return AgentResponse(
            agent_type=AgentType.DME,
            patient_id=patient_data.patient_id,
            structured_data=result.get("structured_data", {}),
            form_data=form_data,
            recommendations=result.get("recommendations", []),
            next_steps=result.get("next_steps", []),
            external_referrals=result.get("external_referrals", [])
        )
    
    async def process_pharmacy_agent(self, patient_data, caregiver_input: CaregiverInput) -> AgentResponse:
        """Process patient case through pharmacy agent."""
        
        prompt = f"""
        You are a PHARMACY TRANSITION coordination agent for hospital discharge planning.
        
        SCOPE: ONLY medication reconciliation and eRx handoff for discharge. NO inpatient medication management.
        
        Patient Discharge Profile:
        - Patient: {patient_data.name} (ID: {patient_data.patient_id})
        - Primary Diagnosis: {patient_data.primary_icu_diagnosis}
        - Secondary Diagnoses: {patient_data.secondary_diagnoses or 'None'}
        - Allergies: {patient_data.allergies or 'None'}
        
        MEDICATION TRANSITION:
        - Current Hospital Medication: {patient_data.medication or 'None specified'}
        - Dosage: {patient_data.dosage or 'Not specified'}
        - Frequency: {patient_data.frequency or 'Not specified'}
        - Route: {patient_data.route or 'Not specified'}
        - Duration: {patient_data.duration_of_therapy or 'Not specified'}
        - Vascular Access: {patient_data.vascular_access or 'None'}
        
        PRESCRIBER INFORMATION:
        - Prescriber: {patient_data.prescriber_name or 'Not specified'}
        - NPI: {patient_data.npi_number or 'Not available'}
        - Contact: {patient_data.prescriber_contact or 'Not available'}
        
        DISCHARGE PLANNING CONCERN: {caregiver_input.primary_concern}
        
        FOCUS AREAS (medication transition only):
        1. Medication list confirmation and reconciliation
        2. eRx handoff to community pharmacy
        3. Route transition (IV to oral if applicable)
        4. Prescription pickup/delivery coordination
        5. Insurance coverage verification for discharge medications
        
        EXCLUDE: Inpatient medication titration, hospital formulary changes, ICU drug protocols
        
        IMPORTANT: Respond ONLY with a valid JSON object for MEDICATION TRANSITION:
        {{
            "structured_data": {{
                "medication_reconciliation_needed": true,
                "erx_handoff_required": true,
                "route_transition": "iv_to_oral",
                "insurance_coverage_verified": false,
                "pickup_delivery_arranged": false,
                "allergy_alerts_documented": true,
                "duration_confirmed": true
            }},
            "recommendations": [
                "Complete medication reconciliation with discharge medications",
                "Coordinate eRx handoff to patient's preferred community pharmacy",
                "Verify insurance coverage for all discharge medications"
            ],
            "next_steps": [
                "Contact community pharmacy for medication availability",
                "Arrange prescription pickup or delivery coordination",
                "Provide patient education on new medication regimen"
            ],
            "external_referrals": ["Community Pharmacy", "Insurance Benefits Verification"]
        }}
        
        Focus ONLY on hospital-to-home medication transition. No inpatient medication management.
        """
        
        try:
            response = await self._call_ai(prompt)
            result = json.loads(response)
        except (json.JSONDecodeError, Exception) as e:
            print(f"Pharmacy agent error: {e}")
            # Create discharge-focused fallback response
            current_med = getattr(patient_data, 'medication', '') or 'discharge medications'
            route = getattr(patient_data, 'route', '') or ''
            result = {
                "structured_data": {
                    "medication_reconciliation_needed": True,
                    "erx_handoff_required": True,
                    "route_transition": "iv_to_oral" if route.lower() == "iv" else "no_transition",
                    "insurance_coverage_verified": False,
                    "pickup_delivery_arranged": False,
                    "allergy_alerts_documented": True,
                    "duration_confirmed": True
                },
                "recommendations": [
                    "Complete medication reconciliation with discharge medications",
                    "Coordinate eRx handoff to patient's preferred community pharmacy",
                    "Verify insurance coverage for all discharge medications",
                    f"Arrange transition from {route} to oral route if applicable" if route else "Confirm medication administration route for home use"
                ],
                "next_steps": [
                    "Contact community pharmacy for medication availability before discharge",
                    "Arrange prescription pickup or delivery coordination",
                    "Provide patient/caregiver education on new medication regimen",
                    "Schedule follow-up for medication effectiveness review"
                ],
                "external_referrals": ["Community Pharmacy", "Insurance Benefits Verification"]
            }
        
        # Generate editable form for pharmacy partners
        form_data = self._generate_pharmacy_form(patient_data, result)
        
        return AgentResponse(
            agent_type=AgentType.PHARMACY,
            patient_id=patient_data.patient_id,
            structured_data=result.get("structured_data", {}),
            form_data=form_data,
            recommendations=result.get("recommendations", []),
            next_steps=result.get("next_steps", []),
            external_referrals=result.get("external_referrals", [])
        )
    
    async def process_state_agent(self, patient_data, caregiver_input: CaregiverInput) -> AgentResponse:
        """Process patient case through state/insurance coordination agent."""
        
        prompt = f"""
        You are a STATE/INSURANCE coordination agent for hospital discharge planning.
        
        SCOPE: ONLY insurance authorization and state program coordination for discharge. NO inpatient billing.
        
        Patient Discharge Profile:
        - Patient: {patient_data.name} (ID: {patient_data.patient_id})
        - Primary Diagnosis: {patient_data.primary_icu_diagnosis}
        - Secondary Diagnoses: {patient_data.secondary_diagnoses or 'None'}
        - MRN: {patient_data.mrn or 'Not available'}
        
        INSURANCE & AUTHORIZATION:
        - Coverage Status: {patient_data.insurance_coverage_status or 'Unknown'}
        - Follow-up Date: {patient_data.follow_up_appointment_date or 'Not scheduled'}
        
        PRESCRIBER INFORMATION:
        - Prescriber: {patient_data.prescriber_name or 'Not specified'}
        - NPI: {patient_data.npi_number or 'Not available'}
        
        DISCHARGE PLANNING CONCERN: {caregiver_input.primary_concern}
        
        FOCUS AREAS (authorization and state programs):
        1. Prior authorization/pre-certification for home services
        2. Medicaid waiver applications for home care
        3. Insurance coverage verification for DME and home health
        4. State program eligibility assessment
        5. Appeals and authorization follow-up
        
        EXCLUDE: Inpatient billing, hospital insurance verification, DRG coding
        
        IMPORTANT: Respond ONLY with a valid JSON object for STATE/INSURANCE COORDINATION:
        {{
            "structured_data": {{
                "prior_auth_required": true,
                "medicaid_waiver_eligible": false,
                "insurance_coverage_verified": false,
                "state_program_referral_needed": true,
                "authorization_timeline": "3-5 business days",
                "appeals_process_available": true
            }},
            "recommendations": [
                "Submit prior authorization for home health services",
                "Verify insurance coverage for prescribed DME equipment",
                "Assess eligibility for state Medicaid waiver programs"
            ],
            "next_steps": [
                "Complete prior authorization forms with physician NPI and diagnosis codes",
                "Contact insurance benefits department for coverage verification",
                "Submit state program applications if eligible"
            ],
            "external_referrals": ["Insurance Prior Authorization", "State Medicaid Office", "Benefits Verification"]
        }}
        
        Focus ONLY on discharge-related insurance and state program coordination.
        """
        
        try:
            ai_response = await self._call_ai(prompt)
            result = json.loads(ai_response)
        except Exception as e:
            print(f"AI call failed for state agent: {e}")
            # Fallback response
            result = {
                "structured_data": {
                    "prior_auth_required": True,
                    "insurance_coverage_verified": False,
                    "authorization_timeline": "3-5 business days"
                },
                "recommendations": [
                    "Verify insurance coverage for discharge services",
                    "Submit required prior authorization forms"
                ],
                "next_steps": [
                    "Contact insurance benefits department",
                    "Complete authorization paperwork"
                ],
                "external_referrals": ["Insurance Authorization"]
            }
        
        # Generate editable form for state/insurance coordination
        form_data = self._generate_state_form(patient_data, result)
        
        return AgentResponse(
            agent_type=AgentType.STATE,
            patient_id=patient_data.patient_id,
            structured_data=result.get("structured_data", {}),
            form_data=form_data,
            recommendations=result.get("recommendations", []),
            next_steps=result.get("next_steps", []),
            external_referrals=result.get("external_referrals", [])
        )
        """Make API call to AI provider (Google AI Studio or OpenAI)."""
        if not self.client:
            raise Exception("No AI API key configured")
        
        try:
            if self.ai_provider == "google":
                # Use Google AI Studio (Gemini)
                system_prompt = "You are a healthcare AI assistant. Always respond with valid JSON."
                full_prompt = f"{system_prompt}\n\n{prompt}"
                
                response = self.client.generate_content(full_prompt)
                response_text = response.text
                
                # Clean up the response text to extract JSON
                if "```json" in response_text:
                    # Extract JSON from markdown code blocks
                    start = response_text.find("```json") + 7
                    end = response_text.find("```", start)
                    response_text = response_text[start:end].strip()
                elif "```" in response_text:
                    # Extract from generic code blocks
                    start = response_text.find("```") + 3
                    end = response_text.find("```", start)
                    response_text = response_text[start:end].strip()
                
                return response_text
                
            elif self.ai_provider == "openai":
                # Use OpenAI
                response = self.client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "You are a healthcare AI assistant. Always respond with valid JSON."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.3
                )
                return response.choices[0].message.content
            else:
                raise Exception("No AI provider configured")
                
        except Exception as e:
            print(f"AI API error ({self.ai_provider}): {e}")
            raise
    
    def _fallback_routing(self, patient_data, caregiver_input: CaregiverInput) -> RoutingDecision:
        """Fallback routing logic when AI is unavailable."""
        agents = []
        reasoning_parts = []
        
        # Simple rule-based routing for comprehensive patient data
        if any(symptom in caregiver_input.primary_concern.lower() for symptom in ["pain", "wound", "vital", "assessment"]):
            agents.append(AgentType.NURSING)
            reasoning_parts.append("nursing care for wound management and vital signs monitoring")
        
        # Check for nursing needs based on comprehensive data
        if hasattr(patient_data, 'skilled_nursing_needed') and patient_data.skilled_nursing_needed and patient_data.skilled_nursing_needed.lower() == "yes":
            if AgentType.NURSING not in agents:
                agents.append(AgentType.NURSING)
            reasoning_parts.append("home health referral setup and discharge education coordination")
        
        # Check for equipment needs
        if hasattr(patient_data, 'equipment_needed') and patient_data.equipment_needed:
            agents.append(AgentType.DME)
            equipment = getattr(patient_data, 'equipment_needed', 'medical equipment')
            reasoning_parts.append(f"equipment delivery coordination for {equipment.lower()} before discharge")
        
        # Check for medication needs
        if hasattr(patient_data, 'medication') and patient_data.medication:
            agents.append(AgentType.PHARMACY)
            reasoning_parts.append("prescription transfer and community pharmacy coordination")
        elif "medication" in caregiver_input.primary_concern.lower():
            agents.append(AgentType.PHARMACY)
            reasoning_parts.append("medication handoff logistics for discharge")
        
        # Check for insurance/authorization needs
        if hasattr(patient_data, 'insurance_coverage_status') and patient_data.insurance_coverage_status and \
           patient_data.insurance_coverage_status.lower() in ['pending', 'denied', 'unknown']:
            agents.append(AgentType.STATE)
            reasoning_parts.append("insurance authorization processing and coverage verification")
        elif any(keyword in caregiver_input.primary_concern.lower() for keyword in ['insurance', 'authorization', 'medicaid', 'coverage']):
            agents.append(AgentType.STATE)
            reasoning_parts.append("insurance coordination and prior authorization processing")
        
        if not agents:
            agents = [AgentType.NURSING]  # Default to nursing
            reasoning_parts = ["discharge coordination and home health setup"]
        
        # Create discharge logistics-focused reasoning
        primary_diagnosis = getattr(patient_data, 'primary_icu_diagnosis', 'complex medical condition')
        discharge_focus = f"Discharge coordination required for {primary_diagnosis.lower()} transition to home care. "
        
        if len(reasoning_parts) == 1:
            full_reasoning = discharge_focus + f"Requires {reasoning_parts[0]} to ensure smooth discharge logistics."
        elif len(reasoning_parts) == 2:
            full_reasoning = discharge_focus + f"Requires {reasoning_parts[0]} and {reasoning_parts[1]} for comprehensive discharge coordination."
        else:
            full_reasoning = discharge_focus + f"Requires coordination of {', '.join(reasoning_parts[:-1])}, and {reasoning_parts[-1]} for seamless hospital-to-home transition logistics."
        
        priority = 5 if caregiver_input.urgency_level == "medium" else (8 if caregiver_input.urgency_level == "high" else 3)
        
        return RoutingDecision(
            patient_id=patient_data.patient_id,
            recommended_agents=agents,
            reasoning=full_reasoning,
            priority_score=priority,
            estimated_timeline="24-48 hours post-discharge"
        )
    
    def _generate_nursing_form(self, patient_data, ai_result: Dict) -> Dict[str, Any]:
        """Generate editable form for nursing partners."""
        return {
            "form_id": f"nursing_{patient_data.patient_id}",
            "title": "Nursing Care Coordination Form",
            "fields": [
                {"name": "patient_name", "type": "text", "label": "Patient Name", "value": patient_data.name, "required": True},
                {"name": "primary_diagnosis", "type": "text", "label": "Primary Diagnosis", 
                 "value": getattr(patient_data, 'primary_icu_diagnosis', 'Not specified')},
                {"name": "care_frequency", "type": "select", "label": "Visit Frequency", 
                 "value": getattr(patient_data, 'nursing_visit_frequency', 'weekly') or 'weekly',
                 "options": ["daily", "weekly", "bi-weekly", "monthly"]},
                {"name": "care_type", "type": "textarea", "label": "Type of Care Needed", 
                 "value": getattr(patient_data, 'type_of_nursing_care', '') or ''},
                {"name": "special_instructions", "type": "textarea", "label": "Special Instructions", 
                 "value": getattr(patient_data, 'special_instructions', '') or ''}
            ],
            "recipient": getattr(patient_data, 'nurse_agency', 'Home Health Agency') or 'Home Health Agency'
        }
    
    def _generate_dme_form(self, patient_data, ai_result: Dict) -> Dict[str, Any]:
        """Generate editable form for DME suppliers."""
        return {
            "form_id": f"dme_{patient_data.patient_id}",
            "title": "DME Equipment Request Form",
            "fields": [
                {"name": "patient_name", "type": "text", "label": "Patient Name", "value": patient_data.name, "required": True},
                {"name": "equipment_needed", "type": "textarea", "label": "Equipment Needed", 
                 "value": getattr(patient_data, 'equipment_needed', '') or ''},
                {"name": "delivery_date", "type": "date", "label": "Requested Delivery Date", 
                 "value": str(getattr(patient_data, 'equipment_delivery_date', '')) if getattr(patient_data, 'equipment_delivery_date', None) else ''},
                {"name": "insurance_status", "type": "text", "label": "Insurance Coverage Status", 
                 "value": getattr(patient_data, 'insurance_coverage_status', '') or ''},
                {"name": "delivery_address", "type": "textarea", "label": "Delivery Address", 
                 "value": getattr(patient_data, 'address', '') or ''}
            ],
            "recipient": getattr(patient_data, 'dme_supplier', 'DME Supplier') or 'DME Supplier'
        }
    
    def _generate_pharmacy_form(self, patient_data, ai_result: Dict) -> Dict[str, Any]:
        """Generate editable form for pharmacy partners."""
        # Build medication info from comprehensive data
        medication_info = getattr(patient_data, 'medication', '') or 'None specified'
        if hasattr(patient_data, 'dosage') and patient_data.dosage:
            medication_info += f" - {patient_data.dosage}"
        if hasattr(patient_data, 'frequency') and patient_data.frequency:
            medication_info += f" {patient_data.frequency}"
        if hasattr(patient_data, 'route') and patient_data.route:
            medication_info += f" ({patient_data.route})"
            
        return {
            "form_id": f"pharmacy_{patient_data.patient_id}",
            "title": "Pharmacy Consultation Form",
            "fields": [
                {"name": "patient_name", "type": "text", "label": "Patient Name", "value": patient_data.name, "required": True},
                {"name": "consultation_type", "type": "select", "label": "Consultation Type", "value": "medication_review",
                 "options": ["medication_review", "drug_interaction", "dosing_optimization", "adherence_support"]},
                {"name": "current_medications", "type": "textarea", "label": "Current Medications", 
                 "value": medication_info},
                {"name": "allergies", "type": "text", "label": "Allergies", 
                 "value": getattr(patient_data, 'allergies', '') or 'None'},
                {"name": "prescriber_info", "type": "text", "label": "Prescriber", 
                 "value": f"{getattr(patient_data, 'prescriber_name', '') or 'Unknown'} - {getattr(patient_data, 'prescriber_contact', '') or ''}"}
            ],
            "recipient": "Clinical Pharmacist"
        }
    
    def _generate_state_form(self, patient_data, ai_result: Dict) -> Dict[str, Any]:
        """Generate editable form for state/insurance coordination."""
        return {
            "form_id": f"state_{patient_data.patient_id}",
            "title": "Insurance Authorization & State Programs Form",
            "fields": [
                {"name": "patient_name", "type": "text", "label": "Patient Name", "value": patient_data.name, "required": True},
                {"name": "mrn", "type": "text", "label": "Medical Record Number", 
                 "value": getattr(patient_data, 'mrn', '') or ''},
                {"name": "primary_diagnosis", "type": "text", "label": "Primary Diagnosis", 
                 "value": getattr(patient_data, 'primary_icu_diagnosis', '') or ''},
                {"name": "prescriber_npi", "type": "text", "label": "Prescriber NPI", 
                 "value": getattr(patient_data, 'npi_number', '') or ''},
                {"name": "insurance_status", "type": "select", "label": "Insurance Coverage Status", 
                 "value": getattr(patient_data, 'insurance_coverage_status', 'pending') or 'pending',
                 "options": ["active", "pending", "denied", "expired", "unknown"]},
                {"name": "services_requested", "type": "textarea", "label": "Services Requiring Authorization", 
                 "value": f"Home Health: {getattr(patient_data, 'skilled_nursing_needed', 'No')}\nDME: {getattr(patient_data, 'equipment_needed', 'None')}"},
                {"name": "authorization_urgency", "type": "select", "label": "Authorization Urgency", 
                 "value": "standard", "options": ["urgent", "standard", "routine"]}
            ],
            "recipient": "Insurance Authorization Department"
        }
    
    async def _call_ai(self, prompt: str) -> str:
        """Make API call to AI provider (Google AI Studio or OpenAI)."""
        if not self.client:
            raise Exception("No AI API key configured")
        
        try:
            if hasattr(self.client, 'generate_content'):  # Google AI Studio
                response = self.client.generate_content(prompt)
                raw_text = response.text
                
                # Clean markdown formatting
                cleaned_text = raw_text.strip()
                if cleaned_text.startswith('```json'):
                    cleaned_text = cleaned_text[7:]
                if cleaned_text.startswith('```'):
                    cleaned_text = cleaned_text[3:]
                if cleaned_text.endswith('```'):
                    cleaned_text = cleaned_text[:-3]
                
                return cleaned_text.strip()
            else:  # OpenAI
                response = await self.client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=1000,
                    temperature=0.7
                )
                return response.choices[0].message.content
        except Exception as e:
            raise Exception(f"AI API call failed: {str(e)}")
