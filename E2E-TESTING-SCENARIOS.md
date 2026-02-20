# 🧪 End-to-End Testing Scenarios - Day 10

## Overview
Complete user journey testing untuk semua role dalam Learning Management System.
Test dilakukan secara manual dengan browser untuk memastikan semua fitur bekerja dalam real user scenarios.

---

## 📋 Pre-Test Checklist

### Services Running
- [ ] Backend running on port 3001
- [ ] Frontend running on port 3000
- [ ] Database connected (Neon PostgreSQL)
- [ ] Seed data loaded

### Test Accounts
```
TEACHER:
- Email: guru1@lms.test
- Password: password123

STUDENT/PARENT:
- Email: siswa1@lms.test
- Password: password123
- Has student profile + can switch to parent view
```

### Browser Setup
- [ ] Open Chrome/Edge DevTools (F12)
- [ ] Open Network tab to monitor API calls
- [ ] Clear browser cache and cookies
- [ ] Test on desktop viewport (1920x1080)
- [ ] Test on mobile viewport (375x667 - iPhone SE)

---

## 🎯 Test Scenario 1: Teacher Complete Workflow

**Goal**: Teacher creates classroom, adds content, assigns work, and grades submissions

### 1.1 Login & Dashboard
**Steps:**
1. Navigate to http://localhost:3000
2. Enter teacher credentials
3. Click "Login"

**Expected:**
- ✅ Redirected to `/dashboard`
- ✅ See "Selamat datang, Guru 1!" header
- ✅ Dashboard shows stats cards (students, classes, pending grading)
- ✅ Sidebar visible with navigation links
- ✅ Navbar shows user info and logout button

**Mobile Check:**
- ✅ Hamburger menu visible
- ✅ Stats cards stack vertically
- ✅ Typography scales appropriately

---

### 1.2 Create Classroom
**Steps:**
1. Click "Kelas" in sidebar
2. Click "Tambah Kelas" button
3. Fill form:
   - Name: "E2E Test Class"
   - Grade: "10"
   - Academic Year: "2025/2026"
4. Click "Tambah"

**Expected:**
- ✅ Modal/form opens
- ✅ All fields are editable
- ✅ Submit button disabled until form valid
- ✅ Loading spinner shows during submission
- ✅ Success toast/message appears
- ✅ Modal closes automatically
- ✅ New classroom appears in list
- ✅ Classroom card shows correct data

**API Check (Network tab):**
- ✅ POST to GraphQL endpoint
- ✅ createClassroom mutation called
- ✅ 200 response received
- ✅ Data refetch triggered

---

### 1.3 Add Subject to Classroom
**Steps:**
1. Click newly created classroom card
2. In Subjects section, click "Tambah Mata Pelajaran"
3. Fill form:
   - Name: "Matematika E2E"
   - Code: "MTK-E2E"
   - Description: "End-to-end test subject"
   - Pick a color (any)
4. Click "Tambah"

**Expected:**
- ✅ Subject form modal opens
- ✅ Color picker works (visual feedback)
- ✅ Form validation (required fields)
- ✅ Success message on submit
- ✅ Subject appears in classroom subjects list
- ✅ Subject card shows name, code, and color badge

---

### 1.4 Create Module in Subject
**Steps:**
1. Click on "Matematika E2E" subject
2. Click "Tambah Modul"
3. Fill form:
   - Title: "Aljabar Dasar"
   - Description: "Pengenalan aljabar"
   - Order: 1
4. Submit

**Expected:**
- ✅ Module form appears
- ✅ Order field accepts numbers
- ✅ Module created successfully
- ✅ Module appears in list with correct order
- ✅ Can click module to view lessons

---

### 1.5 Create Lesson in Module
**Steps:**
1. Click "Aljabar Dasar" module
2. Click "Tambah Materi"
3. Fill form:
   - Title: "Pengenalan Variabel"
   - Content: "Variabel adalah simbol yang mewakili nilai. Contoh: x, y, z..."
   - Duration: 45
   - Order: 1
4. Submit

**Expected:**
- ✅ Lesson form opens
- ✅ Content field allows rich text/multiline
- ✅ Duration in minutes
- ✅ Lesson shows as draft initially (isDraft badge)
- ✅ Can edit lesson after creation
- ✅ "Publish" button visible

**Publish Lesson:**
5. Click eye icon or "Publish" button
6. Confirm lesson is published (isDraft = false)

---

### 1.6 Create Quiz Assignment
**Steps:**
1. In lesson detail, go to "Tugas" tab/section
2. Click "Tambah Tugas"
3. Fill form:
   - Title: "Quiz Variabel"
   - Description: "Kuis tentang variabel dasar"
   - Type: QUIZ
   - Max Score: 100
   - XP Reward: 50
   - Due Date: (future date)
4. Submit

**Expected:**
- ✅ Assignment form appears
- ✅ Type selector works (QUIZ vs TASK)
- ✅ Date picker functional
- ✅ Assignment created as draft
- ✅ Can add questions to quiz

**Add Quiz Questions:**
5. Click "Tambah Pertanyaan"
6. Add question:
   - Question: "Apa itu variabel?"
   - Options: ["Simbol yang mewakili nilai", "Angka tetap", "Operator", "Fungsi"]
   - Correct Answer: "Simbol yang mewakili nilai"
   - Points: 25
7. Add 3 more questions (total 4 questions = 100 points)

**Expected:**
- ✅ Question form works
- ✅ Can add multiple options
- ✅ Can select correct answer
- ✅ Questions appear in list
- ✅ Can edit/delete questions
- ✅ Points sum shown

**Publish Quiz:**
8. Click "Publish" on assignment
9. Verify assignment no longer draft

---

### 1.7 Create Task Assignment (Multi-Step)
**Steps:**
1. Create another assignment:
   - Title: "Latihan Soal Variabel"
   - Type: TASK
   - Max Score: 100
   - XP: 75
2. Add task steps:
   - Step 1: "Selesaikan soal no. 1: 2x + 5 = 15, x = ?"
   - Step 2: "Selesaikan soal no. 2: 3y - 7 = 8, y = ?"
   - Step 3: "Jelaskan langkah-langkah penyelesaian"
3. Publish assignment

**Expected:**
- ✅ Task type allows multi-step creation
- ✅ Each step has order/sequence
- ✅ Steps show clearly in list
- ✅ Can reorder steps (optional)
- ✅ Assignment published successfully

---

### 1.8 Grade Student Submission
**Pre-requisite:** Student has submitted assignment (run Student scenario first, or create mock submission)

**Steps:**
1. Go to Dashboard
2. Check "Perlu Dinilai" section
3. Click on pending submission
4. Review student answers/steps
5. For QUIZ: Verify auto-grading worked
6. For TASK: Grade each step manually
   - Provide score per step
   - Add feedback comments
7. Submit final grade

**Expected:**
- ✅ Pending submissions visible on dashboard
- ✅ Can view student work clearly
- ✅ Quiz auto-graded correctly
- ✅ Task grading interface intuitive
- ✅ Can add comments per step
- ✅ Final score calculated correctly
- ✅ XP awarded to student
- ✅ Submission marked as graded
- ✅ Removed from pending queue

---

### 1.9 View Student Progress
**Steps:**
1. Go to "Siswa" page
2. Click on a student
3. View student detail page
4. Check sections:
   - XP and Level display
   - Completed assignments
   - Recent grades
   - Progress per subject
   - Daily reports (if any)

**Expected:**
- ✅ Student profile loads correctly
- ✅ XP and level badge visible
- ✅ Progress bars show completion %
- ✅ Grade history visible
- ✅ Can see all student activity
- ✅ Responsive on mobile

---

## 🎓 Test Scenario 2: Student Complete Workflow

**Goal**: Student views lessons, completes quiz, submits task, checks grades

### 2.1 Student Login & Dashboard
**Steps:**
1. Logout teacher account
2. Login as student (siswa1@lms.test)
3. Verify landed on student dashboard

**Expected:**
- ✅ Dashboard shows XP progress card
- ✅ Level badge displays correctly
- ✅ Progress bar shows XP to next level
- ✅ Stats cards: assignments completed, average score, quizzes
- ✅ Recent grades section
- ✅ Quick action cards visible
- ✅ Role switcher shows (can switch to Parent view)

**Mobile Check:**
- ✅ XP card remains readable
- ✅ Stats stack to 1 column
- ✅ Progress bar responsive

---

### 2.2 Browse and View Lesson
**Steps:**
1. Click "Pelajaran" or navigate to classroom
2. Browse to "Matematika E2E" subject
3. Click "Aljabar Dasar" module
4. Click "Pengenalan Variabel" lesson
5. Read lesson content

**Expected:**
- ✅ Navigation path clear (breadcrumbs)
- ✅ Lesson content renders properly
- ✅ Formatting preserved (line breaks, etc)
- ✅ Duration shown
- ✅ Can see assignments in lesson
- ✅ Only published lessons visible

---

### 2.3 Complete Quiz Assignment
**Steps:**
1. In lesson page, click "Quiz Variabel"
2. Read instructions
3. Click "Mulai Quiz" or "Start"
4. Answer questions one by one:
   - Select answers for all 4 questions
   - Use navigation (Previous/Next buttons)
   - See progress indicators
5. Click "Submit" when done
6. View quiz results

**Expected:**
- ✅ Quiz interface loads
- ✅ Questions displayed clearly
- ✅ Radio buttons or multiple choice UI works
- ✅ Can navigate between questions
- ✅ Progress dots/numbers show answered questions
- ✅ Submit confirmation dialog
- ✅ Auto-graded immediately
- ✅ Score displayed (e.g., "75/100")
- ✅ Correct/incorrect answers shown
- ✅ XP awarded and visible
- ✅ Level up notification if applicable

**Mobile Check:**
- ✅ Questions readable
- ✅ Navigation buttons accessible
- ✅ Progress indicators visible

---

### 2.4 Submit Task Assignment
**Steps:**
1. Navigate to "Latihan Soal Variabel" task
2. Read instructions and steps
3. For each step:
   - Enter answer/work in text field
   - Upload file if required (optional)
   - Mark step as complete
4. Click "Submit Assignment"

**Expected:**
- ✅ Task steps shown in order
- ✅ Text input fields work
- ✅ File upload (if enabled) works
- ✅ Can see progress (e.g., "2/3 steps completed")
- ✅ Submit button enabled when all steps done
- ✅ Confirmation before submit
- ✅ Success message after submission
- ✅ Status changes to "Submitted" or "Pending Review"
- ✅ Cannot edit after submission

---

### 2.5 Check Grades and XP
**Steps:**
1. Go to dashboard
2. Check "Nilai Terbaru" section
3. View score for quiz (should be auto-graded)
4. View XP progress bar (should increase)
5. Check if level increased
6. Go to assignments page
7. View graded submissions detail

**Expected:**
- ✅ Recent grades show up-to-date
- ✅ Quiz score correct (auto-calculated)
- ✅ Task showing "Pending Review" until teacher grades
- ✅ XP added to total after quiz
- ✅ Progress bar updated
- ✅ Badge color/level changes if leveled up
- ✅ Can click grade to see details
- ✅ Feedback from teacher visible (after grading)

---

## 👨‍👩‍👧 Test Scenario 3: Parent Workflow

**Goal**: Parent switches role, views child progress, adds note to teacher

### 3.1 Switch to Parent View
**Steps:**
1. Already logged in as siswa1@lms.test
2. Click role switcher in navbar/sidebar
3. Click "Orang Tua" button
4. Verify dashboard changes to parent view

**Expected:**
- ✅ Role switcher visible (2 buttons: Siswa, Orang Tua)
- ✅ Current role highlighted
- ✅ Clicking switches view immediately
- ✅ Dashboard changes to parent layout
- ✅ Shows child selector (if multiple children)
- ✅ Child header card displays with level badge

---

### 3.2 View Child Progress
**Steps:**
1. On parent dashboard, view stats:
   - Level and XP
   - Assignments completed
   - Average score
   - Progress per subject
2. Check subject progress bars
3. Click "Lihat Detail" to go to student detail page

**Expected:**
- ✅ Parent can see all child stats
- ✅ Stats match student's actual data
- ✅ Progress bars accurate (completion %)
- ✅ Subject-wise breakdown visible
- ✅ Can navigate to detailed view
- ✅ Read-only access (cannot edit student data)

---

### 3.3 Add Note to Teacher
**Steps:**
1. In student detail page (parent view)
2. Find "Catatan" or "Daily Reports" section
3. Click "Tambah Catatan" or similar button
4. Write note:
   - Content: "Anak saya sudah belajar dengan baik di rumah. Terima kasih bimbingannya!"
5. Submit note

**Expected:**
- ✅ Note form accessible
- ✅ Text area allows multiline input
- ✅ Character counter (optional)
- ✅ Submit button works
- ✅ Note saved successfully
- ✅ Note appears in list
- ✅ Shows timestamp
- ✅ Teacher can see this note in their view

---

### 3.4 Switch Back to Student View
**Steps:**
1. Click role switcher again
2. Select "Siswa"
3. Verify back to student dashboard

**Expected:**
- ✅ Switches back smoothly
- ✅ Student dashboard restored
- ✅ All student features accessible again

---

## 📱 Mobile Responsiveness Testing

**Run all above scenarios on mobile viewport (375x667)**

### Navigation
- ✅ Hamburger menu works on all pages
- ✅ Drawer slides in from left
- ✅ Backdrop overlay visible
- ✅ Click backdrop closes menu
- ✅ Navigation items close menu on click
- ✅ X close button works

### Layout
- ✅ All cards/components readable
- ✅ Text doesn't overflow
- ✅ Buttons are tappable (min 44px)
- ✅ Forms usable on mobile
- ✅ Tables scroll horizontally if needed
- ✅ Modals fit in viewport

### Typography
- ✅ Headings scale down appropriately
- ✅ Body text readable (not too small)
- ✅ Line height comfortable
- ✅ No text cut off

---

## 🔍 Cross-Browser Testing

Test on multiple browsers:
- [ ] Chrome (primary)
- [ ] Firefox
- [ ] Edge
- [ ] Safari (if available)

Check for:
- [ ] Same behavior across browsers
- [ ] No CSS issues
- [ ] No JavaScript errors in console
- [ ] Network requests successful

---

## ⚠️ Error Scenarios Testing

### Network Errors
1. Test with slow 3G throttling (Chrome DevTools)
   - ✅ Loading spinners show
   - ✅ Reasonable wait times
   - ✅ No page crash

2. Test API failure (stop backend)
   - ✅ Error messages show
   - ✅ User-friendly messages (not "Network Error")
   - ✅ Retry options available

### Form Validation
1. Try submitting empty forms
   - ✅ Validation prevents submit
   - ✅ Required field indicators
   - ✅ Error messages helpful

2. Try invalid data
   - ✅ Email format validated
   - ✅ Number fields reject text
   - ✅ Date pickers prevent invalid dates

### Authentication
1. Try accessing protected pages without login
   - ✅ Redirected to login
   - ✅ Original URL preserved (redirected back after login)

2. Try accessing teacher pages as student
   - ✅ Prevented or hidden
   - ✅ No unauthorized access

---

## 📊 Performance Testing

### Page Load Times
- ✅ Dashboard loads < 2 seconds
- ✅ List pages load < 3 seconds
- ✅ Images lazy load (if applicable)
- ✅ No unnecessary re-renders

### API Response Times
- ✅ GraphQL queries respond < 1 second
- ✅ Mutations complete < 2 seconds
- ✅ Optimistic updates where possible

---

## ✅ Test Results Summary

### Overall Status
- [ ] All scenarios PASS
- [ ] Some scenarios FAIL (list below)
- [ ] Blockers found (critical issues)

### Issues Found
<!-- Fill during testing -->

| Issue # | Severity | Description | Page/Feature | Status |
|---------|----------|-------------|--------------|--------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

### Notes
<!-- Additional observations -->

---

## 🚀 Sign-Off

**Tested By:** _______________  
**Date:** _______________  
**Environment:** Development (localhost)  
**Browser:** Chrome ___  
**Viewport:** Desktop + Mobile  

**Recommendation:**
- [ ] Ready for deployment
- [ ] Minor fixes needed
- [ ] Major fixes required
- [ ] Not ready for production

---

## Next Steps After Testing

1. [ ] Fix all critical bugs
2. [ ] Document known issues
3. [ ] Create deployment checklist
4. [ ] Prepare environment variables for production
5. [ ] Set up Vercel (frontend) configuration
6. [ ] Set up Railway (backend) configuration
7. [ ] Deploy to staging environment
8. [ ] Run smoke tests on staging
9. [ ] Deploy to production
10. [ ] Monitor for issues post-deployment
