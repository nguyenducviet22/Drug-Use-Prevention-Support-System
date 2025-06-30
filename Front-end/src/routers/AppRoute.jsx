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
import MyEventList from "../pages/MyEventList";

export default function AppRoute() {
    return (
        <Routes>
            <Route element={<AppLayout />}>
                <Route path='/' element={<Home />} />
                <Route path="/oauth2/success" element={<OAuth2RedirectHandler />} />
                <Route path="/blogs" element={<BlogList />} />
                <Route path="/blogs/:id" element={<BlogDetails />} />
                <Route path="/blogs/create" element={<BlogCreation />} />
                <Route path="/events" element={<EventList />} />
                <Route path="/events/:id" element={<EventDetails />} />
                <Route path="/my-events" element={<MyEventList />} />
                <Route path="/courses" element={<CourseList />} />
                <Route path="/courses/:id" element={<CourseDetails />} />
                <Route path="/courses/lesson/:id" element={<CourseLesson />} />
                <Route path="/assessment" element={<AssessmentList />} />
                <Route path="/assessment-result/:id" element={<AssessmentResult />} />
                <Route path="/appointment" element={<AppointmentBooking />} />
                <Route path='*' element={<NotFound />} />
            </Route>
            <Route path='/login' element={<Login />} />
            <Route path="/profile" element={<MyProfile />} />
        </Routes>
    )
}
