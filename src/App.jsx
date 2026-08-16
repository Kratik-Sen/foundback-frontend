import { lazy, Suspense } from 'react'
import { Toaster } from 'react-hot-toast'
import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import AnimatedOutlet from './components/AnimatedOutlet'
import { Spinner } from './components/States'
import AppShell from './layouts/AppShell'
import PublicLayout from './layouts/PublicLayout'

const AdminResourcePage = lazy(() => import('./pages/AdminResourcePage'))
const AuthPage = lazy(() => import('./pages/AuthPage'))
const BrowsePage = lazy(() => import('./pages/BrowsePage'))
const ChatsPage = lazy(() => import('./pages/ChatsPage'))
const ClaimDetailsPage = lazy(() => import('./pages/ClaimDetailsPage'))
const ClaimPage = lazy(() => import('./pages/ClaimPage'))
const CollectionsPage = lazy(() => import('./pages/CollectionsPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const HandoversPage = lazy(() => import('./pages/HandoversPage'))
const HomePage = lazy(() => import('./pages/HomePage'))
const ItemDetailsPage = lazy(() => import('./pages/ItemDetailsPage'))
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const ReportItemPage = lazy(() => import('./pages/ReportItemPage'))
const StaticPage = lazy(() => import('./pages/StaticPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

const protectedElement = (element, roles) => <ProtectedRoute roles={roles}>{element}</ProtectedRoute>


export default function App() {
  return <>
    <Suspense fallback={<Spinner label="Loading FoundBack" />}><Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="browse" element={<BrowsePage />} />
        <Route path="browse/:type" element={<BrowsePage />} />
        <Route path="items/:id" element={<ItemDetailsPage />} />
        <Route path="about" element={<StaticPage type="about" />} />
        <Route path="contact" element={<StaticPage type="contact" />} />
        <Route path="privacy" element={<StaticPage type="privacy" />} />
      </Route>

      <Route element={<AnimatedOutlet />}>
        <Route path="login" element={<AuthPage mode="login" />} />
        <Route path="register" element={<AuthPage mode="register" />} />
        <Route path="forgot-password" element={<AuthPage mode="forgot" />} />
        <Route path="reset-password" element={<AuthPage mode="reset" />} />
        <Route path="verify-email" element={<AuthPage mode="verify" />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route element={protectedElement(<AppShell />)}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="report/lost" element={<ReportItemPage reportType="lost" />} />
        <Route path="report/found" element={<ReportItemPage reportType="found" />} />
        <Route path="my-listings" element={<CollectionsPage type="listings" />} />
        <Route path="listings/:id/edit" element={<ReportItemPage />} />
        <Route path="saved" element={<CollectionsPage type="saved" />} />
        <Route path="matches" element={<CollectionsPage type="matches" />} />
        <Route path="claims" element={<CollectionsPage type="claims" />} />
        <Route path="claims/:id" element={<ClaimDetailsPage />} />
        <Route path="items/:id/claim" element={<ClaimPage />} />
        <Route path="chats" element={<ChatsPage />} />
        <Route path="chats/:id" element={<ChatsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="change-password" element={<Navigate to="/profile" replace />} />
        <Route path="handovers" element={<HandoversPage />} />

        <Route path="staff" element={protectedElement(<DashboardPage forceRole="staff" />, ['staff', 'admin'])} />
        <Route path="staff/security-items" element={protectedElement(<AdminResourcePage type="security" />, ['staff', 'admin'])} />
        <Route path="staff/claims" element={protectedElement(<AdminResourcePage type="staffClaims" />, ['staff', 'admin'])} />
        <Route path="staff/handovers" element={protectedElement(<HandoversPage />, ['staff', 'admin'])} />
        <Route path="staff/records" element={protectedElement(<HandoversPage status="records" />, ['staff', 'admin'])} />

        <Route path="admin" element={protectedElement(<DashboardPage forceRole="admin" />, ['admin'])} />
        <Route path="admin/users" element={protectedElement(<AdminResourcePage type="users" />, ['admin'])} />
        <Route path="admin/staff" element={protectedElement(<AdminResourcePage type="staff" />, ['admin'])} />
        <Route path="admin/listings" element={protectedElement(<AdminResourcePage type="listings" />, ['admin'])} />
        <Route path="admin/approvals" element={<Navigate to="/admin/listings" replace />} />
        <Route path="admin/claims" element={protectedElement(<AdminResourcePage type="claims" />, ['admin'])} />
        <Route path="admin/complaints" element={protectedElement(<AdminResourcePage type="complaints" />, ['admin'])} />
        <Route path="admin/contact-messages" element={protectedElement(<AdminResourcePage type="contacts" />, ['admin'])} />
        <Route path="admin/categories" element={protectedElement(<AdminResourcePage type="categories" />, ['admin'])} />
        <Route path="admin/locations" element={protectedElement(<AdminResourcePage type="locations" />, ['admin'])} />
        <Route path="admin/announcements" element={protectedElement(<AdminResourcePage type="announcements" />, ['admin'])} />
        <Route path="admin/analytics" element={protectedElement(<DashboardPage forceRole="admin" />, ['admin'])} />
        <Route path="admin/reports" element={protectedElement(<AdminResourcePage type="reports" />, ['admin'])} />
        <Route path="admin/logs" element={protectedElement(<AdminResourcePage type="logs" />, ['admin'])} />
        <Route path="admin/settings" element={protectedElement(<AdminResourcePage type="settings" />, ['admin'])} />
      </Route>

    </Routes></Suspense>
    <Toaster position="top-right" toastOptions={{ duration: 4000, style: { borderRadius: '12px', fontSize: '14px' } }} />
  </>
}
