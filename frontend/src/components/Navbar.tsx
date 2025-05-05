// Navbar.tsx
import React from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";

interface NavbarProps {
  username: string;
  usertype: string;
  onLogout?: () => void;
  extraButtons?: React.ReactNode;
}

const Navbar: React.FC<NavbarProps> = ({ username, usertype, onLogout, extraButtons }) => {
  return (
    <AppBar position="static" color="default" elevation={2}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6" color="inherit">
          HR Track
        </Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button onClick={() => alert("About Us info")}>About</Button>
          <Button onClick={() => alert("Contact info")}>Contact</Button>
          {extraButtons}
          <Button color="inherit" startIcon={<LogoutIcon />} onClick={onLogout}>
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
