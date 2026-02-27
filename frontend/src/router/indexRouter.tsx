import Dashboard from "../pages/index"
import HomePage from "../pages/home/HomePage"
import IngredientPage from "../pages/ingredient/IngredientPage"
import DishPage from "../pages/dish/DishPage"
import RecipePage from "../pages/recipe/RecipePage"
import OrderPage from "../pages/order/OrderPage"
import EmployeePage from "../pages/employee/EmployeePage"
import ProtectedRoute from "../component/ProtectedRoute"

export const indexRouter: any = {
    path: '/',
    element: (<ProtectedRoute><Dashboard /></ProtectedRoute>),
    children: [
        { index: true, element: <HomePage /> },
        { path: 'ingredients', element: <IngredientPage /> },
        { path: 'dishes', element: <DishPage /> },
        { path: 'recipes', element: <RecipePage /> },
        { path: 'orders', element: <OrderPage /> },
        { path: 'employees', element: <EmployeePage /> },
    ]
}