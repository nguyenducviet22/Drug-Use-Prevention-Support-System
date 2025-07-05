import React from 'react'
import { Routes, Route } from "react-router-dom"
import "bootstrap/dist/css/bootstrap.min.css"
import "../App.css"
import AppLayout from '../layouts/AppLayout'
import Home from '../pages/home/Home'
import Login from '../pages/login/Login'
import OAuth2RedirectHandler from '../components/OAuth2RedirectHandler'

import NotFound from '../pages/not-found/NotFound'
import MyProfile from '../pages/my-profiles/MyProfile'

import BlogList from '../pages/blog/BlogList'
import BlogDetails from '../pages/blog/BlogDetails'
import BlogCreation from '../pages/blog/BlogCreation'

import CourseList from '../pages/course/CourseList'
import CourseDetails from '../pages/course/CourseDetails'
import CourseLesson from '../pages/course/CourseLesson'
import CourseCreation from '../pages/course/CourseCreation'
import ModuleCreation from '../pages/module/ModuleCreation'
import LessonCreation from '../pages/lesson/LessonCreation'

import AssessmentList from '../pages/assessment/AssessmentList'
import AssessmentResult from '../pages/assessment/AssessmentResult'
import CRAFFT from '../pages/assessment/CRAFFT';

import AppointmentBooking from '../pages/appointment/AppointmentBooking'
import AvailabilityBooking from '../pages/availability/AvailabilityBooking'

import EventList from '../pages/event/EventList'
import EventDetails from '../pages/event/EventDetails'
import MyEventList from "../pages/event/MyEventList"

import HomeStaff from '../pages/home/HomeStaff'
import HomeManager from '../pages/home/HomeManager'

export default function AppRoute() {
    return (
        <Routes>
            <Route element={<AppLayout />}>
                <Route path='/' element={<Home />} />
                <Route path='/staff' element={<HomeStaff />} />
                <Route path='/manager' element={<HomeManager />} />
                <Route path="/oauth2/success" element={<OAuth2RedirectHandler />} />

                <Route path="/blogs" element={<BlogList />} />
                <Route path="/blogs/:id" element={<BlogDetails />} />
                <Route path="/blogs/create" element={<BlogCreation />} />
                <Route path="/blogs/create/:id" element={<BlogCreation />} />

                <Route path="/events" element={<EventList />} />
                <Route path="/events/:id" element={<EventDetails />} />
                <Route path="/my-events" element={<MyEventList />} />

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
                <Route path="/assessment/crafft" element={<CRAFFT />} />

                <Route path="/appointment" element={<AppointmentBooking />} />
                <Route path="/availability" element={<AvailabilityBooking />} />

                <Route path='*' element={<NotFound />} />
            </Route>
            <Route path='/login' element={<Login />} />
            <Route path="/profile" element={<MyProfile />} />
        </Routes>
    )
}
