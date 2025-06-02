import { Switch, Route } from 'wouter'
import { Toaster } from '@/components/ui/toaster'
import { CartProvider } from '@/context/CartContext'
import { AuthProvider } from '@/hooks/use-auth'
import { ProtectedRoute } from '@/lib/protected-route'
import NotFound from '@/pages/NotFound'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import CartModal from '@/components/layout/CartModal'
import Home from '@/pages/HomePage'
import AiShoppingPage from '@/pages/AiShoppingPage'
import NormalShoppingPage from '@/pages/NormalShoppingPage'
import DishDetail from '@/pages/DishDetail'
import About from '@/pages/About'
import Contact from '@/pages/Contact'
import Checkout from '@/pages/Checkout'
import OrderSuccess from '@/pages/OrderSuccess'
import Orders from '@/pages/Orders'
import OrderDetail from '@/pages/OrderDetail'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import ProfilePage from '@/pages/ProfilePage'
import AdminDashboard from '@/pages/admin'
import ProductsPage from '@/pages/admin/products'
import NewProductPage from '@/pages/admin/products/new'
import EditProductPage from '@/pages/admin/products/edit/[id]'
import CategoriesPage from '@/pages/admin/categories'
import OrdersPage from '@/pages/admin/orders'
import UsersPage from './pages/admin/users'
import SettingsPage from './pages/admin/settings'

function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <Switch>
                    <ProtectedRoute path="/admin" component={AdminDashboard} />
                    <ProtectedRoute path="/admin/products" component={ProductsPage} />
                    <ProtectedRoute path="/admin/products/new" component={NewProductPage} />
                    <ProtectedRoute path="/admin/products/edit/:id" component={EditProductPage} />
                    <ProtectedRoute path="/admin/categories" component={CategoriesPage} />
                    <ProtectedRoute path="/admin/orders" component={OrdersPage} />
                    <ProtectedRoute path="/admin/users" component={UsersPage} />
                    <ProtectedRoute path="/admin/settings" component={SettingsPage} />
                    <Route>
                        <div className="flex flex-col min-h-screen">
                            <Header />
                            <main className="flex-grow">
                                <Switch>
                                    <Route path="/" component={Home} />
                                    <Route path="/menu/ai-mode" component={AiShoppingPage} />
                                    <Route path="/menu/normal-mode" component={NormalShoppingPage} />
                                    <Route path="/menu/normal-mode/:slug" component={NormalShoppingPage} />
                                    <Route path="/dish/:_id" component={DishDetail} />
                                    <Route path="/about" component={About} />
                                    <Route path="/contact" component={Contact} />
                                    <Route path="/profile" component={ProfilePage} />
                                    <Route path="/checkout" component={Checkout} />
                                    <Route path="/order-success" component={OrderSuccess} />
                                    <Route path="/orders" component={Orders} />
                                    <Route path="/orders/:orderId" component={OrderDetail} />
                                    <Route path="/login" component={LoginPage} />
                                    <Route path="/register" component={RegisterPage} />
                                    <Route component={NotFound} />
                                </Switch>
                            </main>
                            <Footer />
                            <CartModal />
                        </div>
                    </Route>
                </Switch>
                <Toaster />
            </CartProvider>
        </AuthProvider>
    )
}

export default App
