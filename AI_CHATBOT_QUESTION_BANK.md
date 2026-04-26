# AI Chatbot Question Bank

Use these example prompts directly in the chatbot. They are grouped by portal role.

## Patient Portal

### Profile & Basics
- What is my full name, age, and blood group in the database?
- What contact details and emergency contact do you have for me?
- Show my Health Passport ID.
- Do you have my latest profile details, and when were they last updated?

### Visits & Care Timeline
- What was my last hospital visit and diagnosis?
- Show all my visits in chronological order.
- How many visits do I have in total?
- Which doctor and hospital were involved in my most recent visit?
- What treatment was recorded during my last 3 visits?

### Medications
- What are my currently active medications?
- What was my last prescribed medication?
- Show medication name, dosage, frequency, and start date for all entries.
- Which medications have been discontinued?
- How many active vs discontinued medications do I have?

### Medical History
- List all my medical conditions with status and severity.
- What allergies are recorded for me?
- Show my immunization history.
- What procedures are present in my records?

### Labs, Vitals & Documents
- Show my latest lab report result.
- List all lab results with test name, date, and status.
- What is the latest blood pressure and heart rate recorded for me?
- Show all my uploaded documents and their types.
- Which is my most recently uploaded medical document?


## Admin Portal

### Global Counts
- How many total patients are there in the system?
- How many doctors and hospitals are registered?
- How many patients are above 18 years of age?
- How many patients are below 18 years?
- Give me patient count by blood group.

### Operational Metrics
- How many hospital patient records are active right now?
- How many hospital records are marked high risk?
- How many notifications are pending, approved, denied, and expired?
- Which hospital has the highest number of linked patient records?
- Which doctor has the highest number of associated patient visits?

### Deep Insights from Stored Data
- Show top 10 patients with highest number of visits.
- Show doctors grouped by specialty.
- List all unverified/verified hospitals and doctors.
- Which patients have no visit records?
- Which patients currently have active medications?

### Data Auditing
- Show patient records missing emergency contact info.
- Show records where blood group is unavailable.
- List notifications that are about to expire.
- Identify patients with no uploaded documents.


## Hospital Portal (Hospital/Doctor Scope)

### Hospital-Level Questions
- How many patients are currently in my hospital scope?
- How many of my scoped patients are above 18?
- Show active vs inactive hospital patient records.
- How many high-risk patients are currently in my records?
- List patients with their risk level and last visit date.

### Patient Management
- Show patients in my scope with active medications.
- Show patients in my scope with allergies.
- Which patients have not visited recently?
- List the latest records added to my hospital view.
- Which patient in my scope has the highest number of visits?

### Access & Requests
- Show all pending access requests for my hospital.
- Show approved and denied requests this week.
- Which access requests are expiring soon?

### Doctor-Specific (if logged in as doctor)
- How many patients are linked to me as a doctor?
- Show all visits where I am the doctor.
- List medications prescribed by me.
- Show lab tests ordered by me.
- Which of my patients need close follow-up based on frequent visits or active meds?


## Natural Language Variations You Can Also Use

- “Summarize this portal’s key stats for me.”
- “Give me a quick dashboard view in bullet points.”
- “Filter this by last 30 days.”
- “Show only high-risk entries.”
- “Export-style summary with counts first, then details.”


## Good Prompt Tips

- Mention a **time range** (e.g., last 7 days, last month).
- Mention a **filter** (e.g., active meds only, high-risk only).
- Mention an **output style** (short summary, table-like bullets, detailed list).
- Ask follow-ups like “now group by hospital”, “now sort by latest date”, etc.
