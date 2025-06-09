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

export default function AppRoute() {
    return (
        <Routes>
            <Route element={<AppLayout />}>
                <Route path='/' element={<Home />} />
                <Route path="/oauth2/success" element={<OAuth2RedirectHandler />} />
                <Route path="/blogs" element={<BlogList />} />
                <Route path="/events" element={<EventList />} />
                <Route path="/courses" element={<CourseList />} />
                <Route path='*' element={<NotFound />} />
            </Route>
            <Route path='/login' element={<Login />} />
            <Route path="/profile" element={<MyProfile />} />
        </Routes>
    )
}
