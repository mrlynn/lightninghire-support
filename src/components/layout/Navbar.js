'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useTheme } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SupportIcon from '@mui/icons-material/Support';
import ArticleIcon from '@mui/icons-material/Article';
import BookIcon from '@mui/icons-material/Book';
import { useUserActivity } from '@/context/UserActivityContext';

export default function Navbar() {
  const { data: session, status } = useSession();
  const { userProfile } = useUserActivity();
  const pathname = usePathname();
  const theme = useTheme();
  
  // Mobile menu state
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // User menu state
  const [anchorElUser, setAnchorElUser] = useState(null);

  // Support site navigation items
  const navigationItems = [
    {
      name: 'Home',
      href: '/',
      current: pathname === '/',
      icon: <SupportIcon fontSize="small" sx={{ mr: 1 }} />
    },
    {
      name: 'Knowledge Base',
      href: '/articles',
      current: pathname.startsWith('/articles'),
      icon: <BookIcon fontSize="small" sx={{ mr: 1 }} />
    },
    {
      name: 'FAQs',
      href: '/faqs',
      current: pathname.startsWith('/faqs'),
      icon: <HelpOutlineIcon fontSize="small" sx={{ mr: 1 }} />
    },
    {
      name: 'My Tickets',
      href: '/tickets',
      current: pathname.startsWith('/tickets'),
      icon: <ArticleIcon fontSize="small" sx={{ mr: 1 }} />
    }
  ];

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Logo component
  const Logo = () => (
    <Box
      component={Link}
      href="/"
      sx={{ 
        display: 'flex',
        alignItems: 'center',
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          mr: 1,
          borderRadius: '50%',
          backgroundColor: '#1A1A1A',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Lightning bolt SVG */}
        <svg
          viewBox="0 0 100 100"
          width="60%"
          height="60%"
        >
          <defs>
            <linearGradient id="navLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFD600" />
              <stop offset="100%" stopColor="#FF7900" />
            </linearGradient>
          </defs>
          <path
            d="M60,20 L30,50 L45,50 L40,80 L70,50 L55,50 L60,20"
            fill="url(#navLogoGradient)"
          />
        </svg>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ 
            display: { xs: 'none', sm: 'block' },
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          LightningHire
        </Typography>
        <Typography
          variant="caption"
          noWrap
          component="div"
          sx={{ 
            display: { xs: 'none', sm: 'block' },
            fontWeight: 500,
            color: 'text.secondary',
          }}
        >
          Support Portal
        </Typography>
      </Box>
    </Box>
  );

  // Mobile drawer content
  const drawer = (
    <Box onClick={() => {}} sx={{ textAlign: 'center' }}>
      <Box 
        component={Link}
        href="/"
        onClick={handleDrawerToggle}
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          my: 2,
          textDecoration: 'none',
          color: 'inherit',
        }}
      >
        <Logo />
      </Box>
      <Divider />
      <List>
        {navigationItems.map((item) => (
          <ListItem key={item.name} disablePadding>
            <ListItemButton 
              component={Link} 
              href={item.href}
              onClick={handleDrawerToggle}
              sx={{
                textAlign: 'left',
                bgcolor: item.current ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                color: item.current ? theme.palette.primary.main : theme.palette.text.primary,
                borderLeft: item.current ? `4px solid ${theme.palette.primary.main}` : '4px solid transparent',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {item.icon}
                <ListItemText primary={item.name} />
              </Box>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      {/* Show admin section if user is admin */}
      {session && session.user.role === 'admin' && (
        <>
          <Divider />
          <ListItem disablePadding>
            <ListItemButton 
              component={Link} 
              href="/admin"
              onClick={handleDrawerToggle}
              sx={{
                textAlign: 'center',
                bgcolor: pathname.startsWith('/admin') ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                color: pathname.startsWith('/admin') ? theme.palette.primary.main : theme.palette.text.primary,
                borderLeft: pathname.startsWith('/admin') ? `4px solid ${theme.palette.primary.main}` : '4px solid transparent',
              }}
            >
              <ListItemText primary="Admin Dashboard" />
            </ListItemButton>
          </ListItem>
        </>
      )}
      
      {!session && (
        <>
          <Divider />
          <ListItem disablePadding>
            <ListItemButton 
              component={Link} 
              href="/login"
              onClick={handleDrawerToggle}
              sx={{ textAlign: 'center' }}
            >
              <ListItemText primary="Sign In" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton 
              component={Link} 
              href="/register"
              onClick={handleDrawerToggle}
              sx={{ 
                textAlign: 'center',
                bgcolor: theme.palette.primary.main,
                color: 'white',
                '&:hover': {
                  bgcolor: theme.palette.primary.dark,
                },
                my: 1,
                mx: 2,
                borderRadius: 1,
              }}
            >
              <ListItemText primary="Sign Up" />
            </ListItemButton>
          </ListItem>
        </>
      )}
    </Box>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* Logo - Desktop */}
            <Logo />

            {/* Mobile menu icon */}
            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' }, justifyContent: 'flex-end' }}>
              <IconButton
                size="large"
                aria-label="menu"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleDrawerToggle}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
            </Box>
            
            {/* Desktop Navigation */}
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, ml: 4 }}>
              {navigationItems.map((item) => (
                <Button
                  key={item.name}
                  component={Link}
                  href={item.href}
                  startIcon={item.icon}
                  sx={{
                    my: 2, 
                    px: 2,
                    color: item.current ? theme.palette.primary.main : theme.palette.text.primary,
                    display: 'flex',
                    position: 'relative',
                    fontWeight: item.current ? 600 : 400,
                    '&::after': item.current ? {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      height: '3px',
                      backgroundColor: theme.palette.primary.main,
                      borderRadius: '3px 3px 0 0',
                    } : {},
                    textTransform: 'none',
                  }}
                >
                  {item.name}
                </Button>
              ))}
              
              {/* Admin link if user is admin */}
              {session && session.user.role === 'admin' && (
                <Button
                  component={Link}
                  href="/admin"
                  sx={{
                    my: 2, 
                    px: 2,
                    color: pathname.startsWith('/admin') ? theme.palette.primary.main : theme.palette.text.primary,
                    display: 'flex',
                    position: 'relative',
                    fontWeight: pathname.startsWith('/admin') ? 600 : 400,
                    '&::after': pathname.startsWith('/admin') ? {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      height: '3px',
                      backgroundColor: theme.palette.primary.main,
                      borderRadius: '3px 3px 0 0',
                    } : {},
                    textTransform: 'none',
                  }}
                >
                  Admin
                </Button>
              )}
            </Box>

            {/* User menu or login buttons */}
            <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center' }}>
              {session ? (
                <>
                  {/* Show user activity stats */}
                  {userProfile && userProfile.supportStats && (
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', mr: 3 }}>
                      <Tooltip title="Your tickets">
                        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                          <ArticleIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {userProfile.supportStats.ticketsCreated || 0}
                          </Typography>
                        </Box>
                      </Tooltip>
                      <Tooltip title="Articles viewed">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <BookIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {userProfile.supportStats.articlesViewed || 0}
                          </Typography>
                        </Box>
                      </Tooltip>
                    </Box>
                  )}
                  
                  {/* User info */}
                  <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', mr: 1 }}>
                    <Typography variant="body2" sx={{ mr: 2 }}>
                      {session.user.name}
                    </Typography>
                  </Box>
                  
                  {/* User avatar and menu */}
                  <Tooltip title="Account settings">
                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                      {session.user.image ? (
                        <Avatar alt={session.user.name} src={session.user.image} />
                      ) : (
                        <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                          {session.user.name?.charAt(0) || 'U'}
                        </Avatar>
                      )}
                    </IconButton>
                  </Tooltip>
                  <Menu
                    sx={{ mt: '45px' }}
                    id="menu-appbar"
                    anchorEl={anchorElUser}
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    open={Boolean(anchorElUser)}
                    onClose={handleCloseUserMenu}
                  >
                    <MenuItem 
                      component={Link} 
                      href="/profile"
                      onClick={handleCloseUserMenu}
                    >
                      <Typography textAlign="center">Profile</Typography>
                    </MenuItem>
                    <MenuItem 
                      component={Link} 
                      href="/tickets"
                      onClick={handleCloseUserMenu}
                    >
                      <Typography textAlign="center">My Tickets</Typography>
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={() => signOut({ callbackUrl: '/' })}>
                      <Typography textAlign="center">Sign out</Typography>
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <Button 
                    component={Link} 
                    href="/login"
                    variant="outlined"
                    sx={{ 
                      mr: 1, 
                      borderColor: theme.palette.primary.main,
                      color: theme.palette.primary.main,
                      display: { xs: 'none', sm: 'flex' }
                    }}
                  >
                    Sign in
                  </Button>
                  <Button 
                    component={Link}
                    href="/register"
                    variant="contained" 
                    sx={{ 
                      bgcolor: theme.palette.primary.main,
                      '&:hover': {
                        bgcolor: theme.palette.primary.dark,
                      },
                      display: { xs: 'none', sm: 'flex' }
                    }}
                  >
                    Sign up
                  </Button>
                </>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        {drawer}
      </Drawer>
    </Box>
  );
}