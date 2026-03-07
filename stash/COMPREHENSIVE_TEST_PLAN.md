COMPREHENSIVE PATIENT DATA SYNCHRONIZATION TEST PLAN
============================================================

## Overview
This test plan verifies that when patient records are edited in the hospital portal, 
the changes are immediately visible in the patient portal.

## Test Environment Setup
- Server: http://localhost:3000
- Mock Patient ID: HP12345
- Mock Patient Password: test123
- Hospital Credentials: admin@cityhospital.com / adminpass123

## Pre-Test Verification
1. Verify server is running at http://localhost:3000
2. Check browser console for any errors
3. Verify mock data utility is functioning

## Test Scenarios

### Scenario 1: Initial Data Verification
**Objective**: Verify both portals show the same initial data

Steps:
1. **Hospital Portal Access**:
   - Navigate to http://localhost:3000
   - Click "Hospital Login"
   - Login with: admin@cityhospital.com / adminpass123
   - Navigate to patient search
   - Search for patient: HP12345
   - Verify patient appears in search results
   - Access patient details
   - Record initial data:
     - Personal Info (name, email, phone, address)
     - Medical History (conditions, allergies, medications)
     - Vitals, visits, documents

2. **Patient Portal Access**:
   - Open new browser tab/window
   - Navigate to http://localhost:3000
   - Click "Patient Login"  
   - Login with: HP12345 / test123
   - Access each section and record data:
     - Dashboard
     - Health Overview
     - Medical History
     - Medications
     - Vitals
     - Visits
     - Documents
     - Profile

3. **Verification**:
   - Compare data between hospital and patient portals
   - Data should be identical

### Scenario 2: Personal Information Update
**Objective**: Verify personal info changes sync immediately

Steps:
1. **Hospital Portal - Edit Personal Info**:
   - In hospital portal, navigate to patient edit page for HP12345
   - Update the following:
     - Email: john.doe.updated@email.com
     - Phone: +1-555-999-8888
     - Address: 456 Updated Ave, Boston, MA 02101
   - Save changes
   - Verify success message appears
   - Verify changes are visible in hospital patient details

2. **Patient Portal - Verify Changes**:
   - In patient portal, refresh the page or navigate between sections
   - Check Profile section
   - Check Dashboard (personal info display)
   - Verify all personal info changes are visible

### Scenario 3: Medical History Updates
**Objective**: Verify medical history changes sync immediately

Steps:
1. **Hospital Portal - Add Medical Conditions**:
   - In hospital portal patient edit page for HP12345
   - Add new medical condition:
     - Name: "Diabetes Type 2"
     - Diagnosed Date: Current date
     - Severity: "Moderate"
     - Status: "Active"
     - Doctor: "Dr. Johnson"
     - Notes: "Recently diagnosed, monitoring blood sugar"
   - Save changes

2. **Hospital Portal - Add Allergy**:
   - Add new allergy:
     - Name: "Shellfish"
     - Severity: "Moderate"
     - Reaction: "Hives, swelling"
     - Date Identified: Current date
   - Save changes

3. **Hospital Portal - Add Medication**:
   - Add new medication:
     - Name: "Metformin"
     - Dosage: "500mg"
     - Frequency: "Twice daily"
     - Prescribed By: "Dr. Johnson"
     - Start Date: Current date
     - Status: "Active"
   - Save changes

4. **Patient Portal - Verify Medical History Changes**:
   - Refresh patient portal
   - Check Medical History section
   - Verify new condition appears
   - Verify new allergy appears
   - Check Medications section
   - Verify new medication appears
   - Check Dashboard for updated summary
   - Check Health Overview for updated data

### Scenario 4: Lab Results and File Upload
**Objective**: Verify file uploads and lab results sync properly

Steps:
1. **Hospital Portal - Add Lab Results with Files**:
   - In hospital portal patient edit page
   - Add lab result:
     - Test Name: "Complete Blood Count"
     - Date: Current date
     - Results: "Normal ranges"
     - Doctor: "Dr. Smith"
     - Upload a test file (any small PDF or image)
   - Save changes

2. **Patient Portal - Verify Lab Results**:
   - In patient portal, check Documents section
   - Verify lab result appears
   - Verify file can be downloaded
   - Verify file can be viewed in modal popup
   - Check Medical History for lab results
   - Check Health Overview for updated lab data

### Scenario 5: Vitals and Visit Records
**Objective**: Verify vitals and visit records sync properly

Steps:
1. **Hospital Portal - Add Vitals**:
   - Add new vital signs:
     - Blood Pressure: "130/85"
     - Heart Rate: "78 bpm"
     - Temperature: "98.6°F"
     - Date: Current date
     - Recorded By: "Dr. Johnson"
   - Save changes

2. **Hospital Portal - Add Visit Record**:
   - Add new visit:
     - Date: Current date
     - Hospital: "City General Hospital"
     - Type: "Follow-up"
     - Reason: "Diabetes monitoring"
     - Diagnosis: "Diabetes Type 2 - stable"
     - Doctor: "Dr. Johnson"
   - Save changes

3. **Patient Portal - Verify Vitals and Visits**:
   - Check Vitals section for new readings
   - Check Visits section for new visit
   - Check Dashboard for updated vitals display
   - Check Health Overview for updated data

### Scenario 6: Real-time Synchronization Test
**Objective**: Verify changes appear immediately without refresh

Steps:
1. **Setup Two Browser Windows**:
   - Hospital portal in one window (logged in, patient edit page open)
   - Patient portal in another window (logged in, relevant section open)

2. **Make Changes and Monitor**:
   - In hospital portal, make a small change (e.g., update phone number)
   - Save changes
   - In patient portal window, navigate between sections
   - Verify changes appear without manual refresh

### Scenario 7: Error Handling and Edge Cases
**Objective**: Verify system handles errors gracefully

Steps:
1. **Test Invalid Data**:
   - Try to save patient with empty required fields
   - Verify appropriate error messages appear
   - Verify data integrity is maintained

2. **Test Large Data**:
   - Add multiple conditions, allergies, medications
   - Verify performance remains acceptable
   - Verify all data syncs correctly

3. **Test Concurrent Updates**:
   - Make changes in hospital portal
   - Before saving, make changes in another browser tab
   - Verify conflicts are handled appropriately

## Expected Results
- All data changes in hospital portal appear immediately in patient portal
- No data loss or corruption occurs
- File uploads work correctly and files are accessible
- Modal viewers work for document attachments
- Error handling is appropriate and user-friendly
- Performance is acceptable even with multiple updates

## Test Data Cleanup
After testing, verify that:
- Mock data can be reset if needed
- No test data affects production functionality
- All test files are properly managed

## Automation Notes
This test plan can be automated using:
- Selenium/Playwright for UI automation
- API testing tools for backend verification
- Database checks for data integrity validation

## Success Criteria
✅ All personal info changes sync immediately
✅ All medical history changes sync immediately
✅ File uploads work and sync properly
✅ Vitals and visits sync correctly
✅ Real-time updates work without refresh
✅ Error handling is robust
✅ Performance is acceptable
✅ No data corruption occurs
✅ Modal document viewers work correctly
✅ All patient portal sections show updated data
