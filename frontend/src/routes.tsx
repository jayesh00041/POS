import { Icon } from '@chakra-ui/react';
import {
  // MdBarChart,
  // MdPerson,
  MdHome,
  MdLock,
  // MdOutlineShoppingCart,
  MdFoodBank,
  MdGridView,
  MdVerifiedUser,
  MdSettings,
} from 'react-icons/md';

// Admin Imports
import Dashboard from 'views/admin/dashboard';
import NewInvoice from 'views/admin/newInvoice';
import Sales from 'views/admin/sales';
import Products from 'views/admin/products';
import Categories from 'views/admin/categories';
import Users from 'views/admin/users';
import Settings from 'views/admin/settings';
// import MainDashboard from 'views/admin/default';
// import NFTMarketplace from 'views/admin/marketplace';
// import Profile from 'views/admin/profile';
// import DataTables from 'views/admin/dataTables';

// Auth Imports
import SignInCentered from 'views/auth/signIn';
import { FaFileInvoice, FaProductHunt } from 'react-icons/fa';
import { Privilege } from './contexts/PrivilegeContext';

const routes = [
  {
    name: "Dashboard",
    layout: "/admin",
    path: "/default",
    icon: <Icon as={MdHome as React.ElementType} width="20px" height="20px" color="inherit" />,
    component: <Dashboard />,
    privilege: ""
  },
  {
    name: "New Invoice",
    layout: "/admin",
    path: "/new-invoice",
    icon: <Icon as={FaFileInvoice as React.ElementType} width="20px" height="20px" color="inherit" />,
    component: <NewInvoice />,
    privilege: Privilege.SALES_WRITE
  },
  {
    name: "Sales",
    layout: "/admin",
    path: "/sales",
    icon: <Icon as={MdFoodBank as React.ElementType} width="20px" height="20px" color="inherit" />,
    component: <Sales />,
    privilege: Privilege.SALES_READ
  },
  {
    name: "Products",
    layout: "/admin",
    path: "/products",
    icon: <Icon as={FaProductHunt as React.ElementType} width="20px" height="20px" color="inherit" />,
    component: <Products />,
    privilege: Privilege.PRODUCTS_READ
  },
  {
    name: "Categories",
    layout: "/admin",
    path: "/category",
    icon: <Icon as={MdGridView as React.ElementType} width="20px" height="20px" color="inherit" />,
    component: <Categories />,
    privilege: Privilege.CATEGORIES_READ
  },
  {
    name: "Users",
    layout: "/admin",
    path: "/users",
    icon: <Icon as={MdVerifiedUser as React.ElementType} width="20px" height="20px" color="inherit" />,
    component: <Users />,
    privilege: Privilege.USERS_READ
  },
  {
    name: "Settings",
    layout: "/admin",
    path: "/settings",
    icon: <Icon as={MdSettings as React.ElementType} width="20px" height="20px" color="inherit" />,
    component: <Settings />,
    privilege: "ADMIN_ONLY"
  },
  // {
  //   name: 'Main Dashboard',
  //   layout: '/admin',
  //   path: '/main-dashboard',
  //   icon: <Icon as={MdHome as React.ElementType} width="20px" height="20px" color="inherit" />,
  //   component: <MainDashboard />,
  //   privilege: "",
  // },
  // {
  //   name: 'NFT Marketplace',
  //   layout: '/admin',
  //   path: '/nft-marketplace',
  //   icon: (
  //     <Icon
  //       as={MdOutlineShoppingCart as React.ElementType}
  //       width="20px"
  //       height="20px"
  //       color="inherit"
  //     />
  //   ),
  //   component: <NFTMarketplace />,
  //   secondary: true,
  // },
  // {
  //   name: 'Data Tables',
  //   layout: '/admin',
  //   icon: <Icon as={MdBarChart as React.ElementType} width="20px" height="20px" color="inherit" />,
  //   path: '/data-tables',
  //   component: <DataTables />,
  // },
  // {
  //   name: 'Profile',
  //   layout: '/admin',
  //   path: '/profile',
  //   icon: <Icon as={MdPerson as React.ElementType} width="20px" height="20px" color="inherit" />,
  //   component: <Profile />,
  // },
  {
    name: 'Sign In',
    layout: '/auth',
    path: '/sign-in',
    icon: <Icon as={MdLock as React.ElementType} width="20px" height="20px" color="inherit" />,
    component: <SignInCentered />,
  },
];

export default routes;
