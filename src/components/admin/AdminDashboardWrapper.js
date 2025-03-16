// src/components/admin/AdminDashboardWrapper.js
'use client';

import { useState } from 'react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, IconButton, Divider, useMediaQuery, useTheme } from '@mui/material';
import { 
  Menu as MenuIcon, 
  Home as HomeIcon,
  Dashboard as DashboardIcon,
  Article as ArticleIcon,
  Category as CategoryIcon,
  Chat as ChatIcon,
  People as PeopleIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  ConfirmationNumber as TicketIcon
} from '@mui/icons-material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import PageLayout from '@/components/layout/PageLayout';

const drawerWidth = 220; // Drawer width

export default function AdminDashboardWrapper({ children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, href: '/admin' },
    { text: 'Tickets', icon: <TicketIcon />, href: '/admin/tickets' },
    { text: 'Articles', icon: <ArticleIcon />, href: '/admin/articles' },
    { text: 'Categories', icon: <CategoryIcon />, href: '/admin/categories' },
    { text: 'Chat History', icon: <ChatIcon />, href: '/admin/chats' },
    { text: 'Users', icon: <PeopleIcon />, href: '/admin/users' },
    { text: 'Analytics', icon: <AnalyticsIcon />, href: '/admin/analytics' },
    { text: 'Settings', icon: <SettingsIcon />, href: '/admin/settings' },
    { text: 'Back to Home', icon: <HomeIcon />, href: '/' },
  ];

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Admin Panel
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton 
              component={Link} 
              href={item.href}
              selected={pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <PageLayout disableChatbot maxWidth={false}>
      <Box sx={{ display: 'flex', width: '100%', position: 'relative' }}>
        <AppBar
          position="fixed"
          sx={{
            width: { md: `calc(100% - ${drawerWidth}px)` },
            ml: { md: `${drawerWidth}px` },
            backgroundColor: 'background.paper',
            color: 'text.primary',
            boxShadow: 1
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              Lightning Hire Support Admin
            </Typography>
          </Toolbar>
        </AppBar>
        
        <Box
          component="nav"
          sx={{ 
            width: { xs: 0, md: drawerWidth }, 
            flexShrink: 0
          }}
          aria-label="admin navigation"
        >
          {/* Mobile drawer */}
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better mobile performance
            }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
          >
            {drawer}
          </Drawer>
          
          {/* Desktop drawer */}
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', md: 'block' },
              '& .MuiDrawer-paper': { 
                boxSizing: 'border-box', 
                width: drawerWidth, 
                borderRight: '1px solid rgba(0, 0, 0, 0.12)'
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>
        
        {/* Main content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
            padding: { xs: 2, md: 3 },
            mt: '64px', // AppBar height
            boxSizing: 'border-box',
            marginLeft: 0 // Explicitly set margin to 0
          }}
        >
          {children}
        </Box>
      </Box>
    </PageLayout>
  );
}