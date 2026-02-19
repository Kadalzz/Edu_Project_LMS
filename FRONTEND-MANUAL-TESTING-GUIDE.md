# 🧪 Day 1-8 Frontend Manual Testing Guide

**Date**: February 19, 2026  
**Services**:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001/graphql
- Database: Neon PostgreSQL (Connected ✅)

---

## 🎯 Test Preparation

### Test Accounts
Login dengan accounts berikut untuk test different roles:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@lms.com | admin123 |
| **Teacher** | teacher@lms.com | teacher123 |
| **Student** | student@lms.com | student123 |

---

## ✅ Testing Checklist

### 1. Authentication (Day 1)

#### ➡️ Login Flow
1. [ ] Buka http://localhost:3000
2. [ ] Klik "Login" atau otomatis redirect ke /login
3. [ ] Test login dengan **admin@lms.com** / admin123
4. [ ] **Expected**: Redirect ke `/dashboard`
5. [ ] **Expected**: Sidebar muncul dengan menu items
6. [ ] **Expected**: User name "Admin User" muncul di sidebar/header

#### ❌ Error Handling
1. [ ] Logout, login lagi dengan email: `wrong@email.com`
2. [ ] **Expected**: Error message "User not found" atau similar
3. [ ] Login dengan admin@lms.com / `wrongpassword`
4. [ ] **Expected**: Error message "Invalid password" atau similar

#### 🚪 Logout
1. [ ] Click logout button (biasanya di sidebar bawah atau profile menu)
2. [ ] **Expected**: Redirect ke /login
3. [ ] Try akses /dashboard directly
4. [ ] **Expected**: Redirect back to /login (protected route)

**Known Bug**: 
- ⚠️ SSR logout on refresh - jika refresh page, akan logout. Workaround: navigasi pakai sidebar

---

### 2. Dashboard (Day 2)

#### 📊 Dashboard Overview
1. [ ] Login as **Admin**
2. [ ] **Expected**: Dashboard menampilkan summary cards:
   - Total Students
   - Total Teachers/Instructors
   - Active Classrooms
   - Recent Activities
3. [ ] **Expected**: Cards ada numbers/counts
4. [ ] **Expected**: Layout responsive & clean

#### 🧭 Navigation
Test semua menu items di sidebar:
1. [ ] Click "Dashboard" → should load dashboard with data
2. [ ] Click "Subjects" → should navigate to /dashboard/subjects
3. [ ] Click "Modules" → should navigate to /dashboard/modules
4. [ ] Click "Lessons" → should navigate to /dashboard/lessons
5. [ ] Click "Assignments" → should navigate to /dashboard/assignments
6. [ ] Click "Classrooms" → should navigate to /dashboard/classrooms
7. [ ] Click "Notes" → should navigate to /dashboard/notes
8. [ ] Click "Daily Reports" → should navigate to /dashboard/daily-reports

---

### 3. Subjects Management (Day 3)

#### 📚 View Subjects
1. [ ] Navigate to **Subjects** page
2. [ ] **Expected**: List/table of subjects with columns:
   - Subject Name
   - Code
   - Description (optional)
   - Actions (Edit/Delete buttons)
3. [ ] **Expected**: "Create Subject" or "+ New Subject" button visible

#### ➕ Create Subject
1. [ ] Click "Create Subject" button
2. [ ] **Expected**: Form appears (modal or new page) with fields:
   - Name (required)
   - Code (required, unique)
   - Description (optional)
3. [ ] Fill form:
   - Name: `Test Subject UI`
   - Code: `TST-UI-001`
   - Description: `Testing from manual UI`
4. [ ] Click "Save" or "Create"
5. [ ] **Expected**: Success toast/message
6. [ ] **Expected**: New subject appears in list
7. [ ] **Expected**: Form closes/resets

#### 📝 Edit Subject
1. [ ] Find "Test Subject UI" in list
2. [ ] Click "Edit" button/icon
3. [ ] **Expected**: Form pre-filled with existing data
4. [ ] Change description to: `Updated via UI testing`
5. [ ] Click "Save" or "Update"
6. [ ] **Expected**: Success message
7. [ ] **Expected**: Updated data reflected in list

#### 🗑️ Delete Subject
1. [ ] Click "Delete" on "Test Subject UI"
2. [ ] **Expected**: Confirmation dialog/modal: "Are you sure?"
3. [ ] Click "Cancel" → nothing deleted
4. [ ] Click "Delete" again → Click "Confirm"
5. [ ] **Expected**: Success message
6. [ ] **Expected**: Subject removed from list

**UI Issues to Note**:
- [ ] Form validation messages clear?
- [ ] Loading states present?
- [ ] Error handling graceful?

---

### 4. Modules Management (Day 4)

#### 📦 View Modules
1. [ ] Navigate to **Modules** page
2. [ ] **Expected**: Modules displayed with:
   - Module Title
   - Subject Name (linked/badge)
   - Order number
   - Actions
3. [ ] **Expected**: Filter by Subject dropdown exists
4. [ ] Test filter → select a subject
5. [ ] **Expected**: Only modules for that subject shown

#### ➕ Create Module
1. [ ] Click "Create Module"
2. [ ] **Expected**: Form with fields:
   - Title (required)
   - Description (optional)
   - Subject (dropdown, required)
   - Order (number, default 1)
3. [ ] Fill form:
   - Title: `Test Module UI`
   - Select any subject from dropdown
   - Order: 1
4. [ ] Click "Save"
5. [ ] **Expected**: Success + module appears in list

#### 📝 Edit & Delete
1. [ ] Edit → change order to 2
2. [ ] **Expected**: Save successful, order updated
3. [ ] Delete → confirm deletion
4. [ ] **Expected**: Module removed

**UI Checks**:
- [ ] Subject dropdown populated with actual subjects?
- [ ] Order field accepts numbers only?
- [ ] Validation errors shown?

---

### 5. Lessons Management (Day 5)

#### 📖 View Lessons
1. [ ] Navigate to **Lessons** page
2. [ ] **Expected**: Lessons list with:
   - Lesson Title
   - Module Name
   - Subject Name
   - Content Preview (first N chars)
   - Actions
3. [ ] **Expected**: Filter by Module or Subject

#### ➕ Create Lesson
1. [ ] Click "Create Lesson"
2. [ ] **Expected**: Form with:
   - Title (required)
   - Content (rich text editor - markdown/WYSIWYG)
   - Module (dropdown, required)
   - Order (number)
3. [ ] Fill form:
   - Title: `Test Lesson UI`
   - Content: Type some text with **markdown** like `# Heading` or `**bold**`
   - Select module
   - Order: 1
4. [ ] Click "Save"
5. [ ] **Expected**: Lesson created successfully

#### 🖼️ Media Upload (SKIP - R2 SSL Issue)
1. [ ] In lesson form, click "Upload Media" or "Add Image"
2. [ ] ⚠️ **Expected**: SSL error atau loading forever
3. [ ] **Status**: Known issue - R2 SSL handshake failure
4. [ ] **Action**: Skip this test, defer to Day 10

#### 📝 Edit & Delete
1. [ ] Edit lesson → update content
2. [ ] Preview markdown rendering if available
3. [ ] Delete lesson → confirm

---

### 6. Assignments Management (Day 6)

#### 📝 View Assignments
1. [ ] Navigate to **Assignments** page
2. [ ] **Expected**: Assignments list with:
   - Title
   - Type (Quiz / Task Analysis)
   - Lesson Name
   - Due Date
   - Status (Active/Draft)
   - Actions
3. [ ] **Expected**: Filter by Lesson or Type

#### ➕ Create Assignment
1. [ ] Click "Create Assignment"
2. [ ] **Expected**: Form with:
   - Title (required)
   - Description
   - Type (dropdown: Quiz or Task Analysis)
   - Lesson (dropdown, required)
   - Due Date (date picker)
   - XP Reward (number)
   - Is Active (checkbox)
3. [ ] Fill form:
   - Title: `Test Assignment UI`
   - Type: Quiz
   - Select lesson
   - Due Date: 7 days from now
   - XP: 100
4. [ ] Click "Save"
5. [ ] **Expected**: Assignment created

#### 📅 Date Picker Test
1. [ ] Click due date input
2. [ ] **Expected**: Calendar picker appears
3. [ ] Select future date
4. [ ] **Expected**: Date displayed properly

#### 📝 Edit & Delete
1. [ ] Edit → change XP reward
2. [ ] Delete → confirm removal

---

### 7. Classrooms Management (Day 8)

#### 🏫 View Classrooms
1. [ ] Navigate to **Classrooms** page
2. [ ] **Expected**: Classrooms list with:
   - Classroom Name
   - Subject
   - Teacher Name
   - Student Count
   - Schedule
   - Actions

#### ➕ Create Classroom
1. [ ] Click "Create Classroom"
2. [ ] **Expected**: Form with:
   - Name (required)
   - Description (optional)
   - Subject (dropdown)
   - Teacher (dropdown - only teachers)
   - Students (multi-select or checkbox list)
   - Schedule (text or time picker)
3. [ ] Fill form:
   - Name: `Test Classroom UI`
   - Select subject
   - Select teacher
   - Select 1-2 students
   - Schedule: "Monday 10:00-12:00"
4. [ ] Click "Save"
5. [ ] **Expected**: Classroom created

#### 👥 Student Management
1. [ ] Edit classroom
2. [ ] Add more students
3. [ ] Remove a student
4. [ ] Save
5. [ ] **Expected**: Student list updated

---

### 8. Notes (Day 8)

#### 📝 View Notes
1. [ ] Navigate to **Notes** page
2. [ ] **Expected**: Notes list filtered by lesson or student
3. [ ] **Expected**: Each note shows:
   - Content
   - Author
   - Date
   - Lesson context

#### ➕ Create Note
1. [ ] Select a lesson (filter or dropdown)
2. [ ] Click "Add Note"
3. [ ] Type note content
4. [ ] Save
5. [ ] **Expected**: Note appears in list

#### 💬 Reply to Note
1. [ ] Click on a note
2. [ ] **Expected**: Reply form appears
3. [ ] Type reply
4. [ ] Submit
5. [ ] **Expected**: Reply nested under original note

---

### 9. Daily Reports (Day 8)

#### 📊 View Reports
1. [ ] Navigate to **Daily Reports** page
2. [ ] **Expected**: Reports list with filters:
   - By Student
   - By Date Range
   - By Classroom
3. [ ] **Expected**: Each report shows:
   - Date
   - Student Name
   - Activities summary
   - Comments

#### ➕ Create Report
1. [ ] Click "Create Report"
2. [ ] Select student
3. [ ] Select date
4. [ ] Fill activities (text or structured fields)
5. [ ] Add comments
6. [ ] Save
7. [ ] **Expected**: Report created

#### 📈 Filter & Search
1. [ ] Test date range picker
2. [ ] Filter by specific student
3. [ ] **Expected**: Results filtered correctly

---

## 🎨 UI/UX Issues to Document

While testing, note down any of these issues:

### 🔴 Critical
- [ ] Errors not showing user-friendly messages
- [ ] Forms not validating required fields
- [ ] Delete actions without confirmation
- [ ] Page crashes or infinite loading

### 🟡 Medium Priority
- [ ] No loading states (spinners/skeletons)
- [ ] Empty states not handled (no data message)
- [ ] Forms don't reset after submission
- [ ] No success toast after actions
- [ ] Dropdown options not loading

### 🟢 Nice to Have
- [ ] No search functionality
- [ ] Pagination missing (if many records)
- [ ] No sort functionality
- [ ] Mobile responsiveness issues
- [ ] Dark mode not available

---

## 📋 Test Results Template

After testing, fill this in:

```
===== DAY 1-8 UI TESTING RESULTS =====

Tested By: [Your Name]
Date: [Date]
Browser: [Chrome/Firefox/Edge]

✅ WORKING FEATURES:
- [List features that work perfectly]

⚠️ ISSUES FOUND:
1. [Issue description]
   - Severity: Critical/Medium/Low
   - Steps to reproduce:
   - Expected vs Actual:

🎨 UI/UX IMPROVEMENTS NEEDED:
1. [Improvement suggestion]

📝 NOTES:
- [Any additional observations]
```

---

## 🚀 Next Steps After Testing

1. Document all bugs & issues
2. Prioritize fixes (Critical → Medium → Low)
3. Create UI/UX polish task list
4. Implement improvements
5. Retest fixed features

**Good luck testing! 🎉**
