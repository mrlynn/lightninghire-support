'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  AppBar, 
  Box, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Drawer, 
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Container,
  useMediaQuery,
  InputBase,
  alpha
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Home as HomeIcon,
  LibraryBooks as ArticlesIcon,
  Category as CategoryIcon,
  ContactSupport as ContactIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon
} from '@mui/icons-material';

// Styled search input
const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.black, 0.05),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.black, 0.1),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

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
    <Typography
      variant="h6"
      noWrap
      component="div"
      sx={{ 
        display: { xs: 'none', sm: 'block' },
        fontWeight: 700,
      }}
    >
      LightningHire
    </Typography>
  </Box>
);

export default function Navbar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      // Handle search logic here
      console.log('Search query:', e.target.value);
    }
  };

  const navItems = [
    { text: 'Home', href: '/', icon: HomeIcon },
    { text: 'Knowledge Base', href: '/articles', icon: ArticlesIcon },
    { text: 'Categories', href: '/categories', icon: CategoryIcon },
    { text: 'Contact Support', href: '/contact', icon: ContactIcon },
  ];

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Logo />
      </Box>
      <List>
        {navItems.map((item) => (
          <ListItem
            key={item.text}
            component={Link}
            href={item.href}
            selected={pathname === item.href}
            sx={{
              '&.Mui-selected': {
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
                '& .MuiListItemIcon-root': {
                  color: 'primary.main',
                },
              },
            }}
          >
            <ListItemIcon>
              <item.icon />
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            {/* Mobile menu button */}
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            
            {/* Logo */}
            <Logo />
            
            {/* Desktop navigation */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, ml: 4 }}>
              {navItems.map((item) => (
                <Button
                  key={item.text}
                  component={Link}
                  href={item.href}
                  sx={{
                    my: 2,
                    mx: 1,
                    color: pathname === item.href ? 'primary.main' : 'text.primary',
                    display: 'block',
                    borderBottom: pathname === item.href ? '2px solid' : '2px solid transparent',
                    borderColor: pathname === item.href ? 'primary.main' : 'transparent',
                    borderRadius: 0,
                    '&:hover': {
                      backgroundColor: 'transparent',
                      borderBottom: '2px solid',
                      borderColor: pathname === item.href ? 'primary.main' : 'text.secondary',
                    },
                  }}
                >
                  {item.text}
                </Button>
              ))}
            </Box>
            
            <Box sx={{ flexGrow: 1 }} />
            
            {/* Search */}
            <Search>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search…"
                inputProps={{ 'aria-label': 'search' }}
                onKeyPress={handleSearch}
              />
            </Search>
            
            {/* Back to app button */}
            <Button
              href="https://www.lightninghire.com"
              target="_blank"
              rel="noopener"
              variant="contained"
              color="primary"
              sx={{ 
                display: { xs: 'none', sm: 'block' },
                fontWeight: 600,
              }}
            >
              Back to App
            </Button>
          </Toolbar>
        </Container>
      </AppBar>
      
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 },
        }}
      >
        {drawer}
      </Drawer>
    </Box>
  );
}