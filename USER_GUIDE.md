# 📖 **User Guide - Discharge Planning Application**

## 🚀 **Getting Started**

### **Step 1: Start the Application**

Open **two terminal windows** and run these commands:

#### **Terminal 1 - Start Backend API:**
```bash
cd /Users/rajvi/routing-ai-agent
export $(grep -v '^#' .env | xargs)
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

#### **Terminal 2 - Start React Frontend:**
```bash
cd /Users/rajvi/routing-ai-agent/frontend
npm start
```

### **Step 2: Access the Application**
- **Main Application:** http://localhost:3000
- **API Documentation:** http://localhost:8000/docs

---

## 📁 **Data Management (First Time Setup)**

### **1. Prepare Your Excel File**
Create an Excel file with patient data using these columns:

**Required Columns:**
- `PatientID` or `Patient ID`
- `Name`
- `Primary ICU Diagnosis`
- `Skilled Nursing Needed` (Yes/No)
- `Equipment Needed`
- `Medication`
- `Insurance Coverage Status`

**Optional Columns:**
- `Gender`, `Age`, `MRN`, `Address`, `Phone`
- `Allergies`, `Prescriber Name`, `Nursing Visit Frequency`
- `Secondary Diagnoses`, `Special Instructions`

### **2. Load Your Data**

#### **Option A: Use Default Directory**
1. Place your Excel file in: `/Users/rajvi/patient_data/`
2. Go to http://localhost:3000/manage-data
3. Click **"Reload Latest File"**

#### **Option B: Load Specific File**
1. Go to http://localhost:3000/manage-data
2. Find your file in the **"Available Files"** section
3. Click the **"Load"** button next to your file

#### **Option C: Change Data Directory**
1. Go to http://localhost:3000/manage-data
2. Click **"Settings"** button
3. Enter your custom directory path
4. Click **"Update Directory"**

---

## 🏥 **Using the Discharge Planning Workflow**

### **Step 1: Access the Main Dashboard**
- Go to http://localhost:3000
- You should see the main discharge planning interface

### **Step 2: Select a Patient**
1. Click the **"Select Patient"** dropdown
2. Choose a patient from the loaded data
3. You'll see patient details below the dropdown

### **Step 3: Fill Out the Case Information**

#### **Required Fields:**
- **Primary Concern:** Describe why the patient needs discharge planning
  - Example: *"Patient with COPD exacerbation needs home health coordination and equipment setup for safe discharge"*

#### **Optional Fields:**
- **Urgency Level:** Choose Low, Medium, or High priority
- **Requested Services:** Enter services like "nursing, equipment, pharmacy"
- **Additional Notes:** Any special considerations

### **Step 4: Process the Case**

#### **Option A: Complete Discharge Planning (Recommended)**
1. Click **"Complete Discharge Planning"** button
2. Wait for AI processing (usually 10-30 seconds)
3. View comprehensive results from all relevant agents

#### **Option B: Quick Actions (Individual Agents)**
- **Route Only:** Get routing decision without agent processing
- **Nursing:** Process only nursing agent
- **DME:** Process only equipment agent
- **Pharmacy:** Process only pharmacy agent
- **Insurance:** Process only insurance/state agent

---

## 📊 **Understanding the Results**

### **Routing Decision Card**
- **Recommended Agents:** Which specialists should handle this case
- **Priority Score:** 1-10 scale (higher = more urgent)
- **Timeline:** Expected completion timeframe
- **AI Reasoning:** Why these agents were selected

### **Agent Response Cards**
Each agent provides:
- **Recommendations:** What should be done
- **Next Steps:** Specific actions to take
- **External Referrals:** Outside services needed
- **Timeline:** When tasks should be completed

### **Agent Types:**
- **🏥 Nursing:** Home health coordination, skilled nursing setup
- **🦽 DME:** Medical equipment delivery and setup
- **💊 Pharmacy:** Medication management and coordination
- **📄 Insurance:** Coverage verification and authorization

---

## 🎯 **Example Workflow**

### **Sample Case: COPD Patient Discharge**

1. **Select Patient:** "Michael Kelly - COPD Exacerbation"
2. **Set Urgency:** High Priority
3. **Primary Concern:** 
   ```
   Patient with COPD exacerbation being discharged after 24-day ICU stay. 
   Needs coordination for home equipment, skilled nursing, and medication management.
   ```
4. **Requested Services:** "nursing care, medical equipment, medication management"
5. **Click:** "Complete Discharge Planning"

### **Expected Results:**
- **Routing Decision:** 4 agents recommended (Nursing, DME, Pharmacy, State)
- **Priority Score:** 8/10 (High Priority)
- **Timeline:** 24-48 hours post-discharge
- **Total Output:** ~15-20 recommendations and action items

---

## 🔧 **Data Management Features**

### **Monitor Patient Data**
- **Total Patients:** See how many patients are loaded
- **Nursing Needed:** Count of patients requiring home health
- **Equipment Needed:** Count of patients requiring DME
- **Insurance Issues:** Count of patients with coverage problems

### **File Management**
- **Auto-Refresh:** System checks for new files every 30 seconds
- **File Status:** Green dot = recent, yellow = today, gray = older
- **Load Specific Files:** Choose which Excel file to load
- **Directory Management:** Change where files are stored

### **Patient Overview**
- **Patient Cards:** Visual display of all loaded patients
- **Status Badges:** Quick indicators for nursing, equipment, medication needs
- **Detailed Information:** Patient ID, diagnosis, requirements

---

## ⚠️ **Troubleshooting**

### **Common Issues:**

#### **"No patients loaded" Error**
1. Go to http://localhost:3000/manage-data
2. Check if Excel files are in the data directory
3. Click "Reload Latest File"
4. Verify Excel file has required columns

#### **"Failed to load patients" Error**
1. Check that both backend and frontend are running
2. Verify Excel file format is correct
3. Check browser console for detailed errors

#### **Processing Takes Too Long**
1. Check your internet connection (AI requires API access)
2. Verify GOOGLE_AI_API_KEY is set in .env file
3. Try processing individual agents instead of complete case

#### **Results Don't Appear**
1. Check browser console for JavaScript errors
2. Verify patient data is properly loaded
3. Try refreshing the page and reprocessing

### **Getting Help:**
- **API Status:** Check http://localhost:8000/health
- **API Documentation:** http://localhost:8000/docs
- **Browser Console:** Press F12 to see detailed error messages

---

## 📋 **Best Practices**

### **For Best Results:**

#### **Patient Data:**
- Include as much patient information as possible
- Use consistent formatting in Excel files
- Keep patient IDs unique and meaningful

#### **Case Processing:**
- Be specific in primary concern descriptions
- Include relevant medical details
- Set appropriate urgency levels

#### **Data Management:**
- Regularly update Excel files with new patient data
- Use descriptive filenames with dates
- Keep backup copies of important data files

### **Workflow Tips:**
1. **Start with Data:** Always load patient data first
2. **Review Results:** Read all agent recommendations carefully
3. **Use Quick Actions:** For specific needs, use individual agents
4. **Monitor Status:** Check data management page regularly

---

## 🎉 **You're Ready to Use the System!**

### **Quick Start Checklist:**
- [ ] Both terminals running (backend + frontend)
- [ ] Excel file with patient data prepared
- [ ] Data loaded via Manage Data page
- [ ] Patient selected on main dashboard
- [ ] Case information filled out
- [ ] Processing completed successfully
- [ ] Results reviewed and understood

### **Next Steps:**
1. **Load Your Data:** Start with your Excel patient file
2. **Try a Test Case:** Process a sample patient
3. **Explore Features:** Try different urgency levels and agents
4. **Review Results:** Understand the AI recommendations
5. **Use in Practice:** Apply to real discharge planning cases

**The system is now ready for professional discharge planning use!** 🏥✨

### **Support:**
- **Application:** http://localhost:3000
- **API Docs:** http://localhost:8000/docs
- **Data Management:** http://localhost:3000/manage-data
