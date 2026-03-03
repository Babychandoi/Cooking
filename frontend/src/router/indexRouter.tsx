import Dashboard from "../pages/index"
import HomePage from "../pages/home/HomePage"
import IngredientPage from "../pages/ingredient/IngredientPage"
import DishPage from "../pages/dish/DishPage"
import OrderPage from "../pages/order/OrderPage"
import EmployeePage from "../pages/employee/EmployeePage"
import BranchPage from "../pages/branch/BranchPage"
import TablePage from "../pages/table/TablePage"
import InvoicePage from "../pages/invoice/InvoicePage"
import ProtectedRoute from "../component/ProtectedRoute"

export const indexRouter: any = {
    path: '/',
    element: (<ProtectedRoute><Dashboard /></ProtectedRoute>),
    children: [
        { index: true, element: <HomePage /> },
        { path: 'branches', element: <BranchPage /> },
        { path: 'tables', element: <TablePage /> },
        { path: 'ingredients', element: <IngredientPage /> },
        { path: 'dishes', element: <DishPage /> },
        { path: 'orders', element: <OrderPage /> },
        { path: 'invoices', element: <InvoicePage /> },
        { path: 'employees', element: <EmployeePage /> },
    ]
}