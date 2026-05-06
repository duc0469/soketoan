# 📝 TODO List

## 🔴 High Priority (Security & Stability)

- [ ] **Authentication & Authorization**
  - [ ] JWT-based authentication
  - [ ] User registration & login
  - [ ] Password hashing (bcrypt)
  - [ ] Protected routes
  - [ ] Role-based access control (Admin, User, Viewer)

- [ ] **Error Handling**
  - [ ] React Error Boundary
  - [ ] Better error messages
  - [ ] Error logging (Winston/Pino)
  - [ ] Error tracking (Sentry)

- [ ] **Input Validation**
  - [ ] Backend validation (Joi/Yup)
  - [ ] Frontend validation
  - [ ] Sanitize user input
  - [ ] XSS prevention

- [ ] **Testing**
  - [ ] Backend unit tests (Jest)
  - [ ] Frontend unit tests (React Testing Library)
  - [ ] Integration tests
  - [ ] E2E tests (Cypress/Playwright)

## 🟡 Medium Priority (Features)

- [ ] **Export Functionality**
  - [ ] Export ledgers to Excel
  - [ ] Export ledgers to PDF
  - [ ] Export transactions to CSV
  - [ ] Custom date range export

- [ ] **Advanced Filters**
  - [ ] Search by description
  - [ ] Filter by amount range
  - [ ] Filter by account
  - [ ] Multiple filters combination

- [ ] **Dashboard**
  - [ ] Summary cards (Total income/expense)
  - [ ] Charts (Line, Bar, Pie)
  - [ ] Monthly comparison
  - [ ] Top expenses by category

- [ ] **Batch Operations**
  - [ ] Bulk edit transactions
  - [ ] Bulk delete transactions
  - [ ] Bulk apply rules
  - [ ] Undo/Redo functionality

- [ ] **Notifications**
  - [ ] Email notifications
  - [ ] In-app notifications
  - [ ] Notification preferences
  - [ ] Digest emails

## 🟢 Low Priority (Nice to Have)

- [ ] **UI/UX Improvements**
  - [ ] Dark mode
  - [ ] Keyboard shortcuts
  - [ ] Drag & drop reorder
  - [ ] Column customization
  - [ ] Save view preferences

- [ ] **Performance**
  - [ ] Virtual scrolling for large tables
  - [ ] Lazy loading components
  - [ ] Image optimization
  - [ ] Code splitting
  - [ ] Service Worker (PWA)

- [ ] **Advanced Features**
  - [ ] OCR for scanned PDFs
  - [ ] AI-powered classification
  - [ ] Duplicate detection
  - [ ] Recurring transactions
  - [ ] Budget tracking

- [ ] **Integration**
  - [ ] Bank API integration
  - [ ] Accounting software export (QuickBooks, Xero)
  - [ ] Google Drive backup
  - [ ] Webhook support

- [ ] **Mobile**
  - [ ] Responsive mobile view
  - [ ] React Native app
  - [ ] Mobile-specific features

## 🔧 Technical Debt

- [ ] **Code Quality**
  - [ ] ESLint configuration
  - [ ] Prettier configuration
  - [ ] Husky pre-commit hooks
  - [ ] Code review checklist

- [ ] **Documentation**
  - [ ] API documentation (Swagger/OpenAPI)
  - [ ] Component documentation (Storybook)
  - [ ] Video tutorials
  - [ ] FAQ section

- [ ] **DevOps**
  - [ ] Docker setup
  - [ ] Docker Compose
  - [ ] CI/CD pipeline (GitHub Actions)
  - [ ] Automated deployment
  - [ ] Environment management

- [ ] **Monitoring**
  - [ ] Application monitoring (New Relic/DataDog)
  - [ ] Database monitoring
  - [ ] Performance metrics
  - [ ] Uptime monitoring

## 🐛 Known Issues

- [ ] CSV parsing không hỗ trợ encoding đặc biệt
- [ ] PDF parsing chỉ hoạt động với format chuẩn
- [ ] Không có loading state khi confirm nhiều transactions
- [ ] Toast notifications có thể chồng lên nhau

## 💡 Ideas for Future

- [ ] Multi-language support (i18n)
- [ ] Multi-currency support
- [ ] Tax calculation
- [ ] Invoice generation
- [ ] Receipt scanning
- [ ] Expense approval workflow
- [ ] Team collaboration features
- [ ] Custom report builder
- [ ] API for third-party integration
- [ ] White-label solution

## 📅 Roadmap

### Version 1.1.0 (Q3 2026)

- Authentication & Authorization
- Export to Excel/PDF
- Advanced filters
- Unit tests

### Version 1.2.0 (Q4 2026)

- Dashboard with charts
- Email notifications
- Batch operations
- Mobile responsive

### Version 2.0.0 (Q1 2027)

- Mobile app (React Native)
- Bank integration
- AI classification
- Real-time collaboration

## 🎯 Current Sprint (Week 1-2)

- [x] ~~Setup project structure~~
- [x] ~~Implement upload & parse~~
- [x] ~~Implement rule engine~~
- [x] ~~Build frontend UI~~
- [x] ~~Write documentation~~
- [ ] Add authentication
- [ ] Add unit tests
- [ ] Setup CI/CD

## 📊 Progress Tracking

| Category      | Completed | Total | Progress |
| ------------- | --------- | ----- | -------- |
| Core Features | 8         | 8     | 100% ✅  |
| Security      | 0         | 5     | 0% 🔴    |
| Testing       | 0         | 4     | 0% 🔴    |
| Documentation | 9         | 9     | 100% ✅  |
| DevOps        | 0         | 4     | 0% 🔴    |

**Overall Progress**: 17/30 = **57%**

## 🤝 Contributing

Muốn đóng góp? Chọn một task từ TODO list và:

1. Comment vào issue tương ứng
2. Fork repo
3. Tạo branch: `feature/task-name`
4. Code & test
5. Submit PR

## 📝 Notes

- Ưu tiên Security & Testing trước khi thêm features mới
- Mỗi feature mới cần có tests
- Update documentation khi thay đổi API
- Follow coding standards trong CONTRIBUTING.md

---

**Last updated**: 2026-05-06  
**Next review**: 2026-05-13
