# 📊 Patient Data Directory

This directory contains patient data files used by the Routing AI Agent for discharge planning.

## 📁 Directory Structure

```
patient_data/
├── README.md           # This file
├── sample 2.xlsx       # Sample patient data (included in repository)
└── [other files]       # User-uploaded patient data (ignored by git)
```

## 📋 File Formats Supported

- **Excel Files** (`.xlsx`): Primary format for patient data
- **CSV Files** (`.csv`): Alternative format for patient data
- **JSON Files** (`.json`): Runtime data storage format

## 🔒 Data Privacy & Security

- **Sample files** (`sample_*.xlsx`, `sample_*.csv`) are included in the repository
- **Actual patient data** files are automatically ignored by git for privacy
- **Sensitive information** should never be committed to version control
- **HIPAA compliance** considerations apply to any real patient data

## 📊 Sample Data

The included `sample 2.xlsx` file contains 5 realistic patient scenarios:

| Patient ID | Name | Condition | Nursing | Equipment | Insurance |
|------------|------|-----------|---------|-----------|-----------|
| 1001 | Michael Kelly | COPD Exacerbation | Yes | Suction, Trach supplies | Pending |
| 1002 | Gary Jones | COPD Exacerbation | No | Hospital bed, IV pole | Pending |
| 1003 | Isaiah Oneal | CHF Exacerbation | Yes | Hospital bed, IV pole | Denied |
| 1004 | Bryan Keller | CHF Exacerbation | Yes | Walker, Commode | Approved |
| 1005 | Victoria Conley | Acute Pancreatitis | No | Wheelchair, Oxygen | Approved |

## 📤 Adding New Patient Data

### Via Web Interface (Recommended)
1. Go to **Data Management** page (`/manage-data`)
2. Click **"Upload Excel File"**
3. Select your patient data file
4. Verify data loads correctly

### Via File System
1. Copy your Excel/CSV file to this directory
2. Restart the backend service
3. Check `/api/data-status` endpoint to verify loading

## 📋 Required Data Columns

Your Excel/CSV files should include these columns:

### Patient Information
- `patient_id` - Unique identifier
- `name` - Patient full name
- `primary_diagnosis` - Primary medical diagnosis
- `age` - Patient age
- `gender` - Patient gender

### Discharge Planning
- `skilled_nursing_needed` - Yes/No
- `equipment_needed` - List of required equipment
- `medication` - Current medications
- `insurance_coverage_status` - Approved/Pending/Denied

### Dates
- `admission_date` - Hospital admission date
- `expected_discharge_date` - Planned discharge date

## 🔧 Data Service Configuration

The data service automatically:
- **Scans this directory** for Excel and CSV files on startup
- **Loads patient data** into memory for fast access
- **Caches data** to improve performance
- **Validates data** format and required fields

## 🧪 Testing Data

For testing and demos, use the included sample data:
- **Realistic scenarios** based on common discharge planning cases
- **Varied complexity** from simple to complex discharge needs
- **Different insurance statuses** to test authorization workflows
- **Multiple medical conditions** (COPD, CHF, Pancreatitis)

## 🚨 Important Notes

- **Never commit real patient data** to version control
- **Use sample data** for development and testing
- **Follow HIPAA guidelines** for any real patient information
- **Backup important data** before making changes
- **Test data loading** after adding new files

## 🔍 Troubleshooting

### Data Not Loading
```bash
# Check file permissions
ls -la patient_data/

# Check backend logs
tail -f backend.log

# Test data status endpoint
curl http://localhost:8000/api/data-status
```

### File Format Issues
- Ensure Excel files are `.xlsx` format (not `.xls`)
- Check that required columns are present
- Verify data types match expected formats
- Remove any empty rows or columns

### Performance Issues
- Large files (>1000 patients) may take longer to load
- Consider splitting large datasets into smaller files
- Monitor memory usage with large datasets

---

**🏥 This directory is essential for the Routing AI Agent's patient data management and discharge planning functionality.**
