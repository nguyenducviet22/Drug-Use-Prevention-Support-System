import React from 'react'
import { Routes, Route } from "react-router-dom"
import "bootstrap/dist/css/bootstrap.min.css"
import "../App.css"
import AppLayout from '../layouts/AppLayout'
import Home from '../pages/Home'
import Login from '../pages/Login'
import OAuth2RedirectHandler from '../components/OAuth2RedirectHandler'
import NotFound from '../pages/NotFound'
import MyProfile from '../pages/MyProfile'
import BlogList from '../pages/BlogList'
import CourseList from '../pages/CourseList'
import EventList from '../pages/EventList'
import AssessmentList from '../pages/AssessmentList'
import BlogDetails from '../pages/BlogDetails'
import AssessmentResult from '../pages/AssessmentResult'
import EventDetails from '../pages/EventDetails'
import CourseDetails from '../pages/CourseDetails'
import CourseLesson from '../pages/CourseLesson'
import BlogCreation from '../pages/BlogCreation'
import AppointmentBooking from '../pages/AppointmentBooking'
import AvailabilityBooking from '../pages/AvailabilityBooking'
import CourseCreation from '../pages/CourseCreation'
import ModuleCreation from '../pages/ModuleCreation'
import LessonCreation from '../pages/LessonCreation'

export default function AppRoute() {
    return (
        <Routes>
            <Route element={<AppLayout />}>
                <Route path='/' element={<Home />} />
                <Route path="/oauth2/success" element={<OAuth2RedirectHandler />} />
                <Route path="/blogs" element={<BlogList />} />
                <Route path="/blogs/:id" element={<BlogDetails />} />
                <Route path="/blogs/create" element={<BlogCreation />} />
                <Route path="/blogs/create/:id" element={<BlogCreation />} />
                <Route path="/events" element={<EventList />} />
                <Route path="/events/:id" element={<EventDetails />} />
                <Route path="/courses" element={<CourseList />} />
                <Route path="/courses/:id" element={<CourseDetails />} />
                <Route path="/courses/lesson/:id" element={<CourseLesson />} />
                <Route path="/courses/create" element={<CourseCreation />} />
                <Route path="/courses/:courseID/module/create" element={<ModuleCreation />} />
                <Route path="/courses/:courseID/module/:moduleID/lesson/create" element={<LessonCreation />} />
                <Route path="/courses/:courseID/update" element={<CourseCreation />} />
                <Route path="/courses/:courseID/module/:moduleID/update" element={<ModuleCreation />} />
                <Route path="/courses/:courseID/module/:moduleID/lesson/:lessonID/update" element={<LessonCreation />} />
                <Route path="/assessment" element={<AssessmentList />} />
                <Route path="/assessment-result/:id" element={<AssessmentResult />} />
                <Route path="/appointment" element={<AppointmentBooking />} />
                <Route path="/availability" element={<AvailabilityBooking />} />
                <Route path='*' element={<NotFound />} />
            </Route>
            <Route path='/login' element={<Login />} />
            <Route path="/profile" element={<MyProfile />} />
        </Routes>
    )
}
