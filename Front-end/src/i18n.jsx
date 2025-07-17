import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import các file JSON của bạn
import homeEn from './locales/en/home.json';
import appointmentBookingEn from './locales/en/appointmentBooking.json';
import assessmentListEn from './locales/en/assessmentList.json';
import assessmentResultEn from './locales/en/assessmentResult.json';
import crafftQuestionnaireEn from './locales/en/crafftQuestionnaire.json';
import availabilityBookingEn from './locales/en/availabilityBooking.json';
import blogCreationEn from './locales/en/blogCreation.json';
import blogDetailsEn from './locales/en/blogDetails.json';
import blogListEn from './locales/en/blogList.json';
import courseCreationEn from './locales/en/courseCreation.json';
import courseDetailsEn from './locales/en/courseDetails.json';
import courseLessonEn from './locales/en/courseLesson.json';
import courseListEn from './locales/en/courseList.json';
import lessonCreationEn from './locales/en/lessonCreation.json';
import loginEn from './locales/en/login.json';
import moduleCreationEn from './locales/en/moduleCreation.json';
import myProfileEn from './locales/en/myProfile.json';
import notFoundEn from './locales/en/notFound.json';
import accountOverviewEn from './locales/en/accountOverview.json';
import assessmentCardEn from './locales/en/assessmentCard.json';
import blogCardEn from './locales/en/blogCard.json';
import courseCardEn from './locales/en/courseCard.json';
import eventCardEn from './locales/en/eventCard.json';
import familyInformationEn from './locales/en/familyInformation.json';
import footerEn from './locales/en/footer.json';
import homeExploreEn from './locales/en/homeExplore.json';
import homeMeEn from './locales/en/homeMe.json';
import navbarEn from './locales/en/navbar.json';
import paginationEn from './locales/en/pagination.json';
import recommendationEn from './locales/en/recommendation.json';
import reportsEn from './locales/en/reports.json';
import searchFilterEn from './locales/en/searchFilter.json';
import userDetailsEn from './locales/en/userDetails.json';
import homeManagerEn from './locales/en/homeManager.json';
import homeStaffEn from './locales/en/homeStaff.json';
import homeConsultantEn from './locales/en/homeConsultant.json';
import lineChartEn from './locales/en/lineChart.json';
import statusCardEn from './locales/en/statusCard.json';
import pendingCardEn from './locales/en/pendingCard.json';
import analyticsPreviewEn from './locales/en/analyticsPreview.json';
import appointmentCardEn from './locales/en/appointmentCard.json';
import qualificationsEn from './locales/en/qualifications.json';
import eventDetailsEn from './locales/en/eventDetails.json';
import eventListEn from './locales/en/eventList.json';
import forgotResetPasswordEn from './locales/en/forgotResetPassword.json'; // Import the new namespace
import userManagementEn from './locales/en/userManagement.json';
import blogManagementEn from './locales/en/blogManagement.json';
import courseManagementEn from './locales/en/courseManagement.json';
import eventManagementEn from './locales/en/eventManagement.json';



// Nếu có tiếng Việt
import homeVi from './locales/vi/home.json';
import appointmentBookingVi from './locales/vi/appointmentBooking.json';
import assessmentListVi from './locales/vi/assessmentList.json';
import assessmentResultVi from './locales/vi/assessmentResult.json';
import crafftQuestionnaireVi from './locales/vi/crafftQuestionnaire.json';
import availabilityBookingVi from './locales/vi/availabilityBooking.json';
import blogCreationVi from './locales/vi/blogCreation.json';
import blogDetailsVi from './locales/vi/blogDetails.json';
import blogListVi from './locales/vi/blogList.json';
import courseCreationVi from './locales/vi/courseCreation.json';
import courseDetailsVi from './locales/vi/courseDetails.json';
import courseLessonVi from './locales/vi/courseLesson.json';
import courseListVi from './locales/vi/courseList.json';
import lessonCreationVi from './locales/vi/lessonCreation.json';
import loginVi from './locales/vi/login.json';
import moduleCreationVi from './locales/vi/moduleCreation.json';
import myProfileVi from './locales/vi/myProfile.json';
import notFoundVi from './locales/vi/notFound.json';
import accountOverviewVi from './locales/vi/accountOverview.json';
import assessmentCardVi from './locales/vi/assessmentCard.json';
import blogCardVi from './locales/vi/blogCard.json';
import courseCardVi from './locales/vi/courseCard.json';
import eventCardVi from './locales/vi/eventCard.json';
import familyInformationVi from './locales/vi/familyInformation.json';
import footerVi from './locales/vi/footer.json';
import homeExploreVi from './locales/vi/homeExplore.json';
import homeMeVi from './locales/vi/homeMe.json'; // Corrected typo here
import navbarVi from './locales/vi/navbar.json';
import paginationVi from './locales/vi/pagination.json';
import recommendationVi from './locales/vi/recommendation.json';
import reportsVi from './locales/vi/reports.json';
import searchFilterVi from './locales/vi/searchFilter.json';
import userDetailsVi from './locales/vi/userDetails.json';
import homeManagerVi from './locales/vi/homeManager.json';
import homeStaffVi from './locales/vi/homeStaff.json';
import homeConsultantVi from './locales/vi/homeConsultant.json';
import lineChartVi from './locales/vi/lineChart.json';
import statusCardVi from './locales/vi/statusCard.json';
import pendingCardVi from './locales/vi/pendingCard.json';
import analyticsPreviewVi from './locales/vi/analyticsPreview.json';
import appointmentCardVi from './locales/vi/appointmentCard.json';
import qualificationsVi from './locales/vi/qualifications.json';
import eventDetailsVi from './locales/vi/eventDetails.json';
import eventListVi from './locales/vi/eventList.json';
import forgotResetPasswordVi from './locales/vi/forgotResetPassword.json'; // Import the new namespace
import userManagementVi from './locales/vi/userManagement.json';
import blogManagementVi from './locales/vi/blogManagement.json';
import courseManagementVi from './locales/vi/courseManagement.json';
import eventManagementVi from './locales/vi/eventManagement.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'vi',
    debug: true,
    resources: {
      en: {
        home: homeEn,
        appointmentBooking: appointmentBookingEn,
        assessmentList: assessmentListEn,
        assessmentResult: assessmentResultEn,
        crafftQuestionnaire: crafftQuestionnaireEn,
        availabilityBooking: availabilityBookingEn,
        blogCreation: blogCreationEn,
        blogDetails: blogDetailsEn,
        blogList: blogListEn,
        courseCreation: courseCreationEn,
        courseDetails: courseDetailsEn,
        courseLesson: courseLessonEn,
        courseList: courseListEn,
        lessonCreation: lessonCreationEn,
        loginPage: loginEn,
        moduleCreation: moduleCreationEn,
        myProfile: myProfileEn,
        notFound: notFoundEn,
        accountOverview: accountOverviewEn,
        assessmentCard: assessmentCardEn,
        blogCard: blogCardEn,
        courseCard: courseCardEn,
        eventCard: eventCardEn,
        familyInformation: familyInformationEn,
        footer: footerEn,
        homeExplore: homeExploreEn,
        homeMe: homeMeEn,
        navbar: navbarEn,
        pagination: paginationEn,
        recommendation: recommendationEn,
        reports: reportsEn,
        searchFilter: searchFilterEn,
        userDetails: userDetailsEn,
        homeManager: homeManagerEn,
        homeStaff: homeStaffEn,
        homeConsultant: homeConsultantEn,
        lineChart: lineChartEn,
        statusCard: statusCardEn,
        pendingCard: pendingCardEn,
        analyticsPreview: analyticsPreviewEn,
        appointmentCard: appointmentCardEn,
        qualifications: qualificationsEn,
        eventDetails: eventDetailsEn,
        eventList: eventListEn,
        forgotResetPassword: forgotResetPasswordEn, // Add the new namespace here
        userManagement: userManagementEn,
        blogManagement: blogManagementEn,
        courseManagement: courseManagementEn,
        eventManagement: eventManagementEn,
      },
      vi: {
        home: homeVi,
        appointmentBooking: appointmentBookingVi,
        assessmentList: assessmentListVi,
        assessmentResult: assessmentResultVi,
        crafftQuestionnaire: crafftQuestionnaireVi,
        availabilityBooking: availabilityBookingVi,
        blogCreation: blogCreationVi,
        blogDetails: blogDetailsVi,
        blogList: blogListVi,
        courseCreation: courseCreationVi,
        courseDetails: courseDetailsVi,
        courseLesson: courseLessonVi,
        courseList: courseListVi,
        lessonCreation: lessonCreationVi,
        loginPage: loginVi,
        moduleCreation: moduleCreationVi,
        myProfile: myProfileVi,
        notFound: notFoundVi,
        accountOverview: accountOverviewVi,
        assessmentCard: assessmentCardVi,
        blogCard: blogCardVi,
        courseCard: courseCardVi,
        eventCard: eventCardVi,
        familyInformation: familyInformationVi,
        footer: footerVi,
        homeExplore: homeExploreVi,
        homeMe: homeMeVi,
        navbar: navbarVi,
        pagination: paginationVi,
        recommendation: recommendationVi,
        reports: reportsVi,
        searchFilter: searchFilterVi,
        userDetails: userDetailsVi,
        homeManager: homeManagerVi,
        homeStaff: homeStaffVi,
        homeConsultant: homeConsultantVi,
        lineChart: lineChartVi,
        statusCard: statusCardVi,
        pendingCard: pendingCardVi,
        analyticsPreview: analyticsPreviewVi,
        appointmentCard: appointmentCardVi,
        qualifications: qualificationsVi,
        eventDetails: eventDetailsVi,
        eventList: eventListVi,
        forgotResetPassword: forgotResetPasswordVi,
        userManagement: userManagementVi,
        blogManagement: blogManagementVi,
        courseManagement: courseManagementVi,
        eventManagement: eventManagementVi,
      }
    },

    ns: [
      'home', 'appointmentBooking', 'assessmentList', 'assessmentResult', 'crafftQuestionnaire',
      'availabilityBooking', 'blogCreation', 'blogDetails', 'blogList',
      'courseCreation', 'courseDetails', 'courseLesson', 'courseList',
      'lessonCreation', 'loginPage', 'moduleCreation', 'myProfile',
      'notFound', 'accountOverview', 'assessmentCard', 'blogCard',
      'courseCard', 'eventCard', 'familyInformation', 'footer',
      'homeExplore', 'homeMe', 'navbar', 'pagination',
      'recommendation', 'reports', 'searchFilter', 'userDetails',
      'homeManager', 'homeStaff', 'homeConsultant', 'lineChart',
      'statusCard', 'pendingCard', 'analyticsPreview', 'appointmentCard',
      'qualifications', 'eventDetails', 'eventList', 'qualifications',
      'forgotResetPassword', 'userManagement', 'blogManagement',
      'courseManagement', 'eventManagement'
    ],
    defaultNS: 'home',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;