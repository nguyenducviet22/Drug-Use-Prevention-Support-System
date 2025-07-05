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
import userDetailsEn from './locales/en/userDetails.json'; // Import new file
import eventDetailsEn from './locales/en/eventDetails.json';
import eventListEn from './locales/en/eventList.json';

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
import homeMeVí from './locales/vi/homeMe.json';
import navbarVi from './locales/vi/navbar.json';
import paginationVi from './locales/vi/pagination.json';
import recommendationVi from './locales/vi/recommendation.json';
import reportsVi from './locales/vi/reports.json';
import searchFilterVi from './locales/vi/searchFilter.json';
import userDetailsVi from './locales/vi/userDetails.json'; // Import new file
import eventDetailsVi from './locales/vi/eventDetails.json';
import eventListVi from './locales/vi/eventList.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
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
        userDetails: userDetailsEn, // Add new namespace
        eventDetails: eventDetailsEn,
        eventList: eventListEn,
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
        homeMe: homeMeVí,
        navbar: navbarVi,
        pagination: paginationVi,
        recommendation: recommendationVi,
        reports: reportsVi,
        searchFilter: searchFilterVi,
        userDetails: userDetailsVi, // Add new namespace
        eventDetails: eventDetailsVi,
        eventList: eventListVi,
      }
    },
    // Ensure 'userDetails' is added to the `ns` array
    ns: [
      'home', 'appointmentBooking', 'assessmentList', 'assessmentResult', 'crafftQuestionnaire',
      'availabilityBooking', 'blogCreation', 'blogDetails', 'blogList',
      'courseCreation', 'courseDetails', 'courseLesson', 'courseList',
      'lessonCreation', 'loginPage', 'moduleCreation', 'myProfile',
      'notFound', 'accountOverview', 'assessmentCard', 'blogCard',
      'courseCard', 'eventCard', 'familyInformation', 'footer', 
      'homeExplore', 'homeMe', 'navbar', 'pagination',
      'recommendation', 'reports', 'searchFilter', 'userDetails', 
      'eventDetails', 'eventList' // Add new namespace
    ],
    defaultNS: 'home',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;