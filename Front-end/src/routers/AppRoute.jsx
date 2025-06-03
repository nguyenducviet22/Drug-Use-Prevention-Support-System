import React from 'react'
import { Routes, Route } from "react-router-dom"
import "bootstrap/dist/css/bootstrap.min.css"
import "../App.css"
import AppLayout from '../layouts/AppLayout'
import Home from '../pages/Home'
import Login from '../pages/Login'
import OAuth2RedirectHandler from '../components/OAuth2RedirectHandler'
import MyInfo from '../pages/MyInfo'
import NotFound from '../pages/NotFound'

export default function AppRoute() {
    return (
        <Routes>
            <Route element={<AppLayout />}>
                <Route path='/' element={<Home />} />
                <Route path="/oauth2/success" element={<OAuth2RedirectHandler />} />
                <Route path="/user/:username" element={<MyInfo />} />
                <Route path='*' element={<NotFound />} />
            </Route>
            <Route path='/login' element={<Login />} />
        </Routes>
    )
}
