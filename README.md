# 🎯 QCM Challenge - Complete Quiz Platform

A professional, fully-responsive web application for students to take multiple-choice quizzes and an admin panel to manage results.

## 📋 Features

### ✅ Student Features
- **Dual Login System**: Student and Admin login tabs
- **Student Registration**: Name, Pole (Department), Phone Number
- **Student Menu**: Welcome screen with options
- **Quiz Challenge**: 
  - 10 sample questions with 4 answer options each
  - One question displayed at a time
  - Instant feedback (correct/incorrect with visual indicators)
  - Progress bar showing quiz advancement
  - Auto-advance to next question after 1.5 seconds
- **Results Page**: 
  - Final score display
  - Percentage calculation
  - Option to restart or return to menu
- **Leaderboard**:
  - Top scores sorted by performance
  - Shows rank, name, pole, score
  - Medal emojis for top 3 (🥇🥈🥉)
  - Persists across sessions

### ✅ Admin Features
- **Admin Login**: 
  - Username: `admin`
  - Password: `1234`
- **Admin Dashboard**:
  - View all participants in a sortable table
  - Columns: #, Name, Pole, Phone, Score, Percentage, Date Submitted
  - Admin Statistics:
    - Total Participants count
    - Average Score percentage
    - Highest Score
  - **Refresh List** button to update data
  - **Clear All Results** button with confirmation
- **Session Persistence**: Admin can stay logged in across page refreshes

### ✅ General Features
- **Responsive Design**: Mobile-friendly interface
- **Local Storage**: All data persists in browser without backend
- **Modern UI**: Gradient design with smooth animations
- **Data Persistence**: Participants data saved automatically
- **Session Management**: Users stay logged in until logout

## 🚀 How to Use

### For Students

1. **Open the Website**
   - Open `index.html` in your web browser

2. **Login**
   - Click on "👨‍🎓 Student" tab
   - Enter your details:
     - Student Name
     - Pole (Department/Class)
     - Phone Number
   - Click "Login as Student"

3. **Main Menu**
   - Click **"🎯 Start Challenge"** to begin the quiz
   - Click **"🏆 View Leaderboard"** to see top scores
   - Click **"🚪 Logout"** to exit

4. **Taking the Quiz**
   - Read each question carefully
   - Select one of the 4 options (A, B, C, D)
   - See instant feedback
   - Automatically advances after 1.5 seconds
   - Complete all 10 questions

5. **View Results**
   - See your final score and percentage
   - Option to **"🔄 Restart Quiz"** or **"🏠 Back to Menu"**

### For Admins

1. **Login as Admin**
   - Click on "👨‍💼 Admin" tab
   - Enter credentials:
     - Username: `admin`
     - Password: `1234`
   - Click "Login as Admin"

2. **Admin Dashboard**
   - View all student participants in a table
   - See statistics:
     - Total number of participants
     - Average quiz score
     - Highest score achieved
   
3. **Manage Results**
   - Click **"� Refresh List"** to update participant data
   - Click **"🗑️ Clear All Results"** to reset all scores (with confirmation)

4. **Logout**
   - Click **"🚪 Logout"** button to exit

## 📁 File Structure

```
QCM/
├── index.html      # Main HTML with all pages (5 pages)
├── styles.css      # Complete styling & responsive design
├── script.js       # Logic for students, admin, quiz, leaderboard
└── README.md       # This file
```

## 🎨 Design Features

- **Modern UI**: Gradient purple/indigo backgrounds
- **Responsive Layout**: Works on desktop, tablet, mobile
- **Smooth Animations**: Fade-in effects and button transitions
- **Color-Coded Feedback**: 
  - Green for correct answers
  - Red for incorrect answers
- **Progress Visualization**: Progress bar during quiz
- **Professional Tables**: Admin panel with sortable data
- **Statistics Cards**: Visual display of admin metrics

## 💾 Data Storage

All data is stored in **browser localStorage**:
- `currentUser`: Currently logged-in user's information
- `participants`: All quiz results from students

**Data persists** even after closing the browser!

## 🔐 Admin Credentials

**Demo Account:**
- Username: `admin`
- Password: `1234`

⚠️ Change these credentials in `script.js` for production use:
```javascript
const ADMIN_CREDENTIALS = {
    username: "your_username",
    password: "your_password"
};
```

## 🔧 Customization

### Add More Questions
Edit `script.js` and add questions to the `questions` array:

```javascript
{
    id: 11,
    question: "Your question here?",
    options: ["Option A", "Option B", "Option C", "Option D"],
    correct: 0  // Index of correct answer (0-3)
}
```

### Change Department Options
In `index.html`, modify the pole select options:

```html
<option value="Your Department">Your Department</option>
```

### Customize Colors
Edit `:root` CSS variables in `styles.css`:

```css
--primary-color: #6366f1;
--secondary-color: #8b5cf6;
--danger-color: #ef4444;
```

### Adjust Quiz Settings
In `script.js`, modify:
```javascript
// Auto-advance delay (in milliseconds)
setTimeout(() => { ... }, 1500); // Change 1500 to your value

// Number of questions
questions.length // Change questions array
```

## 📊 Quiz Settings

- **Number of Questions**: 10 (easily customizable)
- **Time per Question**: Auto-advance after 1.5 seconds
- **Answer Options**: 4 per question
- **Max Participants Stored**: Unlimited

## 🌐 Browser Compatibility

- ✅ Chrome/Chromium (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 📱 Mobile Responsiveness

- Single-column layout on phones
- Touch-friendly buttons
- Responsive table for admin panel
- Readable text on all screen sizes

## ⚡ Performance

- **Lightweight**: ~150 KB total size
- **No External Dependencies**: Pure HTML/CSS/JavaScript
- **Instant Loading**: No server requests
- **Smooth Animations**: 60fps transitions

## 🎓 Educational Use

Perfect for:
- Online assessments
- Classroom quizzes
- Self-assessment tests
- Training and certification exams
- Interactive learning platforms
- Teacher-led evaluations

## � Sample Questions

The app includes 10 sample questions covering:
- HTML fundamentals
- CSS styling
- JavaScript basics
- Web APIs and concepts
- Web development technologies

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Data not persisting | Check if localStorage is enabled in browser settings |
| Quiz not progressing | Ensure JavaScript is enabled |
| Styles not loading | Make sure `styles.css` is in same folder as `index.html` |
| Admin login fails | Verify username: `admin` and password: `1234` |
| Forms not submitting | Check browser console for errors (F12) |

## �💡 Future Enhancements (Optional)

Ideas for advanced versions:
- Timer for each question or entire quiz
- Different difficulty levels
- Category-based quizzes
- Detailed answer explanations
- User performance analytics
- Export results as PDF/Excel
- Multiplayer/competitive mode
- Question randomization
- Answer shuffling
- Live leaderboard updates

## 🔒 Privacy & Security

- All data stored **locally** in browser
- **No information** sent to external servers
- Students can clear data by clearing browser storage
- Admin credentials can be changed
- No authentication database needed

## 📄 License

This project is free to use and modify for educational purposes.

---

**Version**: 2.0  
**Last Updated**: November 2025  
**Type**: Educational Quiz Platform

### Key Improvements in v2.0
✨ Dual login system (Student + Admin)  
✨ Admin dashboard with participant management  
✨ Comprehensive statistics  
✨ Clear all results functionality  
✨ Enhanced responsive design  
✨ Better session management  

---

**Enjoy your quiz platform! 🎉**

For support or questions, refer to the code comments or modify as needed for your use case.
