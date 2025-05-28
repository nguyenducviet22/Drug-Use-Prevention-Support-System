import React from 'react'
import { Route, Routes } from 'react-router'
import Home from '../pages/Home'
import NotFound from '../pages/NotFound'
import AppLayout from '../layouts/AppLayout'
import Login from '../pages/Login'
import OAuth2RedirectHandler from '../components/OAuth2RedirectHandler'

export default function AppRoute() {
    return (
        <Routes>
            <Route element={<AppLayout />}>
                <Route path='/' element={<Home />} />
                <Route path='login' element={<Login />} />
                <Route path="/oauth2/success" element={<OAuth2RedirectHandler />} />
                <Route path='*' element={<NotFound />} />
            </Route>
        </Routes>
    )
}
