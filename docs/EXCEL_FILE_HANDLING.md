# 📊 Excel File Handling Guide

## 🎯 What Happens When You Upload Different Excel Files

The Routing AI Agent has robust Excel file processing with intelligent validation and error handling. Here's exactly what happens in different scenarios:

## ✅ **Scenario 1: Perfect File - All Fields Present**

**Excel Structure:**
```
patient_id | name        | age | gender | diagnosis      | medications | medical_history | current_symptoms | mobility_status | insurance_info
TEST001    | John Smith  | 65  | Male   | Diabetes       | Metformin   | Heart disease   | Fatigue         | Ambulatory      | Medicare
```

**Result:** ✅ **SUCCESS**
- All patients processed successfully
- All fields populated correctly
- Ready for AI processing

---

## ✅ **Scenario 2: Missing Optional Fields**

**Excel Structure:**
```
patient_id | name        | age | gender | diagnosis
TEST002    | Jane Doe    | 70  | Female | Hypertension
```

**Result:** ✅ **SUCCESS**
- Patients processed successfully
- Missing optional fields filled with empty arrays/null values
- AI routing still works with available data

**What Gets Filled:**
- `medications`: `[]` (empty array)
- `medical_history`: `[]` (empty array)  
- `current_symptoms`: `[]` (empty array)
- `mobility_status`: `null`
- `insurance_info`: `null`

---

## ❌ **Scenario 3: Missing Required Fields**

**Excel Structure:**
```
patient_id | name        | age
TEST003    | Bob Smith   | 75
```

**Result:** ❌ **ERROR**
```
Error: Missing required columns: ['gender', 'diagnosis']
```

**Required Fields:**
- `patient_id`
- `name` 
- `age`
- `gender`
- `diagnosis`

---

## ✅ **Scenario 4: Extra Fields (Ignored Gracefully)**

**Excel Structure:**
```
patient_id | name      | age | gender | diagnosis | emergency_contact | allergies | room_number | custom_notes
TEST004    | Sue Jones | 60  | Female | COPD      | John-555-1234    | Penicillin| 101A        | VIP Patient
```

**Result:** ✅ **SUCCESS**
- Required and optional fields processed
- Extra fields **ignored** (not an error)
- System only uses fields it recognizes

**Extra Fields Ignored:**
- `emergency_contact`
- `allergies`
- `room_number`
- `custom_notes`

---

## ❌ **Scenario 5: Wrong Data Types**

**Excel Structure:**
```
patient_id | name        | age           | gender | diagnosis
TEST005    | Bad Data    | seventy-five  | Female | Test
```

**Result:** ❌ **ERROR**
```
Error: Processed 0 patients successfully, but 1 rows had errors:
Row 2: Age must be a valid number, got: seventy-five
```

**Data Type Requirements:**
- `age`: Must be a valid integer
- `patient_id`: String
- `name`: String
- `gender`: String
- `diagnosis`: String

---

## ❌ **Scenario 6: Empty File**

**Excel Structure:**
```
(No data)
```

**Result:** ❌ **ERROR**
```
Error: Missing required columns: ['patient_id', 'name', 'age', 'gender', 'diagnosis']
```

---

## ❌ **Scenario 7: Case Sensitive Column Names**

**Excel Structure:**
```
Patient_ID | NAME      | Age | Gender | Diagnosis
TEST007    | Test User | 65  | Male   | Test
```

**Result:** ❌ **ERROR**
```
Error: Missing required columns: ['patient_id', 'name', 'age', 'gender', 'diagnosis']
```

**Column Names Must Be Exact:**
- `patient_id` (not `Patient_ID`)
- `name` (not `NAME`)
- `age` (not `Age`)
- `gender` (not `Gender`)
- `diagnosis` (not `Diagnosis`)

---

## ⚠️ **Scenario 8: Mixed Data Quality**

**Excel Structure:**
```
patient_id | name         | age | gender | diagnosis
GOOD001    | Good Patient | 65  | Female | Complete
PARTIAL001 | Partial      | 70  | Male   | Partial
BAD001     | Bad Patient  |     |        |
```

**Result:** ❌ **PARTIAL ERROR**
```
Error: Processed 2 patients successfully, but 1 rows had errors:
Row 4: Missing required fields: ['age', 'gender', 'diagnosis']
```

**Behavior:**
- Good rows are processed and cached
- Bad rows cause the entire upload to fail
- **No partial uploads** - it's all or nothing

---

## 🔧 **How to Handle Different Scenarios**

### **✅ Best Practices:**

1. **Use the Sample File as Template**
   - Download the sample from the dashboard
   - Keep the exact column names
   - Follow the data format

2. **Required Fields Must Be Present:**
   ```
   patient_id, name, age, gender, diagnosis
   ```

3. **Optional Fields Can Be Empty:**
   ```
   medications, medical_history, current_symptoms, mobility_status, insurance_info
   ```

4. **List Fields Use Semicolon Separation:**
   ```
   medications: "Metformin 500mg; Lisinopril 10mg; Aspirin 81mg"
   current_symptoms: "Fatigue; Dizziness; Frequent urination"
   ```

### **🛠️ Fixing Common Issues:**

**Issue: Column Name Case**
```
❌ Patient_ID, NAME, Age
✅ patient_id, name, age
```

**Issue: Age as Text**
```
❌ "seventy-five", "N/A", "unknown"
✅ 75, 65, 80
```

**Issue: Missing Required Data**
```
❌ Empty cells in required columns
✅ Fill all required fields with valid data
```

**Issue: Wrong List Format**
```
❌ medications: "Metformin, Lisinopril, Aspirin"
✅ medications: "Metformin; Lisinopril; Aspirin"
```

---

## 📋 **Excel Template Structure**

Here's the exact structure your Excel file should have:

| Column Name | Required | Data Type | Example | Notes |
|-------------|----------|-----------|---------|-------|
| `patient_id` | ✅ Yes | String | "P001" | Unique identifier |
| `name` | ✅ Yes | String | "John Smith" | Patient full name |
| `age` | ✅ Yes | Integer | 65 | Must be a number |
| `gender` | ✅ Yes | String | "Male" | Male/Female/Other |
| `diagnosis` | ✅ Yes | String | "Diabetes Type 2" | Primary diagnosis |
| `medications` | ❌ No | String | "Med1; Med2; Med3" | Semicolon separated |
| `medical_history` | ❌ No | String | "History1; History2" | Semicolon separated |
| `current_symptoms` | ❌ No | String | "Symptom1; Symptom2" | Semicolon separated |
| `mobility_status` | ❌ No | String | "Ambulatory" | Free text |
| `insurance_info` | ❌ No | String | "Medicare Part A & B" | Free text |

---

## 🎯 **Testing Your Excel File**

Before uploading to the main application, you can test your Excel file:

```bash
# Test your Excel file
cd /Users/rajvi/routing-ai-agent
python3 test_excel_scenarios.py
```

This will show you exactly what happens with different file formats and help you fix any issues before uploading.

---

## 💡 **Pro Tips**

1. **Start with the Sample File** - Always use the provided sample as your template
2. **Check Column Names** - They must match exactly (case-sensitive)
3. **Validate Data Types** - Age must be numbers, not text
4. **Use Semicolons for Lists** - Separate multiple items with semicolons
5. **Fill Required Fields** - Never leave required columns empty
6. **Test Small Batches** - Upload a few patients first to test your format

The system is designed to be helpful but strict - it will clearly tell you what's wrong and how to fix it! 🚀
