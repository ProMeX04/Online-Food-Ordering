import { Switch, Route } from 'wouter'
import { Toaster } from '@/components/ui/toaster'
import { CartProvider } from '@/context/CartContext'
import { AuthProvider } from '@/hooks/use-auth'
import { ProtectedRoute } from '@/lib/protected-route'
import NotFound from '@/pages/not-found'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import CartModal from '@/components/layout/CartModal'
import Home from '@/pages/Home'
import ShoppingPage from '@/pages/ShoppingPage'
import DishDetail from '@/pages/DishDetail'
import About from '@/pages/About'
import Contact from '@/pages/Contact'
import Checkout from '@/pages/Checkout'
import LoginPage from '@/pages/login-page'
import RegisterPage from '@/pages/register-page'
import ProfilePage from '@/pages/ProfilePage'
import AdminDashboard from '@/pages/admin'
import ProductsPage from '@/pages/admin/products'
import NewProductPage from '@/pages/admin/products/new'
import EditProductPage from '@/pages/admin/products/edit/[id]'
import CategoriesPage from '@/pages/admin/categories'

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
            <Route>
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-grow">
                  <Switch>
                    <Route path="/" component={Home} />
                    <Route path="/menu" component={ShoppingPage} />
                    <Route path="/menu/:slug" component={ShoppingPage} />
                    <Route path="/dish/:_id" component={DishDetail} />
                    <Route path="/about" component={About} />
                    <Route path="/contact" component={Contact} />
                    <Route path="/profile" component={ProfilePage} />
                    <Route path="/checkout" component={Checkout} />
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
