# Baby Vaccination Tracker

A comprehensive mobile app to track your baby's vaccinations with smart reminders.

## 🎯 Features

- ✅ Baby profile with photo
- ✅ India IAP 2023 vaccination schedule (31 vaccinations from birth to 2 years)
- ✅ Push notifications (1 week & 1 day before due dates)
- ✅ Track completed vs upcoming vaccinations
- ✅ Add notes for each vaccination
- ✅ Color-coded status indicators
- ✅ Professional mobile UI

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Expo CLI
- EAS CLI

### Installation

```bash
# Clone the repository
git clone https://github.com/Prajwalky/baby-vaccination-tracker.git
cd baby-vaccination-tracker

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
pip install -r requirements.txt
```

### Build APK

```bash
cd frontend
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

## 📱 Usage

1. Install the APK on your Android phone
2. Create baby profile with name and date of birth
3. View auto-generated vaccination schedule
4. Mark vaccinations as complete
5. Receive timely reminders

## 🔧 Backend API

- FastAPI backend
- MongoDB database
- RESTful API endpoints
- Tested with 100% pass rate

## 📄 License

MIT

## 👨‍💻 Author

Prajwal Kishan
