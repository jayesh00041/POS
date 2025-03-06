import { Icon } from '@chakra-ui/react';
import {
  // MdBarChart,
  // MdPerson,
  MdHome,
  MdLock,
  // MdOutlineShoppingCart,
  MdFoodBank,
  MdGridView,
} from 'react-icons/md';

// Admin Imports
import Dashboard from 'views/admin/dashboard';
import NewInvoice from 'views/admin/newInvoice';
import Sales from 'views/admin/sales';
import Products from 'views/admin/products';
import Categories from 'views/admin/categories';
import MainDashboard from 'views/admin/default';
// import NFTMarketplace from 'views/admin/marketplace';
// import Profile from 'views/admin/profile';
// import DataTables from 'views/admin/dataTables';

// Auth Imports
import SignInCentered from 'views/auth/signIn';
import { FaFileInvoice, FaProductHunt } from 'react-icons/fa';

const routes = [
  {
    name: "Dashboard",
    layout: "/admin",
    path: "/default",
    icon: <Icon as={MdHome as React.ElementType} width="20px" height="20px" color="inherit" />,
    component: <Dashboard />,
  },
  {
    name: "New Invoice",
    layout: "/admin",
    path: "/new-invoice",
    icon: <Icon as={FaFileInvoice as React.ElementType} width="20px" height="20px" color="inherit" />,
    component: <NewInvoice />,
  },
  {
    name: "Sales",
    layout: "/admin",
    path: "/sales",
    icon: <Icon as={MdFoodBank as React.ElementType} width="20px" height="20px" color="inherit" />,
    component: <Sales />,
  },
  {
    name: "Products",
    layout: "/admin",
    path: "/products",
    icon: <Icon as={FaProductHunt as React.ElementType} width="20px" height="20px" color="inherit" />,
    component: <Products />,
  },
  {
    name: "Categories",
    layout: "/admin",
    path: "/category",
    icon: <Icon as={MdGridView as React.ElementType} width="20px" height="20px" color="inherit" />,
    component: <Categories />,
  },
  {
    name: 'Main Dashboard',
    layout: '/admin',
    path: '/main-dashboard',
    icon: <Icon as={MdHome as React.ElementType} width="20px" height="20px" color="inherit" />,
    component: <MainDashboard />,
  },
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
