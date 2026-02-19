# Manual UI Testing Guide - LMS ABK

**Prerequisites:** 
- ✅ Frontend running on http://localhost:3000
- ✅ Backend running on http://localhost:3001  
- ✅ Database seeded with test data

---

## 🧪 Testing Checklist

### **Phase 1: Authentication & Navigation (Day 1)**

#### Test 1.1: Teacher Login
1. **Navigate to:** http://localhost:3000/login
2. **Enter credentials:**
   - Email: `guru@lms-abk.com`
   - Password: `Guru123!`
3. **Expected:**
   - ✅ Redirect to `/dashboard`
   - ✅ See "Guru LMS" or teacher name in header
   - ✅ Dashboard shows stats/overview

#### Test 1.2: Logout
1. **Click** logout button/menu
2. **Expected:**
   - ✅ Redirect to `/login`
   - ✅ Cannot access `/dashboard` directly (redirect back to login)

#### Test 1.3: Student/Parent Login
1. **Navigate to:** http://localhost:3000/login
2. **Enter credentials:**
   - Email: `siswa1@lms-abk.com`
   - Password: `Siswa123!`
3. **Expected:**
   - ✅ Redirect to `/dashboard`
   - ✅ See student name in header
   - ✅ Dashboard shows progress/XP/level

---

### **Phase 2: Content Navigation (Day 2-4)**

#### Test 2.1: Browse Classrooms (Teacher)
1. **Login as teacher** (guru@lms-abk.com)
2. **Navigate to:** `/dashboard/classrooms` (or click Classrooms menu)
3. **Expected:**
   - ✅ List of classrooms displayed
   - ✅ Can see student count, subject count
   - ✅ Can click on classroom to view details

#### Test 2.2: View Subjects & Modules
1. **Click on a classroom**
2. **Expected:**
   - ✅ See list of subjects (e.g., Matematika, Bahasa Indonesia)
   - ✅ Each subject shows module count
3. **Click on a subject**
4. **Expected:**
   - ✅ See modules list with order/sequence
   - ✅ Can click on module to view lessons

#### Test 2.3: View Lessons
1. **Click on a module**
2. **Expected:**
   - ✅ See list of lessons
   - ✅ Each lesson shows title, description
   - ✅ Draft lessons marked (if any)
3. **Click on a lesson**
4. **Expected:**
   - ✅ See lesson content (text, markdown rendered)
   - ✅ See assignments section (if any)
   - ✅ Media attachments displayed (if any)

---

### **Phase 3: Assignments (Day 5)**

#### Test 3.1: View Quiz Assignment
1. **Login as student** (siswa1@lms-abk.com)
2. **Navigate to a lesson with QUIZ assignment**
3. **Expected:**
   - ✅ Quiz questions displayed
   - ✅ Multiple choice options selectable
   - ✅ Can submit answers
   - ✅ See result/score after submission

#### Test 3.2: View Task Analysis Assignment
1. **Navigate to a lesson with ANALYSIS_TASK assignment**
2. **Expected:**
   - ✅ Task description displayed
   - ✅ Text area for answer input
   - ✅ Can submit answer
   - ✅ Status shows "SUBMITTED" or "PENDING"

---

### **Phase 4: Submissions & Grading (Day 6-7)**

#### Test 4.1: Teacher - Grade Submission
1. **Login as teacher** (guru@lms-abk.com)
2. **Navigate to:** `/dashboard/pending-grading` or similar
3. **Expected:**
   - ✅ See list of pending submissions
   - ✅ Can click to view student's answer
   - ✅ Can enter score (0-100)
   - ✅ Can add feedback/comments
   - ✅ Can submit grade

#### Test 4.2: Student - View Grades
1. **Login as student** (siswa1@lms-abk.com)
2. **Navigate to:** Submissions or Grades page
3. **Expected:**
   - ✅ See list of submissions
   - ✅ Graded submissions show score
   - ✅ Can see teacher feedback
   - ✅ Color-coded status (pending/graded)

#### Test 4.3: XP & Level Progress
1. **Still logged in as student**
2. **Check dashboard or profile**
3. **Expected:**
   - ✅ Current level displayed (e.g., Level 1, 2, 3...)
   - ✅ XP bar showing progress (e.g., 25/100 XP)
   - ✅ Total XP accumulated
   - ✅ XP increases after completing graded assignments

---

### **Phase 5: Dashboard Enhancements (Day 8)**

#### Test 5.1: Pending Grading Queue (Teacher)
1. **Login as teacher**
2. **Check dashboard or dedicated page**
3. **Expected:**
   - ✅ Widget/section showing "Pending Grading"
   - ✅ Shows count (e.g., "5 submissions pending")
   - ✅ List submissions with student name, assignment, date
   - ✅ Quick link to grade

#### Test 5.2: Recent Grades (Student)
1. **Login as student**
2. **Check dashboard**
3. **Expected:**
   - ✅ Widget showing "Recent Grades"
   - ✅ Shows last 3-5 graded assignments
   - ✅ Displays score, assignment name, date
   - ✅ Color-coded by score (green=high, yellow=medium, red=low)

#### Test 5.3: Parent Multi-Child View
1. **Login as parent** (siswa1@lms-abk.com is also parent role)
2. **Navigate to:** Parent dashboard or children section
3. **Expected:**
   - ✅ See list/cards for each child
   - ✅ Each card shows: name, level, XP, recent progress
   - ✅ Can click on child to view detailed stats
   - ✅ Compare multiple children side-by-side

---

### **Phase 6: Media Upload (Day 9)**

#### Test 6.1: Access Media Library
1. **Login as teacher**
2. **Navigate to:** `/dashboard/media-test` or media library page
3. **Expected:**
   - ✅ Page loads without errors
   - ✅ See tabs: IMAGE, VIDEO, PDF, AUDIO
   - ✅ Existing media files displayed (if any in DB)

#### Test 6.2: Media Upload UI (No R2)
1. **Click "Upload Media" or similar button**
2. **Expected:**
   - ✅ File picker dialog appears
   - ✅ Can select image/video/pdf/audio file
   - ✅ Shows file preview (for images)
   - ✅ Shows file size validation (5MB for images, 20MB for videos)
   - ✅ Warning: "R2 not configured" (graceful degradation)

#### Test 6.3: Media Upload (WITH R2 configured)
**⚠️ Only if R2 credentials are set:**
1. **Upload an image (< 5MB)**
2. **Expected:**
   - ✅ Upload progress indicator
   - ✅ Success message after upload
   - ✅ File appears in media library grid
   - ✅ Can see thumbnail, filename, size, date
3. **Click "Copy URL" button**
4. **Expected:**
   - ✅ URL copied to clipboard
   - ✅ Confirmation notification
5. **Click "Delete" button**
6. **Expected:**
   - ✅ Confirmation dialog appears
   - ✅ After confirm, file removed from grid
   - ✅ File deleted from R2 bucket

#### Test 6.4: Media Filtering
1. **Click on "IMAGE" tab**
2. **Expected:**
   - ✅ Only image files shown
3. **Click on "VIDEO" tab**
4. **Expected:**
   - ✅ Only video files shown
5. **Check "My Media" filter/toggle**
6. **Expected:**
   - ✅ Only files uploaded by current user

---

### **Phase 7: Additional Features**

#### Test 7.1: Student Notes
1. **Login as student**
2. **Navigate to a lesson**
3. **Expected:**
   - ✅ Notes section/button visible
   - ✅ Can create new note
   - ✅ Can view existing notes
   - ✅ Can edit/delete own notes

#### Test 7.2: Daily Reports
1. **Login as student**
2. **Navigate to:** Daily Reports page
3. **Expected:**
   - ✅ Can create new daily report
   - ✅ Form has: mood, activities, challenges, date
   - ✅ Can view past reports
   - ✅ Reports listed by date (newest first)

---

## 🐛 Bug Reporting Template

If you find issues, document them as:

```
**Bug:** [Short description]
**Steps to reproduce:**
1. Login as [role]
2. Navigate to [page]
3. Click [button]
4. [what happened]

**Expected:** [what should happen]
**Actual:** [what actually happened]
**Browser:** Chrome/Firefox/Safari
**Screenshot:** [if applicable]
```

---

## ✅ Test Results Tracking

| Feature | Status | Notes |
|---------|--------|-------|
| Teacher Login | ⬜ | |
| Student Login | ⬜ | |
| Classroom Navigation | ⬜ | |
| Module/Lesson View | ⬜ | |
| Quiz Assignment | ⬜ | |
| Task Assignment | ⬜ | |
| Submission Grading | ⬜ | |
| XP/Level Display | ⬜ | |
| Pending Grading Queue | ⬜ | |
| Recent Grades Widget | ⬜ | |
| Parent Multi-Child View | ⬜ | |
| Media Library UI | ⬜ | |
| Media Upload (if R2) | ⬜ | |
| Student Notes | ⬜ | |
| Daily Reports | ⬜ | |

**Legend:**
- ⬜ Not tested
- ✅ Passed
- ⚠️ Partial/Warning
- ❌ Failed

---

## 🚀 Next Steps After Testing

1. **Document bugs** in GitHub issues or bug tracker
2. **Prioritize fixes** based on severity
3. **Test fixes** and re-validate
4. **Prepare for production:**
   - Configure R2 credentials
   - Set up production database
   - Configure CORS for production domain
   - Add monitoring/logging
   - Set up CI/CD pipeline

---

*Last updated: After Day 9 implementation*
